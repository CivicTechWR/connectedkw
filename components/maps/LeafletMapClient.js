'use client';

import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import Legend from './LeafletMapLegend';
import FsaPopup from './FsaPopup';

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

// Custom icon for playground features
const playgroundIcon = new L.Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle marker clustering
function MarkerCluster({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const markerClusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 80,
      iconCreateFunction: function (cluster) {
        return L.divIcon({
          html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
          className: 'custom-marker-cluster',
          iconSize: L.point(33, 33, true),
        });
      },
    });

    markers.forEach((marker) => {
      const leafletMarker = L.marker(marker.coordinates, {
        icon: playgroundIcon,
      });

      leafletMarker.bindPopup(`
        <div>
          <h3 style="margin: 0 0 8px 0; font-weight: bold;">${marker.name}</h3>
          <p style="margin: 0 0 4px 0;">${marker.address}</p>
          <p style="margin: 0;">${marker.description}</p>
        </div>
      `);

      markerClusterGroup.addLayer(leafletMarker);
    });

    map.addLayer(markerClusterGroup);

    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [map, markers]);

  return null;
}

export default function LeafletMapClient({
  geojson,
  fsaRankings,
  playgroundFeatures,
}) {
  const [selectedFSA, setSelectedFSA] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);

  const onEachFeature = useMemo(
    () => (feature, layer) => {
      if (feature.properties) {
        layer.on('click', (e) => {
          setPopupPosition(e.latlng);
          setSelectedFSA(feature);
        });
      }
    },
    []
  );

  const playgroundMarkers = useMemo(
    () =>
      playgroundFeatures
        .filter((feature) => feature.location?.coordinates?.coordinates)
        .map((feature) => ({
          coordinates: [
            feature.location.coordinates.coordinates[1],
            feature.location.coordinates.coordinates[0],
          ],
          name: feature.title || 'Unnamed Location',
          address: feature.location.street_address || '',
          description: feature.description || '',
        })),
    [playgroundFeatures]
  );

  const style = useMemo(
    () => (feature) => {
      const categoryNumber = fsaRankings[feature.properties.DGUID];
      const category = categories.find((c) => c.name === categoryNumber);
      return {
        fillColor: category.color,
        weight: 2,
        opacity: 1,
        color: category.color,
        fillOpacity: 0.2,
      };
    },
    [fsaRankings]
  );

  return (
    <div className="w-full h-[60vh] md:h-full overflow-hidden">
      <style jsx global>{`
        .custom-marker-cluster {
          background: #06d6a0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        .cluster-icon {
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
      `}</style>
      <MapContainer
        center={[43.45, -80.5]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerCluster markers={playgroundMarkers} />
        {geojson && (
          <GeoJSON data={geojson} style={style} onEachFeature={onEachFeature} />
        )}
        {selectedFSA && popupPosition && (
          <Popup position={popupPosition}>
            <FsaPopup feature={selectedFSA} totalFSAs={geojson.length} />
          </Popup>
        )}
        <Legend categories={categories} />
      </MapContainer>
    </div>
  );
}
