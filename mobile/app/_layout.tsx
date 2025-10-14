import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import NotificationHandler from "../components/NotificationHandler";

// Register background location task BEFORE app renders
// This ensures the task is defined when the app starts, not during component mount
import '../services/locationTrackingService';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <NotificationHandler />
      <Stack
        screenOptions={{
          headerShown: false, // We'll handle headers in individual screens
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
