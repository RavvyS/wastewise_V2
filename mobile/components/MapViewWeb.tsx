import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";

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
  [key: string]: any;
}

interface MarkerWebProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  [key: string]: any;
}

// Web fallback component for MapView
const MapViewWeb: React.FC<MapViewWebProps> = ({
  style,
  children,
  onRegionChange,
  initialRegion,
  region,
  ...props
}) => {
  // Handle map-like props to prevent crashes
  React.useEffect(() => {
    if (onRegionChange && initialRegion) {
      // Simulate initial region change for compatibility
      setTimeout(() => {
        onRegionChange(initialRegion);
      }, 100);
    }
  }, [onRegionChange, initialRegion]);

  return (
    <View style={[styles.mapContainer, style]}>
      <Text style={styles.mapText}>🗺️ Map View</Text>
      <Text style={styles.mapSubtext}>
        Interactive maps are available in the mobile app.
      </Text>
      <Text style={styles.mapLocation}>
        {region &&
          `📍 Lat: ${region.latitude?.toFixed(4)}, Lng: ${region.longitude?.toFixed(4)}`}
      </Text>
      {children}
    </View>
  );
};

// Web fallback component for Marker
const MarkerWeb: React.FC<MarkerWebProps> = ({
  children,
  title,
  description,
  ...props
}) => {
  return (
    <View style={styles.markerContainer}>
      {title && <Text style={styles.markerTitle}>{title}</Text>}
      {description && (
        <Text style={styles.markerDescription}>{description}</Text>
      )}
      {children}
    </View>
  );
};

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
  },
  mapLocation: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  markerContainer: {
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 4,
    marginVertical: 2,
  },
  markerTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  markerDescription: {
    fontSize: 11,
    color: "#666",
  },
});

// Constants
export const PROVIDER_GOOGLE = "google";
export const PROVIDER_DEFAULT = "default";

// Named exports
export { MarkerWeb as Marker };

// Default export
export default MapViewWeb;
