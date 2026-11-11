# Data import

Loads GeoJSON files into Directus as collections. It replaces the old manual steps:
1. inspect the file with jq
2. create the collection by hand in Directus
3. flatten the file with jq and import it

Data files (`*.geojson`, `*.json`) and `backups/` stay on your machine; git ignores them. The reviewed `*.schema.json` files and this README are committed, so the repo records what each collection contains.

## Setup (once)

Add an admin token to `.env.local`, next to the existing `DIRECTUS_URL`:

```
DIRECTUS_ADMIN_TOKEN=...
```

Only the import scripts use this token; the website never does. Never add it to Vercel.

## Workflow: plan → review → import

**1. Prepare the file.** It must be a GeoJSON FeatureCollection in WGS84 (EPSG:4326). If it isn't, reproject it first in QGIS or with `ogr2ogr -t_srs EPSG:4326`. Then put it here:

```
data_import/parks_da.geojson
```

The file name becomes the collection name: `Parks DA.geojson` → `parks_da`.

**2. Plan.** This reads the file and writes a schema for you to review. It changes nothing in Directus.

```bash
npm run data:plan -- parks_da
```

The report shows:
- the number of features and their geometry types
- each field's inferred type and how many features have a value for it
- warnings and hints for fields that need a decision
- whether a collection with this name already exists in Directus, and whether its fields match

**3. Review `data_import/parks_da.schema.json`.** Check and edit:

| Key | What to check |
|---|---|
| `collection` | The Directus collection name. If you rename the files, update this **and** `source` too; renaming a file doesn't change what's inside it. |
| `source` | The data file in `data_import/` that this schema describes. |
| `fields` | The columns the collection will have, each with a Directus type: `string`, `text`, `integer`, `bigInteger`, `float`, `decimal`, `boolean` or `json`. IDs should be `string`. |
| `primaryKey` | A field that is unique and never empty, or `null` to let Directus add an auto-numbered `id`. |
| `drop` | Properties in the file to **deliberately leave out**, using the file's original names. Fields that are empty everywhere, or that just repeat other data, are good candidates. |
| `rename` | `{ "old_name": "new_name" }`, applied after `drop`. If you rename a field, use the new name in `fields`. |
| `note` | A short description of the collection. It becomes the collection's description in the Directus admin, followed by an automatic line saying where the data came from (file, fingerprint, date, row count). Can be `""`. |

#### Leaving a property out: change both `fields` and `drop`

Every property in the file must be accounted for: either it's a column (in `fields`) or it's deliberately left out (in `drop`), **never both, never neither**. To leave out `geometry_types`:

```diff
   "fields": {
     "park_id": { "type": "string" },
-    "geometry_types": { "type": "string" },
     "name": { "type": "string" }
   },
-  "drop": []
+  "drop": ["geometry_types"]
```

| In `fields`? | In `drop`? | Result |
|---|---|---|
| no | yes | ✔ Left out, no column created. **This is the way to do it.** |
| no | no | ✗ Import refuses: `"geometry_types" is not in the schema; add it to "fields" or "drop"`. This stops new properties in an updated file from silently never reaching Directus. |
| yes | yes | ✗ Import refuses: `"geometry_types" is in both "fields" and "drop"`. Otherwise it would create a column that's empty in every row. |

Running `plan` again never overwrites a reviewed schema. It checks the schema for problems like these, then lists any differences between the schema and the file. It's a quick way to check your edits before importing. Use `--fresh` to regenerate the schema from scratch.

**4. Import.** Always do a dry run first:

```bash
npm run data:import -- parks_da --dry-run
npm run data:import -- parks_da
```

Before anything is sent to Directus, every row is checked against the schema: types, primary keys and geometry type. Any problem stops the import with the row number and the value that caused it.

## Modes

| Command | What it does |
|---|---|
| `npm run data:import -- <name>` | **create** (the default): creates the collection and loads the rows. **Refuses if the collection already exists.** |
| `npm run data:import -- <name> --mode=replace` | Keeps the collection and its settings, **backs up** the current rows to `data_import/backups/`, deletes them, then loads the new rows. Refuses if the fields in Directus don't match the schema. Asks you to type the collection name to confirm. |
| `… --dry-run` | Runs every check and prints what would happen. Changes nothing. |
| `… --mode=replace --from-backup data_import/backups/<file>.json` | Restores a backup: undo for a replace. |
| `… --yes` | Skips the typed confirmation (for scripts). |

After every import, the script:
- checks that the row count in Directus matches the number of rows sent
- writes a note on the collection: source file, file fingerprint (sha256), date and row count

## Collections the live website reads

`replace` changes the public site **as soon as it runs**, and the map shows partial data while rows are loading. For collections the website reads, import under a new name instead:

1. Copy the schema to `<name>_v2.schema.json`, change its `"collection"` to `<name>_v2`, and run `npm run data:import -- <name>_v2`.
2. Point `integrations/directus.js` at `<name>_v2`, check the site locally, then commit and deploy.
3. Delete the old collection in Directus once you're confident.

## Tests

```bash
npm run test:data-import
```

The unit tests in `scripts/data-import/lib.test.mjs` cover:
- validating the file
- flattening
- type inference
- primary key suggestion
- checking rows against the schema
- comparing with existing collections
- batching

They never contact Directus.
