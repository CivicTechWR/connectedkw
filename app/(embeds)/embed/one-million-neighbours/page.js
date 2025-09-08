import { getFSAGeoData, getFSAData } from 'integrations/directus';
import OneMillionNeighboursComponent from 'components/one-million-neighbours/OneMillionNeighboursComponent';

export default async function OneMillionNeighboursPageEmbed() {
  const FSAGeoData = await getFSAGeoData()
  const FSAData = await getFSAData()

  return (
    <div className="h-screen w-screen">
      <OneMillionNeighboursComponent FSAData={FSAData} FSAGeoData={FSAGeoData} />
    </div>
  )
}
