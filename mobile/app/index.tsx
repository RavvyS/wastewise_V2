// app/index.tsx - Eco-Themed UI
import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
} from "react-native"; 
import * as Speech from "expo-speech";
import { Link, useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { getArticles, getQuizzes, Article, Quiz } from '../services/sqliteService';

const ListItem = ({ item, type }: { item: Article | Quiz, type: 'article' | 'quiz' }) => {
  const isArticle = type === 'article';
  const detailPath = isArticle ? '/ArticleDetail' as '/ArticleDetail' : '/QuizDetail' as '/QuizDetail';
  
  const detailParams = { 
    itemId: item.id,
    itemTitle: item.title,
  };

  const handleListen = () => {
    Speech.speak(item.title);
  };

  return (
    <View style={styles.itemCard}>
      <Link 
        href={{ pathname: detailPath, params: detailParams as any }}
        asChild 
      >
        <TouchableOpacity style={styles.itemContent}>
          <View style={styles.itemIcon}>
            <Ionicons 
              name={isArticle ? "newspaper" : "bulb"} 
              size={24} 
              color="#2E7D32" 
            />
          </View>
          <Text style={styles.itemTitle}>{item.title}</Text>
        </TouchableOpacity>
      </Link>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.listenButton} 
          onPress={handleListen}
        >
          <Ionicons name="volume-medium" size={20} color="#fff" />
        </TouchableOpacity>
        
        <Link 
          href={{
            pathname: "/edit/[id]",
            params: { id: item.id, type: type }
          } as any}
          asChild
        >
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

export default function Index() {
  const router = useRouter(); 
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const articlesData = await getArticles();
      setArticles(articlesData);
      const quizzesData = await getQuizzes();
      setQuizzes(quizzesData);
    } catch (error) {
      console.error("Failed to fetch content from DB:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading WasteWise Hub...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="leaf" size={32} color="#2E7D32" />
        </View>
        <Text style={styles.headerTitle}>WasteWise Hub</Text>
        <Text style={styles.headerSubtitle}>Learn • Reduce • Recycle</Text>
      </View>
      
      {/* ARTICLES SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="newspaper-outline" size={24} color="#2E7D32" />
            <Text style={styles.sectionTitle}>Articles</Text>
          </View>
          <Link href="/create?type=article" asChild>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add-circle" size={28} color="#43A047" />
            </TouchableOpacity>
          </Link>
        </View>
        
        {articles.length === 0 ? (
          <Text style={styles.emptyText}>No articles yet. Create one!</Text>
        ) : (
          articles.map((a) => <ListItem key={a.id} item={a} type="article" />)
        )}
      </View>

      {/* QUIZZES SECTION */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="bulb-outline" size={24} color="#2E7D32" />
            <Text style={styles.sectionTitle}>Quizzes</Text>
          </View>
          <Link href="/create?type=quiz" asChild>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add-circle" size={28} color="#43A047" />
            </TouchableOpacity>
          </Link>
        </View>
        
        {quizzes.length === 0 ? (
          <Text style={styles.emptyText}>No quizzes yet. Create one!</Text>
        ) : (
          quizzes.map((q) => <ListItem key={q.id} item={q} type="quiz" />)
        )}
      </View>
      
      <View style={styles.footer}>
        <Ionicons name="earth" size={20} color="#66BB6A" />
        <Text style={styles.footerText}>Together for a greener planet 🌍</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F8E9',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#C5E1A5',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerIcon: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 50,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#388E3C',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginLeft: 8,
  },
  addButton: {
    padding: 4,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#66BB6A',
  },
  itemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
    marginRight: 12,
  },
  itemTitle: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  listenButton: {
    backgroundColor: '#66BB6A',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  editButton: {
    backgroundColor: '#43A047',
    padding: 8,
    borderRadius: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#81C784',
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    marginTop: 20,
  },
  footerText: {
    marginLeft: 8,
    color: '#388E3C',
    fontSize: 14,
    fontWeight: '500',
  },
});