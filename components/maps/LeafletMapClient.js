'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import Legend from './LeafletMapLegend';
import NeighbourhoodPopup from './NeighbourhoodPopup';

const categories = [
  {
    name: 1,
    color: '#de3f96',
    label: 'Abundant access',
  },
  {
    name: 2,
    color: '#00bcd9',
    label: 'Average access',
  },
  {
    name: 3,
    color: '#5251be',
    label: 'Least access',
  },
];

const FEATURE_CATEGORIES = {
  parks: {
    color: '#06d6a0', // green
    label: 'Parks',
  },
  publicArt: {
    color: '#de3f96', // pink
    label: 'Public Art',
  },
};

const mapConfig = {
  center: [43.45, -80.5],
  zoom: 11,
  zoomControl: true,
  scrollWheelZoom: true,
};

// Smart cluster icon that adapts to single or multi-category
const createClusterIcon = (cluster) => {
  // Count markers by category
  const categoryCount = {};
  cluster.getAllChildMarkers().forEach((marker) => {
    const category = marker.options.markerCategory;
    if (category) {
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    }
  });

  const categoryKeys = Object.keys(categoryCount);

  // Single category or no category info: simple green circle
  if (categoryKeys.length <= 1) {
    const category = categoryKeys[0];
    const categoryColor =
      category && FEATURE_CATEGORIES[category]
        ? FEATURE_CATEGORIES[category].color
        : '#fff';
    return L.divIcon({
      html: `
        <div style="
          background: ${categoryColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          width: 33px;
          height: 33px;
        ">
          <span style="
            color: white;
            font-weight: bold;
            font-size: 14px;
          ">${cluster.getChildCount()}</span>
        </div>
      `,
      className: 'custom-marker-cluster-single',
      iconSize: L.point(33, 33, true),
    });
  }

  // Multi-category: Create segmented display
  const segments = Object.entries(categoryCount)
    .map(([category, count]) => {
      const config = FEATURE_CATEGORIES[category];
      return `
        <div style="
          background-color: ${config.color};
          color: white;
          padding: 4px 10px;
          font-weight: bold;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 28px;
          height: 100%;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        ">
          ${count}
        </div>
      `;
    })
    .join('<div style="width: 1px; background: white; height: 100%;"></div>');

  return L.divIcon({
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        background: white;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.9);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
        overflow: hidden;
        height: 30px;
        line-height: 1;
      ">
        ${segments}
      </div>
    `,
    className: 'custom-multi-marker-cluster',
    iconSize: null,
  });
};

// Custom icon for features
const playgroundIcon = new L.Icon({
  iconUrl: '/icons/playgroundMarker.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const publicArtIcon = new L.Icon({
  iconUrl: '/icons/publicArtMarker.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle marker clustering
const MarkerClusterMemo = React.memo(function MarkerCluster({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const markerClusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 80,
      iconCreateFunction: createClusterIcon,
    });

    const markersLayer = markers.reduce((group, marker) => {
      const leafletMarker = L.marker(marker.coordinates, {
        icon: marker.category === 'parks' ? playgroundIcon : publicArtIcon,
        markerCategory: marker.category,
      }).bindPopup(`
        <div>
          <h3 class="font-bold mb-2">${marker.name}</h3>
          <p class="mb-1">${marker.address}</p>
          <p>${marker.description}</p>
        </div>
      `);

      group.addLayer(leafletMarker);
      return group;
    }, markerClusterGroup);

    map.addLayer(markersLayer);
    return () => map.removeLayer(markersLayer);
  }, [map, markers]);

  return null;
});

export default function LeafletMapClient({ geojson, rankings, markers }) {
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);

  const onEachFeature = useMemo(
    () => (feature, layer) => {
      if (feature.properties) {
        layer.on('click', (e) => {
          setPopupPosition(e.latlng);
          setSelectedNeighbourhood(feature);
        });
      }
    },
    []
  );

  const style = useMemo(
    () => (feature) => {
      // GeoJSON takes an immutable data object so in order to get a dynamic style based on rankings we need to refer to data outside of the feature object
      const categoryNumber = rankings[feature.properties.DGUID];
      const category = categories.find((c) => c.name === categoryNumber);
      const isSelected =
        selectedNeighbourhood?.properties.DGUID === feature.properties.DGUID;
      return {
        fillColor: category.color,
        weight: isSelected ? 3 : 2,
        opacity: 1,
        color: category.color,
        fillOpacity: isSelected ? 0.5 : 0.2,
      };
    },
    [rankings, selectedNeighbourhood]
  );

  return (
    <div className="w-full h-[60vh] md:h-full overflow-hidden">
      <style jsx global>{`
        .custom-marker-cluster-single {
          background: transparent !important;
          border: none !important;
        }
        .custom-multi-marker-cluster {
          background: transparent !important;
          border: none !important;
        }
        .custom-multi-marker-cluster div {
          border: none !important;
        }
      `}</style>
      <MapContainer {...mapConfig} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterMemo markers={markers} />
        {geojson && (
          <GeoJSON data={geojson} style={style} onEachFeature={onEachFeature} />
        )}
        {selectedNeighbourhood && popupPosition && (
          <Popup position={popupPosition}>
            <NeighbourhoodPopup
              feature={selectedNeighbourhood}
              totalNeighbourhoods={geojson.length}
            />
          </Popup>
        )}
        <Legend categories={categories} />
      </MapContainer>
    </div>
  );
}
