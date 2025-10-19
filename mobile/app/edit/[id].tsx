// app/edit/[id].tsx
import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ContentForm from "../ContentForm";

// Import the service functions
import { getContentById, Article, Quiz } from '../../services/sqliteService';

interface EditParams {
  id: string;
  type: 'article' | 'quiz';
}

export default function EditScreen() {
  const params = useLocalSearchParams() as unknown as EditParams;
  const { id, type } = params;
  
  const [contentData, setContentData] = useState<Article | Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!id || !type) {
        setError("Missing ID or type parameter");
        setLoading(false);
        return;
      }

      try {
        // Fix: Properly construct collection name (quiz -> quizzes, article -> articles)
        const collectionName = (type === 'article' ? 'articles' : 'quizzes') as 'articles' | 'quizzes';
        
        // Fetch the data based on type
        let data: Article | Quiz | null = null;
        
        if (type === 'article') {
          data = await getContentById<Article>(collectionName, id);
        } else {
          data = await getContentById<Quiz>(collectionName, id);
        }

        // Check if data was found
        if (data) {
          setContentData(data);
        } else {
          setError("Content not found in database");
        }
      } catch (e) {
        console.error("Failed to load content for editing:", e);
        setError("Failed to load content for editing");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [id, type]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading content for editing...</Text>
      </View>
    );
  }

  if (error || !contentData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Content not found'}</Text>
      </View>
    );
  }

  return <ContentForm type={type} initialData={contentData} />;
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  }
});