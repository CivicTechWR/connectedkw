const fs = require('fs')
const parse = require('csv-parser')
const turf = require('@turf/turf')
const path = require('path')

const results = [];

fs.createReadStream('./data/WatRegionStatCanPopCSv2.csv')
  .pipe(parse())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    processData();
});

function processData() {
    console.log('=== LOADING DATA ===');
    
    const kitchenerGeoJSON = JSON.parse(fs.readFileSync(path.join(__dirname, './data/Kitchener_Parks.geojson')));
    const waterlooGeoJSON = JSON.parse(fs.readFileSync(path.join(__dirname, './data/Waterloo_Parks.geojson')));
    const fsaBounds = JSON.parse(
      fs.readFileSync(path.join(__dirname, './data/fsa_2021_waterloo.json'))
    );

    const allParks = [...kitchenerGeoJSON.features, ...waterlooGeoJSON.features];
    console.log(`Loaded ${allParks.length} parks and ${fsaBounds.features.length} FSAs`);

    // Initialize park count for each FSA
    for(const fsa of fsaBounds.features){
        fsa.properties.parkCount = 0
    }

    console.log('=== COUNTING PARKS PER FSA ===');
    
    // Count parks that overlap with each FSA
    for(const park of allParks){
        for(const fsa of fsaBounds.features){
            try {
                if(turf.booleanIntersects(park.geometry, fsa.geometry)){
                    fsa.properties.parkCount += 1
                    break;
                }
            } catch (error) {
                console.log(`Error processing park: ${error.message}`);
            }
        }
    }

    console.log('=== MERGING POPULATION DATA ===');
    
    // Merge population data with FSA park counts
    for(const fsa of fsaBounds.features) {
        const populationRow = results.find(row => row.GEO === fsa.properties.CFSAUID);
        
        if (populationRow) {
            // Add population data to FSA properties
            fsa.properties.population = parseInt(populationRow['Population and dwelling counts (3):Population, 2021[1]']);
            fsa.properties.dwellings = parseInt(populationRow['Population and dwelling counts (3):Private dwellings occupied by usual residents, 2021[3]']);
            
            // Calculate derived metrics
            fsa.properties.parksPerCapita = fsa.properties.parkCount / fsa.properties.population;
            fsa.properties.parksPerThousand = (fsa.properties.parkCount / fsa.properties.population) * 1000;
            fsa.properties.populationPerPark = fsa.properties.parkCount > 0 ? fsa.properties.population / fsa.properties.parkCount : null;
        } else {
            console.log(`Warning: No population data found for ${fsa.properties.CFSAUID}`);
        }
    }

    console.log('=== PARK EQUITY ANALYSIS ===');
    console.log('FSA Code | Parks | Population | Parks/1000 People | People/Park');
    console.log('---------|-------|------------|-------------------|------------');
    
    // Sort by parks per capita (descending) for equity analysis
    const sortedFSAs = fsaBounds.features
        .filter(fsa => fsa.properties.population > 0)
        .sort((a, b) => b.properties.parksPerThousand - a.properties.parksPerThousand);

    sortedFSAs.forEach(fsa => {
        const parks = fsa.properties.parkCount;
        const pop = fsa.properties.population;
        const parksPerThousand = fsa.properties.parksPerThousand.toFixed(2);
        const peoplePerPark = fsa.properties.populationPerPark ? fsa.properties.populationPerPark.toFixed(0) : 'N/A';
        
        console.log(`${fsa.properties.CFSAUID.padEnd(8)} | ${parks.toString().padStart(5)} | ${pop.toString().padStart(10)} | ${parksPerThousand.padStart(17)} | ${peoplePerPark.padStart(10)}`);
    });

    console.log('\n=== KEY INSIGHTS ===');
    
    // Calculate regional averages
    const totalParks = sortedFSAs.reduce((sum, fsa) => sum + fsa.properties.parkCount, 0);
    const totalPopulation = sortedFSAs.reduce((sum, fsa) => sum + fsa.properties.population, 0);
    const regionalParksPerThousand = (totalParks / totalPopulation) * 1000;
    
    console.log(`Regional Average: ${regionalParksPerThousand.toFixed(2)} parks per 1,000 people`);
    
    // Find best and worst served areas
    const bestServed = sortedFSAs[0];
    const worstServed = sortedFSAs[sortedFSAs.length - 1];
    
    console.log(`Best Served: ${bestServed.properties.CFSAUID} (${bestServed.properties.parksPerThousand.toFixed(2)} parks/1000)`);
    console.log(`Worst Served: ${worstServed.properties.CFSAUID} (${worstServed.properties.parksPerThousand.toFixed(2)} parks/1000)`);
    
    // Count areas above/below average
    const aboveAverage = sortedFSAs.filter(fsa => fsa.properties.parksPerThousand > regionalParksPerThousand).length;
    const belowAverage = sortedFSAs.length - aboveAverage;
    
    console.log(`Areas above regional average: ${aboveAverage}`);
    console.log(`Areas below regional average: ${belowAverage}`);

    console.log('\n=== EXPORTING RESULTS ===');
    
    // Export enhanced GeoJSON with all calculated metrics
    const outputGeoJSON = {
        type: 'FeatureCollection',
        features: fsaBounds.features
    };
    
    fs.writeFileSync('./data/fsa_park_density_analysis.geojson', JSON.stringify(outputGeoJSON, null, 2));
    console.log('Enhanced GeoJSON saved to: ./data/fsa_park_density_analysis.geojson');
    
    // Export CSV summary for easy analysis
    const csvData = sortedFSAs.map(fsa => ({
        FSA: fsa.properties.CFSAUID,
        Parks: fsa.properties.parkCount,
        Population: fsa.properties.population,
        ParksPerThousand: fsa.properties.parksPerThousand.toFixed(3),
        PeoplePerPark: fsa.properties.populationPerPark ? fsa.properties.populationPerPark.toFixed(0) : 'N/A',
        LandArea: fsa.properties.LANDAREA
    }));
    
    const csvHeader = 'FSA,Parks,Population,ParksPerThousand,PeoplePerPark,LandArea\n';
    const csvContent = csvData.map(row => 
        `${row.FSA},${row.Parks},${row.Population},${row.ParksPerThousand},${row.PeoplePerPark},${row.LandArea}`
    ).join('\n');
    
    fs.writeFileSync('./data/park_equity_analysis.csv', csvHeader + csvContent);
    console.log('CSV analysis saved to: ./data/park_equity_analysis.csv');
    
    console.log('\n🎉 Analysis complete! Ready for mapping and policy recommendations.');
}