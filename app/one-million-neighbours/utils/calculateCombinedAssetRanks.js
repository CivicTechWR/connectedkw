// Calculate the combined rank of each FSA based on the selected filters

// FSAfilters is an array of [{filterName: boolean}]
// FSAData is an array of objects with at least the following keys:
// {
//     "GEO_NAME": "N0B",
//     "Population": 86919,
//     "park": 2,
//     "pool": 2,
//     "community_centre": 2,
//     "trail": 20
// }
export default function calculateCombinedAssetRanks(FSAFilters, FSAData) {
    
    // If there are less than 2 neighbourhoods, return the original data with a combined_rank of 1
    if (FSAData.length < 2) {
        return FSAData.map((fsa) => ({ ...fsa, combined_rank: 1 }));
    }
    // Helper function to calculate the mean (average) of an array of numbers.
    const getMean = (arr) => arr.reduce((acc, val) => acc + val, 0) / arr.length;

    // Helper function to calculate the sample standard deviation.
    // R's sd() function uses n-1 in the denominator, so we do the same here for consistency.
    const getStdDev = (arr) => {
        const mean = getMean(arr);
        if (arr.length < 2) return 0; // Sample standard deviation is not defined for a single value.
        // Calculate the sum of squared differences from the mean.
        const sumOfSquares = arr.map(value => Math.pow(value - mean, 2)).reduce((a, b) => a + b, 0);
        // Divide by n-1 for the sample standard deviation.
        return Math.sqrt(sumOfSquares / (arr.length - 1));
    };


    // --- Step 1: Calculate per capita data ---
    const perCapitaData = FSAData.map(fsa => ({
        ...fsa,
        parks_per_capita: fsa.park / fsa.Population,
        pools_per_capita: fsa.pool / fsa.Population,
        community_centre_per_capita: fsa.community_centre / fsa.Population,
        trails_per_capita: fsa.trail / fsa.Population,
    }));

    // --- Step 2: Standardize data (get means and standard deviations first) ---
    // Create arrays of each per-capita metric to easily calculate stats.
    const parksPerCapita = perCapitaData.map(d => d.parks_per_capita);
    const poolsPerCapita = perCapitaData.map(d => d.pools_per_capita);
    const ccPerCapita = perCapitaData.map(d => d.community_centre_per_capita);
    const trailsPerCapita = perCapitaData.map(d => d.trails_per_capita);

    // Calculate the mean for each metric.
    const meanParks = getMean(parksPerCapita);
    const meanPools = getMean(poolsPerCapita);
    const meanCC = getMean(ccPerCapita);
    const meanTrails = getMean(trailsPerCapita);

    // Calculate the standard deviation for each metric.
    const sdParks = getStdDev(parksPerCapita);
    const sdPools = getStdDev(poolsPerCapita);
    const sdCC = getStdDev(ccPerCapita);
    const sdTrails = getStdDev(trailsPerCapita);

    // --- Step 3: Calculate standardized values and the combined metric ---
    // If a filter is not selected (value is false), its standardized value is set to 0 so it is not included in the combined metric.
    // Ternary explained: (if this condition is true) ? (use this value) : (if it is false, use this value)
    const standardizedData = perCapitaData.map(fsa => {
        const parks_std =  FSAFilters.parks ?  (fsa.parks_per_capita - meanParks) / sdParks : 0;
        const pools_std =  FSAFilters.pools ?  (fsa.pools_per_capita - meanPools) / sdPools : 0;
        const cc_std =  FSAFilters.centres ?  (fsa.community_centre_per_capita - meanCC) / sdCC : 0;
        const trails_std =  FSAFilters.trails ?  (fsa.trails_per_capita - meanTrails) / sdTrails : 0;

        // The combined metric is the average of the four standardized metrics.
        const combined_metric = (parks_std + pools_std + cc_std + trails_std) / 4;

        return {
            ...fsa,
            parks_per_capita_standardized: parks_std,
            pools_per_capita_standardized: pools_std,
            community_centre_per_capita_standardized: cc_std,
            trails_per_capita_standardized: trails_std,
            combined_metric: combined_metric,
        };
    });

    // --- Step 4: Sort by the combined metric and assign rank ---
    // Sort in descending order (highest combined_metric first).
    const sortedData = standardizedData.sort((a, b) => b.combined_metric - a.combined_metric);

    // Assign the rank based on the sorted order (index + 1).
    const rankedData = sortedData.map((fsa, index) => ({
        ...fsa,
        combined_rank: index + 1,
    }));

    return rankedData;
}