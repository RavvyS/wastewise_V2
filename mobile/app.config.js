module.exports = {
  expo: {
    name: "EcoZen",
    slug: "ecozen-ai",
    version: "1.0.0",
    projectId: "7959843a-4deb-4b60-addc-3a69ce71882d",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "ecozen",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    description:
      "Learn. Separate. Recycle. - AI-powered waste separation education and recycling guidance.",
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#1B4A5C",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.ecozen.ai",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      output: "static",
      favicon: "./assets/images/logo.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow EcoZen AI to use your location to notify you about nearby recycling centers.",
          locationAlwaysPermission: "Allow EcoZen AI to use your location in the background to notify you about nearby recycling centers.",
          locationWhenInUsePermission: "Allow EcoZen AI to use your location to find nearby recycling centers.",
          isAndroidBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true
        }
      ],
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#F8F9FA",
          dark: {
            backgroundColor: "#1B4A5C",
          },
        },
      ],
      [
        "expo-notifications",
        {
          sounds: [],
          icon: "./assets/images/logo.png",
        },
      ],
      "expo-web-browser",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: "7959843a-4deb-4b60-addc-3a69ce71882d",
      },
    },
  },
};
