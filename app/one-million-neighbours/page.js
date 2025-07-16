import FsaMap from "components/maps/FsaMap"
import { getFSAs } from 'integrations/directus';

export default async function OneMillionNeighboursPage() {
  const FSAs = await getFSAs()
  console.log(FSAs)
  return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">One Million Neighbours</h1>
        <FsaMap />
      </div>
  )
}
