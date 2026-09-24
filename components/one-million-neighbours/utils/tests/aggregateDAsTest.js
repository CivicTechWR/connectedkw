import { test } from "node:test";
import assert from "node:assert/strict";
import aggregateDAs from "../aggregateDAs.js";
import calculateDAScores, { CATEGORIES, createDAScorer } from "../calculateDAScores.js";

// Made-up fixture. Column names are placeholders until #98 is audited.
const das = [
    { dauid: "A", population: 800, households: 300, prox_idx_parks: 0.9, prox_idx_lib: 0.8, pct_low_income: 10, pct_renters: 20, assets_count: 4 },
    { dauid: "B", population: 50, households: 40, prox_idx_parks: 0.1, prox_idx_lib: 0.2, pct_low_income: 30, pct_renters: 80, assets_count: 1 },
    { dauid: "C", population: 400, households: 100, prox_idx_parks: 0.5, prox_idx_lib: null, pct_low_income: "..", pct_renters: 50, assets_count: 2 },
    { dauid: "D", population: 0, households: 0, prox_idx_parks: 0.3, prox_idx_lib: 0.3, pct_low_income: null, pct_renters: null, assets_count: 0 },
    { dauid: "E", population: 0, households: 0, prox_idx_parks: 0.7, prox_idx_lib: "..", pct_low_income: null, pct_renters: null, assets_count: null },
    { dauid: "F", population: 250, households: 90, prox_idx_parks: 0.4, prox_idx_lib: 0.6, pct_low_income: 15, pct_renters: 35, assets_count: 3 },
    { dauid: "G", population: null, households: null, prox_idx_parks: 0.2, prox_idx_lib: 0.1, pct_low_income: 25, pct_renters: 60, assets_count: 1 },
];

const columns = ["prox_idx_parks", "prox_idx_lib", "pct_low_income", "pct_renters"];
const measures = ["prox_idx_parks", "prox_idx_lib"];
const pick = (...ids) => das.filter((da) => ids.includes(da.dauid));
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9, `${actual} != ${expected}`);

test("does not mutate its input", () => {
    const snapshot = structuredClone(das);
    aggregateDAs(das, { columns, scorer: createDAScorer(das, measures) });
    assert.deepEqual(das, snapshot);
});

test("population is summed", () => {
    const result = aggregateDAs(pick("A", "B", "C"), { columns });
    assert.equal(result.population, 1250);
    assert.equal(result.da_count, 3);
    assert.deepEqual(result.dauids, ["A", "B", "C"]);
});

test("extra count columns can be summed, skipping blanks", () => {
    const result = aggregateDAs(pick("A", "B", "E"), { columns, sumColumns: ["assets_count"] });
    assert.equal(result.assets_count, 5);
});

test("scores and percentages are averaged weighted by population", () => {
    const result = aggregateDAs(pick("A", "B"), { columns });
    // A has 800 people, B has 50: A counts 16 times as much
    close(result.prox_idx_parks, (0.9 * 800 + 0.1 * 50) / 850);
    close(result.pct_low_income, (10 * 800 + 30 * 50) / 850);
    // Plain average would be 0.5; the weighted one sits much closer to A
    assert.ok(result.prox_idx_parks > 0.8);
});

test("missing values are skipped and coverage is reported", () => {
    const result = aggregateDAs(pick("A", "B", "C"), { columns });
    // C has no library value: average of A and B only, not dragged toward 0
    close(result.prox_idx_lib, (0.8 * 800 + 0.2 * 50) / 850);
    assert.equal(result.population_with_data.prox_idx_lib, 850);
    close(result.data_coverage.prox_idx_lib, 850 / 1250);
    // ".." is missing too
    close(result.pct_low_income, (10 * 800 + 30 * 50) / 850);
    assert.equal(result.data_coverage.prox_idx_parks, 1);
});

test("zero population DAs add no weight but don't break the average", () => {
    const result = aggregateDAs(pick("A", "D", "E"), { columns });
    assert.equal(result.population, 800);
    assert.equal(result.prox_idx_parks, 0.9);
    assert.deepEqual(result.unweighted_columns, []);
});

test("a group whose total population is 0 falls back to a plain average", () => {
    const result = aggregateDAs(pick("D", "E"), { columns });
    assert.equal(result.population, 0);
    close(result.prox_idx_parks, 0.5);
    assert.equal(result.prox_idx_lib, 0.3);
    assert.equal(result.pct_low_income, null);
    assert.deepEqual(result.unweighted_columns, ["prox_idx_parks", "prox_idx_lib"]);
    assert.equal(result.data_coverage.prox_idx_parks, null);
    for (const value of Object.values(result)) {
        if (typeof value === "number") assert.ok(Number.isFinite(value));
    }
});

test("DAs with blank population are counted and left out of weighted averages", () => {
    const result = aggregateDAs(pick("A", "G"), { columns });
    assert.equal(result.population, 800);
    assert.equal(result.das_missing_population, 1);
    assert.equal(result.prox_idx_parks, 0.9);

    const onlyBlank = aggregateDAs(pick("G"), { columns });
    assert.equal(onlyBlank.population, null);
    assert.equal(onlyBlank.prox_idx_parks, 0.2);
});

test("weightBy weights a per household column by households", () => {
    const result = aggregateDAs(pick("A", "B"), { columns, weightBy: { pct_renters: "households" } });
    close(result.pct_renters, (20 * 300 + 80 * 40) / 340);
    assert.equal(result.population_with_data.pct_renters, 340);
    // Other columns still use population
    close(result.pct_low_income, (10 * 800 + 30 * 50) / 850);
});

test("an empty list returns an empty area, not NaN", () => {
    const result = aggregateDAs([], { columns, scorer: createDAScorer(das, measures) });
    assert.equal(result.population, 0);
    assert.equal(result.da_count, 0);
    assert.deepEqual(result.dauids, []);
    for (const column of columns) {
        assert.equal(result[column], null);
        assert.equal(result.data_coverage[column], null);
    }
    assert.equal(result.score, null);
    assert.equal(result.category, CATEGORIES.NOT_ENOUGH_DATA);
});

test("combining one DA returns that DA's own numbers and score", () => {
    const scorer = createDAScorer(das, measures);
    const individual = Object.fromEntries(calculateDAScores(das, measures).map((da) => [da.dauid, da]));

    for (const da of das) {
        const result = aggregateDAs([da], { columns, sumColumns: ["assets_count"], scorer });
        for (const column of [...columns, "population", "assets_count"]) {
            const expected = da[column] === ".." ? null : da[column] ?? null;
            assert.equal(result[column], expected, `${da.dauid} ${column}`);
        }
        assert.equal(result.score, individual[da.dauid].score, da.dauid);
        assert.equal(result.category, individual[da.dauid].category, da.dauid);
        assert.deepEqual(result.normalized, individual[da.dauid].normalized, da.dauid);
    }
});

test("the group score uses the same method as a single DA", () => {
    const scorer = createDAScorer(das, measures);
    const result = aggregateDAs(pick("A", "B"), { columns, scorer });
    // Scoring the combined numbers by hand with the same scorer gives the same answer
    const expected = scorer({ prox_idx_parks: result.prox_idx_parks, prox_idx_lib: result.prox_idx_lib, population: 850 });
    assert.equal(result.score, expected.score);
    assert.equal(result.category, expected.category);
    // A group dominated by A's 800 people scores close to A
    assert.equal(result.category, CATEGORIES.MOST);
});

test("the group is scored against all DAs, not just the ones in the group", () => {
    const scorer = createDAScorer(das, measures);
    const low = aggregateDAs(pick("B", "G"), { columns, scorer });
    assert.equal(low.category, CATEGORIES.LEAST);
});

test("rejects invalid arguments", () => {
    assert.throws(() => aggregateDAs(null), TypeError);
    assert.throws(() => aggregateDAs(das, { columns: "prox_idx_parks" }), TypeError);
    assert.throws(() => aggregateDAs(das, { columns: ["population"] }), /both summed and averaged/);
});
