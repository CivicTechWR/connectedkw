import { getNeighbourhoodData, getNeighbourhoodGeography } from 'integrations/directus';
import OneMillionNeighboursComponent from 'components/one-million-neighbours/OneMillionNeighboursComponent';

export default async function OneMillionNeighboursPageEmbed() {
  const neighbourhoodGeography = await getNeighbourhoodGeography()
  const neighbourhoodData = await getNeighbourhoodData()

  return (
    <div className="h-screen w-screen">
      <OneMillionNeighboursComponent neighbourhoodData={neighbourhoodData} neighbourhoodGeography={neighbourhoodGeography} />
    </div>
  )
}
