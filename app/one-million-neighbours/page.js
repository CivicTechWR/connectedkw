import OneMillionNeighboursComponent from 'components/OneMillionNeighboursComponent';

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
