'use client'

import { useState } from "react";

import DisseminationAreaMap from "components/maps/DisseminationAreaMap";
import OneMillionNeighboursLayout from "components/one-million-neighbours/OneMillionNeighboursLayout";
import calculateCombinedAssetRanks from "components/one-million-neighbours/utils/calculateCombinedAssetRanks";
import AssetFilters from "components/one-million-neighbours/AssetFilters";

const ASSET_TYPES = [
    { key: 'parks', label: 'Green Space' },
    { key: 'schools', label: 'Schools' },
    { key: 'libraries', label: 'Libraries' },
    { key: 'health', label: 'Healthcare' },
    { key: 'transit', label: 'Transit' },
    { key: 'community_spaces', label: 'Community Spaces' },
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
