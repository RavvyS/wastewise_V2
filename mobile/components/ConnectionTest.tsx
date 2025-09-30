import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
import { apiGet, apiPost, API_ENDPOINTS } from "../utils/api";

interface WasteCategory {
  id: number;
  name: string;
  description: string;
  items?: Array<{
    id: number;
    name: string;
    categoryId: number;
    disposalInstructions: string;
  }>;
}

export default function ConnectionTest() {
  const [categories, setCategories] = useState<WasteCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Not tested");

  const testConnection = async () => {
    setLoading(true);
    setConnectionStatus("Testing...");

    try {
      // Test getting categories
      const data = await apiGet(API_ENDPOINTS.CATEGORIES_WITH_ITEMS);
      setCategories(data);
      setConnectionStatus("✅ Connected successfully!");
      Alert.alert("Success", `Connected! Found ${data.length} categories`);
    } catch (error) {
      console.error("Connection test failed:", error);
      setConnectionStatus("❌ Connection failed");
      Alert.alert("Error", "Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const testAddLog = async () => {
    try {
      const newLog = {
        userId: 1,
        description: "Test log from app",
        quantity: 1,
        itemId: null,
      };

      const result = await apiPost(API_ENDPOINTS.LOGS, newLog);
      Alert.alert("Success", "Test log added successfully!");
    } catch (error) {
      console.error("Add log test failed:", error);
      Alert.alert("Error", "Failed to add test log");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend Connection Test</Text>

      <Text style={styles.status}>Status: {connectionStatus}</Text>

      <Button
        title={loading ? "Testing..." : "Test Connection"}
        onPress={testConnection}
        disabled={loading}
      />

      <Button title="Test Add Log" onPress={testAddLog} disabled={loading} />

      {categories.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Categories found:</Text>
          {categories.map((cat) => (
            <Text key={cat.id} style={styles.categoryItem}>
              • {cat.name} ({cat.items?.length || 0} items)
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  status: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 8,
  },
  results: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  categoryItem: {
    fontSize: 14,
    marginBottom: 5,
    color: "#666",
  },
});
