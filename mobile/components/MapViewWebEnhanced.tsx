import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { GOOGLE_MAPS_API_KEY, isGoogleMapsConfigured } from "../utils/maps";

// Define types for Google Maps objects
declare global {
  interface Window {
    google?: any;
    initGoogleMaps?: () => void;
  }
}

interface MapViewWebProps {
  style?: ViewStyle;
  children?: React.ReactNode;
  onRegionChange?: (region: any) => void;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  provider?: string;
  apiKey?: string;
  [key: string]: any;
}

interface MarkerWebProps {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  [key: string]: any;
}

// Enhanced Web MapView component with Google Maps integration
const MapViewWeb: React.FC<MapViewWebProps> = ({
  style,
  children,
  onRegionChange,
  initialRegion,
  region,
  provider = "default",
  apiKey,
  ...props
}) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());

  // Use provided API key or fallback to the one from config
  const mapsApiKey = apiKey || GOOGLE_MAPS_API_KEY;
  const useGoogleMaps =
    provider === PROVIDER_GOOGLE && isGoogleMapsConfigured && mapsApiKey;

  // Load Google Maps API
  useEffect(() => {
    if (!useGoogleMaps) return;

    // Check if Google Maps is already loaded
    if (window.google?.maps) {
      setIsMapLoaded(true);
      return;
    }

    // Create a function to initialize the map once API is loaded
    window.initGoogleMaps = () => {
      setIsMapLoaded(true);
    };

    // Load Google Maps API script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      setError("Failed to load Google Maps API");
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (window.initGoogleMaps) {
        // @ts-ignore
        window.initGoogleMaps = undefined;
      }
      document.head.removeChild(script);
    };
  }, [useGoogleMaps, mapsApiKey]);

  // Initialize map when API is loaded and container ref is available
  useEffect(() => {
    if (
      isMapLoaded &&
      useGoogleMaps &&
      mapContainerRef.current &&
      window.google?.maps
    ) {
      try {
        // Get center from initialRegion or region
        const center = region || initialRegion || { latitude: 0, longitude: 0 };
        const zoom = calculateZoomLevel(center.latitudeDelta || 0.1);

        // Create map
        googleMapRef.current = new window.google.maps.Map(
          mapContainerRef.current,
          {
            center: { lat: center.latitude, lng: center.longitude },
            zoom: zoom,
            mapTypeId: window.google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }
        );

        // Handle region change events
        if (onRegionChange) {
          googleMapRef.current.addListener("idle", () => {
            const bounds = googleMapRef.current.getBounds();
            const center = googleMapRef.current.getCenter();
            const zoom = googleMapRef.current.getZoom();

            // Calculate approximate latitudeDelta and longitudeDelta
            const ne = bounds.getNorthEast();
            const sw = bounds.getSouthWest();

            onRegionChange({
              latitude: center.lat(),
              longitude: center.lng(),
              latitudeDelta: ne.lat() - sw.lat(),
              longitudeDelta: ne.lng() - sw.lng(),
            });
          });
        }
      } catch (err) {
        console.error("Error initializing Google Maps:", err);
        setError("Error initializing map");
      }
    }
  }, [isMapLoaded, useGoogleMaps, initialRegion, region, onRegionChange]);

  // Calculate zoom level from latitudeDelta
  const calculateZoomLevel = (latitudeDelta: number): number => {
    return Math.round(Math.log2(360 / latitudeDelta));
  };

  // Render fallback if not using Google Maps
  if (!useGoogleMaps) {
    return (
      <View style={[styles.mapContainer, style]}>
        <Text style={styles.mapText}>🗺️ Map View</Text>
        <Text style={styles.mapSubtext}>
          Interactive maps are available in the mobile app.
        </Text>
        <Text style={styles.mapSubtext}>
          Add a Google Maps API key to enable maps on web.
        </Text>
      </View>
    );
  }

  // Render loading state
  if (!isMapLoaded) {
    return (
      <View style={[styles.mapContainer, style]}>
        <Text style={styles.mapText}>Loading map...</Text>
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={[styles.mapContainer, style]}>
        <Text style={styles.mapText}>Error: {error}</Text>
        <Text style={styles.mapSubtext}>
          Please check your internet connection and API key.
        </Text>
      </View>
    );
  }

  // Render the map container - Google Maps will populate this div
  return (
    <View style={[styles.mapContainer, style]} {...props}>
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%", borderRadius: 8 }}
      />
      {/* Note: children (markers) are handled separately via Google Maps API */}
      {React.Children.map(children, (child: any) => {
        // Process Marker components
        if (child?.type?.displayName === "Marker") {
          // Handle marker rendering via Google Maps API
          return null; // Don't render in React tree
        }
        return child;
      })}
    </View>
  );
};

// Web Marker component for Google Maps
const MarkerWeb: React.FC<MarkerWebProps> = ({
  coordinate,
  title,
  description,
  onPress,
  ...props
}) => {
  // This component doesn't render anything directly
  // Markers are handled in the MapViewWeb component
  return null;
};

MarkerWeb.displayName = "Marker";

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    minHeight: 200,
  },
  mapText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
});

// Constants
export const PROVIDER_GOOGLE = "google";
export const PROVIDER_DEFAULT = "default";

// Named exports
export { MarkerWeb as Marker };

// Default export
export default MapViewWeb;
