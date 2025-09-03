'use client'

import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Legend from './LeafletMapLegend'

import 'leaflet/dist/leaflet.css'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false })


const categories = [
  {
    name: 1,
    color: '#de3f96',
    label: 'Top'
  },
  {
    name: 2,
    color: '#00bcd9',
    label: 'Middle'
  },
  {
    name: 3,
    color: '#5251be',
    label: 'Bottom'
  }
]

export default function LeafletMap({ geojson, fsaRankings }) {
  const [selectedFSA, setSelectedFSA] = useState(null)
  const [map, setMap] = useState(null)

  const onEachFeature = useMemo(() => (feature, layer) => {
    if (feature.properties) {
      layer.bindPopup(
        `<div>
          <h3 class="font-semibold">${feature.properties.GEO_DISPLAY_NAME}</h3>
          <p class="text-sm text-gray-600">FSA: ${feature.properties.CFSAUID}</p>
          <p class="text-sm text-gray-600">Median age: ${feature.properties.Median_age_of_the_population}</p>
          <p class="text-sm text-gray-600">Total private dwellings: ${feature.properties.Total_private_dwellings}</p>
        </div>`
      )

      layer.on('click', () => {
        setSelectedFSA(feature.properties)
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
    <div className="w-full h-[500px] rounded-lg overflow-hidden">
      <MapContainer
        center={[43.5, -80.5]} // Waterloo region
        zoom={9}
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
        <Legend categories={categories} />
      </MapContainer>
    </div>
  )
}