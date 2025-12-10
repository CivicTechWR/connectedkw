const NeighbourhoodPopup = ({ feature }) => {
    return (
      <div className="max-h-80 overflow-auto">
        <h3 className="text-blue">{feature.properties.GEO_NAME}</h3>
        <div className="text-sm">
          <div>Population {feature.properties.population_2021.toLocaleString()}</div>

          <h3 className="mt-4">Neighbourhood assets</h3>
          <table className="text-right">
            <thead>
              <tr>
                <th className="py-1"></th>
                <th className="py-1 px-2 border-l border-gray-300">Count</th>
                <th className="py-1 px-2 border-l border-gray-300">Per 1,000</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Green Space</td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.assets_parks_count}</td>
                <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.assets_parks_count / feature.properties.population_2021 * 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1})}</td>
              </tr>

              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Schools</td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.assets_schools_count}</td>
                <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.assets_schools_count / feature.properties.population_2021 * 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1})}</td>
              </tr>

              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Libraries</td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.assets_libraries_count}</td>
                <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.assets_libraries_count / feature.properties.population_2021 * 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1})}</td>
              </tr>

              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Healthcare</td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.assets_health_count}</td>
                <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.assets_health_count / feature.properties.population_2021 * 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1})}</td>
              </tr>

              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Transit Stops</td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.assets_transit_count}</td>
                <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.assets_transit_count / feature.properties.population_2021 * 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1})}</td>
              </tr>

              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Community Spaces</td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.assets_community_spaces_count}</td>
                <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.assets_community_spaces_count / feature.properties.population_2021 * 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1})}</td>
              </tr>
            </tbody>
          </table>

          <h3 className="mt-6">Neighbourhood profile</h3>
          <table className="text-right">
            <tbody>
              <tr>
                <td className="py-1 pr-2 text-left">Single-detached housing</td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.single_detached_house.toFixed(0)}%</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Overcrowded housing <br /><small>more than one person per room</small></td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.crowded.toFixed(0)}%</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Unaffordable housing <br /><small>30% or more of income</small></td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.shelter_costs_over_30_percent.toFixed(0)}%</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Transit commuters</td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.commute_transit.toFixed(0)}%</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Households with children</td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.children.toFixed(0)}%</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Low-income households</td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.low_income.toFixed(0)}%</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Non-official language speakers</td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.non_official_language.toFixed(0)}%</td>
              </tr>
              <tr className="border-t border-gray-300">
                <td className="py-1 pr-2 text-left">Visible minorities</td>
                <td className="py-1 px-2 border-l border-gray-300">{feature.properties.visible_minority.toFixed(0)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  export default NeighbourhoodPopup