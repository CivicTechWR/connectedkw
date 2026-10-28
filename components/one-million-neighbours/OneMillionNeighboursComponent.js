'use client'

import { useState, useCallback } from "react";

import DisseminationAreaMap from "components/maps/DisseminationAreaMap";
import OneMillionNeighboursLayout from "components/one-million-neighbours/OneMillionNeighboursLayout";
import calculateCombinedAssetRanks from "components/one-million-neighbours/utils/calculateCombinedAssetRanks";
import AssetFilters from "components/one-million-neighbours/AssetFilters";

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

    const [activeNeighbourhoodIds, setActiveNeighbourhoodIds] = useState([]);

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


    const rankedNeighbourhoodData = calculateCombinedAssetRanks(selectedAssets, neighbourhoodData);

<<<<<<< HEAD
    let selectionTitle = null;
    let selectionStats = null;
    let selectionScores = null;
    let selectedRegions = [];
    let selectionProfileStats = null;

    if (activeNeighbourhoodIds.length > 0) {
        const activeGeos = neighbourhoodGeography.filter(g => activeNeighbourhoodIds.includes(g.DGUID));
        const activeData = neighbourhoodData.filter(n => activeNeighbourhoodIds.includes(n.DGUID));

        // Maps ID, Name, and calculates individual stats/scores for rendering expanded columns
        selectedRegions = activeGeos.map(g => {
            const data = activeData.find(d => d.DGUID === g.DGUID);
            const stats = {};
            const scores = {};
            const profileStats = {};

            if (data) {
                const pop = Number(data.population_2021) || 0;
                ASSET_TYPES.forEach(asset => {
                    const count = Number(data[asset.dataKey]) || 0;
                    stats[asset.key] = pop > 0 ? ((count / pop) * 1000).toFixed(1) : '-';
                    scores[asset.key] = Number(data[asset.scoreKey]) || 0;
                });
                PROFILE_STATS.forEach(stat => {
                    profileStats[stat.key] = data[stat.key] !== undefined ? Number(data[stat.key]).toFixed(1) : '-';
                });
            }
            return { id: g.DGUID, name: g.GEO_NAME, stats, scores, profileStats };
        });

        if (activeNeighbourhoodIds.length === 1) {
            selectionTitle = selectedRegions[0].name || 'Selected Region';
        } else {
            selectionTitle = 'Custom Selection';
        }

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

        selectionProfileStats = PROFILE_STATS.reduce((acc, stat) => {
            const total = activeData.reduce((sum, n) => sum + (Number(n[stat.key]) || 0), 0);
            acc[stat.key] = activeData.length > 0 ? (total / activeData.length).toFixed(1) : '-';
            return acc;
        }, {});
    }

    const activeNeighbourhoods = rankedNeighbourhoodData.filter(n => activeNeighbourhoodIds.includes(n.DGUID));

    const handleRegionSelect = useCallback((selectedIds) => {
        setActiveNeighbourhoodIds(prev => {
            // Evaluate prev state against incoming state to prevent infinite render loop
            if (prev.length === selectedIds.length && prev.every(id => selectedIds.includes(id))) {
                return prev;
            }
            return selectedIds;
        });
    }, []);

    const handleRemoveRegion = useCallback((idToRemove) => {
        setActiveNeighbourhoodIds(prev => prev.filter(id => id !== idToRemove));
    }, []);

    const regionalAverages = ASSET_TYPES.reduce((acc, asset) => {
        const totalAssets = neighbourhoodData.reduce((sum, n) => sum + (Number(n[asset.dataKey]) || 0), 0);
        const totalPopulation = neighbourhoodData.reduce((sum, n) => sum + (Number(n.population_2021) || 0), 0);
        acc[asset.key] = totalPopulation > 0 ? ((totalAssets / totalPopulation) * 1000).toFixed(2) : '0.00';
        return acc;
    }, {});

    const regionalScores = ASSET_TYPES.reduce((acc, asset) => {
        const totalScore = neighbourhoodData.reduce((sum, n) => sum + (Number(n[asset.scoreKey]) || 0), 0);
        acc[asset.key] = totalNeighbourhoods > 0 ? (totalScore / totalNeighbourhoods) : 0;
        return acc;
    }, {});

    const regionalProfileAverages = PROFILE_STATS.reduce((acc, stat) => {
        const total = neighbourhoodData.reduce((sum, n) => sum + (Number(n[stat.key]) || 0), 0);
        acc[stat.key] = totalNeighbourhoods > 0 ? (total / totalNeighbourhoods).toFixed(1) : '-';
        return acc;
    }, {});

    // Create a map of DGUIDs to their rank groups (1, 2, or 3)
    const rankings = rankedNeighbourhoodData.reduce((acc, neighbourhood) => {
        acc[neighbourhood.DGUID] = neighbourhood.combined_rank;
        return acc
    }, {})

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

        <OneMillionNeighboursLayout sidebar={sideBar}>
            <DisseminationAreaMap
                geojson={disseminationAreaGeoJSON}
                neighbourhoodGeojson={neighbourhoodGeoJSON}
                parksGeojson={parksGeoJSON}
                rankings={rankings}
            />
        </OneMillionNeighboursLayout>
    );
}
