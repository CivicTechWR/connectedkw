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
      <h1 className="text-4xl font-bold mb-8">One Million Neighbours</h1>
      <OneMillionNeighboursComponent FSAData={FSAData} FSAGeoJSON={FSAGeoJSON} />
    </div>
  )
}
