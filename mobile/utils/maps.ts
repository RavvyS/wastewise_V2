// Google Maps configuration
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA';

export const isGoogleMapsConfigured = !!GOOGLE_MAPS_API_KEY;

// Helper functions for maps
export const getMapRegionForCoordinates = (coords: { latitude: number, longitude: number }[], padding = 0.01) => {
    // Calculate the bounding box for all coordinates
    if (!coords || coords.length === 0) {
        // Default to a region around the user's location or a default region
        return {
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
        };
    }

    // If only one coordinate, return a region centered on that point
    if (coords.length === 1) {
        return {
            latitude: coords[0].latitude,
            longitude: coords[0].longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
    }

    // Calculate min and max values
    let minLat = coords[0].latitude;
    let maxLat = coords[0].latitude;
    let minLng = coords[0].longitude;
    let maxLng = coords[0].longitude;

    coords.forEach(coord => {
        minLat = Math.min(minLat, coord.latitude);
        maxLat = Math.max(maxLat, coord.latitude);
        minLng = Math.min(minLng, coord.longitude);
        maxLng = Math.max(maxLng, coord.longitude);
    });

    // Calculate center points
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calculate deltas (with padding)
    const latDelta = (maxLat - minLat) + padding;
    const lngDelta = (maxLng - minLng) + padding;

    return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
    };
};