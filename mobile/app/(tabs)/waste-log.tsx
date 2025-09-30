import React, { useState, useEffect } from "react";
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
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  API_ENDPOINTS,
} from "../../utils/api";

interface WasteLog {
  id: number;
  description: string;
  quantity: number;
  createdAt: string;
  itemName?: string;
  categoryName?: string;
  disposalInstructions?: string;
}

interface WasteCategory {
  id: number;
  name: string;
  description: string;
  items: WasteItem[];
}

interface WasteItem {
  id: number;
  name: string;
  categoryId: number;
  disposalInstructions: string;
}

interface LogStats {
  totalQuantity: number;
  totalLogs: number;
  monthlyStats: any[];
}

export default function WasteLogScreen() {
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLog, setEditingLog] = useState<WasteLog | null>(null);

  // Form state
  const [selectedCategory, setSelectedCategory] =
    useState<WasteCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [customDescription, setCustomDescription] = useState("");
  const [quantity, setQuantity] = useState("1");

  // Mock user ID - In real app, this would come from auth context
  const currentUserId = 1;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, categoriesData, statsData] = await Promise.all([
        apiGet(`${API_ENDPOINTS.LOGS}?userId=${currentUserId}`),
        apiGet(API_ENDPOINTS.CATEGORIES_WITH_ITEMS),
        apiGet(API_ENDPOINTS.LOG_STATS(currentUserId)),
      ]);

      setLogs(logsData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      Alert.alert("Error", "Failed to load data. Please try again.");
      console.error("Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setSelectedItem(null);
    setCustomDescription("");
    setQuantity("1");
    setEditingLog(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (log: WasteLog) => {
    setEditingLog(log);
    setCustomDescription(log.description);
    setQuantity(log.quantity.toString());

    // Find and set the category/item if available
    if (log.categoryName) {
      const category = categories.find((cat) => cat.name === log.categoryName);
      if (category) {
        setSelectedCategory(category);
        const item = category.items.find((item) => item.name === log.itemName);
        if (item) {
          setSelectedItem(item);
        }
      }
    }

    setModalVisible(true);
  };

  const saveLog = async () => {
    try {
      if (!customDescription.trim()) {
        Alert.alert("Error", "Please enter a description");
        return;
      }

      const logData = {
        userId: currentUserId,
        itemId: selectedItem?.id || null,
        description: customDescription.trim(),
        quantity: parseInt(quantity) || 1,
      };

      if (editingLog) {
        // Update existing log
        await apiPut(`${API_ENDPOINTS.LOGS}/${editingLog.id}`, logData);
        Alert.alert("Success", "Log updated successfully!");
      } else {
        // Create new log
        await apiPost(API_ENDPOINTS.LOGS, logData);
        Alert.alert("Success", "Log added successfully!");
      }

      setModalVisible(false);
      resetForm();
      await loadData(); // Refresh data
    } catch (error) {
      Alert.alert("Error", "Failed to save log. Please try again.");
      console.error("Save log error:", error);
    }
  };

  const deleteLog = async (logId: number) => {
    Alert.alert(
      "Delete Log",
      "Are you sure you want to delete this log entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiDelete(`${API_ENDPOINTS.LOGS}/${logId}`);
              Alert.alert("Success", "Log deleted successfully!");
              await loadData();
            } catch (error) {
              Alert.alert("Error", "Failed to delete log. Please try again.");
              console.error("Delete log error:", error);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your waste logs...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Stats */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Waste Log</Text>
          <Text style={styles.headerSubtitle}>
            Track your recycling journey
          </Text>
        </View>

        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { borderLeftColor: "#4CAF50" }]}>
              <View style={styles.statIcon}>
                <Ionicons name="leaf" size={24} color="#4CAF50" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{stats.totalQuantity}kg</Text>
                <Text style={styles.statLabel}>Total Recycled</Text>
              </View>
            </View>
            <View style={[styles.statCard, { borderLeftColor: "#2196F3" }]}>
              <View style={styles.statIcon}>
                <Ionicons name="list" size={24} color="#2196F3" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>{stats.totalLogs}</Text>
                <Text style={styles.statLabel}>Total Entries</Text>
              </View>
            </View>
            <View style={[styles.statCard, { borderLeftColor: "#FF9800" }]}>
              <View style={styles.statIcon}>
                <Ionicons name="trending-up" size={24} color="#FF9800" />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statNumber}>
                  {Math.round(
                    (stats.totalQuantity / Math.max(stats.totalLogs, 1)) * 10
                  ) / 10}
                  kg
                </Text>
                <Text style={styles.statLabel}>Avg per Entry</Text>
              </View>
            </View>
          </View>
        )}

        {/* Add Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Add New Log Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Logs List */}
        <View style={styles.logsContainer}>
          <Text style={styles.sectionTitle}>Recent Logs</Text>
          {logs.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No logs yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your recycling activities!
              </Text>
            </View>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logHeader}>
                  <View style={styles.logIconContainer}>
                    <Ionicons
                      name={log.categoryName ? "leaf" : "document-text"}
                      size={20}
                      color="#4CAF50"
                    />
                  </View>
                  <View style={styles.logInfo}>
                    <Text style={styles.logDescription}>{log.description}</Text>
                    <View style={styles.logMetadata}>
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityText}>
                          {log.quantity}kg
                        </Text>
                      </View>
                      <Text style={styles.logDate}>
                        {formatDate(log.createdAt)}
                      </Text>
                    </View>
                    {log.categoryName && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                          {log.categoryName}
                          {log.itemName && ` • ${log.itemName}`}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.logActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => openEditModal(log)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color="#4CAF50"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => deleteLog(log.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#F44336"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                {log.disposalInstructions && (
                  <View style={styles.instructionsBanner}>
                    <Ionicons name="bulb" size={14} color="#FF9800" />
                    <Text style={styles.disposalInstructions}>
                      {log.disposalInstructions}
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingLog ? "Edit Log Entry" : "Add Log Entry"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* Category Selection */}
              <Text style={styles.formLabel}>Category (Optional)</Text>
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      selectedCategory?.id === category.id &&
                        styles.selectedCategoryCard,
                    ]}
                    onPress={() => {
                      setSelectedCategory(category);
                      setSelectedItem(null); // Reset item selection
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryName,
                        selectedCategory?.id === category.id &&
                          styles.selectedCategoryName,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Item Selection */}
              {selectedCategory && selectedCategory.items.length > 0 && (
                <>
                  <Text style={styles.formLabel}>Specific Item (Optional)</Text>
                  <View style={styles.itemGrid}>
                    {selectedCategory.items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.itemCard,
                          selectedItem?.id === item.id &&
                            styles.selectedItemCard,
                        ]}
                        onPress={() => setSelectedItem(item)}
                      >
                        <Text
                          style={[
                            styles.itemName,
                            selectedItem?.id === item.id &&
                              styles.selectedItemName,
                          ]}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Description Input */}
              <Text style={styles.formLabel}>Description *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="E.g., Recycled plastic bottles"
                value={customDescription}
                onChangeText={setCustomDescription}
                multiline
                numberOfLines={3}
              />

              {/* Quantity Input */}
              <Text style={styles.formLabel}>Quantity (kg)</Text>
              <TextInput
                style={styles.quantityInput}
                placeholder="1"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />

              {/* Disposal Instructions */}
              {selectedItem?.disposalInstructions && (
                <View style={styles.instructionsCard}>
                  <Text style={styles.instructionsTitle}>
                    💡 Disposal Instructions
                  </Text>
                  <Text style={styles.instructionsText}>
                    {selectedItem.disposalInstructions}
                  </Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveLog}>
                <Text style={styles.saveButtonText}>
                  {editingLog ? "Update" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  scrollView: {
    flex: 1,
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
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statIcon: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  logsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  logCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  logIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logInfo: {
    flex: 1,
  },
  logDescription: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  logMetadata: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  quantityBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  quantityText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  logDate: {
    fontSize: 12,
    color: "#666",
  },
  categoryBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  categoryText: {
    fontSize: 11,
    color: "#2196F3",
    fontWeight: "500",
  },
  logActions: {
    flexDirection: "column",
    marginLeft: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  editButton: {
    backgroundColor: "#E8F5E8",
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
  },
  instructionsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  disposalInstructions: {
    fontSize: 12,
    color: "#F57C00",
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
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
    maxHeight: "90%",
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
  modalForm: {
    flex: 1,
    padding: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    marginTop: 16,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryCard: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E8",
  },
  categoryName: {
    fontSize: 14,
    color: "#666",
  },
  selectedCategoryName: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  itemGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedItemCard: {
    borderColor: "#2196F3",
    backgroundColor: "#E3F2FD",
  },
  itemName: {
    fontSize: 12,
    color: "#666",
  },
  selectedItemName: {
    color: "#2196F3",
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: "top",
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 100,
  },
  instructionsCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF9800",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    color: "#666",
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#666",
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});
