import { getNeighbourhoodData, getNeighbourhoodGeography } from 'integrations/directus';
import OneMillionNeighboursComponent from 'components/one-million-neighbours/OneMillionNeighboursComponent';

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
  const neighbourhoodGeography = await getNeighbourhoodGeography()
  const neighbourhoodData = await getNeighbourhoodData()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-6 text-center">Who Has Access?</h1>
        <p className="text-2xl font-bold mb-6 text-center">Mapping neighbourhood services in Waterloo Region</p>
        <p>As Waterloo Region grows to One Million Neighbours in the next few decades, how can we build toward a future that is inclusive, resilient, and abundant for all? </p>
        <p>This map shows the level of access to services like parks, green space, transit, healthcare, and community space. Which neighbourhoods have abundant access? Which ones need more investment?</p>
        <p>This map is one way we are measuring progress towards the <a href="https://onemillionneighbours.ca/" target="_blank" rel="noopener noreferrer">One Million Neighbours vision</a>, created by non-profits and community groups across Waterloo Region. We identified common priorities and envisioned future scenarios based on multisolving: finding solutions that solve multiple problems at the same time, while advancing equity.</p>
      </div>
      <OneMillionNeighboursComponent neighbourhoodData={neighbourhoodData} neighbourhoodGeography={neighbourhoodGeography} />
      <div className="mt-6">
        <h2 className="text-lg font-bold mb-4">How the ratings are calculated</h2>
        <p>The ratings of neighbourhoods as “most,” “average,” or “least” access to services are calculated as follows:</p>  
        <ul className="list-disc pl-5 mb-4">
          <li className="mb-2">For each type of service selected on the filter, divide by the population in the neighbourhood to get a per-capita value.</li>
          <li className="mb-2">Adjust the sizes of the per-capita values so that they all have similar weight. This ensures that all resource types are treated on an equal basis when combined.</li>
          <li className="mb-2">Calculate the average among all selected services</li>
          <li className="mb-2">After combining all resources, the top third of neighbourhoods are rated as “most access.” The middle third are “average” and the lowest third are rated as “least access.”</li>
        </ul>
      </div>
    </div>
  )
}
