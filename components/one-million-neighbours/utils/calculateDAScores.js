// Calculate an access score and category for each Dissemination Area (DA).
//
// This is the DA replacement for calculateCombinedAssetRanks.js, which the live
// neighbourhood map still uses. Keep this function pure: it never mutates its input
// and returns a new array in the same order as the input.
//
// das is an array of objects. Measure values are StatCan proximity index columns
// (roughly 0–1, higher = closer to services). Blank values are allowed:
// {
//     "dauid": "35300123",
//     "population": 512,
//     "prox_idx_parks": 0.0213,
//     "prox_idx_lib": null,
//     "prox_idx_transit": "..",
// }
//
// measures is an array of column names to include, e.g. ["prox_idx_parks", "prox_idx_lib"].
//
// Column names are placeholders until the DA census data (#98) is audited, and the
// scoring decisions (#100) are made. Everything likely to change is an option.
//
// options:
//   weights           { [measure]: number } — relative weight per measure, default 1 each
//   normalize         a key of NORMALIZERS, or a function (values) => (value) => number
//   categorize        a function (scores) => (score) => category, default thirds by rank
//   minCoverage       share of total weight (0–1) a DA must have data for, default 0.5
//   populationKey     column holding population, default "population"
//
// Each returned DA gets:
//   score       weighted average of normalized measures, or null if not enough data
//   category    one of CATEGORIES
//   coverage    share of total weight that had data (0–1)
//   normalized  { [measure]: number | null }
//   zero_population  true when population is 0 or missing

export const CATEGORIES = {
    MOST: "most_access",
    SOME: "some_access",
    LEAST: "least_access",
    NOT_ENOUGH_DATA: "not_enough_data",
};

// StatCan uses ".." and similar markers for suppressed values.
// Anything that is not a finite number is treated as missing, never as 0.
export const toNumberOrNull = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "string" && value.trim() === "") return null;
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : null;
};

// Round away floating point noise so equal inputs produce exactly equal (tied) scores.
const round = (value) => Math.round(value * 1e9) / 1e9;

// Normalizers take every non-missing value for one measure (the reference group) and
// return a function that maps a single value onto a comparable scale.
// Each one must return a finite number for any input, including when all values are equal.
export const NORMALIZERS = {
    // Standard score. Uses sample standard deviation (n - 1) to match calculateCombinedAssetRanks.
    zscore: (values) => {
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.length < 2
            ? 0
            : values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / (values.length - 1);
        const sd = Math.sqrt(variance);
        return (value) => (sd === 0 ? 0 : (value - mean) / sd);
    },

    // Rescale so the lowest value is 0 and the highest is 1.
    minmax: (values) => {
        const min = Math.min(...values);
        const max = Math.max(...values);
        return (value) => (max === min ? 0.5 : (value - min) / (max - min));
    },

    // Share of the reference group below this value, counting ties as half. Robust to skew.
    percentile: (values) => {
        return (value) => {
            if (values.length < 2) return 0.5;
            let below = 0;
            let equal = 0;
            for (const v of values) {
                if (v < value) below++;
                else if (v === value) equal++;
            }
            return Math.min(1, (below + Math.max(equal - 1, 0) / 2) / (values.length - 1));
        };
    },
};

// Default categorizer: split scored DAs into thirds by rank.
// Tied scores always share a rank, so ties always land in the same category.
export const categorizeByThirds = (scores) => {
    const sorted = [...scores].sort((a, b) => b - a);
    return (score) => {
        // Competition rank: number of DAs with a strictly higher score.
        const rank = sorted.findIndex((s) => s === score);
        if (rank < sorted.length / 3) return CATEGORIES.MOST;
        if (rank < (sorted.length / 3) * 2) return CATEGORIES.SOME;
        return CATEGORIES.LEAST;
    };
};

export default function calculateDAScores(das, measures, options = {}) {
    const {
        weights = {},
        normalize = "zscore",
        categorize = categorizeByThirds,
        minCoverage = 0.5,
        populationKey = "population",
    } = options;

    if (!Array.isArray(das)) throw new TypeError("das must be an array");
    if (!Array.isArray(measures) || measures.length === 0) {
        throw new TypeError("measures must be a non-empty array of column names");
    }

    const makeNormalizer = typeof normalize === "function" ? normalize : NORMALIZERS[normalize];
    if (!makeNormalizer) throw new Error(`Unknown normalize method: ${normalize}`);

    const measureWeights = Object.fromEntries(measures.map((measure) => {
        const weight = weights[measure] ?? 1;
        if (!Number.isFinite(weight) || weight < 0) {
            throw new Error(`Weight for ${measure} must be a non-negative number`);
        }
        return [measure, weight];
    }));
    const totalWeight = Object.values(measureWeights).reduce((sum, w) => sum + w, 0);
    if (totalWeight === 0) throw new Error("At least one measure needs a weight above 0");

    // --- Step 1: Build a normalizer per measure from the values that are present ---
    const normalizers = Object.fromEntries(measures.map((measure) => {
        const values = das.map((da) => toNumberOrNull(da[measure])).filter((v) => v !== null);
        return [measure, values.length > 0 ? makeNormalizer(values) : null];
    }));

    // --- Step 2: Weighted average of the measures each DA has data for ---
    const scored = das.map((da) => {
        const population = toNumberOrNull(da[populationKey]);
        const normalized = {};
        let weightWithData = 0;
        let weightedSum = 0;

        for (const measure of measures) {
            const value = toNumberOrNull(da[measure]);
            if (value === null) {
                normalized[measure] = null;
                continue;
            }
            normalized[measure] = normalizers[measure](value);
            weightWithData += measureWeights[measure];
            weightedSum += normalized[measure] * measureWeights[measure];
        }

        const coverage = weightWithData / totalWeight;
        const hasEnoughData = weightWithData > 0 && coverage >= minCoverage;

        return {
            ...da,
            score: hasEnoughData ? round(weightedSum / weightWithData) : null,
            coverage,
            normalized,
            zero_population: population === null || population === 0,
        };
    });

    // --- Step 3: Categorize DAs that have a score ---
    const scores = scored.filter((da) => da.score !== null).map((da) => da.score);
    const getCategory = scores.length > 0 ? categorize(scores) : null;

    return scored.map((da) => ({
        ...da,
        category: da.score === null ? CATEGORIES.NOT_ENOUGH_DATA : getCategory(da.score),
    }));
}
