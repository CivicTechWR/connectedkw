// npm run data:plan -- <name or file> [--fresh]
//
// Reads data_import/<name>.geojson, checks it, infers a schema, and writes
// data_import/<collection>.schema.json for you to review. Never changes anything in Directus.

import { existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import { aggregate, readCollections, readFieldsByCollection } from '@directus/sdk'
import {
  DATA_DIR, analyzeFields, buildSchema, compareWithDirectus, createAdminClient, describeError, diffSchemas,
  flattenFeatures, inferGeometryType, readJsonFile, toCollectionName, validateFeatureCollection, validateSchema,
} from './lib.mjs'

const { positionals, values: options } = parseArgs({ allowPositionals: true, options: { fresh: { type: 'boolean' } } })
if (positionals.length !== 1) {
  console.error('Usage: npm run data:plan -- <name or file> [--fresh]\n  e.g. npm run data:plan -- parks_da')
  process.exit(1)
}

function findSourceFile(arg) {
  const candidates = /\.(geo)?json$/i.test(arg)
    ? [path.resolve(arg), path.join(DATA_DIR, arg)]
    : [path.join(DATA_DIR, `${arg}.geojson`), path.join(DATA_DIR, `${arg}.json`)]
  return candidates.find(existsSync)
}

const sourceFile = findSourceFile(positionals[0])
if (!sourceFile) {
  console.error(`Could not find "${positionals[0]}" (looked in ${path.relative(process.cwd(), DATA_DIR)}/ for .geojson and .json)`)
  process.exit(1)
}

const collection = toCollectionName(sourceFile)
const schemaFile = path.join(DATA_DIR, `${collection}.schema.json`)
const savedSchema = !options.fresh && existsSync(schemaFile) ? readJsonFile(schemaFile) : null

// 1. Check the file
const geojson = readJsonFile(sourceFile)
const geometryField = savedSchema?.geometry.field || 'geometry'
const { errors, geometryCounts } = validateFeatureCollection(geojson, geometryField)
if (errors.length) {
  console.error(`✗ ${path.basename(sourceFile)} can't be imported:`)
  errors.forEach(e => console.error(`  - ${e}`))
  process.exit(1)
}

// 2. Flatten (applying any reviewed rename/drop) and infer types
const rename = savedSchema?.rename || {}
const drop = savedSchema?.drop || []
const rows = flattenFeatures(geojson.features, { geometryField, rename, drop })
const fieldStats = analyzeFields(rows, geometryField)
const geometryType = inferGeometryType(geometryCounts)
const inferred = buildSchema({ collection, source: path.basename(sourceFile), geometryField, geometryType, fieldStats, rename, drop })

// 3. Report
const geometrySummary = Object.entries(geometryCounts).map(([type, count]) => `${type} ${count.toLocaleString()}`).join(' · ')
console.log(`\n${path.basename(sourceFile)} → collection "${collection}"`)
console.log(`  ${rows.length.toLocaleString()} features · ${geometrySummary} → geometry type: ${geometryType}`)
console.log('  WGS84 ✓   all features have geometry ✓\n')

const nameWidth = Math.max(5, ...fieldStats.map(f => f.name.length)) + 2
console.log(`  ${'field'.padEnd(nameWidth)}${'type'.padEnd(12)}${'filled'.padStart(8)}   notes`)
for (const field of fieldStats) {
  const notes = [
    field.name === inferred.primaryKey ? 'unique → suggested primary key' : null,
    ...field.warnings.map(w => `⚠ ${w}`),
    ...field.hints.map(h => `💡 ${h}`),
  ].filter(Boolean).join('; ')
  console.log(`  ${field.name.padEnd(nameWidth)}${field.type.padEnd(12)}${field.filled.toLocaleString().padStart(8)}   ${notes}`)
}
if (!inferred.primaryKey) console.log('\n  No unique ID-like field found: Directus will add an auto-numbered "id" primary key.')

// 4. Compare with Directus (read-only)
const schemaToCompare = savedSchema || inferred
try {
  const client = createAdminClient()
  const existing = (await client.request(readCollections())).some(c => c.collection === collection)
  if (!existing) {
    console.log(`\n  Directus: no collection named "${collection}" yet → it can be created with mode "create".`)
  } else {
    const [fields, [{ count }]] = await Promise.all([
      client.request(readFieldsByCollection(collection)),
      client.request(aggregate(collection, { aggregate: { count: '*' } })),
    ])
    const comparison = compareWithDirectus(schemaToCompare, fields)
    console.log(`\n  Directus: collection "${collection}" ALREADY EXISTS with ${Number(count).toLocaleString()} rows (file has ${rows.length.toLocaleString()}).`)
    if (comparison.matches) {
      console.log('  Its fields match the schema → "--mode=replace" would work.')
    } else {
      console.log('  Its fields do NOT match the schema, so "--mode=replace" would refuse:')
      comparison.missing.forEach(f => console.log(`    - "${f}" is not in Directus`))
      comparison.extra.forEach(f => console.log(`    - "${f}" is in Directus but not in the schema`))
      comparison.typeMismatches.forEach(m => console.log(`    - "${m.field}" is ${m.actual} in Directus, ${m.expected} in the schema`))
      console.log('  Consider importing under a new name instead (e.g. a "_v2" suffix).')
    }
  }
} catch (error) {
  console.log(`\n  Directus comparison skipped: ${describeError(error)}`)
}

// 5. Write the schema, never overwriting one that has been reviewed
const relativeSchemaFile = path.relative(process.cwd(), schemaFile)
if (savedSchema) {
  const differences = diffSchemas(savedSchema, inferred)
  const schemaErrors = validateSchema(savedSchema)
  console.log(`\n  ${relativeSchemaFile} already exists and was NOT changed.`)
  if (schemaErrors.length) {
    console.log('  ✗ It has problems that data:import will refuse:')
    schemaErrors.forEach(e => console.log(`    - ${e}`))
  }
  if (differences.length) {
    console.log('  Differences between it and this file:')
    differences.forEach(d => console.log(`    - ${d}`))
    console.log('  Edit it by hand, or re-run with --fresh to regenerate it.')
  } else {
    console.log('  It matches this file.')
  }
} else {
  writeFileSync(schemaFile, `${JSON.stringify(inferred, null, 2)}\n`)
  console.log(`\n  → wrote ${relativeSchemaFile}. Review it, then run: npm run data:import -- ${collection}`)
}
console.log()
