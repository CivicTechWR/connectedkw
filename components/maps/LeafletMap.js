'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
// import { MapContainer, TileLayer, GeoJSON, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import geojson from 'data/fsa_2021_waterloo.json'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false })

// Fix for default markers in react-leaflet
// import L from 'leaflet'
// delete L.Icon.Default.prototype._getIconUrl
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// })

export default function LeafletMap({fsaGeoJSON}) {
  const [fsaData, setFsaData] = useState(fsaGeoJSON)
  // const [loading, setLoading] = useState(true)

  // useEffect(() => {
  //   // Load FSA GeoJSON data
  //   fetch('/data/fsa_2021_waterloo.json')
  //     .then(response => response.json())
  //     .then(data => {
  //       setFsaData(data)
  //       setLoading(false)
  //     })
  //     .catch(error => {
  //       console.error('Error loading FSA data:', error)
  //       setLoading(false)
  //     })
  // }, [])

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.CFSAUID) {
      layer.bindPopup(
        `<div>
          <h3 class="font-semibold">FSA: ${feature.properties.CFSAUID}</h3>
          <p class="text-sm text-gray-600">Forward Sortation Area</p>
        </div>`
      )
    }
  }

  const style = (feature) => {
    return {
      fillColor: '#0066FF',
      weight: 2,
      opacity: 1,
      color: '#0066FF',
      fillOpacity: 0.1
    }
  }

  // if (loading) {
  //   return (
  //     <div className="w-full h-96 flex items-center justify-center">
  //       <div className="text-gray-500">Loading map...</div>
  //     </div>
  //   )
  // }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden">
      <MapContainer
        center={[43.5, -80.5]} // Waterloo region
        zoom={9}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fsaData && (
          <GeoJSON
            data={fsaData}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  )
} 