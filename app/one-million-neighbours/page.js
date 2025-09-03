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
  const FSAGeoData = await getFSAGeoData()
  const FSAData = await getFSAData()

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">One Million Neighbours</h1>
      <OneMillionNeighboursComponent FSAData={FSAData} FSAGeoData={FSAGeoData} />
    </div>
  )
}
