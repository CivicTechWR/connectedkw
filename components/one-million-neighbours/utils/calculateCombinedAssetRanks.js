// Calculate the combined rank of each Neighbourhood based on the selected filters

// neighbourhoodFilters is an array of [{filterName: boolean}]
// neighbourhoodData is an array of objects with at least the following keys:
// {
//     "GEO_NAME": "Uptown Waterloo",
//     "population_2021": 86919,
//     "assets_parks_count": 5,
//     "assets_schools_count": 5,
//     "assets_libraries_count": 5,
//     "assets_health_count": 5,
//     "assets_transit_count": 5,
//     "assets_community_spaces_count": 5,
// }
export default function calculateCombinedAssetRanks(neighbourhoodFilters, neighbourhoodData) {
    
    // If there are less than 2 neighbourhoods, return the original data with a combined_rank of 1
    if (neighbourhoodData.length < 2) {
        return neighbourhoodData.map((neighbourhood) => ({ ...neighbourhood, combined_rank: 1 }));
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
    const perCapitaData = neighbourhoodData.map(neighbourhood => ({
        ...neighbourhood,
        parks_per_capita: neighbourhood.assets_parks_count / neighbourhood.population_2021,
        schools_per_capita: neighbourhood.assets_schools_count / neighbourhood.population_2021,
        libraries_per_capita: neighbourhood.assets_libraries_count / neighbourhood.population_2021,
        health_per_capita: neighbourhood.assets_health_count / neighbourhood.population_2021,
        transit_per_capita: neighbourhood.assets_transit_count / neighbourhood.population_2021,
        community_spaces_per_capita: neighbourhood.assets_community_spaces_count / neighbourhood.population_2021,
    }));

    // --- Step 2: Standardize data (get means and standard deviations first) ---
    // Create arrays of each per-capita metric to easily calculate stats.
    const parksPerCapita = perCapitaData.map(d => d.parks_per_capita);
    const schoolsPerCapita = perCapitaData.map(d => d.schools_per_capita);
    const librariesPerCapita = perCapitaData.map(d => d.libraries_per_capita);
    const healthPerCapita = perCapitaData.map(d => d.health_per_capita);
    const transitPerCapita = perCapitaData.map(d => d.transit_per_capita);
    const communitySpacesPerCapita = perCapitaData.map(d => d.community_spaces_per_capita);

    // Calculate the mean for each metric.
    const meanParks = getMean(parksPerCapita);
    const meanSchools = getMean(schoolsPerCapita);
    const meanLibraries = getMean(librariesPerCapita);
    const meanHealth = getMean(healthPerCapita);
    const meanTransit = getMean(transitPerCapita);
    const meanCommunitySpaces = getMean(communitySpacesPerCapita);

    // Calculate the standard deviation for each metric.
    const sdParks = getStdDev(parksPerCapita);
    const sdSchools = getStdDev(schoolsPerCapita);
    const sdLibraries = getStdDev(librariesPerCapita);
    const sdHealth = getStdDev(healthPerCapita);
    const sdTransit = getStdDev(transitPerCapita);
    const sdCommunitySpaces = getStdDev(communitySpacesPerCapita);

    // --- Step 3: Calculate standardized values and the combined metric ---
    // If a filter is not selected (value is false), its standardized value is set to 0 so it is not included in the combined metric.
    // Ternary explained: (if this condition is true) ? (use this value) : (if it is false, use this value)
    const standardizedData = perCapitaData.map(neighbourhood => {

        const parks_std = neighbourhoodFilters.parks ? (neighbourhood.parks_per_capita - meanParks) / sdParks : 0;
        const schools_std = neighbourhoodFilters.schools ? (neighbourhood.schools_per_capita - meanSchools) / sdSchools : 0;
        const libraries_std = neighbourhoodFilters.libraries ? (neighbourhood.libraries_per_capita - meanLibraries) / sdLibraries : 0;
        const health_std = neighbourhoodFilters.health ? (neighbourhood.health_per_capita - meanHealth) / sdHealth : 0;
        const transit_std = neighbourhoodFilters.transit ? (neighbourhood.transit_per_capita - meanTransit) / sdTransit : 0;
        const community_spaces_std = neighbourhoodFilters.community_spaces ? (neighbourhood.community_spaces_per_capita - meanCommunitySpaces) / sdCommunitySpaces : 0;

        // The combined metric is the average of the 6 standardized metrics.
        const combined_metric = Math.round((parks_std + schools_std + libraries_std + health_std + transit_std + community_spaces_std) / 6 * 1000000) / 1000000;

        return {
            ...neighbourhood,
            parks_per_capita_standardized: parks_std,
            schools_per_capita_standardized: schools_std,
            libraries_per_capita_standardized: libraries_std,
            health_per_capita_standardized: health_std,
            transit_per_capita_standardized: transit_std,
            community_spaces_per_capita_standardized: community_spaces_std,
            combined_metric: combined_metric,
        };
    });

    // --- Step 4: Sort by the combined metric and assign rank ---
    // Sort in descending order (highest combined_metric first).
    const sortedData = standardizedData.sort((a, b) => b.combined_metric - a.combined_metric);

    // Assign the rank based on the sorted order (index + 1).
    const rankedData = sortedData.map((neighbourhood, index) => ({
        ...neighbourhood,
        combined_rank: index + 1,
    }));

    return rankedData;
}