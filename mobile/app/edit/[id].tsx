import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import ContentForm from "../ContentForm";
import { getArticleById, getQuizWithQuestions } from '../../utils/api';

interface EditParams {
  id: string;
  type: 'article' | 'quiz';
}

interface Article {
  id: number;
  title: string;
  content: string;
  category?: string;
  level?: string;
  createdAt?: string;
}

interface Quiz {
  id: number;
  title: string;
  question?: string;
  answer?: string;
  createdAt?: string;
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
        let data: Article | Quiz | null = null;
        
        if (type === 'article') {
          data = await getArticleById(Number(id));
        } else {
          data = await getQuizWithQuestions(Number(id));
        }

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
