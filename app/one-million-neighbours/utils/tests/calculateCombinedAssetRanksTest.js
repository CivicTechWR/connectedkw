import calculateCombinedAssetRanks from '../calculateCombinedAssetRanks';

// --- Unit Test Implementation ---

function runTest() {
    console.log("Running unit test for calculateCombinedRank...");

    // 1. Define the input data for the test.
    const testData = [{
        "GEO_NAME": "N0B",
        "Population": 86919,
        "park": 2,
        "pool": 2,
        "community_centre": 2,
        "trail": 20
    }, {
        "GEO_NAME": "N1P",
        "Population": 7991,
        "park": 3,
        "pool": 0,
        "community_centre": 0,
        "trail": 6
    }, {
        "GEO_NAME": "N1R",
        "Population": 42928,
        "park": 28,
        "pool": 11,
        "community_centre": 0,
        "trail": 35
    }, {
        "GEO_NAME": "N1S",
        "Population": 20171,
        "park": 29,
        "pool": 3,
        "community_centre": 0,
        "trail": 16
    }, {
        "GEO_NAME": "N1T",
        "Population": 18513,
        "park": 6,
        "pool": 3,
        "community_centre": 0,
        "trail": 23
    }, {
        "GEO_NAME": "N2A",
        "Population": 32454,
        "park": 43,
        "pool": 9,
        "community_centre": 3,
        "trail": 14
    }, {
        "GEO_NAME": "N2B",
        "Population": 16939,
        "park": 17,
        "pool": 2,
        "community_centre": 0,
        "trail": 10
    }, {
        "GEO_NAME": "N2C",
        "Population": 17681,
        "park": 32,
        "pool": 7,
        "community_centre": 2,
        "trail": 10
    }, {
        "GEO_NAME": "N2E",
        "Population": 40428,
        "park": 41,
        "pool": 3,
        "community_centre": 4,
        "trail": 10
    }, {
        "GEO_NAME": "N2G",
        "Population": 14580,
        "park": 22,
        "pool": 9,
        "community_centre": 3,
        "trail": 10
    }, {
        "GEO_NAME": "N2H",
        "Population": 22456,
        "park": 41,
        "pool": 7,
        "community_centre": 3,
        "trail": 12
    }, {
        "GEO_NAME": "N2J",
        "Population": 20899,
        "park": 0,
        "pool": 6,
        "community_centre": 1,
        "trail": 55
    }, {
        "GEO_NAME": "N2K",
        "Population": 29381,
        "park": 26,
        "pool": 4,
        "community_centre": 2,
        "trail": 151
    }, {
        "GEO_NAME": "N2L",
        "Population": 37953,
        "park": 0,
        "pool": 17,
        "community_centre": 0,
        "trail": 125
    }, {
        "GEO_NAME": "N2M",
        "Population": 36494,
        "park": 47,
        "pool": 8,
        "community_centre": 2,
        "trail": 7
    }, {
        "GEO_NAME": "N2N",
        "Population": 26596,
        "park": 43,
        "pool": 2,
        "community_centre": 2,
        "trail": 7
    }, {
        "GEO_NAME": "N2P",
        "Population": 25040,
        "park": 76,
        "pool": 3,
        "community_centre": 2,
        "trail": 10
    }, {
        "GEO_NAME": "N2R",
        "Population": 18445,
        "park": 40,
        "pool": 0,
        "community_centre": 0,
        "trail": 14
    }, {
        "GEO_NAME": "N2T",
        "Population": 20634,
        "park": 0,
        "pool": 9,
        "community_centre": 0,
        "trail": 117
    }, {
        "GEO_NAME": "N2V",
        "Population": 19428,
        "park": 0,
        "pool": 6,
        "community_centre": 0,
        "trail": 135
    }, {
        "GEO_NAME": "N3C",
        "Population": 27518,
        "park": 30,
        "pool": 3,
        "community_centre": 0,
        "trail": 14
    }, {
        "GEO_NAME": "N3E",
        "Population": 2802,
        "park": 4,
        "pool": 0,
        "community_centre": 0,
        "trail": 2
    }, {
        "GEO_NAME": "N3H",
        "Population": 24306,
        "park": 20,
        "pool": 5,
        "community_centre": 1,
        "trail": 17
    }];

    // 2. Define the expected output from the R script, extracted from your data.
    const expectedRankFromR = {
        "N0B": 23,
        "N1P": 22,
        "N1R": 17,
        "N1S": 15,
        "N1T": 21,
        "N2A": 8,
        "N2B": 19,
        "N2C": 2,
        "N2E": 13,
        "N2G": 1,
        "N2H": 3,
        "N2J": 11,
        "N2K": 5,
        "N2L": 9,
        "N2M": 10,
        "N2N": 12,
        "N2P": 4,
        "N2R": 16,
        "N2T": 6,
        "N2V": 7,
        "N3C": 18,
        "N3E": 20,
        "N3H": 14,
    };

    // 3. Run the function with the test data.
    const actualResult = calculateCombinedAssetRanks(testData);

    // 4. Assert and check the results.
    let testsPassed = true;
    let failedTests = [];
    actualResult.forEach(fsa => {
        const expectedRank = expectedRankFromR[fsa.GEO_NAME];
        const actualRank = fsa.combined_rank;

        if (expectedRank === actualRank) {
            console.log(`✅ PASSED: For FSA ${fsa.GEO_NAME}, expected rank ${expectedRank}, got ${actualRank}.`);
        } else {
            console.error(`❌ FAILED: For FSA ${fsa.GEO_NAME}, expected rank ${expectedRank}, but got ${actualRank}.`);
            testsPassed = false;
            failedTests.push({fsa: fsa.GEO_NAME, expected: expectedRank, actual: actualRank});
        }
    });

    console.log("\n--------------------");
    if (testsPassed) {
        console.log("All tests passed successfully!");
    } else {
        console.log(`${failedTests.length} test(s) failed.`);
        console.table(failedTests);
    }
    console.log("--------------------");

    // Display the full output for inspection
    console.log("\nFull calculation result from JavaScript:");
    console.table(actualResult.map(d => ({
        FSA: d.GEO_NAME,
        Combined_Metric: d.combined_metric.toFixed(6), // Increased precision for debugging
        Rank: d.combined_rank,
    })));
}

// --- Execute the test ---
runTest();
