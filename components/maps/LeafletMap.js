'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Legend from './LeafletMapLegend'
import FsaPopup from './FsaPopup'
import 'leaflet/dist/leaflet.css'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })

const categories = [
  {
    name: 1,
    color: '#de3f96',
    label: 'Abundant access'
  },
  {
    name: 2,
    color: '#00bcd9',
    label: 'Average access'
  },
  {
    name: 3,
    color: '#5251be',
    label: 'Least access'
  }
]

export default function LeafletMap({ geojson, fsaRankings }) {
  const [selectedFSA, setSelectedFSA] = useState(null)
  const [map, setMap] = useState(null)
  const [popupPosition, setPopupPosition] = useState(null)

  const onEachFeature = useMemo(() => (feature, layer) => {
    if (feature.properties) {

      layer.on('click', (e) => {
        setPopupPosition(e.latlng)
        setSelectedFSA(feature)
      })
    }
  }, [])

  const style = useMemo(() => (feature) => {
    // GeoJSON takes an immutable data object so in order to get a dynamic style based on rankings we need to refer to data outside of the feature object
    const categoryNumber = fsaRankings[feature.properties.DGUID]
    const category = categories.find(c => c.name === categoryNumber)
    return {
      fillColor: category.color,
      weight: 2,
      opacity: 1,
      color: category.color,
      fillOpacity: 0.2
    }
  }, [fsaRankings])

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={[43.45, -80.5]} // Waterloo region
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geojson && (
          <GeoJSON
            data={geojson}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
        {selectedFSA && popupPosition && (
          <Popup position={popupPosition}>
            <FsaPopup feature={selectedFSA} totalFSAs={geojson.length} />
          </Popup>
        )}
        <Legend categories={categories} />
      </MapContainer>
    </div>
  )
}