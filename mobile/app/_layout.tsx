import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react'; // React import is a good practice in TSX/JSX files

export default function AppLayout(): React.ReactElement {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3498db',
      }}
    >
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          // The type of the destructured props { color, size } is usually inferred
          // by expo-router's Tabs component, which are strings and numbers respectively.
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="waste"
        options={{
          title: 'Waste',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trash-bin-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: 'Chatbot',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}