import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  readTime: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  image: string;
  content: string;
}

interface Quiz {
  id: number;
  title: string;
  description: string;
  questionCount: number;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  points: number;
  completed: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function LearningScreen() {
  const [activeTab, setActiveTab] = useState<"articles" | "quizzes">(
    "articles"
  );
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [quizModalVisible, setQuizModalVisible] = useState(false);

  // Mock data - in real app this would come from API
  const articles: Article[] = [
    {
      id: 1,
      title: "The Complete Guide to Plastic Recycling",
      excerpt:
        "Learn about different types of plastics and how to properly recycle them...",
      readTime: "5 min read",
      category: "Plastic",
      difficulty: "Beginner",
      image: "🔄",
      content:
        "Plastic recycling is one of the most important aspects of waste management. Different types of plastics require different recycling processes...",
    },
    {
      id: 2,
      title: "Composting at Home: A Step-by-Step Guide",
      excerpt:
        "Transform your organic waste into nutrient-rich compost for your garden...",
      readTime: "8 min read",
      category: "Organic",
      difficulty: "Intermediate",
      image: "🌱",
      content:
        "Composting is a natural process that transforms organic waste into valuable fertilizer. Here's how you can start composting at home...",
    },
    {
      id: 3,
      title: "Electronic Waste: What You Need to Know",
      excerpt:
        "Understanding the importance of proper e-waste disposal and recycling...",
      readTime: "6 min read",
      category: "Electronics",
      difficulty: "Advanced",
      image: "📱",
      content:
        "Electronic waste contains valuable materials but also hazardous substances. Proper disposal is crucial for environmental protection...",
    },
    {
      id: 4,
      title: "Glass Recycling: From Bottle to Bottle",
      excerpt:
        "Discover the fascinating process of glass recycling and its environmental benefits...",
      readTime: "4 min read",
      category: "Glass",
      difficulty: "Beginner",
      image: "🍶",
      content:
        "Glass is 100% recyclable and can be recycled endlessly without loss in quality. Learn about the glass recycling process...",
    },
  ];

  const quizzes: Quiz[] = [
    {
      id: 1,
      title: "Plastic Types Quiz",
      description:
        "Test your knowledge about different plastic types and their recycling codes",
      questionCount: 5,
      difficulty: "Easy",
      category: "Plastic",
      points: 50,
      completed: false,
    },
    {
      id: 2,
      title: "Waste Separation Challenge",
      description: "How well do you know which bin each item belongs to?",
      questionCount: 10,
      difficulty: "Medium",
      category: "General",
      points: 100,
      completed: true,
    },
    {
      id: 3,
      title: "Environmental Impact Expert",
      description:
        "Advanced quiz on the environmental impact of different waste materials",
      questionCount: 15,
      difficulty: "Hard",
      category: "Environment",
      points: 150,
      completed: false,
    },
  ];

  const sampleQuestions: QuizQuestion[] = [
    {
      id: 1,
      question:
        "What does the recycling code '1' on plastic containers indicate?",
      options: ["PET/PETE", "HDPE", "PVC", "LDPE"],
      correctAnswer: 0,
      explanation:
        "Code 1 indicates PET/PETE (Polyethylene Terephthalate), commonly used for water bottles and food containers.",
    },
    {
      id: 2,
      question:
        "Which of these materials takes the longest to decompose in a landfill?",
      options: ["Paper", "Plastic bottle", "Apple core", "Aluminum can"],
      correctAnswer: 1,
      explanation:
        "Plastic bottles can take 450-1000 years to decompose, much longer than other materials.",
    },
  ];

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    setModalVisible(true);
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResults(false);
    setScore(0);
    setQuizModalVisible(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer === sampleQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < sampleQuestions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResults(true);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
      case "Easy":
        return "#4CAF50";
      case "Intermediate":
      case "Medium":
        return "#FF9800";
      case "Advanced":
      case "Hard":
        return "#F44336";
      default:
        return "#666";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learning Hub</Text>
        <Text style={styles.headerSubtitle}>Expand your knowledge</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "articles" && styles.activeTab]}
          onPress={() => setActiveTab("articles")}
        >
          <Ionicons
            name="library"
            size={20}
            color={activeTab === "articles" ? "#4CAF50" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "articles" && styles.activeTabText,
            ]}
          >
            Articles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "quizzes" && styles.activeTab]}
          onPress={() => setActiveTab("quizzes")}
        >
          <Ionicons
            name="help-circle"
            size={20}
            color={activeTab === "quizzes" ? "#4CAF50" : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "quizzes" && styles.activeTabText,
            ]}
          >
            Quizzes
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {activeTab === "articles" ? (
          <View style={styles.articlesContainer}>
            {articles.map((article) => (
              <TouchableOpacity
                key={article.id}
                style={styles.articleCard}
                onPress={() => openArticle(article)}
              >
                <View style={styles.articleHeader}>
                  <View style={styles.articleImage}>
                    <Text style={styles.imageEmoji}>{article.image}</Text>
                  </View>
                  <View style={styles.articleInfo}>
                    <Text style={styles.articleTitle}>{article.title}</Text>
                    <Text style={styles.articleExcerpt}>{article.excerpt}</Text>
                    <View style={styles.articleMeta}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>
                          {article.category}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.difficultyBadge,
                          {
                            backgroundColor: getDifficultyColor(
                              article.difficulty
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.difficultyText}>
                          {article.difficulty}
                        </Text>
                      </View>
                      <Text style={styles.readTime}>{article.readTime}</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.quizzesContainer}>
            {quizzes.map((quiz) => (
              <TouchableOpacity
                key={quiz.id}
                style={[
                  styles.quizCard,
                  quiz.completed && styles.completedQuizCard,
                ]}
                onPress={() => startQuiz(quiz)}
              >
                <View style={styles.quizHeader}>
                  <View style={styles.quizIcon}>
                    <Ionicons
                      name={quiz.completed ? "checkmark-circle" : "help-circle"}
                      size={24}
                      color={quiz.completed ? "#4CAF50" : "#FF9800"}
                    />
                  </View>
                  <View style={styles.quizInfo}>
                    <Text style={styles.quizTitle}>{quiz.title}</Text>
                    <Text style={styles.quizDescription}>
                      {quiz.description}
                    </Text>
                    <View style={styles.quizMeta}>
                      <View style={styles.quizStats}>
                        <Text style={styles.questionCount}>
                          {quiz.questionCount} questions
                        </Text>
                        <View
                          style={[
                            styles.difficultyBadge,
                            {
                              backgroundColor: getDifficultyColor(
                                quiz.difficulty
                              ),
                            },
                          ]}
                        >
                          <Text style={styles.difficultyText}>
                            {quiz.difficulty}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.pointsBadge}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.pointsText}>{quiz.points} pts</Text>
                      </View>
                    </View>
                  </View>
                </View>
                {quiz.completed && (
                  <View style={styles.completedBanner}>
                    <Text style={styles.completedText}>✓ Completed</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Article Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedArticle && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedArticle.title}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalBody}>
                  <View style={styles.articleContent}>
                    <Text style={styles.articleText}>
                      {selectedArticle.content}
                    </Text>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Quiz Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={quizModalVisible}
        onRequestClose={() => setQuizModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedQuiz && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedQuiz.title}</Text>
                  <TouchableOpacity onPress={() => setQuizModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                {!showResults ? (
                  <View style={styles.quizContent}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${
                              ((currentQuestion + 1) / sampleQuestions.length) *
                              100
                            }%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.questionCounter}>
                      Question {currentQuestion + 1} of {sampleQuestions.length}
                    </Text>

                    <Text style={styles.questionText}>
                      {sampleQuestions[currentQuestion].question}
                    </Text>

                    <View style={styles.optionsContainer}>
                      {sampleQuestions[currentQuestion].options.map(
                        (option, index) => (
                          <TouchableOpacity
                            key={index}
                            style={[
                              styles.optionButton,
                              selectedAnswer === index && styles.selectedOption,
                            ]}
                            onPress={() => handleAnswerSelect(index)}
                          >
                            <Text
                              style={[
                                styles.optionText,
                                selectedAnswer === index &&
                                  styles.selectedOptionText,
                              ]}
                            >
                              {option}
                            </Text>
                          </TouchableOpacity>
                        )
                      )}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.nextButton,
                        selectedAnswer === null && styles.disabledButton,
                      ]}
                      onPress={nextQuestion}
                      disabled={selectedAnswer === null}
                    >
                      <Text style={styles.nextButtonText}>
                        {currentQuestion + 1 === sampleQuestions.length
                          ? "Finish"
                          : "Next"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.resultsContainer}>
                    <Ionicons name="trophy" size={64} color="#FFD700" />
                    <Text style={styles.resultsTitle}>Quiz Completed!</Text>
                    <Text style={styles.scoreText}>
                      You scored {score} out of {sampleQuestions.length}
                    </Text>
                    <Text style={styles.pointsEarned}>
                      Points earned:{" "}
                      {Math.round(
                        (score / sampleQuestions.length) * selectedQuiz.points
                      )}
                    </Text>
                    <TouchableOpacity
                      style={styles.doneButton}
                      onPress={() => setQuizModalVisible(false)}
                    >
                      <Text style={styles.doneButtonText}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "white",
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#E8F5E8",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  activeTabText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  articlesContainer: {
    paddingBottom: 20,
  },
  articleCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  articleHeader: {
    flexDirection: "row",
  },
  articleImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  imageEmoji: {
    fontSize: 24,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  articleExcerpt: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  categoryBadge: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 11,
    color: "#2196F3",
    fontWeight: "500",
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  difficultyText: {
    fontSize: 11,
    color: "white",
    fontWeight: "500",
  },
  readTime: {
    fontSize: 12,
    color: "#999",
  },
  quizzesContainer: {
    paddingBottom: 20,
  },
  quizCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  completedQuizCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  quizIcon: {
    marginRight: 16,
  },
  quizInfo: {
    flex: 1,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  quizDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  quizMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quizStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  questionCount: {
    fontSize: 12,
    color: "#999",
    marginRight: 12,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8E1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    color: "#F57C00",
    marginLeft: 4,
    fontWeight: "500",
  },
  completedBanner: {
    marginTop: 12,
    padding: 8,
    backgroundColor: "#E8F5E8",
    borderRadius: 8,
    alignItems: "center",
  },
  completedText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 16,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  articleContent: {
    paddingBottom: 20,
  },
  articleText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  quizContent: {
    flex: 1,
    padding: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#f0f0f0",
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  questionCounter: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 24,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionButton: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    backgroundColor: "#E8F5E8",
    borderColor: "#4CAF50",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 8,
  },
  pointsEarned: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 32,
  },
  doneButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  doneButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
