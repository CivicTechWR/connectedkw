'use client'

import { useEffect, useState, useRef, isValidElement, cloneElement, Children } from 'react';
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import Loading from 'components/Loading'
import FeatureDisplay from 'components/FeatureDisplay'
import FeatureList from 'components/FeatureList'
import FeatureGrid from 'components/FeatureGrid'
import ReactModal from "react-modal";
import MapFilter from 'components/MapFilter'
import geojson from 'data/fsa_2021_waterloo.json'

import { DEFAULT_MAP_CENTER, MAP_STYLE, MARKER_SVG, MARKER_CLUSTER_SVG, DEFAULT_MARKER_COLOR } from "utils/constants";
const MAP_ZOOM_LEVEL = 10

const Legend = ({ map, categories }) => {
  const ref = useRef(null);
  const [legend, setLegend] = useState()

  useEffect(() => {
    if (ref.current && !legend) {
      setLegend(ref.current)
    }
  }, [ref]);

  useEffect(() => {
    if (legend && map) {
      map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(legend);
    }
  }, [legend])

  if (!categories) return null;
  const categoryNames = categories.map(c => c.name)

  return (
    <div ref={ref} className="m-2 bg-white p-2 font-body text-xs shadow flex flex-col w-fit">
      <p className="font-semibold">Legend</p>
      {categories.map(category => {
        return (
          <div className="mb-1 space-x-1 flex flex-nowrap items-center" key={category.id}>
            <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: `${category.colour}`}}>
            </div>
            <div>
              {category.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const Marker = ({ map, feature, category={}, setPreviewMarker, setSelectedFeature }) => {
  const [marker, setMarker] = useState();

  useEffect(() => {
    if (!marker) {
      setMarker(new google.maps.Marker());
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  useEffect(() => {
    if (marker) {
      const position = new google.maps.LatLng(feature.Latitude, feature.Longitude)
      const color = category.colour || DEFAULT_MARKER_COLOR
      const icon = {
        path: MARKER_SVG,
        fillColor: color,
        fillOpacity: 1,
        anchor: new google.maps.Point(30, 30),
        scaledSize: new google.maps.Size(30, 30),
        strokeWeight: 2,
        scale: 1,
      }
      const title = feature.Title
      const options = {
        icon,
        position,
        title,
        properties: feature
      }

      marker.setOptions({map, ...options});
      marker.addListener("mouseover", () => setPreviewMarker(marker))
      marker.addListener("mouseout", () => setPreviewMarker(null))
      marker.addListener("click", () => setSelectedFeature(marker.properties))
    }
  }, [marker, feature]);

  return null;
};

const generatePreview = (feature, previewConfig={}) => {
  const title = feature.title || ""

  if (feature.images && feature.images.length > 0 && feature.images[0]?.id) {
    const imageId = feature.images[0].id
    const imageSrc = `${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${imageId}?key=thumbnail-100`
    return (`<div class="map-infowindow"><div class="image"><img src="${imageSrc}" alt="Photo of park" /></div><p class="title">${title}</p></div>`)
  }

  return (`<div class="map-infowindow"><p class="title">${title}</p></div>`)
}

const InfoWindow = ({ map, marker, previewConfig }) => {
  const [infoWindow, setInfoWindow] = useState();

  useEffect(() => { 
    if (!infoWindow) {
      setInfoWindow(new google.maps.InfoWindow({ maxWidth: 240 }));
    }

    // remove infowindow from map on unmount
    return () => {
      if (infoWindow) {
        infoWindow.setMap(null);
      }
    };
  }, [infoWindow]);

  useEffect(() => {
    if (infoWindow && marker) {
      const feature = marker.properties
      const content = generatePreview(feature, previewConfig)

      infoWindow.setContent(content)
      infoWindow.open({
        anchor: marker,
        map
      });
    }

    if (infoWindow && !marker) {
      infoWindow.close()
    }
  }, [infoWindow, marker]);

  return null;
};


const MapComponent = ({ features, categories, setPreviewMarker, setSelectedFeature, previewMarker, children }) => {
  const ref = useRef(null);
  const [map, setMap] = useState();
  const [markers, setMarkers] = useState([])
  const [clusterer, setClusterer] = useState(null)
  const [zoom, setZoom] = useState(MAP_ZOOM_LEVEL);
  const [center, setCenter] = useState(DEFAULT_MAP_CENTER);

  useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {}));
    }
  }, [ref, map]);

  useEffect(() => {
    if (map) {
      map.setOptions({ 
        zoom: MAP_ZOOM_LEVEL,
        center: DEFAULT_MAP_CENTER,
        styles: MAP_STYLE ,
        mapTypeControl: false,
      });

      map.data.addGeoJson(geojson)
    }
  }, [map]);

//   useEffect(() => {
//     if (map && features) {
//       markers.forEach(m => {
//         m.setMap(null)
//         m = null
//       })

//       if (clusterer) {
//         clusterer.clearMarkers()
//       }

//       setMarkers([])

//       const gmapMarkers = features.map(feature => {
//         if (!feature?.location?.coordinates?.coordinates) return null
//         const [longitude, latitude] = feature.location.coordinates.coordinates
//         const position = new google.maps.LatLng(latitude, longitude)
//         const category = feature.categories[0] || {}
//         const color = category.colour || DEFAULT_MARKER_COLOR
//         const icon = {
//           path: MARKER_SVG,
//           fillColor: color,
//           strokeColor: "#030F12",
//           fillOpacity: 1,
//           size: new google.maps.Size(30,30),
//           origin: new google.maps.Point(0,0),
//           anchor: new google.maps.Point(15,30),
//           // strokeWeight: 2,
//           scale: 1,
//         }
//         const title = feature.Title
//         const options = {
//           icon,
//           position,
//           title,
//           properties: feature
//         }

//         const marker = new google.maps.Marker(options)

//         // marker.setOptions({map, ...options});
//         marker.addListener("mouseover", () => setPreviewMarker(marker))
//         marker.addListener("mouseout", () => setPreviewMarker(null))
//         marker.addListener("click", () => setSelectedFeature(marker.properties))

//         return marker
//       }).filter(i => i)

//       setMarkers(gmapMarkers)

//       const options = {
//         renderer: { render: ({ count, position }) => new google.maps.Marker({
//           label: { 
//             text: String(count), 
//             color: "#030F12", 
//             fontSize: "11px",
//             fontFamily: "'Outfit', sans-serif",
//           },
//           position,
//           // adjust zIndex to be above other markers
//           zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
//           icon: {
//             path: MARKER_CLUSTER_SVG,
//             fillColor: "#ffd166",
//             fillOpacity: 1,
//             size: new google.maps.Size(30,30),
//             origin: new google.maps.Point(0,0),
//             anchor: new google.maps.Point(15,30),
//             labelOrigin: new google.maps.Point(15,15),
//             strokeWeight: 1,
//             strokeColor: "#030F12",
//             scale: 1,
//           }
//         })}
//       }

//       if (clusterer) {
//         clusterer.addMarkers(gmapMarkers)
//       } else {
//         const gClusterer = new MarkerClusterer({ markers: gmapMarkers, map, ...options });
//         setClusterer(gClusterer)
//       }

//       resizeMapBounds()
//     }
//   }, [map, features])

//   const resizeMapBounds = () => {
//     if (!map) return null;

//     if (!features || features.length === 0) {
//       return resetMap()
//     }

//     const bounds = new google.maps.LatLngBounds();
//     features.forEach(feature => {
//       if (feature?.location?.coordinates?.coordinates) {
//         const [longitude, latitude] = feature.location.coordinates.coordinates
//         const position = new google.maps.LatLng(latitude, longitude)
//         // const pos = { lat: feat.Latitude, lng: feat.Longitude }
//         bounds.extend(position);
//       }
//     })

//     map.fitBounds(bounds)
//   }

//   const resetMap = () => {
//     if (map) {
//       map.panTo(DEFAULT_MAP_CENTER);
//       map.setZoom(MAP_ZOOM_LEVEL);
//     }
//   }

  return (
    <>
      <div className="h-full w-full bg-white overflow-hidden" ref={ref} />
      { 
        Children.map(children, (child) => {
          if (isValidElement(child)) {
            return cloneElement(child, { map });
          }
        })
      }
    </>
  )
}

const render = ({ status }) => {
  if (status === Status.FAILURE) return <div className="w-full h-full flex justify-center items-center">This map is not available.</div>;
  return <Loading />;
};

const FsaMap = ({ features, mapId }) => {
//   const { categories, categoriesName, tags, tagsName, mapId, preview } = mapConfig
//   const [previewMarker, setPreviewMarker] = useState(null)
//   const [selectedFeature, setSelectedFeature] = useState(null)
//   const [selectedTags, setSelectedTags] = useState([])
//   const [selectedCategories, setSelectedCategories] = useState([])
  const [view, setView] = useState("map")
//   const [filteredFeatures, setFilteredFeatures] = useState(features)

//   const toggleView = () => {
//     setView(view === "map" ? "grid" : "map")
//   }

//   const filterFeatures = () => {
//     let newSetOfFeatures = features

//     if (selectedCategories.length > 0) {
//       // newSetOfFeatures = newSetOfFeatures.filter(feature => {
//       //   return selectedCategories.includes(feature.categories[0].id)
//       // })
//       newSetOfFeatures = newSetOfFeatures.filter(feature => {
//         const featureCategories = feature.categories.map(c => c.id)
//         const matches = selectedCategories.map(catId => featureCategories.includes(catId))

//         // use .any to keep only the items that match ALL the selected filters.
//         // use .some() to keep the items that match ANY of the selected filters.
//         return matches.some(m => m)
//       })
//     }

//     if (selectedTags.length > 0) {
//       newSetOfFeatures = newSetOfFeatures.filter(feature => {
//         const featureTags = feature.tags.map(t => t.id)
//         const matches = selectedTags.map(tagId => featureTags.includes(tagId))

//         // use .any to keep only the items that match ALL the selected filters.
//         // use .some() to keep the items that match ANY of the selected filters.
//         return matches.some(m => m)
//       })
//     }

//     setFilteredFeatures(newSetOfFeatures)
//   }

//   const reset = () => {
//     setSelectedTags([])
//     setSelectedCategories([])
//   }

//   const toggleFilter = (tagId) => {
//     const alreadySelected = selectedTags.includes(tagId)

//     if (alreadySelected) {
//       const filteredTags = selectedTags.filter(item => item != tagId)
//       setSelectedTags(filteredTags)
//     } else {
//       const newTags = [...selectedTags, tagId]
//       setSelectedTags(newTags)
//     }
//   }

//   const toggleCategory = (categoryId) => {
//     const alreadySelected = selectedCategories.includes(categoryId)

//     if (alreadySelected) {
//       const filteredCategories = selectedCategories.filter(item => item != categoryId)
//       setSelectedCategories(filteredCategories)
//     } else {
//       const newCategories = [...selectedCategories, categoryId]
//       setSelectedCategories(newCategories)
//     }
//   }

//   useEffect(() => {
//     ReactModal.setAppElement(`#${mapId}`)
//   })

//   useEffect(() => {
//     filterFeatures()
//   }, [selectedTags, selectedCategories])

  return(
    <div id={mapId} className="w-full h-full">
    { view === "map" &&
      <div className="h-[80vh]">
        <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY} render={render}>
          <MapComponent 
            // features={filteredFeatures} 
            // categories={categories}
            // setPreviewMarker={setPreviewMarker} 
            // setSelectedFeature={setSelectedFeature}
            // previewMarker={previewMarker}
          >
            {/* <InfoWindow marker={previewMarker} previewConfig={mapConfig.preview} />
            <Legend categories={categories} />
            <MapFilter 
              categories={categories}
              categoriesName={categoriesName}
              tags={tags}
              tagsName={tagsName}
              toggleFilter={toggleFilter}
              toggleCategory={toggleCategory}
              selectedTags={selectedTags}
              selectedCategories={selectedCategories}
              reset={reset}
              toggleView={toggleView}
              view={view}
            /> */}
          </MapComponent>
        </Wrapper>
      </div>
    }
    {/* {
      view === "grid" && 
      <div className="container mx-auto">
        <div className="w-full flex justify-end items-center">
          <MapFilter 
            categories={categories}
            categoriesName={categoriesName}
            tags={tags}
            tagsName={tagsName}
            toggleFilter={toggleFilter}
            toggleCategory={toggleCategory}
            selectedTags={selectedTags}
            selectedCategories={selectedCategories}
            reset={reset}
            toggleView={toggleView}
            view={view}
          />
        </div>
        <FeatureGrid 
          features={filteredFeatures} 
          categories={categories}
          setSelectedFeature={setSelectedFeature}
          preview={preview}
        />
      </div>
    } */}
      {/* <ReactModal
        isOpen={!!selectedFeature}
        onRequestClose={() => setSelectedFeature(null)}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={true}
        className="max-w-md mx-auto h-full"
        style={{
          overlay: { padding: "3vw", zIndex: 100, background: "rgba(3,15,18,0.5)" }
        }}
      >
        <FeatureDisplay 
          feature={selectedFeature} 
          closeModal={() => setSelectedFeature(null)} 
        />
      </ReactModal> */}
    </div>
  )
}

export default FsaMap

