// app/create.tsx
import React from 'react';
import { 
  View, 
  Text // <-- FIX: Import Text to be used as a JSX component
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ContentForm from './ContentForm'; // Import the form

// Define the expected URL parameters for this screen
interface CreateParams {
  type: 'article' | 'quiz';
}

export default function CreateContentScreen() {
  // Read the 'type' param passed from the main screen's navigation Link
  const params = useLocalSearchParams() as unknown as CreateParams;
  const contentType = params.type;

  if (!contentType || (contentType !== 'article' && contentType !== 'quiz')) {
    // This is the part that caused the error without the 'Text' import
    return <View><Text>Error: Invalid content type selected.</Text></View>;
  }

  return <ContentForm type={contentType} />;
}