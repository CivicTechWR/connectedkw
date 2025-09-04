import { getFSAGeoData, getFSAData } from 'integrations/directus';
import OneMillionNeighboursComponent from 'components/OneMillionNeighboursComponent';

const defaultGeoJSON = {
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  "name": "fsa_2021_reprojected",
  "features": []
}

export default async function OneMillionNeighboursPage() {
  const FSAs = await getFSAGeoData()
  const FSAData = await getFSAData()

  const featuresWithRanking = FSAData.map((feature, index) => {
    return {
      ...feature,
      ranking: feature.combined_rank < 9 ? 'top' : feature.combined_rank < 17 ? 'middle' : 'bottom',
    }
  })

  let features = []
  try {
    features = FSAs.map(fsa => {
      const fsaData = featuresWithRanking.find(f => f.DGUID === fsa.DGUID)
      return {
        "type": "Feature",
        "properties": {
          "CFSAUID": fsa.GEO_NAME,
          "DGUID": fsa.DGUID,
          "id": fsa.id,
          "PRNAME": "Ontario",
          "LANDAREA": fsa.LANDAREA,
          ...fsaData
        },
        geometry: JSON.parse(fsa.geometry)
      }
    })
  } catch (error) {
    console.error(error)
  }

  const FSAGeoJSON = {
    ...defaultGeoJSON,
    features: features
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-6 text-center">Who Has Access?</h1>
        <p className="text-2xl font-bold mb-6 text-center">Mapping neighbourhood equity in Waterloo Region</p>
        <p>As Waterloo Region grows to One Million Neighbours in the next few decades, how can we build toward a future that is inclusive, resilient, and abundant for all? </p>
        <p>This map is a proof of concept showing the level of access to parks, pools, trails, and community centres. Which neighbourhoods have abundant access? Which ones need more investment in public space? (“Neighbourhoods” are defined by the first three letters of the postal code, for example, N2R)</p>
        <p>This map is one way we are measuring progress towards the <a href="https://onemillionneighbours.ca/" target="_blank" rel="noopener noreferrer">One Million Neighbours vision</a>, a bottom-up vision for the future created by non-profits and community groups over the course of 8 roundtable discussions in 2024 and 2025. We identified common priorities and built future scenarios based on the concept of multisolving: that is, finding solutions that solve multiple problems at the same time, while advancing equity.</p>
      </div>
      <OneMillionNeighboursComponent FSAData={FSAData} FSAGeoJSON={FSAGeoJSON} />
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-4">How the ratings are calculated</h2>
        <p>The ratings of neighbourhoods as “abundant,” “average,” or “least” access to resources are calculated as follows:</p>  
        <ul className="list-disc pl-5 mb-4">
          <li className="mb-2">For each type of resource selected on the filter, divide by the population in the neighbourhood to get a per-capita value.</li>
          <li className="mb-2">Adjust the sizes of the per-capita values so that they all have similar sizes. This ensures that all resource types are treated on an equal basis when combined.</li>
          <li className="mb-2">Calculate the average among all resources selected on the filter</li>
          <li className="mb-2">After combining all resources, the top third of neighbourhoods are rated as “abundant.” The middle third are “average” and the lowest third are rated as “least access.”</li>
        </ul>
      </div>
    </div>
  )
}
