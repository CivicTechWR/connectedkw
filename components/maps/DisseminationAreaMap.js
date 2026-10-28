'use client'
import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Legend from './LeafletMapLegend'
import NeighbourhoodPopup from './NeighbourhoodPopup'
import findContainingFeature from 'components/one-million-neighbours/utils/findContainingFeature'
import 'leaflet/dist/leaflet.css'

const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Pane = dynamic(() => import('react-leaflet').then(mod => mod.Pane), { ssr: false })
const LayersControl = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl), { ssr: false })
const LayersControlOverlay = dynamic(() => import('react-leaflet').then(mod => mod.LayersControl.Overlay), { ssr: false })

const categories = [
  {
    name: 1,
    color: '#00B88A',
    label: 'Most access'
  },
  {
    name: 2,
    color: '#DE54A0',
    label: 'Average access'
  },
  {
    name: 3,
    color: '#7378cc',
    label: 'Least access'
  }
]

// DA outlines sit on top of the ranked ADAs, so they have no visible fill by default
const baseStyle = {
  fillColor: '#4B5563',
  fillOpacity: 0,
  color: '#4B5563',
  weight: 1,
  opacity: 0.6,
}

const highlightStyle = {
  fillOpacity: 0.25,
  weight: 2,
  opacity: 1,
}

const PARK_GREEN = '#166534'
const PARK_LIGHT_GREEN = '#bbf7d0'
const PARK_PATTERN_ID = 'park-trees-pattern'

// A small tree centred on (x, y): triangular canopy over a short trunk
const treePath = (x, y) => `M${x} ${y - 3}l2.5 4.5h-5zM${x - 0.5} ${y + 1.5}h1v1.5h-1z`

// Parks are fill-only decoration, so they ignore the mouse and clicks fall through to the DAs
const parkStyle = {
  fillColor: `url(#${PARK_PATTERN_ID})`,
  fillOpacity: 0.9,
  color: PARK_GREEN,
  weight: 1,
  opacity: 1,
}

const treeIconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6.5" fill="${PARK_LIGHT_GREEN}" stroke="${PARK_GREEN}"/><path d="${treePath(7, 7)}" fill="${PARK_GREEN}"/></svg>`

const parksLayerName = `<span style="display:inline-flex;align-items:center;gap:4px">${treeIconSvg(14)}Parks</span>`

// Point parks (e.g. playgrounds) have no area to fill, so they get a small tree marker instead
const parkPointToLayer = (feature, latlng) => {
  // Leaflet needs window, so it is only loaded here, when the map is rendering in the browser
  const L = require('leaflet')
  return L.marker(latlng, {
    icon: L.divIcon({ html: treeIconSvg(14), className: '', iconSize: [14, 14] }),
    interactive: false,
    keyboard: false,
    pane: 'parks',
  })
}

// Repeating 16px tile of light green with three offset trees, referenced by the park fill
const ParkPatternDefs = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
    <defs>
      <pattern id={PARK_PATTERN_ID} width="16" height="16" patternUnits="userSpaceOnUse">
        <rect width="16" height="16" fill={PARK_LIGHT_GREEN} />
        <path d={`${treePath(4, 4)}${treePath(12, 7)}${treePath(6, 12)}`} fill={PARK_GREEN} />
      </pattern>
    </defs>
  </svg>
)

const DisseminationAreaDetails = ({ feature }) => {
  const { DAUID, city, LANDAREA, population_2021, population_2025_estimate } = feature.properties
  return (
    <div>
      <h3 className="text-blue">Dissemination area {DAUID}</h3>
      <table className="text-sm text-right">
        <tbody>
          <tr>
            <td className="py-1 pr-2 text-left">City</td>
            <td className="py-1 px-2 border-l border-gray-300">{city}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Population (2021)</td>
            <td className="py-1 px-2 border-l border-gray-300">{Number(population_2021).toLocaleString()}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Population (2025 est.)</td>
            <td className="py-1 px-2 border-l border-gray-300">{Number(population_2025_estimate).toLocaleString()}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Land area</td>
            <td className="py-1 px-2 border-l border-gray-300">{Number(LANDAREA).toLocaleString(undefined, { maximumFractionDigits: 2 })} km²</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const NeighbourhoodDetails = ({ feature, rankings }) => {
  const category = categories.find(c => c.name === rankings[feature.properties.DGUID])
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">Aggregate dissemination area</p>
      {category && (
        <p className="flex items-center gap-2 text-sm font-semibold mb-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
          {category.label}
        </p>
      )}
      <NeighbourhoodPopup feature={feature} />
    </div>
  )
}

export default function DisseminationAreaMap({ geojson, neighbourhoodGeojson, parksGeojson, rankings }) {
  const [selected, setSelected] = useState(null)

  const onEachFeature = useMemo(() => (feature, layer) => {
    layer.on({
      click: (e) => {
        setSelected({
          position: e.latlng,
          disseminationArea: feature,
          neighbourhood: findContainingFeature(e.latlng, neighbourhoodGeojson?.features || []),
        })
      },
      mouseover: (e) => {
        e.target.setStyle(highlightStyle)
        e.target.bringToFront()
      },
      mouseout: (e) => {
        e.target.setStyle(baseStyle)
      },
    })
  }, [neighbourhoodGeojson])

  // Only reachable when the DA layer is hidden, since DAs cover the ADAs otherwise
  const onEachNeighbourhood = useMemo(() => (feature, layer) => {
    layer.on('click', (e) => {
      setSelected({ position: e.latlng, disseminationArea: null, neighbourhood: feature })
    })
  }, [])

  const neighbourhoodStyle = useMemo(() => (feature) => {
    // GeoJSON takes an immutable data object so in order to get a dynamic style based on rankings we need to refer to data outside of the feature object
    const categoryNumber = rankings[feature.properties.DGUID]
    const category = categories.find(c => c.name === categoryNumber)
    return {
      fillColor: category.color,
      weight: 2,
      opacity: 1,
      color: category.color,
      fillOpacity: 0.2
    }
  }, [rankings])

  return (
    <div className="w-full h-[60vh] md:h-full overflow-hidden">
      <ParkPatternDefs />
      <MapContainer
        center={[43.45, -80.5]} // Waterloo region
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution= '&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Separate panes keep DAs drawn above ADAs no matter which order the layers are toggled */}
        <Pane name="neighbourhoods" style={{ zIndex: 410 }} />
        <Pane name="disseminationAreas" style={{ zIndex: 420 }} />
        <Pane name="parks" style={{ zIndex: 430 }} />
        <LayersControl position="topleft">
          {neighbourhoodGeojson && (
            <LayersControlOverlay checked name="Aggregate dissemination areas (access ranking)">
              <GeoJSON
                data={neighbourhoodGeojson}
                style={neighbourhoodStyle}
                onEachFeature={onEachNeighbourhood}
                pane="neighbourhoods"
              />
            </LayersControlOverlay>
          )}
          {geojson && (
            <LayersControlOverlay checked name="Dissemination areas">
              <GeoJSON
                data={geojson}
                style={baseStyle}
                onEachFeature={onEachFeature}
                pane="disseminationAreas"
              />
            </LayersControlOverlay>
          )}
          {parksGeojson && (
            <LayersControlOverlay name={parksLayerName}>
              <GeoJSON
                data={parksGeojson}
                style={parkStyle}
                pointToLayer={parkPointToLayer}
                interactive={false}
                pane="parks"
              />
            </LayersControlOverlay>
          )}
        </LayersControl>
        {selected && (
          <Popup position={selected.position}>
            <div className="space-y-4">
              {selected.disseminationArea && <DisseminationAreaDetails feature={selected.disseminationArea} />}
              {selected.disseminationArea && selected.neighbourhood && <hr className="border-gray-300" />}
              {selected.neighbourhood && <NeighbourhoodDetails feature={selected.neighbourhood} rankings={rankings} />}
            </div>
          </Popup>
        )}
        <Legend categories={categories} />
      </MapContainer>
    </div>
  )
}
