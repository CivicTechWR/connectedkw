import FsaMap from "components/maps/FsaMap"
import { getFSAGeoData } from 'integrations/directus';
import LeafletMap from "components/maps/LeafletMap"

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
  let features = []
  try {
    features = FSAs.map(fsa => {
      console.log(fsa)
      return {
        "type": "Feature",
        "properties": {
          "CFSAUID": fsa.GEO_NAME,
          "DGUID": fsa.DGUID,
          "id": fsa.id,
          "PRNAME": "Ontario",
          "LANDAREA": fsa.LANDAREA
        },
        geometry: JSON.parse(fsa.geometry)
      }
    })
  } catch (error) {
    console.error(error)
  }
  
  console.log(features)
  const fsaGeoJSON = {
    ...defaultGeoJSON,
    features: features
  }

  return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">One Million Neighbours</h1>
        {/* <FsaMap /> */}
        <LeafletMap fsaGeoJSON={fsaGeoJSON} />
      </div>
  )
}
