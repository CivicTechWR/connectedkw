const NeighbourhoodPopup = ({ feature, totalNeighbourhoods=60 }) => {
    return (
      <div>
        <h3 className="font-semibold">{feature.properties.GEO_NAME}</h3>
        <div className="text-sm">
          <div className="flex justify-between gap-4 border-b py-1">
            <div>Population</div>
            <div>{feature.properties.population_2021.toLocaleString()}</div>
          </div>

          <h4 className="mt-4">Neighbourhood Assets</h4>

          <div className="flex justify-between gap-4 border-b py-1">
            <div>Green Space</div>
            <div>{feature.properties.assets_parks_count}</div>
          </div>

          <div className="flex justify-between gap-4 border-b py-1">
            <div>Schools</div>
            <div>{feature.properties.assets_schools_count}</div>
          </div>

          <div className="flex justify-between gap-4 border-b py-1">
            <div>Libraries</div>
            <div>{feature.properties.assets_libraries_count}</div>
          </div>

          <div className="flex justify-between gap-4 border-b py-1">
            <div>Healthcare</div>
            <div>{feature.properties.assets_health_count}</div>
          </div>

          <div className="flex justify-between gap-4 border-b py-1">
            <div>Transit</div>
            <div>{feature.properties.assets_transit_count}</div>
          </div>

          <div className="flex justify-between gap-4 border-b py-1">
            <div>Community Space</div>
            <div>{feature.properties.assets_community_spaces_count}</div>
          </div>
        </div>
      </div>
    )
  }

  export default NeighbourhoodPopup