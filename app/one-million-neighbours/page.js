import FsaMap from "components/maps/FsaMap"
import LeafletMap from "components/maps/LeafletMap"

export default function OneMillionNeighboursPage() {
  return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">One Million Neighbours</h1>
        {/* <FsaMap /> */}
        <LeafletMap />
      </div>
  )
}