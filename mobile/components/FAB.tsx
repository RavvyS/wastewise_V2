import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "../constants/Colors";

const { width, height } = Dimensions.get("window");

interface FABProps {
  onEcoZenPress?: () => void;
  onCameraPress?: () => void;
}

export default function FAB({ onEcoZenPress, onCameraPress }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleFAB = () => {
    const toValue = isOpen ? 0 : 1;

    Animated.spring(animation, {
      toValue,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    setIsOpen(!isOpen);
  };

  const handleEcoZenPress = () => {
    setIsOpen(false);
    Animated.spring(animation, {
      toValue: 0,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    if (onEcoZenPress) {
      onEcoZenPress();
    } else {
      router.push("/chatbot");
    }
  };

  const handleCameraPress = () => {
    setIsOpen(false);
    Animated.spring(animation, {
      toValue: 0,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    if (onCameraPress) {
      onCameraPress();
    } else {
      router.push("/camera-detection");
    }
  };

  const mainButtonRotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const subButtonScale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const subButtonOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const ecoZenTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -80],
  });

  const cameraTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -140],
  });

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      {isOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={toggleFAB}
        />
      )}

      {/* EcoZen AI Button */}
      <Animated.View
        style={[
          styles.subFAB,
          styles.ecoZenFAB,
          {
            transform: [
              { translateY: ecoZenTranslateY },
              { scale: subButtonScale },
            ],
            opacity: subButtonOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.subFABButton, styles.ecoZenButton]}
          onPress={handleEcoZenPress}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.subFABLabel}>Ask EcoZen</Text>
      </Animated.View>

      {/* Camera Detection Button */}
      <Animated.View
        style={[
          styles.subFAB,
          styles.cameraFAB,
          {
            transform: [
              { translateY: cameraTranslateY },
              { scale: subButtonScale },
            ],
            opacity: subButtonOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.subFABButton, styles.cameraButton]}
          onPress={handleCameraPress}
          activeOpacity={0.8}
        >
          <Ionicons name="camera" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.subFABLabel}>Detect Symbol</Text>
      </Animated.View>

      {/* Main FAB Button */}
      <Animated.View
        style={[
          styles.mainFAB,
          {
            transform: [{ rotate: mainButtonRotation }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.mainFABButton}
          onPress={toggleFAB}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: width < 400 ? 80 : 100, // Adjust for smaller screens
    right: width < 400 ? 16 : 20,
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: -height,
    left: -width,
    width: width * 2,
    height: height * 2,
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Slightly darker for better contrast
  },
  mainFAB: {
    zIndex: 3,
  },
  mainFABButton: {
    width: width < 400 ? 56 : 60, // Responsive sizing
    height: width < 400 ? 56 : 60,
    borderRadius: width < 400 ? 28 : 30,
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    // Better touch feedback
    borderWidth: 0,
  },
  subFAB: {
    position: "absolute",
    alignItems: "center",
    zIndex: 2,
  },
  ecoZenFAB: {
    right: 5,
  },
  cameraFAB: {
    right: 5,
  },
  subFABButton: {
    width: width < 400 ? 48 : 50, // Responsive sizing
    height: width < 400 ? 48 : 50,
    borderRadius: width < 400 ? 24 : 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Minimum touch target of 44px
    minWidth: 44,
    minHeight: 44,
  },
  ecoZenButton: {
    backgroundColor: Colors.primary,
  },
  cameraButton: {
    backgroundColor: Colors.accent,
  },
  subFABLabel: {
    marginTop: 8,
    fontSize: width < 400 ? 11 : 12, // Responsive font size
    color: "#333",
    fontWeight: "600",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)", // Better contrast
    paddingHorizontal: width < 400 ? 6 : 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    // Better readability
    lineHeight: width < 400 ? 14 : 16,
    maxWidth: 80, // Prevent too wide labels
  },
});
