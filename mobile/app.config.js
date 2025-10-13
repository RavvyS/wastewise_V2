export default {
  expo: {
    name: "EcoZen AI",
    slug: "ecozen-ai",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/logo.png",
    scheme: "ecozen",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    description: "Learn. Separate. Recycle. - AI-powered waste separation education and recycling guidance.",
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSMicrophoneUsageDescription:
          "EcoZen AI needs microphone access to listen to your voice input for the chat feature.",
        NSSpeechRecognitionUsageDescription:
          "EcoZen AI uses speech recognition services to convert your voice into text for the chat."
      }
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#1B4A5C",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.ecozen.ai",
      permissions: ["android.permission.RECORD_AUDIO"]
    },
    web: {
      output: "static",
      favicon: "./assets/images/logo.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/logo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#F8F9FA",
          dark: {
            backgroundColor: "#1B4A5C"
          }
        }
      ],
      "expo-web-browser",
      "expo-sqlite"
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },
    extra: {
      OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY
    }
  }
};
