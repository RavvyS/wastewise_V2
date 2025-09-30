import React, { useState, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

interface OnboardingSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

export default function WelcomeScreen() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const slides: OnboardingSlide[] = [
    {
      id: 1,
      title: "Learn. Separate. Recycle.",
      subtitle: "Welcome to EcoSeparate",
      description:
        "Your journey to becoming an eco-warrior starts here. Learn proper waste separation and make a positive impact on our planet.",
      icon: "leaf",
      color: "#4CAF50",
      backgroundColor: "#E8F5E8",
    },
    {
      id: 2,
      title: "Track Your Impact",
      subtitle: "Monitor Your Progress",
      description:
        "Log your daily recycling activities and watch your positive environmental impact grow day by day.",
      icon: "analytics",
      color: "#2196F3",
      backgroundColor: "#E3F2FD",
    },
    {
      id: 3,
      title: "Find Recycling Centers",
      subtitle: "Locate Nearby Centers",
      description:
        "Discover recycling centers near you with detailed information about accepted materials and operating hours.",
      icon: "location",
      color: "#FF9800",
      backgroundColor: "#FFF8E1",
    },
    {
      id: 4,
      title: "Learn & Grow",
      subtitle: "Educational Content",
      description:
        "Take quizzes, read articles, and expand your knowledge about waste separation and environmental protection.",
      icon: "school",
      color: "#9C27B0",
      backgroundColor: "#F3E5F5",
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      const nextIndex = currentSlide + 1;
      setCurrentSlide(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
    } else {
      // Navigate to login/auth page
      router.push("/auth" as any);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      const prevIndex = currentSlide - 1;
      setCurrentSlide(prevIndex);
      scrollViewRef.current?.scrollTo({
        x: prevIndex * width,
        animated: true,
      });
    }
  };

  const skipToAuth = () => {
    router.push("/auth" as any);
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header with Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.skipButton} onPress={skipToAuth}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.slidesContainer}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: slide.backgroundColor },
              ]}
            >
              <View
                style={[styles.iconCircle, { backgroundColor: slide.color }]}
              >
                <Ionicons name={slide.icon as any} size={60} color="white" />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={[styles.slideSubtitle, { color: slide.color }]}>
                {slide.subtitle}
              </Text>
              <Text style={styles.slideDescription}>{slide.description}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Page Indicators */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              {
                backgroundColor:
                  currentSlide === index
                    ? slides[currentSlide].color
                    : "#E0E0E0",
                width: currentSlide === index ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {currentSlide > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={prevSlide}>
            <Ionicons name="chevron-back" size={24} color="#666" />
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: slides[currentSlide].color },
          ]}
          onPress={nextSlide}
        >
          <Text style={styles.nextButtonText}>
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Features Preview */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.featureText}>Track daily recycling</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.featureText}>Educational content</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.featureText}>Find recycling centers</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  skipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  skipText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    width: width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  slideSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  slideDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: "#f8f9fa",
  },
  navButtonText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginTop: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 6,
  },
});
