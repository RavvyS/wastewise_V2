// app/ArticleDetail.tsx - EcoZen Themed UI

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
import { Ionicons } from '@expo/vector-icons';
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
  const [isSpeaking, setIsSpeaking] = useState(false);

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

  const handleListen = async () => {
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
            <Text style={styles.headerTitle}>Learning</Text>
          </View>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#67A859" />
          </View>
        </View>
      );
  }

  if (error || !article) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Learning</Text>
        </View>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color="#E53935" />
          <Text style={styles.errorText}>{error || 'Article unavailable.'}</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
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
          style={styles.backIconButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Learning</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Article Card */}
        <View style={styles.articleCard}>
          <Text style={styles.title}>{article.title}</Text>
          
          {/* Listen Button */}
          <TouchableOpacity 
            style={styles.listenButton}
            onPress={handleListen}
          >
            <Ionicons 
              name={isSpeaking ? "stop-circle" : "volume-high"} 
              size={20} 
              color="#67A859" 
            />
            <Text style={styles.listenButtonText}>
              {isSpeaking ? "Stop Reading" : "Listen to Article"}
            </Text>
          </TouchableOpacity>
          
          {/* Content */}
          <Text style={styles.content}>{article.content}</Text>
        </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
      backgroundColor: '#67A859',
      paddingTop: 50,
      paddingBottom: 16,
      paddingHorizontal: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backIconButton: {
      marginRight: 12,
      padding: 4,
    },
    headerTitle: { 
      fontSize: 24, 
      fontWeight: "bold", 
      color: '#FFFFFF',
    },
    scrollContent: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    articleCard: {
      backgroundColor: '#FFFFFF',
      margin: 20,
      padding: 24,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    title: { 
        fontSize: 28, 
        fontWeight: "bold", 
        marginBottom: 20,
        color: '#2C2C2C',
        lineHeight: 36,
    },
    content: { 
        fontSize: 16, 
        lineHeight: 26,
        color: '#424242',
        marginTop: 20,
    },
    listenButton: {
        backgroundColor: '#E8F5E9',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#67A859',
    },
    listenButtonText: {
        color: '#67A859',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    primaryButton: {
        backgroundColor: '#67A859',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        marginTop: 20,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
        textAlign: 'center',
    },
    errorText: {
        color: '#E53935',
        marginVertical: 20,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    footerSpacer: {
        height: 40,
    },
});