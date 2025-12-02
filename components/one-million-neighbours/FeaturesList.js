import React, { useState } from 'react';

const TableRow = ({ feature }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${feature.coordinates[0]},${feature.coordinates[1]}`
  )}`;

  return (
    <>
      <tr
        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="px-4 py-3">
          <button className="text-gray-400 hover:text-gray-600">
            {isExpanded ? (
              <i className="fa-solid fa-chevron-down w-4 h-4"></i>
            ) : (
              <i className="fa-solid fa-chevron-right w-4 h-4"></i>
            )}
          </button>
        </td>
        <td className="px-4 py-3">
          <div>
            <div className="font-medium text-gray-900">{feature.name}</div>
            <div className="text-sm text-gray-500">{feature.address}</div>
          </div>
        </td>

        <td className="px-4 py-3 text-sm text-gray-600">
          {feature.raw?.tags && feature.raw.tags.length > 0 ? (
            <>
              {feature.raw.tags
                .slice(0, 2)
                .map((tag) => tag.name)
                .join(', ')}
              {feature.raw.tags.length > 2 &&
                ` +${feature.raw.tags.length - 2}`}
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1 no-underline"
              title="Get Directions"
            >
              <i className="fa-solid fa-location-arrow w-4 h-4" />
            </a>
            {feature.website && (
              <a
                href={feature.website}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center gap-1"
                title="Visit Website"
              >
                <i className="fa-solid fa-arrow-up-right-from-square w-4 h-4"></i>
              </a>
            )}
          </div>
        </td>
      </tr>

      {/* Expanded content */}
      {isExpanded && (
        <tr className="bg-gray-50 border-b border-gray-200">
          <td colSpan="5" className="px-4 py-4">
            <div className="ml-12">
              {feature.description && (
                <>
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">
                    Description
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {feature.description}
                  </p>
                </>
              )}

              {feature.raw.tags.length > 0 && (
                <>
                  <h4 className="font-semibold text-sm text-gray-900 mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {feature.raw.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-xs"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-sm font-medium inline-flex items-center gap-2 no-underline"
                >
                  <i className="fa-solid fa-location-arrow w-4 h-4" />
                  Get Directions
                </a>
                {feature.website && (
                  <a
                    href={feature.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium inline-flex items-center gap-2"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square w-4 h-4"></i>
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default function FeaturesList({ items = [] }) {
  if (!items.length) {
    return (
      <div className="p-6 text-center text-gray-600">
        No locations available.
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white overflow-hidden flex flex-col mt-12">
      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name & Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Links
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.map((feature) => (
              <TableRow key={feature.id} feature={feature} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
