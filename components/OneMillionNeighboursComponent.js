'use client'

import LeafletMap from "components/maps/LeafletMap";
import OneMillionNeighboursLayout from "components/OneMillionNeighboursLayout";

export default function OneMillionNeighboursComponent({FSAData, FSAGeoJSON}) {

    return (
        <OneMillionNeighboursLayout sidebar={<></>}>
            <LeafletMap geojson={FSAGeoJSON} fsaData={FSAData}/>
        </OneMillionNeighboursLayout>
    );

}