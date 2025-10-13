import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Switch,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { logout, getCurrentUser } from "../../utils/api";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  totalRecycled: number;
  streakDays: number;
  level: number;
  points: number;
}

interface Setting {
  id: string;
  title: string;
  description: string;
  type: "switch" | "navigation";
  value?: boolean;
  icon: string;
  color: string;
}

export default function ProfileScreen() {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [achievementsModalVisible, setAchievementsModalVisible] =
    useState(false);

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 234-567-8900",
    location: "New York, NY",
    joinDate: "January 2024",
    totalRecycled: 127.5,
    streakDays: 23,
    level: 5,
    points: 1250,
  });

  // User role state - default 'user', can be 'admin'
  const [userRole, setUserRole] = useState<'user' | 'manager' | 'admin'>('user');

  // Fetch current user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserRole(user.role || 'user');
          // You can also update userProfile here if needed
          console.log('👤 User role:', user.role);
        }
      } catch (error) {
        console.log('ℹ️ Could not fetch user data, using defaults');
      }
    };
    fetchUser();
  }, []);

  // Settings state
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: "notifications",
      title: "Push Notifications",
      description: "Receive daily reminders and updates",
      type: "switch",
      value: true,
      icon: "notifications",
      color: "#4CAF50",
    },
    {
      id: "reminders",
      title: "Daily Reminders",
      description: "Get reminded to log your recycling",
      type: "switch",
      value: true,
      icon: "alarm",
      color: "#FF9800",
    },
    {
      id: "privacy",
      title: "Privacy Settings",
      description: "Manage your data and privacy preferences",
      type: "navigation",
      icon: "shield-checkmark",
      color: "#2196F3",
    },
    {
      id: "help",
      title: "Help & Support",
      description: "Get help and contact support",
      type: "navigation",
      icon: "help-circle",
      color: "#9C27B0",
    },
  ]);

  // Form state for editing profile
  const [editForm, setEditForm] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    location: userProfile.location,
  });

  const achievements = [
    {
      id: 1,
      title: "First Steps",
      description: "Log your first recycling activity",
      icon: "footsteps",
      color: "#4CAF50",
      completed: true,
      date: "Jan 15, 2024",
    },
    {
      id: 2,
      title: "Streak Master",
      description: "Maintain a 7-day logging streak",
      icon: "flame",
      color: "#FF5722",
      completed: true,
      date: "Feb 3, 2024",
    },
    {
      id: 3,
      title: "Eco Warrior",
      description: "Recycle 100kg of materials",
      icon: "leaf",
      color: "#4CAF50",
      completed: true,
      date: "Mar 12, 2024",
    },
    {
      id: 4,
      title: "Knowledge Seeker",
      description: "Complete 5 learning quizzes",
      icon: "school",
      color: "#2196F3",
      completed: false,
      progress: 3,
      total: 5,
    },
    {
      id: 5,
      title: "Community Helper",
      description: "Share 10 recycling tips",
      icon: "people",
      color: "#9C27B0",
      completed: false,
      progress: 2,
      total: 10,
    },
  ];

  const toggleSetting = (settingId: string) => {
    setSettings(
      settings.map((setting) =>
        setting.id === settingId && setting.type === "switch"
          ? { ...setting, value: !setting.value }
          : setting
      )
    );
  };

  const handleSettingPress = (setting: Setting) => {
    if (setting.type === "switch") {
      toggleSetting(setting.id);
    } else {
      Alert.alert(setting.title, `Opening ${setting.title.toLowerCase()}...`);
    }
  };

  const saveProfile = () => {
    setUserProfile({
      ...userProfile,
      ...editForm,
    });
    setEditModalVisible(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const getLevelProgress = () => {
    const currentLevelPoints = (userProfile.level - 1) * 300;
    const nextLevelPoints = userProfile.level * 300;
    const progress =
      (userProfile.points - currentLevelPoints) /
      (nextLevelPoints - currentLevelPoints);
    return Math.max(0, Math.min(1, progress));
  };

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            console.log("🚪 User confirmed sign out - starting logout process...");
            
            try {
              // Step 1: Clear authentication token
              console.log("🗑️ Clearing authentication token...");
              logout();
              console.log("✅ Token cleared successfully");
              
              // Step 2: Navigate to auth screen immediately
              console.log("🔄 Attempting navigation to auth screen...");
              
              // Use setTimeout to ensure state updates are processed
              setTimeout(() => {
                try {
                  console.log("� Executing router.replace('/auth')...");
                  router.replace("/auth");
                  console.log("✅ Primary navigation successful");
                } catch (replaceError) {
                  console.error("❌ Replace navigation failed:", replaceError);
                  
                  // Fallback 1: Try push navigation
                  try {
                    console.log("🔄 Trying fallback push navigation...");
                    router.push("/auth");
                    console.log("✅ Push navigation successful");
                  } catch (pushError) {
                    console.error("❌ Push navigation failed:", pushError);
                    
                    // Fallback 2: Try navigate
                    try {
                      console.log("🔄 Trying navigate fallback...");
                      router.navigate("/auth");
                      console.log("✅ Navigate fallback successful");
                    } catch (navigateError) {
                      console.error("❌ All navigation methods failed:", navigateError);
                      
                      // Final fallback: Show manual instruction
                      Alert.alert(
                        "Signed Out",
                        "You have been signed out successfully. Please manually navigate to the login screen.",
                        [
                          {
                            text: "Go to Login",
                            onPress: () => {
                              // Force navigation with delay
                              setTimeout(() => {
                                router.replace("/auth");
                              }, 100);
                            }
                          }
                        ]
                      );
                    }
                  }
                }
              }, 100);
              
            } catch (error) {
              console.error("❌ Critical error during sign out:", error);
              Alert.alert(
                "Sign Out Error", 
                "An error occurred during sign out. Please restart the app.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      // Still try to navigate to auth screen
                      router.replace("/auth");
                    }
                  }
                ]
              );
            }
          },
        },
      ]
    );
  };

  const handleShareApp = () => {
    Alert.alert(
      "Share ECOZEN",
      "Help your friends join the eco-friendly movement!",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Share",
          onPress: () => {
            // In a real app, you would use React Native Share API
            Alert.alert(
              "Share App",
              "Share link: https://ecozen.app\n\nJoin me on ECOZEN - the best way to track your recycling and help the environment! 🌱"
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userProfile.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{userProfile.level}</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={styles.profileEmail}>{userProfile.email}</Text>
            <Text style={styles.joinDate}>
              Member since {userProfile.joinDate}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setEditModalVisible(true)}
          >
            <Ionicons name="create-outline" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Level Progress */}
        <View style={styles.levelProgressContainer}>
          <View style={styles.levelProgressHeader}>
            <Text style={styles.levelProgressTitle}>
              Level {userProfile.level}
            </Text>
            <Text style={styles.pointsText}>{userProfile.points} points</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${getLevelProgress() * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.nextLevelText}>
            {userProfile.level * 300 - userProfile.points} points to level{" "}
            {userProfile.level + 1}
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="leaf" size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>{userProfile.totalRecycled}kg</Text>
            <Text style={styles.statLabel}>Total Recycled</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={24} color="#FF5722" />
            <Text style={styles.statNumber}>{userProfile.streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color="#FFD700" />
            <Text style={styles.statNumber}>
              {achievements.filter((a) => a.completed).length}
            </Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setAchievementsModalVisible(true)}
            >
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.quickActionText}>Achievements</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setSettingsModalVisible(true)}
            >
              <Ionicons name="settings" size={24} color="#666" />
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
            
            {/* Show "Send Inquiry" only for regular users */}
            {userRole === 'user' && (
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => router.push('/screens/inquiries/InquiriesScreen')}
              >
                <Ionicons name="send" size={24} color="#4CAF50" />
                <Text style={styles.quickActionText}>Send Inquiry</Text>
              </TouchableOpacity>
            )}
            
            {/* Show "Answer Inquiries" only for admins */}
            {userRole === 'admin' && (
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => router.push('/screens/inquiries/AnswerInquiriesScreen')}
              >
                <Ionicons name="mail" size={24} color="#2196F3" />
                <Text style={styles.quickActionText}>Answer Inquiries</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={handleShareApp}
            >
              <Ionicons name="share" size={24} color="#FF9800" />
              <Text style={styles.quickActionText}>Share App</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => {
                // Simple direct sign out - no confirmation
                console.log("🚪 Sign out button pressed - executing logout...");
                logout();
                console.log("🔄 Navigating to auth page...");
                router.replace("/auth");
                console.log("✅ Sign out navigation completed");
              }}
            >
              <Ionicons name="log-out" size={24} color="#F44336" />
              <Text style={styles.quickActionText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Achievements */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          {achievements
            .filter((a) => a.completed)
            .slice(0, 3)
            .map((achievement) => (
              <View key={achievement.id} style={styles.achievementCard}>
                <View
                  style={[
                    styles.achievementIcon,
                    { backgroundColor: achievement.color },
                  ]}
                >
                  <Ionicons
                    name={achievement.icon as any}
                    size={20}
                    color="white"
                  />
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                  <Text style={styles.achievementDate}>
                    Completed on {achievement.date}
                  </Text>
                </View>
              </View>
            ))}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.name}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, name: text })
                  }
                  placeholder="Enter your name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Email</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.email}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, email: text })
                  }
                  placeholder="Enter your email"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.phone}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, phone: text })
                  }
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Location</Text>
                <TextInput
                  style={styles.formInput}
                  value={editForm.location}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, location: text })
                  }
                  placeholder="Enter your location"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.settingsList}>
              {settings.map((setting) => (
                <TouchableOpacity
                  key={setting.id}
                  style={styles.settingItem}
                  onPress={() => handleSettingPress(setting)}
                >
                  <View
                    style={[
                      styles.settingIcon,
                      { backgroundColor: setting.color },
                    ]}
                  >
                    <Ionicons
                      name={setting.icon as any}
                      size={20}
                      color="white"
                    />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{setting.title}</Text>
                    <Text style={styles.settingDescription}>
                      {setting.description}
                    </Text>
                  </View>
                  {setting.type === "switch" ? (
                    <Switch
                      value={setting.value}
                      onValueChange={() => toggleSetting(setting.id)}
                      trackColor={{ false: "#f0f0f0", true: "#4CAF50" }}
                      thumbColor={setting.value ? "#fff" : "#f4f3f4"}
                    />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#ccc" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Achievements Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={achievementsModalVisible}
        onRequestClose={() => setAchievementsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Achievements</Text>
              <TouchableOpacity
                onPress={() => setAchievementsModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.achievementsList}>
              {achievements.map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.fullAchievementCard,
                    !achievement.completed && styles.incompleteAchievement,
                  ]}
                >
                  <View
                    style={[
                      styles.achievementIcon,
                      { backgroundColor: achievement.color },
                    ]}
                  >
                    <Ionicons
                      name={achievement.icon as any}
                      size={24}
                      color={achievement.completed ? "white" : "#ccc"}
                    />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text
                      style={[
                        styles.achievementTitle,
                        !achievement.completed && styles.incompleteText,
                      ]}
                    >
                      {achievement.title}
                    </Text>
                    <Text
                      style={[
                        styles.achievementDescription,
                        !achievement.completed && styles.incompleteText,
                      ]}
                    >
                      {achievement.description}
                    </Text>
                    {achievement.completed ? (
                      <Text style={styles.achievementDate}>
                        Completed on {achievement.date}
                      </Text>
                    ) : achievement.progress && achievement.total ? (
                      <View style={styles.progressContainer}>
                        <Text style={styles.progressText}>
                          {achievement.progress}/{achievement.total}
                        </Text>
                        <View style={styles.progressBar}>
                          <View
                            style={[
                              styles.progressFill,
                              {
                                width: `${
                                  (achievement.progress / achievement.total) *
                                  100
                                }%`,
                              },
                            ]}
                          />
                        </View>
                      </View>
                    ) : null}
                  </View>
                  {achievement.completed && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#4CAF50"
                    />
                  )}
                </View>
              ))}
            </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    marginBottom: 16,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  levelBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  levelText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: "#999",
  },
  editButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#E8F5E8",
  },
  levelProgressContainer: {
    backgroundColor: "white",
    padding: 20,
    marginBottom: 16,
  },
  levelProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  levelProgressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  pointsText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 4,
  },
  nextLevelText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
  },
  quickActionButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: "47%",
    marginHorizontal: 4,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
    fontWeight: "500",
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: 12,
    color: "#999",
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
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
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
    borderRadius: 12,
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
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  settingsList: {
    flex: 1,
    padding: 20,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
  },
  achievementsList: {
    flex: 1,
    padding: 20,
  },
  fullAchievementCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "white",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  incompleteAchievement: {
    borderColor: "#f0f0f0",
    backgroundColor: "#f8f9fa",
  },
  incompleteText: {
    color: "#999",
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
});
