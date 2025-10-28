'use client';

import { useState } from 'react';

import getRankGroup from 'components/one-million-neighbours/utils/getRankGroup';
import LeafletMap from 'components/maps/LeafletMap';
import OneMillionNeighboursLayout from 'components/one-million-neighbours/OneMillionNeighboursLayout';
import calculateCombinedAssetRanks from 'components/one-million-neighbours/utils/calculateCombinedAssetRanks';
import AssetFilters from 'components/one-million-neighbours/AssetFilters';

const ASSET_TYPES = [
  { key: 'centres', label: 'Community Centers' },
  { key: 'trails', label: 'Trails & Paths' },
  { key: 'pools', label: 'Pools' },
  { key: 'parks', label: 'Parks & Green Space' },
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
  FSAData,
  FSAGeoData,
  playgroundFeatures,
}) {
  const [selectedAssets, setSelectedAssets] = useState({
    centres: true,
    trails: true,
    pools: true,
    parks: true,
  });

  const handleAssetToggle = (key) => {
    setSelectedAssets({
      ...selectedAssets,
      [key]: !selectedAssets[key],
    });
  };

  let features = [];
  let totalNeighbourhoods = FSAData.length;

  try {
    features = FSAGeoData.map((fsa) => {
      const fsaData = FSAData.find((f) => f.DGUID === fsa.DGUID);
      return {
        type: 'Feature',
        properties: {
          CFSAUID: fsa.GEO_NAME,
          DGUID: fsa.DGUID,
          id: fsa.id,
          PRNAME: 'Ontario',
          LANDAREA: fsa.LANDAREA,
          ...fsaData,
        },
        geometry: JSON.parse(fsa.geometry),
      };
    });
  } catch (error) {
    console.error(error);
  }

  const rankedFSAData = calculateCombinedAssetRanks(selectedAssets, FSAData);
  // Create a map of FSA DGUIDs to their rank groups (1, 2, or 3)
  const fsaRankings = rankedFSAData.reduce((acc, fsa) => {
    acc[fsa.DGUID] = getRankGroup(fsa.combined_rank, totalNeighbourhoods, 3);
    return acc;
  }, {});

  const FSAGeoJSON = {
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
      <LeafletMap
        geojson={FSAGeoJSON}
        fsaRankings={fsaRankings}
        playgroundFeatures={playgroundFeatures}
      />
    </OneMillionNeighboursLayout>
  );
}
