import { Redirect } from "expo-router";

export default function Index() {
  // For new users, redirect to welcome screen
  // In a real app, you'd check if user is authenticated and has seen onboarding
  const hasSeenOnboarding = false; // This would come from AsyncStorage or similar
  const isAuthenticated = false; // This would come from your auth context

  if (!hasSeenOnboarding) {
    return <Redirect href="/welcome" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return <Redirect href="/(tabs)" />;
}
