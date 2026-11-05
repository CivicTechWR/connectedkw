'use client'
'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
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


const MapControllerWrapper = dynamic(() => Promise.resolve(({ children }) => <>{children}</>), { ssr: false })

const categories = [
  { name: 1, color: '#00B88A', label: 'Most access' },
  { name: 2, color: '#DE54A0', label: 'Average access' },
  { name: 3, color: '#7378cc', label: 'Least access' }
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

const treePath = (x, y) => `M${x} ${y - 3}l2.5 4.5h-5zM${x - 0.5} ${y + 1.5}h1v1.5h-1z`

const parkStyle = {
  fillColor: `url(#${PARK_PATTERN_ID})`,
  fillOpacity: 0.9,
  color: PARK_GREEN,
  weight: 1,
  opacity: 1,
}

const treeIconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6.5" fill="${PARK_LIGHT_GREEN}" stroke="${PARK_GREEN}"/><path d="${treePath(7, 7)}" fill="${PARK_GREEN}"/></svg>`

const parksLayerName = `<span style="display:inline-flex;align-items:center;gap:4px">${treeIconSvg(14)}Parks</span>`

const parkPointToLayer = (feature, latlng) => {
  const L = require('leaflet')
  return L.marker(latlng, {
    icon: L.divIcon({ html: treeIconSvg(14), className: '', iconSize: [14, 14] }),
    interactive: false,
    keyboard: false,
    pane: 'parks',
  })
}

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
      <div className="mb-4">
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

// Map Controller to manage active highlight states for selected Neighbourhoods
function MapController({ selectedNeighbourhoods, setSelectedNeighbourhoods, setPopupPosition, setClickedDA, rankings, featureClickedRef }) {
  const { useMap, useMapEvents } = require('react-leaflet')
  const map = useMap()

  useMapEvents({
    click() {
      if (featureClickedRef.current) return
      setSelectedNeighbourhoods([])
      setPopupPosition(null)
      setClickedDA(null)
    }
  })

  useEffect(() => {
    if (!map) return

    const updateStyle = (layer) => {
      // Only apply selected styling to Neighbourhoods (which have DGUID)
      if (layer.feature && layer.feature.properties && layer.feature.properties.DGUID && layer.setStyle) {
        const categoryNumber = rankings[layer.feature.properties.DGUID]
        const category = categories.find(c => c.name === categoryNumber)
        const isSelected = selectedNeighbourhoods.some(f => f.properties.DGUID === layer.feature.properties.DGUID)

        layer.setStyle({
          fillColor: category ? category.color : '#ccc',
          weight: isSelected ? 4 : 2,
          opacity: 1,
          color: category ? category.color : '#ccc',
          fillOpacity: isSelected ? 0.5 : 0.2
        })

        if (isSelected && layer.bringToFront) {
          layer.bringToFront()
        }
      }
    }

    map.eachLayer((layer) => {
      updateStyle(layer)
      if (layer.eachLayer) {
        layer.eachLayer(subLayer => updateStyle(subLayer))
      }
    })
  }, [map, selectedNeighbourhoods, rankings])

  return null
}

function LassoSelection({ lassoEnabled, setLassoEnabled, setSelectedNeighbourhoods, setPopupPosition, setClickedDA }) {
  const { useMap } = require('react-leaflet')
  const map = useMap()
  const lassoRef = useRef(null)

  useEffect(() => {
    if (!map) return
    let isMounted = true

    import('leaflet').then((leafletModule) => {
      const L = leafletModule.default || leafletModule
      window.L = L

      import('leaflet-lasso').then(() => {
        if (!isMounted || !map) return

        if (!lassoRef.current) {
          lassoRef.current = L.lasso(map, { intersect: true })
        }

        const handleLassoFinished = (event) => {
          const toggledFeatures = []
          event.layers.forEach(layer => {
            const processFeature = (feat) => {
              // Ensure we only select Neighbourhoods (DGUID), not DAs
              if (feat && feat.properties && feat.properties.DGUID) {
                if (!toggledFeatures.some(f => f.properties.DGUID === feat.properties.DGUID)) {
                  toggledFeatures.push(feat)
                }
              }
            }

            if (layer.feature) {
              processFeature(layer.feature)
            } else if (layer.eachLayer) {
              layer.eachLayer(subLayer => processFeature(subLayer.feature))
            }
          })

          if (toggledFeatures.length > 0) {
            setSelectedNeighbourhoods(toggledFeatures)
            setClickedDA(null) // clear DA selection on lasso
            if (event.latLngs && event.latLngs.length > 0) {
              setPopupPosition(event.latLngs[0])
            }
          }
        }

        map.on('lasso.finished', handleLassoFinished)
      })
    })

    return () => {
      isMounted = false
      if (map) {
        map.off('lasso.finished')
      }
    }
  }, [map, setSelectedNeighbourhoods, setPopupPosition, setClickedDA])

  useEffect(() => {
    if (!map || !lassoRef.current) return

    if (lassoEnabled) {
      map.dragging.disable()
      map.getContainer().style.cursor = 'crosshair'
      lassoRef.current.enable()
    } else {
      map.dragging.enable()
      map.getContainer().style.cursor = ''
      lassoRef.current.disable()
    }
  }, [lassoEnabled, map])

  return null
}

export default function DisseminationAreaMap({ geojson, neighbourhoodGeojson, parksGeojson, rankings, onRegionSelect, regionalProfileAverages }) {
  const [selectedNeighbourhoods, setSelectedNeighbourhoods] = useState([])
  const [popupPosition, setPopupPosition] = useState(null)
  const [clickedDA, setClickedDA] = useState(null)
  const [lassoEnabled, setLassoEnabled] = useState(false)
  const [compareEnabled, setCompareEnabled] = useState(false)

  const featureClickedRef = useRef(false)
  const lassoEnabledRef = useRef(lassoEnabled)
  const compareEnabledRef = useRef(compareEnabled)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Sync selected regions back to parent component for sidebar
  useEffect(() => {
    if (onRegionSelect) {
      onRegionSelect(selectedNeighbourhoods.map(f => f.properties.DGUID));
    }
  }, [selectedNeighbourhoods, onRegionSelect]);

  useEffect(() => {
    lassoEnabledRef.current = lassoEnabled
    if (lassoEnabled) setCompareEnabled(false)
  }, [lassoEnabled])

  useEffect(() => {
    compareEnabledRef.current = compareEnabled
    if (compareEnabled) setLassoEnabled(false)
  }, [compareEnabled])

  const handleNeighbourhoodSelection = (neighbourhoodFeature, latlng, daFeature) => {
    if (!neighbourhoodFeature) return;

    if (compareEnabledRef.current) {
      setSelectedNeighbourhoods(prev => {
        const isSelected = prev.some(f => f.properties.DGUID === neighbourhoodFeature.properties.DGUID)
        if (isSelected) {
          const newSelection = prev.filter(f => f.properties.DGUID !== neighbourhoodFeature.properties.DGUID)
          if (newSelection.length === 0) {
            setPopupPosition(null)
            setClickedDA(null)
          }
          return newSelection
        }
        setPopupPosition(latlng)
        setClickedDA(daFeature)
        return [...prev, neighbourhoodFeature]
      })
      return
    }

    setPopupPosition(latlng)
    setClickedDA(daFeature)
    setSelectedNeighbourhoods([neighbourhoodFeature])
  }

  const handleRemoveFeature = (dguid) => {
    setSelectedNeighbourhoods(prev => {
      const newArray = prev.filter(f => f.properties.DGUID !== dguid)
      if (newArray.length === 0) {
        setPopupPosition(null)
        setClickedDA(null)
      }
      return newArray
    })
  }

  // Handle clicks on the top-layer DAs
  const onEachFeature = useMemo(() => (feature, layer) => {
    layer.on({
      click: (e) => {
        if (e.originalEvent) e.originalEvent.stopPropagation()
        featureClickedRef.current = true
        setTimeout(() => { featureClickedRef.current = false }, 50)

        if (lassoEnabledRef.current) return

        const neighbourhood = findContainingFeature(e.latlng, neighbourhoodGeojson?.features || [])
        handleNeighbourhoodSelection(neighbourhood, e.latlng, feature)
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

  // Handle clicks if the DA layer is turned off and they click ADAs directly
  const onEachNeighbourhood = useMemo(() => (feature, layer) => {
    layer.on('click', (e) => {
      if (e.originalEvent) e.originalEvent.stopPropagation()
      featureClickedRef.current = true
      setTimeout(() => { featureClickedRef.current = false }, 50)

      if (lassoEnabledRef.current) return

      handleNeighbourhoodSelection(feature, e.latlng, null)
    })
  }, [])

  const neighbourhoodStyle = useMemo(() => (feature) => {
    const categoryNumber = rankings[feature.properties.DGUID]
    const category = categories.find(c => c.name === categoryNumber)
    return {
      fillColor: category ? category.color : '#ccc',
      weight: 2,
      opacity: 1,
      color: category ? category.color : '#ccc',
      fillOpacity: 0.2
    }
  }, [rankings])

  if (!isMounted) {
    return <div className="w-full h-[60vh] md:h-full bg-gray-50 flex items-center justify-center text-gray-400">Loading map...</div>
  }

  return (
      <div className="w-full h-[60vh] md:h-full overflow-hidden relative">
        <ParkPatternDefs />
        <MapContainer
            center={[43.45, -80.5]}
            zoom={11}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
        >
          <TileLayer
              attribution='&copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

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

          <MapControllerWrapper>
            <MapController
                selectedNeighbourhoods={selectedNeighbourhoods}
                setSelectedNeighbourhoods={setSelectedNeighbourhoods}
                setPopupPosition={setPopupPosition}
                setClickedDA={setClickedDA}
                rankings={rankings}
                featureClickedRef={featureClickedRef}
            />
            <LassoSelection
                lassoEnabled={lassoEnabled}
                setLassoEnabled={setLassoEnabled}
                setSelectedNeighbourhoods={setSelectedNeighbourhoods}
                setPopupPosition={setPopupPosition}
                setClickedDA={setClickedDA}
            />
          </MapControllerWrapper>

          {selectedNeighbourhoods.length > 0 && popupPosition && (
              <Popup
                  key={`popup-${compareEnabled}-${selectedNeighbourhoods.length}`}
                  position={popupPosition}
                  closeButton={false}
                  maxWidth={800}
                  minWidth={50}
              >
                <div className="space-y-4">
                  {clickedDA && <DisseminationAreaDetails feature={clickedDA} />}
                  {clickedDA && selectedNeighbourhoods.length > 0 && <hr className="border-gray-300" />}

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Aggregate dissemination area(s)</p>
                    <NeighbourhoodPopup
                        features={selectedNeighbourhoods}
                        onRemoveFeature={handleRemoveFeature}
                        isCompareMode={compareEnabled}
                        regionalProfileAverages={regionalProfileAverages}
                    />
                  </div>
                </div>
              </Popup>
          )}

          <Legend categories={categories} />
        </MapContainer>

        {/* Action Buttons Overlay */}
        <div className="absolute top-4 left-14 flex flex-row gap-2" style={{ zIndex: 1000 }}>
          <button
              onClick={() => setLassoEnabled(!lassoEnabled)}
              title="Toggle Lasso"
              className={`p-2 flex items-center justify-center bg-white rounded shadow-md border-2 transition-colors ${lassoEnabled ? 'border-blue-500 text-blue-500 bg-blue-50' : 'border-transparent text-gray-700 hover:bg-gray-50'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 22a5 5 0 0 1-2-4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.3 14A6.8 6.8 0 0 1 2 10c0-4.4 4.5-8 10-8s10 3.6 10 8-4.5 8-10 8a12 12 0 0 1-5-1" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
            </svg>
          </button>
          <button
              onClick={() => setCompareEnabled(!compareEnabled)}
              title="Select multiple"
              className={`p-2 bg-white rounded shadow border-2 transition-colors ${compareEnabled ? 'border-blue-500 text-blue-500 bg-blue-50' : 'border-transparent text-gray-700 hover:bg-gray-100'}`}
          >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            </svg>
          </button>
        </div>
      </div>
  )
}