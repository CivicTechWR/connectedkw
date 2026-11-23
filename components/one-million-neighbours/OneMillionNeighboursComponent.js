'use client'

import { useState, useCallback } from "react";

import DisseminationAreaMap from "components/maps/DisseminationAreaMap";
import OneMillionNeighboursLayout from "components/one-million-neighbours/OneMillionNeighboursLayout";
import calculateCombinedAssetRanks, { calculateClusterScores, getClusterRankTier } from "components/one-million-neighbours/utils/calculateCombinedAssetRanks";
import AssetFilters from "components/one-million-neighbours/AssetFilters";
import OneMillionNeighboursTable from "components/one-million-neighbours/OneMillionNeighboursTable";

const ASSET_TYPES = [
    { key: 'parks', label: 'Green Space', dataKey: 'assets_parks_count', scoreKey: 'assets_parks_score' },
    { key: 'schools', label: 'Schools', dataKey: 'assets_schools_count', scoreKey: 'assets_schools_score' },
    { key: 'libraries', label: 'Libraries', dataKey: 'assets_libraries_count', scoreKey: 'assets_libraries_score' },
    { key: 'health', label: 'Healthcare', dataKey: 'assets_health_count', scoreKey: 'assets_health_score' },
    { key: 'transit', label: 'Transit', dataKey: 'assets_transit_count', scoreKey: 'assets_transit_score' },
    { key: 'community_spaces', label: 'Community Spaces', dataKey: 'assets_community_spaces_count', scoreKey: 'assets_community_spaces_score' },
];

const PROFILE_STATS = [
    { key: 'single_detached_house', label: 'Single-detached housing' },
    { key: 'crowded', label: 'Overcrowded housing' },
    { key: 'shelter_costs_over_30_percent', label: 'Unaffordable housing' },
    { key: 'commute_transit', label: 'Transit commuters' },
    { key: 'children', label: 'Households with children' },
    { key: 'low_income', label: 'Low-income households' },
    { key: 'non_official_language', label: 'Non-official language speakers' },
    { key: 'visible_minority', label: 'Visible minorities' }
];

// Directus rows carry their GeoJSON geometry in a `geometry` field; every other field becomes a feature property
const toFeatureCollection = (rows) => ({
    "type": "FeatureCollection",
    "features": rows.map(({ geometry, ...properties }) => ({
        "type": "Feature",
        "properties": properties,
        "geometry": geometry,
    })),
})

export default function OneMillionNeighboursComponent({ disseminationAreas, parks, neighbourhoodData, neighbourhoodGeography }) {
    const [selectedAssets, setSelectedAssets] = useState({
        parks: true,
        schools: true,
        libraries: true,
        health: true,
        transit: true,
        community_spaces: true,
    });

    const [boundaryType, setBoundaryType] = useState('ada');
    const [activeRegionIds, setActiveRegionIds] = useState([]);

    const handleBoundaryTypeChange = useCallback((nextType) => {
        setBoundaryType(nextType);
        setActiveRegionIds([]);
    }, []);

    const handleAssetToggle = (key) => {
        setSelectedAssets({
            ...selectedAssets,
            [key]: !selectedAssets[key]
        });
    };

    let neighbourhoodFeatures = []

    try {
        neighbourhoodFeatures = neighbourhoodGeography.map(neighbourhood => {
            const properties = neighbourhoodData.find(f => f.DGUID === neighbourhood.DGUID)
            return {
                "type": "Feature",
                "properties": {
                    "CSDNAME": neighbourhood.CSDNAME,
                    "GEO_NAME": neighbourhood.GEO_NAME,
                    "DGUID": neighbourhood.DGUID,
                    "id": neighbourhood.id,
                    "PRNAME": "Ontario",
                    "LANDAREA": neighbourhood.landarea,
                    ...properties,
                },
                geometry: JSON.parse(neighbourhood.geometry)
            }
        })
    } catch (error) {
        console.error(error)
    }

    const isDA = boundaryType === 'da';
    const activeDataset = isDA ? disseminationAreas : neighbourhoodData;
    const idField = isDA ? 'DAUID' : 'DGUID';

    const rankedAdaData = calculateCombinedAssetRanks(selectedAssets, neighbourhoodData);
    const rankedDataset = isDA
      ? calculateCombinedAssetRanks(selectedAssets, disseminationAreas)
      : rankedAdaData;

    let selectionTitle = null;
    let selectionStats = null;
    let selectionScores = null;
    let selectedRegions = [];
    let selectionProfileStats = null;
    let selectionRankTier = null;

    if (activeRegionIds.length > 0) {
        const activeData = activeDataset.filter(item => activeRegionIds.includes(String(item[idField])));

        selectedRegions = activeData.map(data => {
            const stats = {};
            const scores = {};
            const profileStats = {};
            const pop = Number(data.population_2021) || 0;

            ASSET_TYPES.forEach(asset => {
                const count = Number(data[asset.dataKey]) || 0;
                stats[asset.key] = pop > 0 && data[asset.dataKey] !== undefined
                  ? ((count / pop) * 1000).toFixed(1)
                  : Number(data[asset.scoreKey] ?? 0).toFixed(2);
                scores[asset.key] = Number(data[asset.scoreKey]) || 0;
            });

            PROFILE_STATS.forEach(stat => {
                profileStats[stat.key] = data[stat.key] !== undefined ? Number(data[stat.key]).toFixed(1) : '-';
            });

            const name = isDA
              ? `DA ${data.DAUID}`
              : (neighbourhoodGeography.find(g => g.DGUID === data.DGUID)?.GEO_NAME || data.GEO_NAME || data.DGUID);

            return { id: String(data[idField]), name, stats, scores, profileStats };
        });

        if (activeRegionIds.length === 1) {
            selectionTitle = selectedRegions[0]?.name || 'Selected Region';
        } else {
            selectionTitle = isDA ? `Selected DAs (${activeRegionIds.length})` : 'Custom Selection';
        }

        if (isDA) {
            const cluster = calculateClusterScores(activeData);
            selectionScores = ASSET_TYPES.reduce((acc, asset) => {
                acc[asset.key] = cluster[asset.scoreKey] ?? 0;
                return acc;
            }, {});
            selectionStats = ASSET_TYPES.reduce((acc, asset) => {
                acc[asset.key] = (cluster[asset.scoreKey] ?? 0).toFixed(2);
                return acc;
            }, {});
            selectionRankTier = getClusterRankTier(cluster, selectedAssets, rankedAdaData);
        } else {
            selectionStats = ASSET_TYPES.reduce((acc, asset) => {
                const totalAssets = activeData.reduce((sum, n) => sum + (Number(n[asset.dataKey]) || 0), 0);
                const totalPopulation = activeData.reduce((sum, n) => sum + (Number(n.population_2021) || 0), 0);
                acc[asset.key] = totalPopulation > 0 ? ((totalAssets / totalPopulation) * 1000).toFixed(1) : '-';
                return acc;
            }, {});

            selectionScores = ASSET_TYPES.reduce((acc, asset) => {
                const totalScore = activeData.reduce((sum, n) => sum + (Number(n[asset.scoreKey]) || 0), 0);
                acc[asset.key] = activeData.length > 0 ? (totalScore / activeData.length) : 0;
                return acc;
            }, {});
        }

        selectionProfileStats = PROFILE_STATS.reduce((acc, stat) => {
            const total = activeData.reduce((sum, n) => sum + (Number(n[stat.key]) || 0), 0);
            acc[stat.key] = activeData.length > 0 ? (total / activeData.length).toFixed(1) : '-';
            return acc;
        }, {});
    }

    const handleRegionSelect = useCallback((selectedIds) => {
        const normalizedIds = selectedIds.map(String);
        setActiveRegionIds(prev => {
            if (prev.length === normalizedIds.length && prev.every(id => normalizedIds.includes(id))) {
                return prev;
            }
            return normalizedIds;
        });
    }, []);

    const handleRemoveRegion = useCallback((idToRemove) => {
        setActiveRegionIds(prev => prev.filter(id => id !== String(idToRemove)));
    }, []);

    const totalItems = activeDataset.length;

    const regionalAverages = ASSET_TYPES.reduce((acc, asset) => {
        if (isDA) {
            const totalScore = activeDataset.reduce((sum, n) => sum + (Number(n[asset.scoreKey]) || 0), 0);
            acc[asset.key] = totalItems > 0 ? (totalScore / totalItems).toFixed(2) : '0.00';
        } else {
            const totalAssets = activeDataset.reduce((sum, n) => sum + (Number(n[asset.dataKey]) || 0), 0);
            const totalPopulation = activeDataset.reduce((sum, n) => sum + (Number(n.population_2021) || 0), 0);
            acc[asset.key] = totalPopulation > 0 ? ((totalAssets / totalPopulation) * 1000).toFixed(2) : '0.00';
        }
        return acc;
    }, {});

    const regionalScores = ASSET_TYPES.reduce((acc, asset) => {
        const totalScore = activeDataset.reduce((sum, n) => sum + (Number(n[asset.scoreKey]) || 0), 0);
        acc[asset.key] = totalItems > 0 ? (totalScore / totalItems) : 0;
        return acc;
    }, {});

    const regionalProfileAverages = PROFILE_STATS.reduce((acc, stat) => {
        const total = activeDataset.reduce((sum, n) => sum + (Number(n[stat.key]) || 0), 0);
        acc[stat.key] = totalItems > 0 ? (total / totalItems).toFixed(1) : '-';
        return acc;
    }, {});

    const rankings = rankedDataset.reduce((acc, item) => {
        acc[String(item[idField])] = item.combined_rank;
        return acc;
    }, {});

    const neighbourhoodGeoJSON = {
        "type": "FeatureCollection",
        "features": neighbourhoodFeatures,
    }

    const disseminationAreaGeoJSON = toFeatureCollection(disseminationAreas)
    const parksGeoJSON = toFeatureCollection(parks)

    const sideBar = <AssetFilters
      selectedAssets={selectedAssets}
      onAssetToggle={handleAssetToggle}
      assetTypes={ASSET_TYPES}
      profileTypes={PROFILE_STATS}
      regionalAverages={regionalAverages}
      regionalScores={regionalScores}
      regionalProfileAverages={regionalProfileAverages}
      selectionTitle={selectionTitle}
      selectionStats={selectionStats}
      selectionScores={selectionScores}
      selectionProfileStats={selectionProfileStats}
      selectedRegions={selectedRegions}
      onRemoveRegion={handleRemoveRegion}
    />
    return (
      <>

          <OneMillionNeighboursLayout sidebar={sideBar}>
              <DisseminationAreaMap
                geojson={disseminationAreaGeoJSON}
                neighbourhoodGeojson={neighbourhoodGeoJSON}
                parksGeojson={parksGeoJSON}
                rankings={rankings}
                boundaryType={boundaryType}
                onBoundaryTypeChange={handleBoundaryTypeChange}
                onRegionSelect={handleRegionSelect}
              />


          </OneMillionNeighboursLayout>

          <OneMillionNeighboursTable
            selectedAssets={selectedAssets}
            onAssetToggle={handleAssetToggle}
            assetTypes={ASSET_TYPES}
            profileTypes={PROFILE_STATS}
            regionalAverages={regionalAverages}
            regionalScores={regionalScores}
            regionalProfileAverages={regionalProfileAverages}
            selectionTitle={selectionTitle}
            selectionStats={selectionStats}
            selectionScores={selectionScores}
            selectionProfileStats={selectionProfileStats}
            selectedRegions={selectedRegions}
            onRemoveRegion={handleRemoveRegion}
            boundaryType={boundaryType}
            selectionRankTier={selectionRankTier}
          />

      </>

    );
}