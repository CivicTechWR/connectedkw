import React from 'react';

const FeatureCard = ({ feature }) => {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${feature.coordinates[0]},${feature.coordinates[1]}`
  )}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full">
      {/* Image placeholder */}
      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
        <i className="fa-solid fa-image text-4xl"></i>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        {/* Name */}
        <h3 className="font-semibold text-base text-gray-900 mb-2">
          {feature.name}
        </h3>

        {/* Address */}
        <div className="flex items-center gap-0 text-gray-600 text-sm mb-3">
          <i className="fa-solid fa-map-pin w-4 h-4 mt-0.5 flex-shrink-0"></i>
          <span>{feature.address}</span>
        </div>

        {/* Amenities/Tags */}
        {feature.raw.tags.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1.5">Tags:</p>
            <div className="flex flex-wrap gap-1.5">
              {feature.raw.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-auto pt-2">
          <div className="flex gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 no-underline"
            >
              <i className="fa-solid fa-location-arrow w-4 h-4"></i>
              Directions
            </a>
            {feature.website && (
              <a
                href={feature.website}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                title="Visit Website"
              >
                <i className="fa-solid fa-arrow-up-right-from-square w-4 h-4"></i>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function FeaturesGrid({ items = [] }) {
  if (!items.length) {
    return (
      <div className="p-6 text-center text-gray-600">
        No locations available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-14">
      {items.map((item) => (
        <FeatureCard key={item.id} feature={item} />
      ))}
    </div>
  );
}
