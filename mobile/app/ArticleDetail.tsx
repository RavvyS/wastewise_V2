// app/ArticleDetail.tsx (Eco-Themed)

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
import { getContentById, Article } from '../services/sqliteService';

interface ArticleDetailParams {
    itemId: string;
    itemTitle: string;
}

export default function ArticleDetail() {
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as ArticleDetailParams;
  const { itemId } = params;
  
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadArticle = async () => {
      if (!itemId) {
        setError("Article ID not found.");
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await getContentById<Article>('articles', itemId);
        
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

  if (isLoading) {
      return <ActivityIndicator size="large" style={styles.centerContainer} color="#2d5016" />;
  }

  if (error || !article) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error || 'Article unavailable.'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.buttonText}>⬅ Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scrollContent}>
        <Text style={styles.ecoDecor}>🌍</Text>
        <Text style={styles.title}>{article.title}</Text>
        
        <TouchableOpacity 
          style={styles.listenButton}
          onPress={() => Speech.speak(article.content)}
        >
          <Text style={styles.buttonText}>🔊 Listen to Article</Text>
        </TouchableOpacity>
        
        <Text style={styles.content}>{article.content}</Text>
        
        <View style={styles.backView}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>⬅ Back to Learning Hub</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: { 
        backgroundColor: '#f1f8f0',
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f1f8f0',
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
    backButton: {
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
    }
});