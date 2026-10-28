// Ray-casting test: is [lng, lat] inside a linear ring of [lng, lat] coordinates?
const isPointInRing = ([x, y], ring) => {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [xi, yi] = ring[i];
        const [xj, yj] = ring[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
            inside = !inside;
        }
    }
    return inside;
};

// The first ring is the outer boundary; any further rings are holes
const isPointInPolygon = (point, rings) =>
    isPointInRing(point, rings[0]) && !rings.slice(1).some(hole => isPointInRing(point, hole));

const isPointInGeometry = (point, geometry) => {
    if (geometry?.type === 'Polygon') return isPointInPolygon(point, geometry.coordinates);
    if (geometry?.type === 'MultiPolygon') return geometry.coordinates.some(rings => isPointInPolygon(point, rings));
    return false;
};

// Returns the first feature whose geometry contains the given Leaflet latlng
export default function findContainingFeature(latlng, features) {
    const point = [latlng.lng, latlng.lat];
    return features.find(feature => isPointInGeometry(point, feature.geometry)) || null;
}
