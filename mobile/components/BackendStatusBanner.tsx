import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { apiGet, API_ENDPOINTS, API_BASE_URL } from "../utils/api";
import { Colors } from "../constants/Colors";

const BackendStatusBanner = () => {
  const [status, setStatus] = useState("unknown"); // unknown, success, error
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    // Check connection when component mounts
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet(API_ENDPOINTS.CATEGORIES);
      setStatus("success");
      setLastChecked(new Date());
      console.log(
        "Backend connection verified with",
        data.length,
        "categories"
      );
    } catch (error) {
      console.error("Backend connection failed:", error);
      setStatus("error");
      setLastChecked(new Date());
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    if (isLoading) return;

    if (status === "success") {
      // Show success alert with details
      Alert.alert(
        "Backend Connection Status",
        `✅ Connected successfully to:\n${API_BASE_URL}\n\nLast checked: ${lastChecked?.toLocaleTimeString()}`,
        [{ text: "OK" }]
      );
    } else if (status === "error") {
      // Try reconnecting
      checkConnection();
    } else {
      // First time checking
      checkConnection();
    }
  };

  // Return empty if we haven't checked yet
  if (status === "unknown" && !isLoading) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        status === "success" ? styles.successContainer : styles.errorContainer,
      ]}
      onPress={handlePress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Ionicons
          name={status === "success" ? "cloud-done" : "cloud-offline"}
          size={20}
          color="#fff"
        />
      )}
      <Text style={styles.text}>
        {isLoading
          ? "Checking backend connection..."
          : status === "success"
            ? "Backend connected"
            : "Backend connection failed"}
      </Text>
      <View style={styles.spacer} />
      <Ionicons name="refresh" size={18} color="#fff" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  successContainer: {
    backgroundColor: Colors.success || "#4CAF50",
  },
  errorContainer: {
    backgroundColor: Colors.error || "#F44336",
  },
  text: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 8,
  },
  spacer: {
    flex: 1,
  },
});

export default BackendStatusBanner;
