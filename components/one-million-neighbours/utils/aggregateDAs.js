// Combine a group of Dissemination Areas (DAs) into one area, for the selection summary panel (#114).
//
// Pure function: never mutates its input. The result has the same shape as a single DA,
// so it can be shown in the same popup and scored with createDAScorer from calculateDAScores.js.
//
// das is an array of DA objects, like calculateDAScores takes.
//
// options:
//   columns        columns to average weighted by population, e.g. prox_idx_* scores and
//                  census percentages. Missing values are skipped, not counted as 0.
//   sumColumns     count columns to add up. Population is always summed.
//   weightBy       { [column]: weightColumn } to weight a column by something other than
//                  population, e.g. { pct_renters: "households" } (see note below)
//   populationKey  column holding population, default "population"
//   idKey          column holding the DA id, default "dauid"
//   scorer         a scorer from createDAScorer(allDAs, measures, options). When given, the
//                  group is scored against every DA with exactly the same method as one DA.
//
// Returns an object with every combined column plus:
//   dauids                     ids of the DAs in the group
//   da_count                   number of DAs in the group
//   population_with_data       { [column]: weight (usually people) behind the average }
//   data_coverage              { [column]: share of the group's weight with data, 0–1, or null }
//   unweighted_columns         columns averaged without weights because the group had no weight
//                              for them (e.g. only zero-population DAs had data)
//   das_missing_population     number of DAs with blank population
//   score, category, coverage, normalized   only when a scorer is given
//
// Per household columns: some census percentages have households, not people, as their
// denominator. Weighting them by population is close enough for v1 but slightly over-counts
// DAs with larger households. Pass weightBy to fix a column once a household count column exists.
// From the 2021 Census Profile, these are per household (or per dwelling / family):
//   - Tenure: owner and renter households
//   - Shelter cost to income ratio (spending 30% or more on shelter)
//   - Core housing need
//   - Dwellings needing major repairs, suitable (not crowded) housing
//   - Structural type of dwelling, period of construction
//   - Household size and household type (one-person, couples with children)
//   - Lone-parent families (per census family)
//   - Median and average household income
// Per person columns (population weighting is correct): age groups, low income (LIM-AT),
// visible minority, immigrant status, language, education, labour force, commuting mode.
// Proximity indices (prox_idx_*) are per DA and population weighting gives the average resident.

import { toNumberOrNull } from "./calculateDAScores.js";

export default function aggregateDAs(das, options = {}) {
    const {
        columns = [],
        populationKey = "population",
        sumColumns = [],
        weightBy = {},
        idKey = "dauid",
        scorer = null,
    } = options;

    if (!Array.isArray(das)) throw new TypeError("das must be an array");
    if (!Array.isArray(columns)) throw new TypeError("columns must be an array of column names");
    const columnsToSum = [...new Set([populationKey, ...sumColumns])];
    for (const column of columns) {
        if (columnsToSum.includes(column)) {
            throw new Error(`${column} can't be both summed and averaged`);
        }
    }

    // --- Step 1: Sum count columns, skipping blanks ---
    const sums = Object.fromEntries(columnsToSum.map((column) => {
        const values = das.map((da) => toNumberOrNull(da[column])).filter((v) => v !== null);
        // null when every DA was blank, so a blank is never shown as 0. An empty group is 0.
        const hasData = values.length > 0 || das.length === 0;
        return [column, hasData ? values.reduce((sum, v) => sum + v, 0) : null];
    }));

    // --- Step 2: Weighted average of each column over the DAs that have data for it ---
    const averages = {};
    const populationWithData = {};
    const dataCoverage = {};
    const unweightedColumns = [];

    for (const column of columns) {
        const weightKey = weightBy[column] ?? populationKey;
        const rows = das
            .map((da) => ({ value: toNumberOrNull(da[column]), weight: toNumberOrNull(da[weightKey]) }))
            .filter((row) => row.value !== null);

        // Total weight of the whole group, with or without data for this column
        const groupWeight = das.reduce((sum, da) => sum + Math.max(toNumberOrNull(da[weightKey]) ?? 0, 0), 0);
        const weighted = rows.filter((row) => row.weight !== null && row.weight > 0);
        const weightWithData = weighted.reduce((sum, row) => sum + row.weight, 0);

        if (weightWithData > 0) {
            averages[column] = runningMean(weighted);
        } else if (rows.length > 0) {
            // Only zero or blank population DAs had data, e.g. a group of parks and industrial land.
            // Fall back to a plain average rather than showing nothing.
            averages[column] = runningMean(rows.map((row) => ({ value: row.value, weight: 1 })));
            unweightedColumns.push(column);
        } else {
            averages[column] = null;
        }

        populationWithData[column] = weightWithData;
        dataCoverage[column] = groupWeight > 0 ? weightWithData / groupWeight : null;
    }

    const combined = {
        ...sums,
        ...averages,
        dauids: das.map((da) => da[idKey]),
        da_count: das.length,
        population_with_data: populationWithData,
        data_coverage: dataCoverage,
        unweighted_columns: unweightedColumns,
        das_missing_population: das.filter((da) => toNumberOrNull(da[populationKey]) === null).length,
    };

    // --- Step 3: Score the group exactly like a single DA ---
    if (scorer === null) return combined;
    return { ...combined, ...scorer(combined) };
}

// Weighted mean that returns a single value unchanged (v * w / w can drift in floating point),
// so combining one DA gives back exactly that DA's numbers.
function runningMean(rows) {
    let mean = 0;
    let totalWeight = 0;
    for (const { value, weight } of rows) {
        totalWeight += weight;
        mean += (weight / totalWeight) * (value - mean);
    }
    return mean;
}
