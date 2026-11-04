'use client'
import { useState } from "react";

export default function OneMillionNeighboursTable({
                                                    selectedAssets = {},
                                                    onAssetToggle,
                                                    assetTypes = [],
                                                    profileTypes = [],
                                                    regionalAverages = {},
                                                    regionalScores = {},
                                                    regionalProfileAverages = {},
                                                    selectionTitle,
                                                    selectionStats,
                                                    selectionScores,
                                                    selectionProfileStats = {},
                                                    selectedRegions = [],
                                                    onRemoveRegion
                                                  }) {
  const selectedAssetCount = Object.values(selectedAssets || {}).filter(Boolean).length;
  const [isExpanded, setIsExpanded] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const getScoreStyle = (scoreVal) => {
    const score = parseFloat(scoreVal);
    if (isNaN(score)) return 'bg-transparent text-gray-900';

    if (score >= 1.0) return 'bg-[#00B88A]/30 text-[#006b50]';
    if (score >= 0.43) return 'bg-[#00B88A]/15 text-[#006b50]';
    if (score <= -1.0) return 'bg-[#7378cc]/30 text-[#404373]';
    if (score <= -0.43) return 'bg-[#7378cc]/15 text-[#404373]';
    if (Math.abs(score) < 0.15) return 'bg-[#DE54A0]/10 text-[#8a3463]';
    return 'bg-[#DE54A0]/25 text-[#8a3463]';
  };


  return (
    <div
      className="w-full max-w-full bg-white overflow-x-auto mt-6 mb-12 border border-gray-200 shadow-sm rounded-lg relative z-10">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 id="assets-heading" className="text-lg font-semibold text-gray-900">
            Compare Neighbourhoods
          </h2>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-4">
            {selectedAssetCount} of {assetTypes.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto w-auto text-left text-sm">
            <thead>
            <tr className="border-b border-gray-200">
              <th className="w-32 py-2 px-1 font-semibold text-left">Asset Filter</th>

              {isExpanded && selectedRegions.length > 1 && selectedRegions.map(region => (
                <th key={region.id}
                    className="w-16 py-2 px-2 font-semibold text-center text-blue-800 text-xs break-words align-bottom leading-tight">
                  {region.name}
                </th>
              ))}

              {selectionTitle && (
                <th
                  className="w-16 py-2 px-2 font-semibold text-center text-blue-600 break-words align-bottom leading-tight">
                  <div className="flex flex-col items-center justify-end gap-1">
                    {selectedRegions.length > 1 && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 rounded hover:bg-blue-50 text-blue-400 hover:text-blue-600 transition-colors"
                        aria-label="Toggle individual regions"
                      >
                        <svg className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                             fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    <span>{selectionTitle}</span>
                  </div>
                </th>
              )}
              <th className="w-16 py-2 px-2 font-semibold text-center align-bottom break-words leading-tight">
                Region (per 1000)
              </th>
            </tr>
            </thead>
            <tbody>
            {assetTypes.map(({ key, label }) => {
              const isSelected = selectedAssets[key];
              const isDisabled = selectedAssetCount === 1 && isSelected;

              return (
                <tr key={key}
                    className={`border-b border-gray-100 transition-all ${!isSelected ? 'opacity-50 grayscale' : ''}`}>
                  <td className={`py-2 px-1 text-left transition-colors ${isSelected ? 'bg-blue-50' : 'bg-white'}`}>
                    <label
                      className={`flex items-center pr-1 ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={isSelected || false}
                        onChange={() => onAssetToggle(key)}
                        disabled={isDisabled}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-medium whitespace-nowrap">{label}</span>
                    </label>
                  </td>
                  {isExpanded && selectedRegions.length > 1 && selectedRegions.map(region => (
                    <td key={region.id}
                        className={`py-2 px-2 text-center font-medium transition-colors ${getScoreStyle(region.scores[key])}`}>
                      {region.stats[key]}
                    </td>
                  ))}
                  {selectionStats && (
                    <td
                      className={`py-2 px-2 text-center font-medium transition-colors ${getScoreStyle(selectionScores[key])}`}>
                      {selectionStats[key]}
                    </td>
                  )}
                  <td className={`py-2 px-2 text-center transition-colors ${getScoreStyle(regionalScores[key])}`}>
                    {regionalAverages[key]}
                  </td>
                </tr>
              );
            })}
            </tbody>

            <tbody>
            <tr>
              <td colSpan={10} className="py-1 px-2 bg-gray-50 border-y border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowProfile(!showProfile)}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 w-full hover:text-blue-600 transition-colors py-1 cursor-pointer"
                >
                  <svg className={`w-4 h-4 transform transition-transform ${showProfile ? 'rotate-180' : ''}`}
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>Neighbourhood Profile</span>
                </button>
              </td>
            </tr>
            </tbody>

            {showProfile && (
              <tbody>
              {profileTypes.map(({ key, label }) => (
                <tr key={key} className="border-b border-gray-100 bg-white">
                  <td className="py-2 px-1 text-sm text-left text-gray-700 whitespace-nowrap">{label}</td>

                  {isExpanded && selectedRegions.length > 1 && selectedRegions.map(region => (
                    <td key={`${region.id}-${key}`}
                        className="py-2 px-2 text-center text-sm transition-colors bg-gray-50 text-gray-700">
                      {region.profileStats?.[key] ? `${region.profileStats[key]}%` : '-'}
                    </td>
                  ))}

                  {selectionTitle && (
                    <td
                      className="py-2 px-2 text-center text-sm font-medium transition-colors bg-gray-100 text-gray-900">
                      {selectionProfileStats?.[key] ? `${selectionProfileStats[key]}%` : '-'}
                    </td>
                  )}

                  <td className="py-2 px-2 text-center text-sm transition-colors bg-gray-50 text-gray-700">
                    {regionalProfileAverages?.[key] ? `${regionalProfileAverages[key]}%` : '-'}
                  </td>
                </tr>
              ))}
              </tbody>
            )}
          </table>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <div className="font-semibold text-gray-700 mb-2">Access Tiers</div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#00B88A] inline-block"></span>
              <span>Most Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#DE54A0] inline-block"></span>
              <span>Average Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-[#7378cc] inline-block"></span>
              <span>Least Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}