export const tagEmojiDict = {
  "Family": "👯",
  "Date idea": "🌹",
  "Free": "🙌",
  "Staying in": "😇",
  "Solo": "🚶",
  "Food": "🍩",
  "Drinks": "🍻",
  "Shopping": "💸",
  "Culture": "🎤",
  "Sports": "👟",
  "Dog-friendly": "🐶",
  "Self-care": "💖",
  "Group": "👥",
  "Holidays": "🎅",
  "Craft": "✂️"
}

export const eventCategories = {
  "Arts & culture": { bgColor: "bg-lightBlue", textColor: "text-blue", emoji: "🎤" },
  "Learning & personal growth": { bgColor: "bg-latte", textColor: "text-purple", emoji: "🌱" },
  "Festival or market": { bgColor: "bg-lightYellow", textColor: "text-yellow", emoji: "🎪" },
  "Food & drink": { bgColor: "bg-lightRed", textColor: "text-red", emoji: "🍩" },
  "Community action": { bgColor: "bg-blue", textColor: "text-white", emoji: "✌" },
  "Kids & family": { bgColor: "bg-purple", textColor: "text-white", emoji: "👯" },
  "Nightlife": { bgColor: "bg-red", textColor: "text-white", emoji: "💃" },
  "Sports & recreation": { bgColor: "bg-lightGreen", textColor: "text-green", emoji: "👟" },
  "Tech": { bgColor: "bg-green", textColor: "text-white", emoji: "🤖" }
}

export const artCategories = {
  "Arts & culture": { bgColor: "bg-lightBlue", textColor: "text-blue", emoji: "🎤" },
  "Learning & personal growth": { bgColor: "bg-latte", textColor: "text-purple", emoji: "🌱" },
  "Festival or market": { bgColor: "bg-lightYellow", textColor: "text-yellow", emoji: "🎪" },
  "Food & drink": { bgColor: "bg-lightRed", textColor: "text-red", emoji: "🍩" },
  "Community action": { bgColor: "bg-blue", textColor: "text-white", emoji: "✌" },
  "Kids & family": { bgColor: "bg-purple", textColor: "text-white", emoji: "👯" },
  "Nightlife": { bgColor: "bg-red", textColor: "text-white", emoji: "💃" },
  "Sports & recreation": { bgColor: "bg-lightGreen", textColor: "text-green", emoji: "👟" },
  "Tech": { bgColor: "bg-green", textColor: "text-white", emoji: "🤖" }
}


export const MAP_ZOOM_LEVEL = 12

export const DEFAULT_MAP_CENTER = {
  lat: 43.421678,
  lng: -80.432968,
}

export const MAP_STYLE = [
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "saturation": "-100"
            }
        ]
    },
    {
        "featureType": "administrative.province",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 65
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": "20"
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": "-100"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "all",
        "stylers": [
            {
                "lightness": "30"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "all",
        "stylers": [
            {
                "lightness": "40"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
            {
                "hue": "#ffff00"
            },
            {
                "saturation": -97
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [
            {
                "saturation": -100
            }
        ]
    }
]

export const MARKER_SVG = "M14.18,27.26c2.8,4.47,5.33-.35,8.89-6.7S26.77,5.77,21.9,2.15C18-.76,5.89,2.17,4.25,7.39,1.56,16,9.48,19.75,14.18,27.26Z"
export const MARKER_CLUSTER_SVG = "M15,1C7.89,1.05,1.05,8.17,1,16,1,22.91,6.2,27.89,13,29c7.29,1.19,14.26-1.57,16-8C31.3,12.5,23.94.94,15,1Z"
export const DEFAULT_MARKER_COLOR = "#ef476f"

export const DEFAULT_LOCALE = 'en-CA'
export const DATE_FORMAT = { weekday: 'short', month: 'short', day: 'numeric' }
export const TIME_FORMAT = { hour: 'numeric', minute: '2-digit' }

export const DEFAULT_CATEGORY_ID = 6 // All ages

export const DATA_SOURCE_LOOKUP = [
    { id: 1, name: "Waterloo Public Library" },
    { id: 2, name: "City of Kitchener" },
    { id: 3, name: "City of Waterloo" },
    { id: 4, name: "Kitchener Public Library" },
    { id: 5, name: "Explore Waterloo" },
    { id: 6, name: "Other" },
    { id: 7, name: "Region of Waterloo Museums" },
    { id: 8, name: "City of Cambridge" },
    { id: 9, name: "Eventbrite" },
    { id: 10, name: "Region of Waterloo Museums" }, 
    { id: 11, name: "Meetup" },
]