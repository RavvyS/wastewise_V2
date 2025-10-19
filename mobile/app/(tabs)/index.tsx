import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { apiGet, API_ENDPOINTS } from "../../utils/api";
import FAB from "../../components/FAB";
import { Colors } from "../../constants/Colors";
import BackendStatusBanner from "../../components/BackendStatusBanner";

export default function HomeScreen() {
  const [testing, setTesting] = useState(false);

  const testBackendConnection = async () => {
    setTesting(true);
    try {
      const categories = await apiGet(API_ENDPOINTS.CATEGORIES_WITH_ITEMS);
      Alert.alert(
        "✅ Backend Connected!",
        `Successfully connected to backend!\n\nFound ${categories.length} waste categories with items.`
      );
    } catch (error) {
      console.error("Backend connection test failed:", error);
      Alert.alert(
        "❌ Connection Failed",
        "Could not connect to backend server. Make sure it's running on port 5001."
      );
    } finally {
      setTesting(false);
    }
  };

  const quickActions = [
    {
      id: 1,
      title: "Waste Log",
      icon: "create-outline" as const,
      color: Colors.secondary,
      description: "Log your daily recycling",
      route: "/waste-log",
    },
    {
      id: 2,
      title: "Recycling Locations",
      icon: "location-outline" as const,
      color: Colors.primary,
      description: "Find nearby centers",
      route: "/locations",
    },
    {
      id: 3,
      title: "Learning Hub",
      icon: "library-outline" as const,
      color: Colors.accent,
      description: "Quizzes & articles",
      route: "/learning",
    },
    {
      id: 4,
      title: "AI Tools",
      icon: "sparkles-outline" as const,
      color: "#9C27B0", // Purple for AI features
      description: "Chat & Waste Detection",
      route: "/ai-tools",
    },
  ];

  const handleNavigation = (route: string) => {
    // AIChat is a standalone screen, not in tabs
    if (route === "/AIChat") {
      router.push("/AIChat" as any);
    } else {
      // Remove the leading slash and navigate to the tab
      const tabRoute = route.substring(1);
      router.push(`/(tabs)/${tabRoute}` as any);
    }
  };

  const recentActivities = [
    {
      id: 1,
      type: "Waste Log",
      status: "5kg plastic recycled",
      date: "2 hours ago",
      icon: "leaf" as const,
      color: "#4CAF50",
    },
    {
      id: 2,
      type: "Quiz Completed",
      status: "Separation Basics - 8/10",
      date: "1 day ago",
      icon: "trophy" as const,
      color: "#FF9800",
    },
    {
      id: 3,
      type: "Location Added",
      status: "New recycling center",
      date: "3 days ago",
      icon: "location" as const,
      color: "#2196F3",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <BackendStatusBanner />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.username}>Welcome to your eco journey!</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={testBackendConnection}
              disabled={testing}
            >
              <Ionicons
                name={testing ? "refresh" : "cloud-outline"}
                size={20}
                color={Colors.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => handleNavigation("/profile")}
            >
              <Ionicons
                name="person-circle-outline"
                size={40}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>45kg</Text>
            <Text style={styles.statLabel}>Recycled</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#FF9800" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Quizzes</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="location" size={24} color="#2196F3" />
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Locations</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionCard, { borderColor: action.color }]}
                activeOpacity={0.7}
                onPress={() => handleNavigation(action.route)}
              >
                <View
                  style={[styles.actionIcon, { backgroundColor: action.color }]}
                >
                  <Ionicons name={action.icon} size={24} color="white" />
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>
                  {action.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityContainer}>
            {recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityIcon,
                    { backgroundColor: activity.color },
                  ]}
                >
                  <Ionicons name={activity.icon} size={16} color="white" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityType}>{activity.type}</Text>
                  <Text style={styles.activityStatus}>{activity.status}</Text>
                </View>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Reminder */}
        <View style={styles.section}>
          <View style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#4CAF50"
              />
              <Text style={styles.reminderTitle}>Daily Reminder</Text>
            </View>
            <Text style={styles.reminderMessage}>
              Don't forget to log your daily recycling activities!
            </Text>
            <TouchableOpacity
              style={styles.reminderButton}
              onPress={() => handleNavigation("/waste-log")}
            >
              <Text style={styles.reminderButtonText}>Add Today's Log</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Educational Tip */}
        <View style={styles.section}>
          <View style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Ionicons name="bulb-outline" size={24} color="#FF9800" />
              <Text style={styles.tipTitle}>Today's Eco Tip</Text>
            </View>
            <Text style={styles.tipText}>
              Did you know? Plastic bottles can be recycled into clothing
              fibers! Make sure to separate your plastic waste properly.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
  },
  username: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  profileButton: {
    padding: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  activityContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityType: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  activityStatus: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  activityDate: {
    fontSize: 12,
    color: "#999",
  },
  reminderCard: {
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  reminderMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  reminderButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  reminderButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  tipCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  testButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: Colors.backgroundDark,
  },
});
