import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { signup, login, getCurrentUser } from "../utils/api";

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<'user' | 'manager' | 'admin'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (!isLogin) {
      if (!name.trim()) {
        Alert.alert("Error", "Please enter your name");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters long");
        return;
      }
    }

    setLoading(true);

    try {
      console.log("🔄 Starting authentication process...");
      
      if (isLogin) {
        // Login
        console.log("📝 Attempting login for:", email.trim());
        const response = await login({
          email: email.trim(),
          password: password,
        });
        
        const userRole = response.user.role;
        const welcomeMessage = `Welcome back, ${response.user.name}!${userRole === 'admin' || userRole === 'manager' ? ` (${userRole.charAt(0).toUpperCase() + userRole.slice(1)})` : ''}`;
        
        console.log("✅ Login successful:", response);
        console.log("🚀 Navigating to home screen...");
        
        // Navigate immediately after successful login
        console.log("🚀 Attempting navigation to /(tabs)...");
        
        // Use setTimeout to ensure the state updates are processed first
        setTimeout(() => {
          try {
            console.log("📱 Executing router.replace to /(tabs)...");
            router.replace("/(tabs)");
            console.log("✅ Navigation command executed successfully");
          } catch (navError) {
            console.error("❌ Primary navigation failed:", navError);
            
            // Fallback navigation attempts
            console.log("🔄 Trying fallback navigation methods...");
            
            try {
              router.push("/(tabs)");
              console.log("✅ Fallback push navigation successful");
            } catch (pushError) {
              console.error("❌ Push navigation failed:", pushError);
              
              // Final fallback - navigate to home tab directly
              try {
                router.navigate("/(tabs)");
                console.log("✅ Navigate fallback successful");
              } catch (finalError) {
                console.error("❌ All navigation methods failed:", finalError);
                Alert.alert(
                  "Navigation Issue",
                  "Login was successful but navigation failed. Please close and reopen the app.",
                  [{ text: "OK" }]
                );
              }
            }
          }
        }, 250);
        
        // Show welcome message after navigation
        setTimeout(() => {
          Alert.alert("Welcome Back!", welcomeMessage);
        }, 500);
      } else {
        // Sign up
        const signupData = {
          name: name.trim(),
          email: email.trim(),
          password: password,
          ...(isAdminMode && { role: role })
        };
        
        console.log("📝 Attempting signup with data:", { ...signupData, password: "[HIDDEN]" });
        const response = await signup(signupData);
        console.log("✅ Signup successful:", response);
        
        // Clear form and switch to login mode after successful registration
        setIsLogin(true);
        setEmail(email.trim()); // Keep the email for convenience
        setPassword("");
        setConfirmPassword("");
        setName("");
        setRole('user');
        setIsAdminMode(false);
        
        // Show success message and prompt to login
        Alert.alert(
          "Registration Successful",
          "Your account has been created successfully! Please log in to continue.",
          [{ text: "OK" }]
        );
      }
    } catch (error: any) {
      console.error("❌ Authentication failed:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = "Authentication failed. Please try again.";
      
      if (error.message === "Failed to fetch") {
        errorMessage = "Cannot connect to server. Please check your internet connection and make sure the backend server is running.";
      } else if (error.message.includes("Invalid email or password")) {
        errorMessage = "Invalid email or password. Please check your credentials.";
      } else if (error.message.includes("timeout")) {
        errorMessage = "Request timed out. Please check your connection and try again.";
      }
      
      Alert.alert(
        "Login Failed",
        errorMessage + "\n\nTip: Try using 'testlogin@example.com' with password 'password123' for testing."
      );
    } finally {
      console.log("🏁 Authentication process completed");
      setLoading(false);
    }
  };

  const handleSocialAuth = (platform: string) => {
    Alert.alert("Social Login", `Continue with ${platform}`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Continue",
        onPress: () => {
          // Simulate social login
          setTimeout(() => {
            router.push("/(tabs)");
          }, 1000);
        },
      },
    ]);
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setName("");
    setRole('user');
    setIsAdminMode(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/welcome" as any)}
            >
              <Ionicons name="chevron-back" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={48} color="#4CAF50" />
            </View>
            <Text style={styles.appName}>EcoSeparate</Text>
            <Text style={styles.tagline}>Learn. Separate. Recycle.</Text>
          </View>

          {/* Auth Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </Text>
            <Text style={styles.formSubtitle}>
              {isLogin
                ? "Sign in to continue your eco journey"
                : "Join thousands of eco-warriors worldwide"}
            </Text>

            {/* Name Input (Sign Up only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  placeholderTextColor="#999"
                />
              </View>
            )}

            {/* Admin Mode Toggle (Sign Up only) */}
            {!isLogin && (
              <TouchableOpacity 
                style={styles.adminToggle}
                onPress={() => setIsAdminMode(!isAdminMode)}
              >
                <Text style={styles.adminToggleText}>
                  {isAdminMode ? "👤 Regular User Signup" : "🔑 Admin Signup"}
                </Text>
              </TouchableOpacity>
            )}

            {/* Role Selection (Admin Sign Up only) */}
            {!isLogin && isAdminMode && (
              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>Select Role:</Text>
                <View style={styles.roleButtons}>
                  {(['user', 'manager', 'admin'] as const).map((roleOption) => (
                    <TouchableOpacity
                      key={roleOption}
                      style={[
                        styles.roleButton,
                        role === roleOption && styles.selectedRoleButton,
                      ]}
                      onPress={() => setRole(roleOption)}
                    >
                      <Text
                        style={[
                          styles.roleButtonText,
                          role === roleOption && styles.selectedRoleButtonText,
                        ]}
                      >
                        {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#666"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password (Sign Up only) */}
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}

            {/* Auth Button */}
            <TouchableOpacity
              style={[styles.authButton, loading && styles.disabledButton]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.authButtonText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.authButtonText}>
                  {isLogin ? "Sign In" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialAuth("Google")}
              >
                <Ionicons name="logo-google" size={24} color="#DB4437" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialAuth("Apple")}
              >
                <Ionicons name="logo-apple" size={24} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialAuth("Facebook")}
              >
                <Ionicons name="logo-facebook" size={24} color="#4267B2" />
              </TouchableOpacity>
            </View>

            {/* Toggle Auth Mode */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </Text>
              <TouchableOpacity onPress={toggleAuthMode}>
                <Text style={styles.toggleLink}>
                  {isLogin ? "Sign Up" : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms and Privacy (Sign Up only) */}
            {!isLogin && (
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By creating an account, you agree to our{" "}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>
            )}
          </View>

          {/* Guest Access */}
          <View style={styles.guestContainer}>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => router.push("/(tabs)")}
            >
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
              <Ionicons name="arrow-forward" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#f8f9fa",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "500",
  },
  authButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 16,
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  toggleText: {
    fontSize: 14,
    color: "#666",
  },
  toggleLink: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  termsContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  termsText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    lineHeight: 18,
  },
  termsLink: {
    color: "#4CAF50",
    fontWeight: "500",
  },
  guestContainer: {
    alignItems: "center",
    paddingBottom: 30,
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  guestButtonText: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  adminToggle: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "#f0f8ff",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  adminToggleText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#f8f9fa",
    alignItems: "center",
  },
  selectedRoleButton: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E8",
  },
  roleButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  selectedRoleButtonText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});
