'use client';

import { useState, useMemo } from 'react';

import getRankGroup from 'components/one-million-neighbours/utils/getRankGroup';
import LeafletMap from 'components/maps/LeafletMap';
import OneMillionNeighboursLayout from 'components/one-million-neighbours/OneMillionNeighboursLayout';
import calculateCombinedAssetRanks from 'components/one-million-neighbours/utils/calculateCombinedAssetRanks';
import AssetFilters from 'components/one-million-neighbours/AssetFilters';
// ? TESTING
import FeaturesGrid from 'components/one-million-neighbours/FeaturesGrid';
import FeaturesList from 'components/one-million-neighbours/FeaturesList';

const ASSET_TYPES = [
  { key: 'parks', label: 'Green Space' },
  { key: 'schools', label: 'Schools' },
  { key: 'libraries', label: 'Libraries' },
  { key: 'health', label: 'Healthcare' },
  { key: 'transit', label: 'Transit' },
  { key: 'community_spaces', label: 'Community Space' },
];

const defaultGeoJSON = {
  type: 'FeatureCollection',
  crs: {
    type: 'name',
    properties: {
      name: 'urn:ogc:def:crs:OGC:1.3:CRS84',
    },
  },
  name: 'fsa_2021_reprojected',
  features: [],
};

export default function OneMillionNeighboursComponent({
  neighbourhoodData,
  neighbourhoodGeography,
  playgroundFeatures,
  publicArtFeatures,
}) {
  const [selectedAssets, setSelectedAssets] = useState({
    parks: true,
    schools: true,
    libraries: true,
    health: true,
    transit: true,
    community_spaces: true,
  });
  const [viewMode, setViewMode] = useState('map');

  const handleAssetToggle = (key) => {
    setSelectedAssets({
      ...selectedAssets,
      [key]: !selectedAssets[key],
    });
  };

  // Create/memoize all feature markers for both collections (can add more later if needed)
  const combinedMarkers = useMemo(() => {
    const combinedFeatures = [
      ...(playgroundFeatures || []).map((feature) => ({
        ...feature,
        category: 'parks',
      })),
      ...(publicArtFeatures || []).map((feature) => ({
        ...feature,
        category: 'publicArt',
      })),
    ];

    return (combinedFeatures || [])
      .filter((f) => f.location?.coordinates?.coordinates)
      .map((feature) => ({
        id: feature.id,
        coordinates: [
          feature.location.coordinates.coordinates[1],
          feature.location.coordinates.coordinates[0],
        ],
        name: feature.title || 'Unnamed Location',
        address: feature.location?.street_address || '',
        description: feature.description || '',
        raw: feature,
        category: feature.category,
      }));
  }, [playgroundFeatures, publicArtFeatures]);

  let features = [];
  let totalNeighbourhoods = neighbourhoodData.length;

  try {
    features = neighbourhoodGeography.map((neighbourhood) => {
      const properties = neighbourhoodData.find(
        (f) => f.DGUID === neighbourhood.DGUID
      );
      return {
        type: 'Feature',
        properties: {
          CSDNAME: neighbourhood.CSDNAME,
          GEO_NAME: neighbourhood.GEO_NAME,
          DGUID: neighbourhood.DGUID,
          id: neighbourhood.id,
          PRNAME: 'Ontario',
          LANDAREA: neighbourhood.landarea,
          ...properties,
        },
        geometry: JSON.parse(neighbourhood.geometry),
      };
    });
  } catch (error) {
    console.error(error);
  }

  const rankedNeighbourhoodData = calculateCombinedAssetRanks(
    selectedAssets,
    neighbourhoodData
  );

  // Create a map of DGUIDs to their rank groups (1, 2, or 3)
  const rankings = rankedNeighbourhoodData.reduce((acc, neighbourhood) => {
    acc[neighbourhood.DGUID] = getRankGroup(
      neighbourhood.combined_rank,
      totalNeighbourhoods,
      3
    );
    return acc;
  }, {});

  const neighbourhoodGeoJSON = {
    ...defaultGeoJSON,
    features: features,
  };

  const sideBar = (
    <AssetFilters
      selectedAssets={selectedAssets}
      onAssetToggle={handleAssetToggle}
      assetTypes={ASSET_TYPES}
    />
  );

  return (
    <OneMillionNeighboursLayout sidebar={sideBar}>
      {/* Controls: view toggle */}
      <div className="absolute top-3 right-7 z-999 flex items-center gap-2 bg-white/90 p-1 rounded-md shadow-md">
        <button
          className={`px-3 py-1 rounded ${viewMode === 'map' ? 'bg-sky-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setViewMode('map')}
          aria-pressed={viewMode === 'map'}
        >
          <i className="fa-solid fa-map mr-1"></i>
          Map
        </button>
        <button
          className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-sky-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setViewMode('grid')}
          aria-pressed={viewMode === 'grid'}
        >
          <i className="fa-solid fa-table-cells mr-1"></i>
          Grid
        </button>
        <button
          className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-sky-600 text-white' : 'bg-gray-100'}`}
          onClick={() => setViewMode('list')}
          aria-pressed={viewMode === 'list'}
        >
          <i className="fa-solid fa-table-list mr-1"></i>
          List
        </button>
      </div>
      {viewMode === 'map' && (
        <LeafletMap
          geojson={neighbourhoodGeoJSON}
          rankings={rankings}
          markers={combinedMarkers}
        />
      )}
      {viewMode !== 'map' && (
        <div className="w-full h-dvh overflow-auto p-4">
          {viewMode === 'grid' && <FeaturesGrid items={combinedMarkers} />}
          {viewMode === 'list' && <FeaturesList items={combinedMarkers} />}
        </div>
      )}
    </OneMillionNeighboursLayout>
  );
}
