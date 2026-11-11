// Shared logic for `npm run data:plan` and `npm run data:import`.
// Everything here except createAdminClient() is pure (no network), so it can be unit tested.

import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { createDirectus, rest, staticToken } from '@directus/sdk'

export const DATA_DIR = path.resolve(import.meta.dirname, '../../data_import')
export const BACKUP_DIR = path.join(DATA_DIR, 'backups')

// Directus field types this tool can create
export const FIELD_TYPES = ['string', 'text', 'integer', 'bigInteger', 'float', 'decimal', 'boolean', 'json']
const GEOMETRY_TYPES = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon']
const MAX_INTEGER = 2147483647 // largest value a Postgres `integer` column holds
const MAX_STRING_LENGTH = 255 // Directus `string` is varchar(255); longer values need `text`

// ---------- names ----------

// "Parks DA.geojson" -> "parks_da"
export function toCollectionName(fileName) {
  return path.basename(fileName).replace(/\.(geo)?json$/i, '')
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}

// IDs are labels, not quantities: DAUID, DGUID, park_id, CFSAUID, fsa_code, id
export function isIdLikeName(name) {
  return /(^|_)(id|uid|guid|code)$/i.test(name) || /[A-Z](ID|UID)$/.test(name)
}

// ---------- reading & validating GeoJSON ----------

export function readJsonFile(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

export function sha256File(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

// Calls fn on every [x, y] position in a geometry
function forEachPosition(geometry, fn) {
  if (geometry.type === 'GeometryCollection') {
    geometry.geometries.forEach(g => forEachPosition(g, fn))
    return
  }
  const walk = (coords) => {
    if (typeof coords[0] === 'number') fn(coords)
    else coords.forEach(walk)
  }
  walk(geometry.coordinates)
}

// Checks the file is a FeatureCollection in WGS84 lng/lat that Directus can store.
// Returns { errors, geometryCounts }; any error means the file must not be imported.
export function validateFeatureCollection(geojson, geometryField = 'geometry') {
  const errors = []
  if (geojson?.type !== 'FeatureCollection' || !Array.isArray(geojson.features)) {
    return { errors: ['File is not a GeoJSON FeatureCollection'], geometryCounts: {} }
  }
  if (geojson.features.length === 0) {
    return { errors: ['FeatureCollection has no features'], geometryCounts: {} }
  }

  const crsName = geojson.crs?.properties?.name
  if (crsName && !/CRS84|EPSG:+4326$/i.test(crsName)) {
    errors.push(`File declares coordinate system "${crsName}". Reproject to WGS84 (EPSG:4326) before importing.`)
  }

  const geometryCounts = {}
  const missingGeometry = []
  const conflictingProperty = []
  let outOfRange = null

  geojson.features.forEach((feature, index) => {
    if (!feature?.geometry?.type) {
      missingGeometry.push(index)
      return
    }
    geometryCounts[feature.geometry.type] = (geometryCounts[feature.geometry.type] || 0) + 1
    if (feature.properties && geometryField in feature.properties) conflictingProperty.push(index)
    if (!outOfRange) {
      forEachPosition(feature.geometry, ([lng, lat]) => {
        if (!outOfRange && (Math.abs(lng) > 180 || Math.abs(lat) > 90)) outOfRange = { index, lng, lat }
      })
    }
  })

  if (missingGeometry.length) {
    errors.push(`${missingGeometry.length} feature(s) have no geometry (e.g. feature #${missingGeometry.slice(0, 5).join(', #')})`)
  }
  if (conflictingProperty.length) {
    errors.push(`${conflictingProperty.length} feature(s) have a property named "${geometryField}", which would clash with the geometry field`)
  }
  if (outOfRange) {
    errors.push(`Feature #${outOfRange.index} has coordinates [${outOfRange.lng}, ${outOfRange.lat}], which are not longitude/latitude. The file is probably in a projected coordinate system; reproject to WGS84 (EPSG:4326) first.`)
  }
  return { errors, geometryCounts }
}

// One geometry type for the whole collection: specific when all features agree, generic otherwise
export function inferGeometryType(geometryCounts) {
  const types = Object.keys(geometryCounts)
  return types.length === 1 && GEOMETRY_TYPES.includes(types[0]) ? `geometry.${types[0]}` : 'geometry'
}

// ---------- flattening (same as: jq '[.features[] | .properties + {geometry: .geometry}]') ----------

// `drop` uses the file's original property names and is applied before `rename`
export function flattenFeatures(features, { geometryField = 'geometry', rename = {}, drop = [] } = {}) {
  return features.map(feature => {
    const row = {}
    for (const [key, value] of Object.entries(feature.properties || {})) {
      if (drop.includes(key)) continue
      row[rename[key] || key] = value
    }
    row[geometryField] = feature.geometry
    return row
  })
}

// ---------- type inference ----------

const isEmpty = (value) => value === null || value === undefined || value === ''

// Infers the Directus type for one field from every value it has in the file
export function inferFieldType(name, values) {
  const filled = values.filter(v => !isEmpty(v))
  const warnings = []
  const hints = []

  if (filled.length === 0) {
    return { type: 'string', warnings: ['all values are empty; consider adding it to "drop"'], hints }
  }

  const kinds = new Set(filled.map(v => (Array.isArray(v) ? 'object' : typeof v)))

  if (kinds.has('object')) {
    if (kinds.size > 1) warnings.push('mixes objects with plain values')
    return { type: 'json', warnings, hints }
  }
  if (kinds.size > 1) {
    warnings.push(`mixes ${[...kinds].join(' and ')} values; stored as text`)
    return { type: 'string', warnings, hints }
  }

  const [kind] = kinds
  if (kind === 'boolean') return { type: 'boolean', warnings, hints }

  if (kind === 'number') {
    if (isIdLikeName(name)) {
      hints.push('numeric values, but the name looks like an ID, so it is stored as text')
      return { type: 'string', warnings, hints }
    }
    if (filled.every(Number.isInteger)) {
      return { type: filled.some(v => Math.abs(v) > MAX_INTEGER) ? 'bigInteger' : 'integer', warnings, hints }
    }
    return { type: 'float', warnings, hints }
  }

  // strings
  if (filled.every(v => /^\d{4}-\d{2}-\d{2}/.test(v))) hints.push('values look like dates; change the type by hand if needed')
  else if (!isIdLikeName(name) && filled.every(v => /^-?\d+(\.\d+)?$/.test(v) && !/^-?0\d/.test(v))) {
    hints.push('text values that look numeric; change to integer/float by hand if they are quantities')
  }
  const type = filled.some(v => v.length > MAX_STRING_LENGTH) ? 'text' : 'string'
  return { type, warnings, hints }
}

// Per-field type and fill statistics across all rows (excluding the geometry field)
export function analyzeFields(rows, geometryField = 'geometry') {
  const names = []
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (key !== geometryField && !names.includes(key)) names.push(key)
    }
  }
  return names.map(name => {
    const values = rows.map(row => row[name])
    const filledValues = values.filter(v => !isEmpty(v))
    const unique = filledValues.length === rows.length && new Set(filledValues.map(String)).size === rows.length
    return { name, filled: filledValues.length, total: rows.length, unique, ...inferFieldType(name, values) }
  })
}

// Only an ID-like field that is filled and unique in every row is a safe primary key;
// otherwise Directus adds its own auto-numbered `id`
export function suggestPrimaryKey(fieldStats) {
  const candidate = fieldStats.find(f => f.unique && isIdLikeName(f.name) && ['string', 'integer', 'bigInteger'].includes(f.type))
  return candidate ? candidate.name : null
}

export function buildSchema({ collection, source, geometryField = 'geometry', geometryType, fieldStats, rename = {}, drop = [] }) {
  return {
    collection,
    source,
    note: '',
    primaryKey: suggestPrimaryKey(fieldStats),
    geometry: { field: geometryField, type: geometryType },
    fields: Object.fromEntries(fieldStats.map(f => [f.name, { type: f.type }])),
    rename,
    drop,
  }
}

// Differences between a saved (reviewed) schema and a freshly inferred one, for the plan report
export function diffSchemas(saved, inferred) {
  const differences = []
  for (const [name, { type }] of Object.entries(inferred.fields)) {
    if (!saved.fields[name]) differences.push(`field "${name}" is in the file but not in the saved schema`)
    else if (saved.fields[name].type !== type) differences.push(`field "${name}": saved as ${saved.fields[name].type}, file suggests ${type}`)
  }
  for (const name of Object.keys(saved.fields)) {
    if (!inferred.fields[name]) differences.push(`field "${name}" is in the saved schema but not in the file`)
  }
  if (saved.geometry.type !== inferred.geometry.type) {
    differences.push(`geometry: saved as ${saved.geometry.type}, file suggests ${inferred.geometry.type}`)
  }
  return differences
}

// ---------- checking rows against the schema before anything is sent ----------

export function validateSchema(schema) {
  const errors = []
  if (!schema.collection) errors.push('schema has no "collection" name')
  for (const [name, { type }] of Object.entries(schema.fields || {})) {
    if (!FIELD_TYPES.includes(type)) errors.push(`field "${name}" has unsupported type "${type}" (use one of: ${FIELD_TYPES.join(', ')})`)
  }
  // A dropped property never reaches the rows, so listing it in fields too would only create an empty column
  for (const name of schema.drop || []) {
    const renamedTo = schema.rename?.[name]
    if (schema.fields?.[name] || (renamedTo && schema.fields?.[renamedTo])) {
      errors.push(`"${name}" is in both "fields" and "drop"; remove it from "fields" to leave it out, or from "drop" to keep it`)
    }
  }
  if (schema.primaryKey && !schema.fields?.[schema.primaryKey]) errors.push(`primaryKey "${schema.primaryKey}" is not one of the fields`)
  if (!/^geometry(\.\w+)?$/.test(schema.geometry?.type || '')) errors.push('schema "geometry.type" must be "geometry" or e.g. "geometry.Polygon"')
  return errors
}

// Converts one value to the field's type where that is lossless, or returns an error message
function coerceValue(value, type) {
  if (isEmpty(value)) return { value: type === 'string' || type === 'text' ? (value ?? null) : null }
  switch (type) {
    case 'string':
    case 'text': {
      if (typeof value === 'object') return { error: 'is an object/array; use type json' }
      const text = String(value)
      if (type === 'string' && text.length > MAX_STRING_LENGTH) return { error: `is longer than ${MAX_STRING_LENGTH} characters; use type text` }
      return { value: text }
    }
    case 'integer':
    case 'bigInteger': {
      const number = typeof value === 'string' && /^-?\d+$/.test(value) ? Number(value) : value
      if (!Number.isInteger(number)) return { error: 'is not a whole number' }
      if (type === 'integer' && Math.abs(number) > MAX_INTEGER) return { error: 'is too large for integer; use bigInteger' }
      return { value: number }
    }
    case 'float':
    case 'decimal': {
      const number = typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value
      if (typeof number !== 'number' || !Number.isFinite(number)) return { error: 'is not a number' }
      return { value: number }
    }
    case 'boolean': {
      if (typeof value === 'boolean') return { value }
      if (value === 'true' || value === 'false') return { value: value === 'true' }
      return { error: 'is not true/false' }
    }
    default: // json
      return { value }
  }
}

// Returns rows converted to the schema's types plus every problem found.
// Any error means nothing should be sent to Directus.
export function prepareRows(rows, schema) {
  const errors = []
  const geometryField = schema.geometry.field
  const specificGeometry = schema.geometry.type.split('.')[1]
  const seenKeys = new Set()

  const prepared = rows.map((row, index) => {
    const out = {}
    for (const key of Object.keys(row)) {
      if (key !== geometryField && !schema.fields[key]) {
        errors.push({ row: index, field: key, message: 'is not in the schema; add it to "fields" or "drop"' })
      }
    }
    for (const [name, { type }] of Object.entries(schema.fields)) {
      const result = coerceValue(row[name], type)
      if (result.error) errors.push({ row: index, field: name, value: row[name], message: result.error })
      else out[name] = result.value
    }

    const geometry = row[geometryField]
    if (!geometry?.type) errors.push({ row: index, field: geometryField, message: 'is missing' })
    else if (specificGeometry && geometry.type !== specificGeometry) {
      errors.push({ row: index, field: geometryField, message: `is a ${geometry.type}, but the schema only allows ${specificGeometry}` })
    }
    out[geometryField] = geometry

    if (schema.primaryKey) {
      const key = out[schema.primaryKey]
      if (isEmpty(key)) errors.push({ row: index, field: schema.primaryKey, message: 'is the primary key but is empty' })
      else if (seenKeys.has(key)) errors.push({ row: index, field: schema.primaryKey, value: key, message: 'is the primary key but is a duplicate' })
      seenKeys.add(key)
    }
    return out
  })
  return { rows: prepared, errors }
}

// ---------- Directus collection definitions ----------

// Fields Directus should have for this schema, including the primary key and geometry
export function expectedDirectusFields(schema) {
  const fields = Object.fromEntries(Object.entries(schema.fields).map(([name, { type }]) => [name, type]))
  if (!schema.primaryKey) fields.id = 'integer'
  fields[schema.geometry.field] = schema.geometry.type
  return fields
}

const geometryCompatible = (a, b) => a.startsWith('geometry') && b.startsWith('geometry') && (a === 'geometry' || b === 'geometry')

// Compares the schema with an existing collection's fields (from readFieldsByCollection)
export function compareWithDirectus(schema, directusFields) {
  const expected = expectedDirectusFields(schema)
  const actual = Object.fromEntries(directusFields.filter(f => f.type !== 'alias').map(f => [f.field, f.type]))
  const missing = Object.keys(expected).filter(name => !(name in actual))
  const extra = Object.keys(actual).filter(name => !(name in expected))
  const typeMismatches = Object.keys(expected)
    .filter(name => name in actual && actual[name] !== expected[name] && !geometryCompatible(actual[name], expected[name]))
    .map(name => ({ field: name, expected: expected[name], actual: actual[name] }))
  return { matches: !missing.length && !extra.length && !typeMismatches.length, missing, extra, typeMismatches }
}

// Payload for createCollection(): the collection plus all of its fields in one request
export function collectionPayload(schema, note) {
  const primaryKeyField = schema.primaryKey
    ? { field: schema.primaryKey, type: schema.fields[schema.primaryKey].type, schema: { is_primary_key: true, is_nullable: false, has_auto_increment: false } }
    : { field: 'id', type: 'integer', schema: { is_primary_key: true, has_auto_increment: true }, meta: { hidden: true, readonly: true } }

  const fields = Object.entries(schema.fields)
    .filter(([name]) => name !== schema.primaryKey)
    .map(([name, { type }]) => ({ field: name, type, schema: {} }))

  return {
    collection: schema.collection,
    meta: { note, icon: 'map' },
    schema: {},
    fields: [
      primaryKeyField,
      ...fields,
      { field: schema.geometry.field, type: schema.geometry.type, schema: {}, meta: { interface: 'map' } },
    ],
  }
}

export function importNote(schema, { sourceName, sha256, rowCount, date = new Date() }) {
  // en-CA formats as YYYY-MM-DD in the local time zone (toISOString would give the UTC date)
  const line = `Imported by data:import from ${sourceName} (sha256 ${sha256.slice(0, 12)}) on ${date.toLocaleDateString('en-CA')}, ${rowCount} rows`
  return [schema.note, line].filter(Boolean).join(' | ')
}

// Directus rejects requests over ~1 MB, so rows are sent in batches capped by size and count
export function chunkRows(rows, { maxBytes = 500_000, maxRows = 200 } = {}) {
  const batches = []
  let batch = []
  let bytes = 0
  for (const row of rows) {
    const size = Buffer.byteLength(JSON.stringify(row))
    if (batch.length && (bytes + size > maxBytes || batch.length >= maxRows)) {
      batches.push(batch)
      batch = []
      bytes = 0
    }
    batch.push(row)
    bytes += size
  }
  if (batch.length) batches.push(batch)
  return batches
}

// ---------- Directus client ----------

// Uses a separate admin token so the website's token can later become read-only
export function createAdminClient() {
  const { DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN } = process.env
  if (!DIRECTUS_URL || !DIRECTUS_ADMIN_TOKEN) {
    throw new Error('DIRECTUS_URL and DIRECTUS_ADMIN_TOKEN must be set (add them to .env.local)')
  }
  return createDirectus(DIRECTUS_URL).with(staticToken(DIRECTUS_ADMIN_TOKEN)).with(rest())
}

// Directus SDK errors carry the server's messages in `errors`
export function describeError(error) {
  return error?.errors?.map(e => e.message).join('; ') || error?.message || String(error)
}
