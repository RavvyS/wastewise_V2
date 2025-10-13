// app/_layout.tsx

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
// Import the DatabaseProvider component
import DatabaseProvider from './providers/DatabaseProvider'; 
import NotificationHandler from "../components/NotificationHandler";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      
      {/* WRAP THE ENTIRE NAVIGATION STACK WITH THE DATABASE PROVIDER */}
      <DatabaseProvider>
        <Stack
          screenOptions={{
            headerShown: false, // You can override this in specific screens
          }}
        >
          {/* Main Learning Hub Screen */}
          <Stack.Screen name="index" options={{ title: 'Learning Hub' }} />
          
          {/* Detail/Read Routes */}
          <Stack.Screen name="ArticleDetail" options={{ title: 'Article Details', headerShown: true }} />
          <Stack.Screen name="QuizDetail" options={{ title: 'Take Quiz', headerShown: true }} />
          
          {/* CRUD Routes (Presented as Modals) */}
          <Stack.Screen name="create" options={{ 
            title: 'Create New Content', 
            presentation: 'modal',
            headerShown: true
          }} />
          <Stack.Screen name="edit/[id]" options={{ 
            title: 'Edit Content', 
            presentation: 'modal',
            headerShown: true
          }} />
          
          {/* Keep your existing routes if they are necessary for your app's structure: */}
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </DatabaseProvider>
=======
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