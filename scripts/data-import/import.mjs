// npm run data:import -- <collection> [--mode=create|replace] [--dry-run] [--from-backup <file>] [--yes]
//
// Creates or refreshes a Directus collection from a reviewed data_import/<collection>.schema.json.
//   create (default)  creates the collection; refuses if it already exists
//   replace           backs up the current rows, deletes them, loads the new rows; refuses if fields differ
//   --dry-run         runs every check and prints what would happen, changes nothing
//   --from-backup     (replace only) loads a backup file instead of the GeoJSON, to undo a replace
//   --yes             skips the typed confirmation for replace

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { createInterface } from 'node:readline/promises'
import { parseArgs } from 'node:util'
import {
  aggregate, createCollection, createItems, deleteItems, readCollections, readFieldsByCollection, readItems, updateCollection,
} from '@directus/sdk'
import {
  BACKUP_DIR, DATA_DIR, chunkRows, collectionPayload, compareWithDirectus, createAdminClient, describeError,
  flattenFeatures, importNote, prepareRows, readJsonFile, sha256File, validateFeatureCollection, validateSchema,
} from './lib.mjs'

const { positionals, values: options } = parseArgs({
  allowPositionals: true,
  options: {
    mode: { type: 'string', default: 'create' },
    'dry-run': { type: 'boolean' },
    'from-backup': { type: 'string' },
    yes: { type: 'boolean' },
  },
})

const fail = (...lines) => {
  lines.forEach(line => console.error(line))
  process.exit(1)
}

if (positionals.length !== 1) fail('Usage: npm run data:import -- <collection> [--mode=create|replace] [--dry-run] [--from-backup <file>] [--yes]')
if (!['create', 'replace'].includes(options.mode)) fail(`Unknown mode "${options.mode}". Use --mode=create or --mode=replace.`)
if (options['from-backup'] && options.mode !== 'replace') fail('--from-backup only works with --mode=replace')

const dryRun = options['dry-run']
const collection = positionals[0]
const relative = (file) => path.relative(process.cwd(), file)

// 1. Load and check the reviewed schema
const schemaFile = path.join(DATA_DIR, `${collection}.schema.json`)
if (!existsSync(schemaFile)) fail(`No schema at ${relative(schemaFile)}. Run "npm run data:plan -- <file>" first.`)
const schema = readJsonFile(schemaFile)
const schemaErrors = validateSchema(schema)
if (schema.collection !== collection) schemaErrors.push(`schema says collection "${schema.collection}", but you asked for "${collection}"`)
if (schemaErrors.length) fail(`✗ ${relative(schemaFile)} has problems:`, ...schemaErrors.map(e => `  - ${e}`))

// 2. Build the rows from the GeoJSON (or a backup), converted to the schema's types
let sourceFile
let rawRows
if (options['from-backup']) {
  sourceFile = path.resolve(options['from-backup'])
  if (!existsSync(sourceFile)) fail(`Backup file not found: ${options['from-backup']}`)
  // Auto-numbered ids are left for Directus to assign again
  rawRows = readJsonFile(sourceFile).map(row => {
    if (schema.primaryKey) return row
    const { id, ...rest } = row
    return rest
  })
} else {
  sourceFile = path.join(DATA_DIR, schema.source)
  if (!existsSync(sourceFile)) fail(`Source file not found: ${relative(sourceFile)} (from "source" in the schema)`)
  const geojson = readJsonFile(sourceFile)
  const { errors } = validateFeatureCollection(geojson, schema.geometry.field)
  if (errors.length) fail(`✗ ${schema.source} can't be imported:`, ...errors.map(e => `  - ${e}`))
  rawRows = flattenFeatures(geojson.features, { geometryField: schema.geometry.field, rename: schema.rename, drop: schema.drop })
}

const { rows, errors: rowErrors } = prepareRows(rawRows, schema)
if (rowErrors.length) {
  const shown = rowErrors.slice(0, 15).map(e => `  - row ${e.row + 1}: "${e.field}"${'value' in e ? ` (${JSON.stringify(e.value)})` : ''} ${e.message}`)
  fail(`✗ ${rowErrors.length} problem(s) found; nothing was sent to Directus:`, ...shown,
    ...(rowErrors.length > 15 ? [`  …and ${rowErrors.length - 15} more`] : []))
}

const note = importNote(schema, { sourceName: path.basename(sourceFile), sha256: sha256File(sourceFile), rowCount: rows.length })
const batches = chunkRows(rows)
console.log(`\n${path.basename(sourceFile)}: ${rows.length.toLocaleString()} rows checked against the schema ✓ (${batches.length} batch${batches.length === 1 ? '' : 'es'})`)

// 3. Talk to Directus
let client
try {
  client = createAdminClient()
} catch (error) {
  fail(error.message)
}

async function request(command) {
  try {
    return await client.request(command)
  } catch (error) {
    throw new Error(describeError(error))
  }
}

async function countRows() {
  const [{ count }] = await request(aggregate(collection, { aggregate: { count: '*' } }))
  return Number(count)
}

async function insertRows(onFailureHint) {
  const keyField = schema.primaryKey || 'id'
  let inserted = 0
  for (const [index, batch] of batches.entries()) {
    try {
      await request(createItems(collection, batch, { fields: [keyField] }))
    } catch (error) {
      fail(`\n✗ Batch ${index + 1}/${batches.length} failed: ${error.message}`,
        `  ${inserted.toLocaleString()} of ${rows.length.toLocaleString()} rows were loaded before the failure.`, onFailureHint)
    }
    inserted += batch.length
    process.stdout.write(`\r  loading… batch ${index + 1}/${batches.length} (${inserted.toLocaleString()} rows)`)
  }
  process.stdout.write('\n')
}

async function verifyCount() {
  const count = await countRows()
  if (count !== rows.length) fail(`✗ Directus reports ${count.toLocaleString()} rows, expected ${rows.length.toLocaleString()}.`)
  console.log(`  Directus now has ${count.toLocaleString()} rows ✓`)
}

async function confirm(question, expected) {
  if (options.yes) return
  if (!process.stdin.isTTY) fail('Refusing to continue without confirmation (no terminal). Re-run with --yes if you are sure.')
  const readline = createInterface({ input: process.stdin, output: process.stdout })
  const answer = await readline.question(question)
  readline.close()
  if (answer.trim() !== expected) fail('Cancelled; nothing was changed.')
}

const exists = (await request(readCollections())).some(c => c.collection === collection)

if (options.mode === 'create') {
  if (exists) {
    fail(`\n✗ Collection "${collection}" already exists in Directus; nothing was changed.`,
      '  To refresh its rows, use --mode=replace (backs up the current rows first).',
      `  To keep it untouched, import under a new name: rename the schema file and its "collection" (e.g. "${collection}_v2").`)
  }
  if (dryRun) {
    console.log(`\nDry run: would create collection "${collection}" and load ${rows.length.toLocaleString()} rows. Nothing was changed.\n`)
    process.exit(0)
  }

  console.log(`\nCreating collection "${collection}"…`)
  await request(createCollection(collectionPayload(schema, note)))
  await insertRows(`  The collection was created but is incomplete. Delete "${collection}" in the Directus admin, fix the problem, and run the import again.`)
  await verifyCount()
} else {
  if (!exists) fail(`\n✗ Collection "${collection}" doesn't exist in Directus, so there is nothing to replace. Use --mode=create.`)

  const fields = await request(readFieldsByCollection(collection))
  const comparison = compareWithDirectus(schema, fields)
  if (!comparison.matches) {
    fail(`\n✗ The fields in Directus don't match the schema, so replace would lose or mangle data. Nothing was changed.`,
      ...comparison.missing.map(f => `  - "${f}" is not in Directus`),
      ...comparison.extra.map(f => `  - "${f}" is in Directus but not in the schema`),
      ...comparison.typeMismatches.map(m => `  - "${m.field}" is ${m.actual} in Directus, ${m.expected} in the schema`),
      `  Import under a new name instead (e.g. "${collection}_v2").`)
  }

  const currentCount = await countRows()
  if (dryRun) {
    console.log(`\nDry run: would back up ${currentCount.toLocaleString()} current rows, delete them, and load ${rows.length.toLocaleString()} rows into "${collection}". Nothing was changed.\n`)
    process.exit(0)
  }

  console.log(`\n"${collection}" has ${currentCount.toLocaleString()} rows. Replacing them with ${rows.length.toLocaleString()} rows.`)
  console.log('If the live website reads this collection, the map changes as soon as this finishes.')
  await confirm(`Type the collection name (${collection}) to continue: `, collection)

  // Back up every current row before deleting anything
  const keyField = fields.find(f => f.schema?.is_primary_key)?.field || 'id'
  const currentRows = await request(readItems(collection, { fields: ['*'], limit: -1 }))
  mkdirSync(BACKUP_DIR, { recursive: true })
  const backupFile = path.join(BACKUP_DIR, `${collection}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  writeFileSync(backupFile, JSON.stringify(currentRows))
  console.log(`  backed up ${currentRows.length.toLocaleString()} rows → ${relative(backupFile)}`)

  const restoreHint = `  To restore the previous rows: npm run data:import -- ${collection} --mode=replace --from-backup ${relative(backupFile)}`
  const keys = currentRows.map(row => row[keyField])
  for (let start = 0; start < keys.length; start += 500) {
    try {
      await request(deleteItems(collection, keys.slice(start, start + 500)))
    } catch (error) {
      fail(`\n✗ Deleting the old rows failed: ${error.message}`, restoreHint)
    }
  }
  console.log(`  deleted ${keys.length.toLocaleString()} old rows`)

  await insertRows(restoreHint)
  await request(updateCollection(collection, { meta: { note } }))
  await verifyCount()
}

console.log(`  note: ${note}\nDone.\n`)
