import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RecyclingCenter {
  id: number;
  name: string;
  address: string;
  distance: string;
  hours: string;
  phone: string;
  acceptedMaterials: string[];
  rating: number;
  isOpen: boolean;
}

export default function LocationsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCenter, setSelectedCenter] = useState<RecyclingCenter | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  // Mock data - in real app this would come from API
  const recyclingCenters: RecyclingCenter[] = [
    {
      id: 1,
      name: "EcoCenter Downtown",
      address: "123 Green Street, City Center",
      distance: "0.8 km",
      hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM",
      phone: "+1 234-567-8900",
      acceptedMaterials: ["Paper", "Plastic", "Glass", "Metal", "Electronics"],
      rating: 4.8,
      isOpen: true,
    },
    {
      id: 2,
      name: "Green Valley Recycling",
      address: "456 Valley Road, Green District",
      distance: "2.1 km",
      hours: "Mon-Sat: 7AM-7PM, Sun: 10AM-3PM",
      phone: "+1 234-567-8901",
      acceptedMaterials: ["Paper", "Plastic", "Organic", "Textiles"],
      rating: 4.5,
      isOpen: true,
    },
    {
      id: 3,
      name: "Metro Waste Management",
      address: "789 Industrial Ave, Metro Zone",
      distance: "3.5 km",
      hours: "Mon-Fri: 6AM-8PM, Closed Weekends",
      phone: "+1 234-567-8902",
      acceptedMaterials: ["Metal", "Electronics", "Hazardous", "Batteries"],
      rating: 4.2,
      isOpen: false,
    },
    {
      id: 4,
      name: "Community Recycle Hub",
      address: "321 Community Drive, Suburb Area",
      distance: "4.2 km",
      hours: "Daily: 8AM-6PM",
      phone: "+1 234-567-8903",
      acceptedMaterials: ["Paper", "Plastic", "Glass", "Organic"],
      rating: 4.6,
      isOpen: true,
    },
  ];

  const materialFilters = [
    "all",
    "Paper",
    "Plastic",
    "Glass",
    "Metal",
    "Electronics",
    "Organic",
  ];

  const filteredCenters = recyclingCenters.filter((center) => {
    const matchesSearch =
      center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" || center.acceptedMaterials.includes(filterType);
    return matchesSearch && matchesFilter;
  });

  const openCenterDetails = (center: RecyclingCenter) => {
    setSelectedCenter(center);
    setModalVisible(true);
  };

  const callCenter = (phone: string) => {
    Alert.alert("Call Center", `Would you like to call ${phone}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => console.log("Calling:", phone) },
    ]);
  };

  const getDirections = (address: string) => {
    Alert.alert("Get Directions", `Opening directions to:\n${address}`, [
      { text: "OK", onPress: () => console.log("Opening maps:", address) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recycling Locations</Text>
        <Text style={styles.headerSubtitle}>Find centers near you</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search locations..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Material Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {materialFilters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              filterType === filter && styles.activeFilterChip,
            ]}
            onPress={() => setFilterType(filter)}
          >
            <Text
              style={[
                styles.filterText,
                filterType === filter && styles.activeFilterText,
              ]}
            >
              {filter === "all" ? "All Materials" : filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Centers List */}
      <ScrollView style={styles.centersList}>
        {filteredCenters.map((center) => (
          <TouchableOpacity
            key={center.id}
            style={styles.centerCard}
            onPress={() => openCenterDetails(center)}
          >
            <View style={styles.centerHeader}>
              <View style={styles.centerInfo}>
                <Text style={styles.centerName}>{center.name}</Text>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: center.isOpen ? "#4CAF50" : "#F44336",
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: center.isOpen ? "#4CAF50" : "#F44336" },
                    ]}
                  >
                    {center.isOpen ? "Open" : "Closed"}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{center.rating}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.distanceContainer}>
                <Ionicons name="location" size={16} color="#2196F3" />
                <Text style={styles.distanceText}>{center.distance}</Text>
              </View>
            </View>

            <Text style={styles.centerAddress}>{center.address}</Text>
            <Text style={styles.centerHours}>{center.hours}</Text>

            <View style={styles.materialsContainer}>
              {center.acceptedMaterials.slice(0, 3).map((material, index) => (
                <View key={index} style={styles.materialTag}>
                  <Text style={styles.materialText}>{material}</Text>
                </View>
              ))}
              {center.acceptedMaterials.length > 3 && (
                <View style={styles.materialTag}>
                  <Text style={styles.materialText}>
                    +{center.acceptedMaterials.length - 3} more
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.centerActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => callCenter(center.phone)}
              >
                <Ionicons name="call" size={16} color="#4CAF50" />
                <Text style={styles.actionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => getDirections(center.address)}
              >
                <Ionicons name="navigate" size={16} color="#2196F3" />
                <Text style={styles.actionText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Center Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedCenter && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedCenter.name}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <Ionicons name="location" size={20} color="#2196F3" />
                      <Text style={styles.detailText}>
                        {selectedCenter.address}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="time" size={20} color="#FF9800" />
                      <Text style={styles.detailText}>
                        {selectedCenter.hours}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="call" size={20} color="#4CAF50" />
                      <Text style={styles.detailText}>
                        {selectedCenter.phone}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Ionicons name="star" size={20} color="#FFD700" />
                      <Text style={styles.detailText}>
                        {selectedCenter.rating} rating
                      </Text>
                    </View>
                  </View>

                  <View style={styles.materialsSection}>
                    <Text style={styles.sectionTitle}>Accepted Materials</Text>
                    <View style={styles.allMaterialsContainer}>
                      {selectedCenter.acceptedMaterials.map(
                        (material, index) => (
                          <View key={index} style={styles.modalMaterialTag}>
                            <Text style={styles.modalMaterialText}>
                              {material}
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.callButton]}
                    onPress={() => callCenter(selectedCenter.phone)}
                  >
                    <Ionicons name="call" size={20} color="white" />
                    <Text style={styles.modalActionText}>Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.directionsButton]}
                    onPress={() => getDirections(selectedCenter.address)}
                  >
                    <Ionicons name="navigate" size={20} color="white" />
                    <Text style={styles.modalActionText}>Get Directions</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  filtersContainer: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  filterChip: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeFilterChip: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
  },
  activeFilterText: {
    color: "white",
    fontWeight: "600",
  },
  centersList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centerCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  centerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  centerInfo: {
    flex: 1,
  },
  centerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    fontSize: 14,
    color: "#2196F3",
    marginLeft: 4,
    fontWeight: "600",
  },
  centerAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  centerHours: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
  },
  materialsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  materialTag: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  materialText: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "500",
  },
  centerActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 6,
    color: "#666",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  materialsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  allMaterialsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  modalMaterialTag: {
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  modalMaterialText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  modalActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 6,
  },
  callButton: {
    backgroundColor: "#4CAF50",
  },
  directionsButton: {
    backgroundColor: "#2196F3",
  },
  modalActionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
