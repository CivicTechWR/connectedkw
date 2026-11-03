import { useState } from 'react';

export default function NeighbourhoodPopup({ feature, onRemoveFeature, regionalProfileAverages }) {
  if (!feature) return null

  const { GEO_NAME, DGUID, population_2021 } = feature.properties
  const pop = population_2021 || 0

  const parks = feature.properties.assets_parks_count || 0
  const schools = feature.properties.assets_schools_count || 0
  const libraries = feature.properties.assets_libraries_count || 0
  const health = feature.properties.assets_health_count || 0
  const transit = feature.properties.assets_transit_count || 0
  const community = feature.properties.assets_community_spaces_count || 0

  const getPer1000 = (val) => {
    if (pop === 0) return "0.0"
    return ((val / pop) * 1000).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  }

  return (
    <div className="max-h-80 overflow-auto pr-2">
      <div className="mb-4 flex justify-between items-center text-blue font-bold py-1 border-b border-gray-100">
        <span>{GEO_NAME}</span>
        {onRemoveFeature && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFeature(DGUID);
            }}
            className="ml-4 text-gray-400 hover:text-red-500 font-normal px-2 rounded hover:bg-gray-100"
          >
            ✕
          </button>
        )}
      </div>

      <div className="text-sm">
        <div>Population {pop.toLocaleString()}</div>

        <h3 className="mt-4 font-bold">Neighbourhood assets</h3>
        <table className="text-right w-full">
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
            <td className="py-1 px-2 border-l border-gray-300">{parks}</td>
            <td className="py-1 px-2 border-l border-gray-300">{getPer1000(parks)}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Schools</td>
            <td className="py-1 px-2 border-l border-gray-300">{schools}</td>
            <td className="py-1 px-2 border-l border-gray-300">{getPer1000(schools)}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Libraries</td>
            <td className="py-1 px-2 border-l border-gray-300">{libraries}</td>
            <td className="py-1 px-2 border-l border-gray-300">{getPer1000(libraries)}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Healthcare</td>
            <td className="py-1 px-2 border-l border-gray-300">{health}</td>
            <td className="py-1 px-2 border-l border-gray-300">{getPer1000(health)}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Transit Stops</td>
            <td className="py-1 px-2 border-l border-gray-300">{transit}</td>
            <td className="py-1 px-2 border-l border-gray-300">{getPer1000(transit)}</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Community Spaces</td>
            <td className="py-1 px-2 border-l border-gray-300">{community}</td>
            <td className="py-1 px-2 border-l border-gray-300">{getPer1000(community)}</td>
          </tr>
          </tbody>
        </table>

        <h3 className="mt-6 font-bold">Neighbourhood profile</h3>
        <table className="text-right w-full">
          <tbody>
          <tr>
            <td className="py-1 pr-2 text-left">Single-detached housing</td>
            <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.single_detached_house || 0).toFixed(0)}%</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Overcrowded housing <br /><small>more than one person per room</small></td>
            <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.crowded || 0).toFixed(0)}%</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Unaffordable housing <br /><small>30% or more of income</small></td>
            <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.shelter_costs_over_30_percent || 0).toFixed(0)}%</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Transit commuters</td>
            <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.commute_transit || 0).toFixed(0)}%</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Households with children</td>
            <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.children || 0).toFixed(0)}%</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Low-income households</td>
            <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.low_income || 0).toFixed(0)}%</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Non-official language speakers</td>
            <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.non_official_language || 0).toFixed(0)}%</td>
          </tr>
          <tr className="border-t border-gray-300">
            <td className="py-1 pr-2 text-left">Visible minorities</td>
            <td className="py-1 px-2 border-l border-gray-300">{(feature.properties.visible_minority || 0).toFixed(0)}%</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}