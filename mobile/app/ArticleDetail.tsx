import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as Speech from "expo-speech";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getArticleById } from '../utils/api';
import { Colors } from "../constants/Colors";

interface ArticleDetailParams {
  itemId: string;
  itemTitle: string;
}

interface Article {
  id: number;
  title: string;
  content: string;
  category?: string;
  level?: string;
  createdAt?: string;
}

export default function ArticleDetail() {
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as ArticleDetailParams;
  const { itemId, itemTitle } = params;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const loadArticle = async () => {
      if (!itemId) {
        setError("Article ID not found.");
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await getArticleById(Number(itemId));
        
        if (data) {
          setArticle(data);
        } else {
          setError("Article content not found.");
        }
      } catch (e) {
        console.error("Failed to fetch article content:", e);
        setError("Error loading content.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadArticle();
  }, [itemId]);

  const handleListenToArticle = async () => {
    if (!article) return;
    
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(article.content, {
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Article Details</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </View>
    );
  }

  if (error || !article) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Article Details</Text>
        </View>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Error: {error || 'Article unavailable.'}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.buttonText}>⬅ Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Article Details</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={styles.ecoDecor}>🌍</Text>
          <Text style={styles.title}>{article.title}</Text>
          
          <TouchableOpacity 
            style={styles.listenButton}
            onPress={handleListenToArticle}
          >
            <Text style={styles.buttonText}>
              {isSpeaking ? "🔇 Stop Reading" : "🔊 Listen to Article"}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.content}>{article.content}</Text>
          
          <View style={styles.backView}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>⬅ Back to Learning Hub</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    backgroundColor: '#f1f8f0',
    flex: 1,
  },
  header: {
    backgroundColor: '#67A859',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: '#FFFFFF',
  },
  scrollContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: '500',
  },
  title: { 
    fontSize: 26, 
    fontWeight: "bold", 
    marginBottom: 15,
    color: '#1b3d0c',
    lineHeight: 32,
  },
  content: { 
    marginVertical: 20, 
    fontSize: 16, 
    lineHeight: 26,
    color: '#2d5016',
    fontWeight: '500',
  },
  backView: { 
    marginTop: 30,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#558b2f',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#2d5016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  listenButton: {
    backgroundColor: '#7cb342',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 15,
    elevation: 3,
    shadowColor: '#2d5016',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: '#c62828',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  ecoDecor: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 15,
  },
});
