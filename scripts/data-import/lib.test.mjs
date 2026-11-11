// Unit tests for the data-import logic. Run with: npm run test:data-import
// They use small made-up features and never contact Directus.

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  analyzeFields, buildSchema, chunkRows, collectionPayload, compareWithDirectus, diffSchemas, flattenFeatures,
  importNote, inferFieldType, inferGeometryType, isIdLikeName, prepareRows, suggestPrimaryKey, toCollectionName,
  validateFeatureCollection, validateSchema,
} from './lib.mjs'

// ---------- helpers to build tiny test data ----------

const square = { type: 'Polygon', coordinates: [[[-80.5, 43.4], [-80.4, 43.4], [-80.4, 43.5], [-80.5, 43.4]]] }
const point = { type: 'Point', coordinates: [-80.5, 43.45] }
const feature = (properties, geometry = square) => ({ type: 'Feature', properties, geometry })
const collectionOf = (...features) => ({ type: 'FeatureCollection', features })

const schemaWith = (fields, overrides = {}) => ({
  collection: 'test_areas',
  source: 'test_areas.geojson',
  note: '',
  primaryKey: null,
  geometry: { field: 'geometry', type: 'geometry.Polygon' },
  fields,
  rename: {},
  drop: [],
  ...overrides,
})

// ---------- naming ----------

describe('toCollectionName', () => {
  it('turns a file name into a lowercase snake_case collection name', () => {
    assert.equal(toCollectionName('parks_da.geojson'), 'parks_da')
    assert.equal(toCollectionName('data_import/Parks DA.geojson'), 'parks_da')
    assert.equal(toCollectionName('Onemill-Season9 (test).json'), 'onemill_season9_test')
  })
})

describe('isIdLikeName', () => {
  it('recognises the ID field names used in our census and park data', () => {
    for (const name of ['id', 'DAUID', 'DGUID', 'ADAUID', 'CFSAUID', 'park_id', 'fsa_code', 'OBJECTID']) {
      assert.ok(isIdLikeName(name), `${name} should be ID-like`)
    }
  })

  it('does not treat ordinary fields as IDs, even if they end in "id"', () => {
    for (const name of ['population_2021', 'city', 'LANDAREA', 'paid', 'grid', 'valid']) {
      assert.ok(!isIdLikeName(name), `${name} should not be ID-like`)
    }
  })
})

// ---------- validating the file ----------

describe('validateFeatureCollection', () => {
  it('accepts a valid WGS84 FeatureCollection and counts geometry types', () => {
    const { errors, geometryCounts } = validateFeatureCollection(collectionOf(feature({}), feature({}), feature({}, point)))
    assert.deepEqual(errors, [])
    assert.deepEqual(geometryCounts, { Polygon: 2, Point: 1 })
  })

  it('rejects something that is not a FeatureCollection', () => {
    assert.match(validateFeatureCollection([{ DAUID: '1' }]).errors[0], /not a GeoJSON FeatureCollection/)
  })

  it('rejects an empty FeatureCollection', () => {
    assert.match(validateFeatureCollection(collectionOf()).errors[0], /no features/)
  })

  it('rejects features without a geometry and says which ones', () => {
    const { errors } = validateFeatureCollection(collectionOf(feature({}), feature({}, null)))
    assert.match(errors[0], /1 feature\(s\) have no geometry \(e\.g\. feature #1\)/)
  })

  it('rejects coordinates that are not longitude/latitude (a projected file)', () => {
    const utm = { type: 'Polygon', coordinates: [[[540000, 4810000], [541000, 4810000], [541000, 4811000], [540000, 4810000]]] }
    assert.match(validateFeatureCollection(collectionOf(feature({}, utm))).errors[0], /not longitude\/latitude/)
  })

  it('rejects a declared coordinate system other than WGS84', () => {
    const file = { ...collectionOf(feature({})), crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::26917' } } }
    assert.match(validateFeatureCollection(file).errors[0], /Reproject to WGS84/)
  })

  it('accepts the CRS84 declaration that QGIS writes for WGS84 files', () => {
    const file = { ...collectionOf(feature({})), crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } } }
    assert.deepEqual(validateFeatureCollection(file).errors, [])
  })

  it('rejects a property with the same name as the geometry field', () => {
    assert.match(validateFeatureCollection(collectionOf(feature({ geometry: 'x' }))).errors[0], /clash with the geometry field/)
  })
})

describe('inferGeometryType', () => {
  it('uses the specific type when every feature has the same one', () => {
    assert.equal(inferGeometryType({ Polygon: 766 }), 'geometry.Polygon')
  })

  it('uses generic geometry when types are mixed, like parks_da', () => {
    assert.equal(inferGeometryType({ Polygon: 2365, MultiPolygon: 22, Point: 61 }), 'geometry')
  })
})

// ---------- flattening ----------

describe('flattenFeatures', () => {
  it('produces the same rows as our jq one-liner: properties plus a geometry field', () => {
    const rows = flattenFeatures([feature({ DAUID: '35300002', city: 'Woolwich' })])
    assert.deepEqual(rows, [{ DAUID: '35300002', city: 'Woolwich', geometry: square }])
  })

  it('drops and renames properties as listed in the schema, keeping field order', () => {
    const rows = flattenFeatures(
      [feature({ OBJECTID: 7, name: 'Victoria Park', neaby_pop: 120 })],
      { drop: ['OBJECTID'], rename: { neaby_pop: 'nearby_pop' } },
    )
    assert.deepEqual(rows, [{ name: 'Victoria Park', nearby_pop: 120, geometry: square }])
    assert.deepEqual(Object.keys(rows[0]), ['name', 'nearby_pop', 'geometry'])
  })
})

// ---------- type inference ----------

describe('inferFieldType', () => {
  it('whole numbers become integer', () => {
    assert.equal(inferFieldType('population_2021', [1481, 394, 0]).type, 'integer')
  })

  it('very large whole numbers become bigInteger', () => {
    assert.equal(inferFieldType('total', [1, 3_000_000_000]).type, 'bigInteger')
  })

  it('any decimal makes the whole field float, whichever row it is in', () => {
    assert.equal(inferFieldType('LANDAREA', [6, 0.1718, 12]).type, 'float')
  })

  it('numbers in an ID-like field are stored as text', () => {
    const result = inferFieldType('DAUID', [35300002, 35300003])
    assert.equal(result.type, 'string')
    assert.match(result.hints[0], /looks like an ID/)
  })

  it('a field that is empty everywhere is flagged for dropping', () => {
    const result = inferFieldType('nearby_pop_2021', [null, null, ''])
    assert.equal(result.type, 'string')
    assert.match(result.warnings[0], /all values are empty/)
  })

  it('empty values are ignored when inferring the type', () => {
    assert.equal(inferFieldType('population_2021', [1481, null, 394]).type, 'integer')
  })

  it('mixed numbers and text become string with a warning', () => {
    const result = inferFieldType('rank', [1, 'two'])
    assert.equal(result.type, 'string')
    assert.match(result.warnings[0], /mixes number and string/)
  })

  it('true/false values become boolean', () => {
    assert.equal(inferFieldType('accessible', [true, false]).type, 'boolean')
  })

  it('text longer than 255 characters becomes text instead of string', () => {
    assert.equal(inferFieldType('description', ['short', 'x'.repeat(256)]).type, 'text')
  })

  it('objects and arrays become json', () => {
    assert.equal(inferFieldType('tags', [['park'], { a: 1 }]).type, 'json')
  })

  it('date-looking text stays string, with a hint to change it by hand', () => {
    const result = inferFieldType('opened', ['2021-05-01', '2019-11-30'])
    assert.equal(result.type, 'string')
    assert.match(result.hints[0], /look like dates/)
  })

  it('numeric-looking text stays string, with a hint (shapefile exports often do this)', () => {
    const result = inferFieldType('population', ['1481', '394'])
    assert.equal(result.type, 'string')
    assert.match(result.hints[0], /look numeric/)
  })

  it('text with leading zeros gets no numeric hint, since the zeros matter', () => {
    assert.deepEqual(inferFieldType('zone', ['0123', '0456']).hints, [])
  })
})

describe('analyzeFields and suggestPrimaryKey', () => {
  const rows = flattenFeatures([
    feature({ DAUID: '35300002', city: 'Woolwich', population_2021: 1481 }),
    feature({ DAUID: '35300003', city: 'Woolwich', population_2021: 394 }),
  ])

  it('reports type, how many rows are filled, and uniqueness for every field', () => {
    const stats = analyzeFields(rows)
    assert.deepEqual(stats.map(({ name, type, filled, unique }) => ({ name, type, filled, unique })), [
      { name: 'DAUID', type: 'string', filled: 2, unique: true },
      { name: 'city', type: 'string', filled: 2, unique: false },
      { name: 'population_2021', type: 'integer', filled: 2, unique: true },
    ])
  })

  it('suggests a unique ID-like field as the primary key', () => {
    assert.equal(suggestPrimaryKey(analyzeFields(rows)), 'DAUID')
  })

  it('does not suggest a unique field that is not ID-like (population just happens to be unique)', () => {
    const withoutIds = rows.map(({ DAUID, ...rest }) => rest)
    assert.equal(suggestPrimaryKey(analyzeFields(withoutIds)), null)
  })

  it('does not suggest an ID field with duplicates', () => {
    const duplicated = flattenFeatures([feature({ park_id: 'a' }), feature({ park_id: 'a' })])
    assert.equal(suggestPrimaryKey(analyzeFields(duplicated)), null)
  })

  it('does not suggest an ID field with empty values', () => {
    const withGap = flattenFeatures([feature({ park_id: 'a' }), feature({ park_id: null })])
    assert.equal(suggestPrimaryKey(analyzeFields(withGap)), null)
  })

  it('finds fields that only some features have', () => {
    const uneven = flattenFeatures([feature({ name: 'A' }), feature({ name: 'B', leisure: 'park' })])
    assert.deepEqual(analyzeFields(uneven).map(f => [f.name, f.filled]), [['name', 2], ['leisure', 1]])
  })
})

describe('buildSchema and diffSchemas', () => {
  const stats = analyzeFields(flattenFeatures([feature({ DAUID: '1', city: 'Kitchener' }), feature({ DAUID: '2', city: 'Waterloo' })]))
  const schema = buildSchema({ collection: 'test_areas', source: 'test_areas.geojson', geometryType: 'geometry.Polygon', fieldStats: stats })

  it('builds a schema with the suggested primary key, field types, and geometry type', () => {
    assert.equal(schema.primaryKey, 'DAUID')
    assert.deepEqual(schema.fields, { DAUID: { type: 'string' }, city: { type: 'string' } })
    assert.deepEqual(schema.geometry, { field: 'geometry', type: 'geometry.Polygon' })
  })

  it('reports no differences when the saved schema matches the file', () => {
    assert.deepEqual(diffSchemas(schema, schema), [])
  })

  it('reports fields added, removed, or retyped since the schema was reviewed', () => {
    const saved = { ...schema, fields: { DAUID: { type: 'string' }, city: { type: 'text' }, old_field: { type: 'integer' } } }
    assert.deepEqual(diffSchemas(saved, schema), [
      'field "city": saved as text, file suggests string',
      'field "old_field" is in the saved schema but not in the file',
    ])
  })
})

// ---------- checking rows before import ----------

describe('validateSchema', () => {
  it('accepts a well-formed schema', () => {
    assert.deepEqual(validateSchema(schemaWith({ DAUID: { type: 'string' } }, { primaryKey: 'DAUID' })), [])
  })

  it('catches a hand-edited type Directus does not support, a missing primary key field, and a bad geometry type', () => {
    const errors = validateSchema(schemaWith({ opened: { type: 'date-ish' } }, { primaryKey: 'DAUID', geometry: { field: 'geometry', type: 'shape' } }))
    assert.equal(errors.length, 3)
  })

  it('refuses a property listed in both "fields" and "drop", which would only create an empty column', () => {
    const errors = validateSchema(schemaWith({ park_id: { type: 'string' }, geometry_types: { type: 'string' } }, { drop: ['geometry_types'] }))
    assert.deepEqual(errors, ['"geometry_types" is in both "fields" and "drop"; remove it from "fields" to leave it out, or from "drop" to keep it'])
  })

  it('accepts a property that is in "drop" and not in "fields"', () => {
    assert.deepEqual(validateSchema(schemaWith({ park_id: { type: 'string' } }, { drop: ['geometry_types'] })), [])
  })
})

describe('importNote', () => {
  it('combines the reviewed note with where the data came from, dated in local time', () => {
    const lateEvening = new Date(2026, 9, 28, 23, 30) // Oct 28, 11:30 pm local: already Oct 29 in UTC
    const note = importNote(schemaWith({}, { note: 'OSM parks' }), { sourceName: 'parks.geojson', sha256: 'f89d90aca7a8ffff', rowCount: 2448, date: lateEvening })
    assert.equal(note, 'OSM parks | Imported by data:import from parks.geojson (sha256 f89d90aca7a8) on 2026-10-28, 2448 rows')
  })
})

describe('prepareRows', () => {
  it('converts values to the schema type where nothing is lost', () => {
    const schema = schemaWith({ DAUID: { type: 'string' }, population: { type: 'integer' }, area: { type: 'decimal' }, flag: { type: 'boolean' } })
    const { rows, errors } = prepareRows([{ DAUID: 35300002, population: '1481', area: '6.8791', flag: 'true', geometry: square }], schema)
    assert.deepEqual(errors, [])
    assert.deepEqual(rows[0], { DAUID: '35300002', population: 1481, area: 6.8791, flag: true, geometry: square })
  })

  it('turns empty values into null for non-text fields', () => {
    const { rows } = prepareRows([{ population: '', geometry: square }], schemaWith({ population: { type: 'integer' } }))
    assert.equal(rows[0].population, null)
  })

  it('reports values that do not fit their type, with the row number and value', () => {
    const { errors } = prepareRows([{ population: 'many', geometry: square }], schemaWith({ population: { type: 'integer' } }))
    assert.deepEqual(errors, [{ row: 0, field: 'population', value: 'many', message: 'is not a whole number' }])
  })

  it('reports fields in the file that are missing from the schema, instead of silently dropping them', () => {
    const { errors } = prepareRows([{ city: 'Cambridge', extra: 1, geometry: square }], schemaWith({ city: { type: 'string' } }))
    assert.match(errors[0].message, /not in the schema/)
    assert.equal(errors[0].field, 'extra')
  })

  it('reports geometry that does not match a specific geometry type', () => {
    const { errors } = prepareRows([{ geometry: point }], schemaWith({}))
    assert.match(errors[0].message, /is a Point, but the schema only allows Polygon/)
  })

  it('reports duplicate and empty primary keys', () => {
    const schema = schemaWith({ park_id: { type: 'string' } }, { primaryKey: 'park_id' })
    const { errors } = prepareRows([{ park_id: 'a', geometry: square }, { park_id: 'a', geometry: square }, { park_id: null, geometry: square }], schema)
    assert.deepEqual(errors.map(e => [e.row, e.message]), [
      [1, 'is the primary key but is a duplicate'],
      [2, 'is the primary key but is empty'],
    ])
  })

  it('rejects text longer than a string field can hold', () => {
    const { errors } = prepareRows([{ name: 'x'.repeat(300), geometry: square }], schemaWith({ name: { type: 'string' } }))
    assert.match(errors[0].message, /use type text/)
  })
})

// ---------- comparing with an existing Directus collection ----------

describe('compareWithDirectus', () => {
  const schema = schemaWith({ DAUID: { type: 'string' }, population: { type: 'integer' } }, { primaryKey: 'DAUID' })
  const directusField = (field, type) => ({ field, type })

  it('matches a collection with the same fields and types', () => {
    const fields = [directusField('DAUID', 'string'), directusField('population', 'integer'), directusField('geometry', 'geometry.Polygon')]
    assert.equal(compareWithDirectus(schema, fields).matches, true)
  })

  it('treats generic and specific geometry as compatible', () => {
    const fields = [directusField('DAUID', 'string'), directusField('population', 'integer'), directusField('geometry', 'geometry')]
    assert.equal(compareWithDirectus(schema, fields).matches, true)
  })

  it('reports missing fields, extra fields, and type changes so replace can refuse', () => {
    const fields = [directusField('DAUID', 'string'), directusField('population', 'float'), directusField('city', 'string'), directusField('geometry', 'geometry')]
    const result = compareWithDirectus(schema, fields)
    assert.equal(result.matches, false)
    assert.deepEqual(result.extra, ['city'])
    assert.deepEqual(result.typeMismatches, [{ field: 'population', expected: 'integer', actual: 'float' }])
  })

  it('expects an auto-numbered id when the schema has no primary key', () => {
    const noKey = schemaWith({ name: { type: 'string' } })
    assert.deepEqual(compareWithDirectus(noKey, [directusField('name', 'string'), directusField('geometry', 'geometry')]).missing, ['id'])
  })
})

describe('collectionPayload', () => {
  it('uses the chosen field as primary key and adds a map-enabled geometry field', () => {
    const payload = collectionPayload(schemaWith({ DAUID: { type: 'string' }, city: { type: 'string' } }, { primaryKey: 'DAUID' }), 'note')
    assert.deepEqual(payload.fields.map(f => [f.field, f.type]), [['DAUID', 'string'], ['city', 'string'], ['geometry', 'geometry.Polygon']])
    assert.equal(payload.fields[0].schema.is_primary_key, true)
    assert.equal(payload.fields[2].meta.interface, 'map')
  })

  it('adds an auto-numbered id when there is no primary key', () => {
    const payload = collectionPayload(schemaWith({ name: { type: 'string' } }), 'note')
    assert.equal(payload.fields[0].field, 'id')
    assert.equal(payload.fields[0].schema.has_auto_increment, true)
  })
})

// ---------- batching ----------

describe('chunkRows', () => {
  it('splits rows into batches no larger than the row limit', () => {
    const batches = chunkRows(Array.from({ length: 450 }, (_, i) => ({ i })), { maxRows: 200 })
    assert.deepEqual(batches.map(b => b.length), [200, 200, 50])
  })

  it('starts a new batch before the size limit is exceeded', () => {
    const row = { text: 'x'.repeat(100) } // ~111 bytes as JSON
    assert.deepEqual(chunkRows([row, row, row], { maxBytes: 250 }).map(b => b.length), [2, 1])
  })

  it('still sends a single row that is bigger than the size limit, in its own batch', () => {
    const big = { text: 'x'.repeat(1000) }
    assert.deepEqual(chunkRows([{ a: 1 }, big], { maxBytes: 100 }).map(b => b.length), [1, 1])
  })
})
