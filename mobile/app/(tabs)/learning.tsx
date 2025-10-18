import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { getArticles, getQuizzes, deleteArticle, deleteQuiz } from '../../utils/api';
import { Colors } from "../../constants/Colors";

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
  level: string;
  authorId?: number;
  createdAt?: string;
}

interface Quiz {
  id: number;
  title: string;
  createdAt?: string;
  questions?: QuizQuestion[];
}

interface QuizQuestion {
  id: number;
  quizId: number;
  question: string;
  correctAnswer: string;
  options?: string;
}

export default function LearningScreen() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'articles' | 'quizzes'>('articles');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [quizModalVisible, setQuizModalVisible] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [articlesData, quizzesData] = await Promise.all([
        getArticles(),
        getQuizzes()
      ]);
      setArticles(articlesData);
      setQuizzes(quizzesData);
    } catch (error) {
      console.error("Failed to fetch content from backend:", error);
      Alert.alert("Error", "Failed to load learning content. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const openArticle = (article: Article) => {
    router.push({
      pathname: '/ArticleDetail',
      params: { 
        itemId: article.id.toString(),
        itemTitle: article.title 
      }
    });
  };

  const startQuiz = (quiz: Quiz) => {
    router.push({
      pathname: '/QuizDetail',
      params: { 
        itemId: quiz.id.toString(),
        itemTitle: quiz.title 
      }
    });
  };

  const handleDeleteArticle = async (articleId: number) => {
    Alert.alert(
      "Delete Article",
      "Are you sure you want to delete this article?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteArticle(articleId);
              await fetchData();
              Alert.alert("Success", "Article deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete article");
            }
          },
        },
      ]
    );
  };

  const handleDeleteQuiz = async (quizId: number) => {
    Alert.alert(
      "Delete Quiz",
      "Are you sure you want to delete this quiz?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteQuiz(quizId);
              await fetchData();
              Alert.alert("Success", "Quiz deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete quiz");
            }
          },
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "#4CAF50";
      case "Intermediate":
        return "#FF9800";
      case "Advanced":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Air Quality': '#E3F2FD',
      'Water': '#E8F5E8',
      'Energy': '#FFF3E0',
      'Soil': '#F3E5F5',
      'Plastic': '#E1F5FE',
      'General': '#F5F5F5',
    };
    return colors[category] || '#F5F5F5';
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'Beginner': '#C8E6C9',
      'Intermediate': '#FFF3E0',
      'Advanced': '#FFCDD2',
    };
    return colors[level] || '#F5F5F5';
  };

  const getCategoryTextColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Air Quality': '#1976D2',
      'Water': '#2E7D32',
      'Energy': '#F57C00',
      'Soil': '#7B1FA2',
      'Plastic': '#0277BD',
      'General': '#424242',
    };
    return colors[category] || '#424242';
  };

  const getLevelTextColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'Beginner': '#2E7D32',
      'Intermediate': '#F57C00',
      'Advanced': '#D32F2F',
    };
    return colors[level] || '#424242';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Learning</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.secondary} />
          <Text style={styles.loadingText}>Loading Learning Hub...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Single Green Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.learningTitle}>Learning Hub</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === 'articles' 
              ? `${articles.length} articles found` 
              : `${quizzes.length} quizzes found`
            }
          </Text>
        </View>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => router.push('/AIChat')}
        >
          <Ionicons name="chatbubbles-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* White Second Header with Tabs */}
      <View style={styles.whiteHeader}>
        <View style={styles.tabContainer}>
        <TouchableOpacity
            style={[styles.tab, activeTab === 'articles' && styles.activeTab]}
            onPress={() => setActiveTab('articles')}
        >
          <Ionicons
              name="book"
            size={20}
              color={activeTab === 'articles' ? Colors.secondary : '#757575'}
            />
            <Text style={[styles.tabText, activeTab === 'articles' && styles.activeTabText]}>
            Articles
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.tab, activeTab === 'quizzes' && styles.activeTab]}
            onPress={() => setActiveTab('quizzes')}
        >
          <Ionicons
            name="help-circle"
            size={20}
              color={activeTab === 'quizzes' ? Colors.secondary : '#757575'}
            />
            <Text style={[styles.tabText, activeTab === 'quizzes' && styles.activeTabText]}>
            Quizzes
          </Text>
        </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Add Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push({
              pathname: '/create',
              params: { type: activeTab.slice(0, -1) } // Remove 's' from 'articles'/'quizzes'
            })}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>+ Add {activeTab.slice(0, -1) === 'article' ? 'Article' : 'Quiz'}</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {activeTab === 'articles' ? (
            <>
              {articles.length === 0 ? (
                <Text style={styles.emptyText}>
                  No articles available yet.
                </Text>
              ) : (
                articles.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleCard}
                onPress={() => openArticle(article)}
              >
                {/* Green Icon on Left */}
                <View style={styles.articleIconContainer}>
                  <Ionicons name="document-text" size={24} color={Colors.secondary} />
                </View>
                
                {/* Main Content */}
                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle}>{article.title}</Text>
                  <Text style={styles.articleDescription} numberOfLines={2}>
                    {article.content?.substring(0, 100) || 'Read this article...'}...
                  </Text>
                  
                  {/* Badges and Reading Time */}
                  <View style={styles.articleMeta}>
                    <View style={styles.badgeContainer}>
                      <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(article.category) }]}>
                        <Text style={[styles.categoryText, { color: getCategoryTextColor(article.category) }]}>{article.category}</Text>
                      </View>
                      <View style={[styles.difficultyBadge, { backgroundColor: getLevelColor(article.level) }]}>
                        <Text style={[styles.difficultyText, { color: getLevelTextColor(article.level) }]}>{article.level}</Text>
                      </View>
                    </View>
                    <Text style={styles.readTime}>
                      {calculateReadTime(article.content || '')}
                    </Text>
                  </View>
                </View>
                
                {/* Edit Icon in Top Right */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push({
                      pathname: '/edit/[id]',
                      params: { id: article.id.toString(), type: 'article' }
                    });
                  }}
                  style={styles.editIconButton}
                >
                  <Ionicons name="pencil-outline" size={18} color="#666666" />
                </TouchableOpacity>
              </TouchableOpacity>
                ))
              )}
            </>
          ) : (
            <>
              {quizzes.length === 0 ? (
                <Text style={styles.emptyText}>
                  No quizzes available yet.
                    </Text>
              ) : (
                quizzes.map((quiz) => (
                          <TouchableOpacity
                    key={quiz.id}
                    style={styles.articleCard}
                    onPress={() => startQuiz(quiz)}
                  >
                    <View style={styles.articleHeader}>
                      <View style={styles.articleImage}>
                        <Text style={styles.imageEmoji}>❓</Text>
                      </View>
                      <View style={styles.articleInfo}>
                        <Text style={styles.articleTitle}>{quiz.title}</Text>
                        <Text style={styles.articleExcerpt} numberOfLines={2}>
                          Test your knowledge with this quiz
                            </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.editIconButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          router.push({
                            pathname: '/edit/[id]',
                            params: { id: quiz.id.toString(), type: 'quiz' }
                          });
                        }}
                      >
                        <Ionicons name="pencil-outline" size={20} color="#757575" />
                    </TouchableOpacity>
                  </View>
                    </TouchableOpacity>
                ))
                )}
              </>
            )}
          </View>

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  topHeader: {
    backgroundColor: Colors.secondary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  learningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'System',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    fontFamily: 'System',
  },
  whiteHeader: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'System',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'System',
  },
  chatButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.secondary,
    fontWeight: '500',
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#757575',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#757575',
  },
  activeTabText: {
    color: Colors.secondary,
    fontWeight: '600',
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: Colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  articleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  articleIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  articleContent: {
    flex: 1,
    marginRight: 10,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  articleImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  imageEmoji: {
    fontSize: 24,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    fontFamily: 'System',
    lineHeight: 24,
  },
  articleDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  articleExcerpt: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  readTime: {
    fontSize: 12,
    color: '#999',
  },
  editIconButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9E9E9E',
    fontSize: 14,
    marginVertical: 40,
  },
  footerSpacer: {
    height: 40,
  },
});