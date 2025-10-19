import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  ScrollView,
  Modal,
  Linking,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from "../../../utils/PlatformMapView";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { apiGet, API_ENDPOINTS } from "../../../utils/api";

interface RecyclingCenter {
  id: number;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  hours?: string;
  services?: string[];
  rating?: number;
  latitude?: string;
  longitude?: string;
}

export default function MapViewScreen() {
  const params = useLocalSearchParams();
  const mapRef = useRef<any>(null);

  const [centers, setCenters] = useState<RecyclingCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(
    null
  );
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [expandedHours, setExpandedHours] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCenters();
      getUserLocation();
    }, [])
  );

  // Handle notification tap - auto open bottom sheet for specific center
  useEffect(() => {
    if (params.centerId && params.autoOpen === "true" && centers.length > 0) {
      const centerId = parseInt(params.centerId as string);
      const center = centers.find((c) => c.id === centerId);

      if (center && center.latitude && center.longitude) {
        console.log("Opening center from notification:", center.name);

        // Set selected center and show bottom sheet
        setSelectedCenter(center);
        setShowBottomSheet(true);

        // Center map on this location
        setTimeout(() => {
          mapRef.current?.animateToRegion(
            {
              latitude: parseFloat(center.latitude!),
              longitude: parseFloat(center.longitude!),
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            1000
          );
        }, 500);
      }
    }
  }, [params.centerId, params.autoOpen, centers]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const loadCenters = async () => {
    try {
      setLoading(true);
      const centersData = await apiGet(API_ENDPOINTS.CENTERS);
      setCenters(centersData);
    } catch (error) {
      console.error("Error loading centers:", error);
      Alert.alert("Error", "Failed to load recycling centers");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (center: RecyclingCenter) => {
    setSelectedCenter(center);
    setShowBottomSheet(true);
    setExpandedHours(false);
  };

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWebsite = (website: string) => {
    if (website) {
      let url = website.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
      }
      Linking.openURL(url).catch(() => {
        Alert.alert("Error", "Could not open website");
      });
    }
  };

  const handleDirections = (
    latitude: string,
    longitude: string,
    name: string
  ) => {
    // Use Google Maps Directions API - opens with directions ready, user taps Start
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Could not open directions");
    });
  };

  const parseOperatingHours = (hoursString?: string) => {
    if (!hoursString) return [];

    const dayHours = hoursString
      .split(", ")
      .map((dayHour) => {
        const [day, hours] = dayHour.split(": ");
        return { day: day.trim(), hours: hours ? hours.trim() : "" };
      })
      .filter((item) => item.day && item.hours);

    return dayHours;
  };

  // Filter centers that have lat/lng
  const centersWithLocation = centers.filter(
    (center) => center.latitude && center.longitude
  );

  // Calculate region to fit all markers
  const getRegion = () => {
    if (centersWithLocation.length === 0) {
      // Default to user location or Colombo, Sri Lanka
      return {
        latitude: userLocation?.latitude || 6.9271,
        longitude: userLocation?.longitude || 79.8612,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    const latitudes = centersWithLocation.map((c) => parseFloat(c.latitude!));
    const longitudes = centersWithLocation.map((c) => parseFloat(c.longitude!));

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.5 || 0.05;
    const deltaLng = (maxLng - minLng) * 1.5 || 0.05;

    return {
      latitude: midLat,
      longitude: midLng,
      latitudeDelta: Math.max(deltaLat, 0.05),
      longitudeDelta: Math.max(deltaLng, 0.05),
    };
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#4CAF50" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recycling Centers Map</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={getRegion()}
      >
        {/* User Location Marker */}
        {userLocation && (
          <Marker coordinate={userLocation} title="Your Location">
            <MaterialIcons name="my-location" size={30} color="#2196F3" />
          </Marker>
        )}

        {/* Recycling Center Markers */}
        {centersWithLocation.map((center) => (
          <Marker
            key={center.id}
            coordinate={{
              latitude: parseFloat(center.latitude!),
              longitude: parseFloat(center.longitude!),
            }}
            onPress={() => handleMarkerPress(center)}
          >
            <View>
              <MaterialIcons name="place" size={30} color="#FF5252" />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Info Box */}
      {centersWithLocation.length === 0 && (
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color="#FF9800" />
          <Text style={styles.infoText}>
            No recycling centers with location data found. Add centers with
            location to see them on the map.
          </Text>
        </View>
      )}

      {/* Centers Count */}
      <View style={styles.countBox}>
        <MaterialIcons name="place" size={20} color="#4CAF50" />
        <Text style={styles.countText}>
          {centersWithLocation.length} center
          {centersWithLocation.length !== 1 ? "s" : ""} shown
        </Text>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showBottomSheet}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBottomSheet(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowBottomSheet(false)}
          />
          <View style={styles.bottomSheet}>
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedCenter && (
                <View style={styles.sheetContent}>
                  {/* Header */}
                  <View style={styles.sheetHeader}>
                    <View style={styles.sheetTitleContainer}>
                      <Text style={styles.sheetTitle}>
                        {selectedCenter.name}
                      </Text>
                      {selectedCenter.rating !== undefined &&
                        selectedCenter.rating > 0 && (
                          <View style={styles.sheetRating}>
                            <MaterialIcons
                              name="star"
                              size={18}
                              color="#FFD700"
                            />
                            <Text style={styles.sheetRatingText}>
                              {selectedCenter.rating}
                            </Text>
                          </View>
                        )}
                    </View>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setShowBottomSheet(false)}
                    >
                      <MaterialIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {/* Address */}
                  <View style={styles.sheetSection}>
                    <View style={styles.sheetRow}>
                      <MaterialIcons
                        name="location-on"
                        size={20}
                        color="#4CAF50"
                      />
                      <Text style={styles.sheetText}>
                        {selectedCenter.address}
                      </Text>
                    </View>
                  </View>

                  {/* Phone */}
                  {selectedCenter.phone && (
                    <View style={styles.sheetSection}>
                      <View style={styles.sheetRow}>
                        <MaterialIcons name="phone" size={20} color="#4CAF50" />
                        <Text style={styles.sheetText}>
                          {selectedCenter.phone}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Services */}
                  {selectedCenter.services &&
                    selectedCenter.services.length > 0 && (
                      <View style={styles.sheetSection}>
                        <Text style={styles.sheetSectionLabel}>Services:</Text>
                        <View style={styles.servicesTags}>
                          {selectedCenter.services.map((service, index) => (
                            <View key={index} style={styles.serviceTag}>
                              <Text style={styles.serviceTagText}>
                                {service}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                  {/* Operating Hours */}
                  {selectedCenter.hours && (
                    <View style={styles.sheetSection}>
                      <Text style={styles.sheetSectionLabel}>
                        Operating Hours:
                      </Text>
                      <View style={styles.hoursContainer}>
                        {parseOperatingHours(selectedCenter.hours)
                          .slice(0, expandedHours ? undefined : 3)
                          .map((dayHour, index) => (
                            <View key={index} style={styles.dayHourRow}>
                              <Text style={styles.dayText}>{dayHour.day}:</Text>
                              <Text style={styles.hoursText}>
                                {dayHour.hours}
                              </Text>
                            </View>
                          ))}
                        {parseOperatingHours(selectedCenter.hours).length >
                          3 && (
                          <TouchableOpacity
                            style={styles.moreHoursButton}
                            onPress={() => setExpandedHours(!expandedHours)}
                          >
                            <Text style={styles.moreHoursText}>
                              {expandedHours
                                ? "Show Less"
                                : `+${parseOperatingHours(selectedCenter.hours).length - 3} more days`}
                            </Text>
                            <MaterialIcons
                              name={
                                expandedHours ? "expand-less" : "expand-more"
                              }
                              size={16}
                              color="#4CAF50"
                            />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}

                  {/* Website */}
                  {selectedCenter.website && (
                    <View style={styles.sheetSection}>
                      <View style={styles.sheetRow}>
                        <MaterialIcons
                          name="language"
                          size={20}
                          color="#4CAF50"
                        />
                        <Text style={styles.sheetText}>
                          {selectedCenter.website}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionButtons}>
                    {selectedCenter.phone && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleCall(selectedCenter.phone!)}
                      >
                        <MaterialIcons name="phone" size={20} color="#4CAF50" />
                        <Text style={styles.actionButtonText}>Call</Text>
                      </TouchableOpacity>
                    )}

                    {selectedCenter.latitude && selectedCenter.longitude && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() =>
                          handleDirections(
                            selectedCenter.latitude!,
                            selectedCenter.longitude!,
                            selectedCenter.name
                          )
                        }
                      >
                        <MaterialIcons
                          name="directions"
                          size={20}
                          color="#2196F3"
                        />
                        <Text
                          style={[
                            styles.actionButtonText,
                            { color: "#2196F3" },
                          ]}
                        >
                          Directions
                        </Text>
                      </TouchableOpacity>
                    )}

                    {selectedCenter.website && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleWebsite(selectedCenter.website!)}
                      >
                        <MaterialIcons
                          name="language"
                          size={20}
                          color="#FF9800"
                        />
                        <Text
                          style={[
                            styles.actionButtonText,
                            { color: "#FF9800" },
                          ]}
                        >
                          Website
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#4CAF50",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  map: {
    flex: 1,
  },
  centerMarker: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  countBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    gap: 8,
  },
  countText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  // Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBackdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "75%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  sheetContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sheetTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  sheetRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sheetRatingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  sheetSection: {
    marginBottom: 16,
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  sheetText: {
    flex: 1,
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  sheetSectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  servicesTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceTag: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceTagText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
  },
  hoursContainer: {
    gap: 6,
  },
  dayHourRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    minWidth: 50,
    marginRight: 12,
  },
  hoursText: {
    fontSize: 14,
    color: "#666",
  },
  moreHoursButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginTop: 4,
    gap: 4,
  },
  moreHoursText: {
    fontSize: 13,
    color: "#4CAF50",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 16,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
