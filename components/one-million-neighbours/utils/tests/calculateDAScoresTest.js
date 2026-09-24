import { test } from "node:test";
import assert from "node:assert/strict";
import calculateDAScores, { CATEGORIES, NORMALIZERS, categorizeByThirds, createDAScorer, toNumberOrNull } from "../calculateDAScores.js";

// Made-up fixture of 10 DAs. Column names are placeholders until #98 is audited.
// Includes blanks (null, "", ".."), zero population, and exact ties.
const das = [
    { dauid: "A", population: 500, prox_idx_parks: 0.9, prox_idx_lib: 0.8, prox_idx_transit: 0.7 },
    { dauid: "B", population: 450, prox_idx_parks: 0.8, prox_idx_lib: 0.7, prox_idx_transit: 0.6 },
    { dauid: "C", population: 600, prox_idx_parks: 0.6, prox_idx_lib: 0.5, prox_idx_transit: 0.5 },
    // D and E are exact ties
    { dauid: "D", population: 300, prox_idx_parks: 0.5, prox_idx_lib: 0.4, prox_idx_transit: 0.4 },
    { dauid: "E", population: 350, prox_idx_parks: 0.5, prox_idx_lib: 0.4, prox_idx_transit: 0.4 },
    { dauid: "F", population: 400, prox_idx_parks: 0.3, prox_idx_lib: 0.2, prox_idx_transit: 0.2 },
    // Missing library value: scored on the other two measures
    { dauid: "G", population: 700, prox_idx_parks: 0.2, prox_idx_lib: null, prox_idx_transit: 0.1 },
    // Zero population, but has data
    { dauid: "H", population: 0, prox_idx_parks: 0.1, prox_idx_lib: 0.1, prox_idx_transit: 0.1 },
    // Too much missing data (StatCan ".." suppression and a blank string)
    { dauid: "I", population: 250, prox_idx_parks: 0.4, prox_idx_lib: "..", prox_idx_transit: "" },
    // Zero population and no data at all
    { dauid: "J", population: 0, prox_idx_parks: null, prox_idx_lib: undefined, prox_idx_transit: ".." },
];

const measures = ["prox_idx_parks", "prox_idx_lib", "prox_idx_transit"];
const byId = (result) => Object.fromEntries(result.map((da) => [da.dauid, da]));

test("returns one result per DA in input order without mutating input", () => {
    const snapshot = structuredClone(das);
    const result = calculateDAScores(das, measures);
    assert.deepEqual(result.map((da) => da.dauid), das.map((da) => da.dauid));
    assert.deepEqual(das, snapshot);
    // Original columns are kept
    assert.equal(result[0].prox_idx_parks, 0.9);
});

test("never produces NaN or Infinity", () => {
    for (const normalize of Object.keys(NORMALIZERS)) {
        for (const da of calculateDAScores(das, measures, { normalize })) {
            if (da.score !== null) assert.ok(Number.isFinite(da.score), `${normalize} ${da.dauid}`);
            for (const value of Object.values(da.normalized)) {
                if (value !== null) assert.ok(Number.isFinite(value), `${normalize} ${da.dauid}`);
            }
            assert.ok(Number.isFinite(da.coverage));
        }
    }
});

test("blank values are skipped, not treated as 0", () => {
    const result = byId(calculateDAScores(das, measures));
    assert.equal(result.G.normalized.prox_idx_lib, null);
    assert.equal(result.G.coverage, 2 / 3);
    // G's score is the average of only its two present measures
    const expected = (result.G.normalized.prox_idx_parks + result.G.normalized.prox_idx_transit) / 2;
    assert.ok(Math.abs(result.G.score - expected) < 1e-9);

    // Treating the blank as 0 would have given a different, lower score
    const withZero = byId(calculateDAScores(
        das.map((da) => (da.dauid === "G" ? { ...da, prox_idx_lib: 0 } : da)),
        measures,
    ));
    assert.ok(withZero.G.score < result.G.score);
});

test("blank values do not affect how other DAs are normalized", () => {
    const withoutBlanks = das.filter((da) => da.dauid !== "J");
    const a = byId(calculateDAScores(das, measures));
    const b = byId(calculateDAScores(withoutBlanks, measures));
    assert.equal(a.A.score, b.A.score);
});

test("DAs with too much missing data are marked not enough data", () => {
    const result = byId(calculateDAScores(das, measures));
    assert.equal(result.I.score, null);
    assert.equal(result.I.category, CATEGORIES.NOT_ENOUGH_DATA);
    assert.equal(result.I.coverage, 1 / 3);
    assert.equal(result.J.score, null);
    assert.equal(result.J.category, CATEGORIES.NOT_ENOUGH_DATA);
    assert.equal(result.J.coverage, 0);
});

test("minCoverage controls the not enough data cutoff", () => {
    const strict = byId(calculateDAScores(das, measures, { minCoverage: 1 }));
    assert.equal(strict.G.category, CATEGORIES.NOT_ENOUGH_DATA);
    const loose = byId(calculateDAScores(das, measures, { minCoverage: 0.3 }));
    assert.notEqual(loose.I.category, CATEGORIES.NOT_ENOUGH_DATA);
    // No data at all is never scored, even with minCoverage 0
    const none = byId(calculateDAScores(das, measures, { minCoverage: 0 }));
    assert.equal(none.J.category, CATEGORIES.NOT_ENOUGH_DATA);
});

test("zero population DAs are flagged and still scored when they have data", () => {
    const result = byId(calculateDAScores(das, measures));
    assert.equal(result.H.zero_population, true);
    assert.equal(result.A.zero_population, false);
    assert.ok(Number.isFinite(result.H.score));
    assert.equal(result.H.category, CATEGORIES.LEAST);
});

test("ties get the same score and category", () => {
    for (const normalize of Object.keys(NORMALIZERS)) {
        const result = byId(calculateDAScores(das, measures, { normalize }));
        assert.equal(result.D.score, result.E.score, normalize);
        assert.equal(result.D.category, result.E.category, normalize);
    }
});

test("ties that straddle a category boundary stay together", () => {
    // 3 DAs with identical values: rank-based thirds would otherwise split them
    const tied = [
        { dauid: "X", prox_idx_parks: 0.5 },
        { dauid: "Y", prox_idx_parks: 0.5 },
        { dauid: "Z", prox_idx_parks: 0.5 },
    ];
    const categories = new Set(calculateDAScores(tied, ["prox_idx_parks"]).map((da) => da.category));
    assert.equal(categories.size, 1);
});

test("higher proximity gives a higher score and categories follow score order", () => {
    const result = byId(calculateDAScores(das, measures));
    assert.ok(result.A.score > result.B.score);
    assert.ok(result.B.score > result.C.score);
    assert.ok(result.F.score > result.H.score);
    assert.equal(result.A.category, CATEGORIES.MOST);
    assert.equal(result.B.category, CATEGORIES.MOST);
    assert.equal(result.H.category, CATEGORIES.LEAST);

    const rank = { [CATEGORIES.MOST]: 0, [CATEGORIES.SOME]: 1, [CATEGORIES.LEAST]: 2 };
    const scored = Object.values(result).filter((da) => da.score !== null).sort((a, b) => b.score - a.score);
    for (let i = 1; i < scored.length; i++) {
        assert.ok(rank[scored[i].category] >= rank[scored[i - 1].category]);
    }
});

test("zscore matches a hand calculation", () => {
    const data = [
        { dauid: "1", prox_idx_parks: 1 },
        { dauid: "2", prox_idx_parks: 2 },
        { dauid: "3", prox_idx_parks: 3 },
    ];
    // mean 2, sample sd 1
    const result = calculateDAScores(data, ["prox_idx_parks"], { normalize: "zscore" });
    assert.deepEqual(result.map((da) => da.score), [-1, 0, 1]);
});

test("weights change the balance between measures", () => {
    const data = [
        { dauid: "parks", prox_idx_parks: 1, prox_idx_transit: 0 },
        { dauid: "transit", prox_idx_parks: 0, prox_idx_transit: 1 },
    ];
    const equal = byId(calculateDAScores(data, ["prox_idx_parks", "prox_idx_transit"]));
    assert.equal(equal.parks.score, equal.transit.score);

    const parksHeavy = byId(calculateDAScores(data, ["prox_idx_parks", "prox_idx_transit"], {
        weights: { prox_idx_parks: 3 },
    }));
    assert.ok(parksHeavy.parks.score > parksHeavy.transit.score);

    // A weight of 0 leaves the measure out of the score
    const parksOnly = byId(calculateDAScores(data, ["prox_idx_parks", "prox_idx_transit"], {
        weights: { prox_idx_transit: 0 },
    }));
    assert.ok(parksOnly.parks.score > parksOnly.transit.score);
    assert.equal(parksOnly.parks.coverage, 1);
});

test("only selected measures are used", () => {
    const result = byId(calculateDAScores(das, ["prox_idx_parks"]));
    assert.deepEqual(Object.keys(result.A.normalized), ["prox_idx_parks"]);
    // I has parks data, so it is scored when only parks is selected
    assert.notEqual(result.I.category, CATEGORIES.NOT_ENOUGH_DATA);
});

test("normalization and categorization are swappable", () => {
    const minmax = byId(calculateDAScores(das, ["prox_idx_parks"], { normalize: "minmax" }));
    assert.equal(minmax.A.score, 1);
    assert.equal(minmax.H.score, 0);

    const percentile = byId(calculateDAScores(das, ["prox_idx_parks"], { normalize: "percentile" }));
    assert.equal(percentile.A.score, 1);
    assert.equal(percentile.H.score, 0);

    const raw = byId(calculateDAScores(das, ["prox_idx_parks"], { normalize: () => (value) => value }));
    assert.equal(raw.A.score, 0.9);

    const fixedThreshold = () => (score) => (score >= 0.5 ? "high" : "low");
    const custom = byId(calculateDAScores(das, ["prox_idx_parks"], {
        normalize: () => (value) => value,
        categorize: fixedThreshold,
    }));
    assert.equal(custom.A.category, "high");
    assert.equal(custom.H.category, "low");
    assert.equal(custom.J.category, CATEGORIES.NOT_ENOUGH_DATA);
});

test("edge cases: empty input, single DA, all values equal", () => {
    assert.deepEqual(calculateDAScores([], measures), []);

    const [single] = calculateDAScores([das[0]], measures);
    assert.ok(Number.isFinite(single.score));
    assert.equal(single.category, CATEGORIES.MOST);

    for (const normalize of Object.keys(NORMALIZERS)) {
        const same = calculateDAScores([das[3], das[4]], measures, { normalize });
        assert.equal(same[0].score, same[1].score);
        assert.ok(Number.isFinite(same[0].score));
    }
});

test("rejects invalid arguments", () => {
    assert.throws(() => calculateDAScores(null, measures), TypeError);
    assert.throws(() => calculateDAScores(das, []), TypeError);
    assert.throws(() => calculateDAScores(das, measures, { normalize: "nope" }), /Unknown normalize/);
    assert.throws(() => calculateDAScores(das, measures, { weights: { prox_idx_parks: -1 } }), /non-negative/);
    assert.throws(() => calculateDAScores(das, ["prox_idx_parks"], { weights: { prox_idx_parks: 0 } }), /above 0/);
});

test("toNumberOrNull", () => {
    assert.equal(toNumberOrNull(0), 0);
    assert.equal(toNumberOrNull("0.25"), 0.25);
    assert.equal(toNumberOrNull(""), null);
    assert.equal(toNumberOrNull("  "), null);
    assert.equal(toNumberOrNull(".."), null);
    assert.equal(toNumberOrNull("F"), null);
    assert.equal(toNumberOrNull(null), null);
    assert.equal(toNumberOrNull(undefined), null);
    assert.equal(toNumberOrNull(NaN), null);
    assert.equal(toNumberOrNull(Infinity), null);
});

test("categorizeByThirds places scores that are not in the reference list", () => {
    const getCategory = categorizeByThirds([3, 2, 1]);
    assert.equal(getCategory(10), CATEGORIES.MOST);
    assert.equal(getCategory(2.5), CATEGORIES.SOME);
    assert.equal(getCategory(1.5), CATEGORIES.LEAST);
    assert.equal(getCategory(-10), CATEGORIES.LEAST);
});

test("createDAScorer scores a reference DA the same as calculateDAScores", () => {
    const scoreDA = createDAScorer(das, measures);
    for (const da of calculateDAScores(das, measures)) {
        const { score, category, coverage, normalized, zero_population } = scoreDA(da);
        assert.deepEqual({ score, category, coverage, normalized, zero_population },
            { score: da.score, category: da.category, coverage: da.coverage, normalized: da.normalized, zero_population: da.zero_population });
    }
});

test("createDAScorer treats a measure with no reference data as missing", () => {
    const scoreDA = createDAScorer([{ prox_idx_parks: 0.5 }, { prox_idx_parks: 0.7 }], ["prox_idx_parks", "prox_idx_lib"]);
    const result = scoreDA({ prox_idx_parks: 0.7, prox_idx_lib: 0.9 });
    assert.equal(result.normalized.prox_idx_lib, null);
    assert.equal(result.coverage, 0.5);
    assert.ok(Number.isFinite(result.score));
});
