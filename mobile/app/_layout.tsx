import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import DatabaseProvider from "./providers/DatabaseProvider";
import NotificationHandler from "../components/NotificationHandler";

// Register background location task BEFORE app renders
// This ensures the task is defined when the app starts, not during component mount
import '../services/locationTrackingService';

export default function RootLayout() {
  return (
    // Providers like DatabaseProvider should wrap the entire app
    <DatabaseProvider>
      <>
        {/* Set the status bar style for the app */}
        <StatusBar style="dark" />

        {/* The NotificationHandler can be placed here if it doesn't render any UI */}
        <NotificationHandler />

        {/* This is the main Stack navigator for the entire app */}
        <Stack screenOptions={{ headerShown: false }}>
          {/* The primary entry point is the (tabs) layout, which contains your main screens. */}
          <Stack.Screen name="(tabs)" />

          {/* Authentication and onboarding screens */}
          <Stack.Screen name="welcome" />
          <Stack.Screen name="auth" />

          {/* Detail screens that should be pushed on top of the tabs */}
          <Stack.Screen
            name="ArticleDetail"
            options={{
              title: "Article",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="QuizDetail"
            options={{
              title: "Quiz",
              headerShown: true,
            }}
          />

          {/* Other standalone screens */}
          <Stack.Screen
            name="AIChat"
            options={{
              headerShown: false,
            }}
          />

          {/* CRUD screens presented as modals */}
          <Stack.Screen
            name="create"
            options={{
              title: "Create Content",
              presentation: "modal",
              headerShown: true,
            }}
          />
          <Stack.Screen
            name="edit/[id]"
            options={{
              title: "Edit Content",
              presentation: "modal",
              headerShown: true,
            }}
          />
        </Stack>
      </>
    </DatabaseProvider>
  );
}
