import dynamic from 'next/dynamic';

const LeafletMapClient = dynamic(() => import('./LeafletMapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[60vh] md:h-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
});

export default function LeafletMap(props) {
  return <LeafletMapClient {...props} />;
}
