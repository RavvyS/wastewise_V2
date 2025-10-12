// app/QuizDetail.tsx (Eco-Themed with Voice Feedback)

import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  StyleSheet, 
  ViewStyle, 
  TextStyle,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import * as Speech from "expo-speech";
import { useLocalSearchParams, useRouter } from "expo-router"; 
import { getContentById, Quiz } from '../services/sqliteService'; 

interface QuizDetailParams {
    itemId: string;
    itemTitle: string; 
}

interface Styles {
  container: ViewStyle;
  scrollContent: ViewStyle;
  title: TextStyle;
  question: TextStyle;
  input: TextStyle;
  backView: ViewStyle;
  centerContainer: ViewStyle;
  errorText: TextStyle;
  feedbackContainer: ViewStyle;
  correctFeedback: TextStyle;
  wrongFeedback: TextStyle;
  correctAnswer: TextStyle;
  buttonRow: ViewStyle;
  speakButton: ViewStyle;
  speakButtonText: TextStyle;
  tryAgainButton: ViewStyle;
  listenButton: ViewStyle;
  submitButton: ViewStyle;
  ecoDecor: TextStyle;
}

export default function QuizDetail() {
  const router = useRouter();
  const params = useLocalSearchParams() as unknown as QuizDetailParams;
  const { itemId } = params;
    
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!itemId) {
        setError("Quiz ID not found.");
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await getContentById<Quiz>('quizzes', itemId);
        
        if (data) {
          setQuiz(data);
        } else {
          setError("Quiz content not found.");
        }
      } catch (e) {
        console.error("Failed to fetch quiz content:", e);
        setError("Error loading content. CHECK DB INITIALIZATION/PATHING.");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadQuiz();
  }, [itemId]);

  const checkAnswer = () => {
    if (!quiz) return;

    const userResponse = answer.trim().toLowerCase();
    const correctAnswer = String(quiz.answer).toLowerCase();

    if (userResponse === correctAnswer) {
      setIsCorrect(true);
      setShowFeedback(true);
      
      Speech.speak("Correct! Nice work!", {
        language: 'en',
        pitch: 1.2,
        rate: 0.9,
      });
      
      setTimeout(() => {
        setShowFeedback(false);
        setAnswer("");
      }, 3000);
      
    } else {
      setIsCorrect(false);
      setShowFeedback(true);
      
      const feedbackMessage = `Wrong answer. The correct answer is ${quiz.answer}`;
      Speech.speak(feedbackMessage, {
        language: 'en',
        pitch: 1.0,
        rate: 0.85,
      });
    }
  };

  const speakCorrectAnswer = () => {
    if (!quiz) return;
    Speech.speak(`The correct answer is ${quiz.answer}`, {
      language: 'en',
      pitch: 1.0,
      rate: 0.85,
    });
  };

  const tryAgain = () => {
    setShowFeedback(false);
    setAnswer("");
  };

  if (isLoading) {
      return <ActivityIndicator size="large" style={styles.centerContainer} color="#2d5016" />;
  }

  if (error || !quiz) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error || 'Quiz unavailable.'}</Text>
        <TouchableOpacity style={styles.listenButton} onPress={() => router.back()}>
          <Text style={styles.speakButtonText}>⬅ Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.scrollContent}>
        <Text style={styles.ecoDecor}>🌱</Text>
        <Text style={styles.title}>{quiz.title}</Text>
        <Text style={styles.question}>{quiz.question}</Text>
        
        <TouchableOpacity 
          style={styles.listenButton}
          onPress={() => Speech.speak(quiz.question)}
        >
          <Text style={styles.speakButtonText}>🔊 Listen to Question</Text>
        </TouchableOpacity>
        
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            {isCorrect ? (
              <>
                <Text style={styles.correctFeedback}>✅ Correct! Nice work!</Text>
                <Text style={styles.ecoDecor}>🌿</Text>
              </>
            ) : (
              <>
                <Text style={styles.wrongFeedback}>❌ Wrong Answer</Text>
                <Text style={styles.correctAnswer}>
                  The correct answer is: <Text style={{fontWeight: 'bold'}}>{quiz.answer}</Text>
                </Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={styles.speakButton} 
                    onPress={speakCorrectAnswer}
                  >
                    <Text style={styles.speakButtonText}>🔊 Hear Answer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.tryAgainButton} 
                    onPress={tryAgain}
                  >
                    <Text style={styles.speakButtonText}>↻ Try Again</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
        
        <TextInput
          style={styles.input}
          placeholder="Type your answer"
          placeholderTextColor="#7cb342"
          value={answer}
          onChangeText={setAnswer}
          editable={!showFeedback || !isCorrect}
        />
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            {opacity: answer.trim().length === 0 || (showFeedback && isCorrect) ? 0.5 : 1}
          ]}
          disabled={answer.trim().length === 0 || (showFeedback && isCorrect)}
          onPress={checkAnswer}
        >
          <Text style={styles.speakButtonText}>Submit Answer</Text>
        </TouchableOpacity>
        
        <View style={styles.backView}>
          <TouchableOpacity 
            style={styles.listenButton}
            onPress={() => router.back()}
          >
            <Text style={styles.speakButtonText}>⬅ Back to Learning Hub</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create<Styles>({
    container: { 
        backgroundColor: '#f1f8f0',
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    title: { 
        fontSize: 26, 
        fontWeight: "bold", 
        marginBottom: 5,
        color: '#1b3d0c',
    },
    question: { 
        marginVertical: 20, 
        fontSize: 18, 
        lineHeight: 26,
        color: '#2d5016',
        fontWeight: '500',
    },
    input: {
        borderWidth: 2,
        borderColor: "#7cb342",
        borderRadius: 12,
        padding: 15,
        marginVertical: 20,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#1b3d0c',
    },
    backView: { 
        marginTop: 25,
        marginBottom: 30,
    },
    centerContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f1f8f0',
    },
    errorText: { 
        color: '#c62828', 
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    feedbackContainer: {
        marginVertical: 20,
        padding: 18,
        borderRadius: 12,
        backgroundColor: '#e8f5e9',
        borderLeftWidth: 5,
        borderLeftColor: '#558b2f',
    },
    correctFeedback: {
        fontSize: 20,
        color: '#2d5016',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    wrongFeedback: {
        fontSize: 18,
        color: '#c62828',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    correctAnswer: {
        fontSize: 16,
        color: '#2d5016',
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '500',
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 15,
        justifyContent: 'space-between',
        gap: 10,
    },
    speakButton: {
        backgroundColor: '#558b2f',
        padding: 12,
        borderRadius: 10,
        flex: 1,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#2d5016',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    tryAgainButton: {
        backgroundColor: '#7cb342',
        padding: 12,
        borderRadius: 10,
        flex: 1,
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
        marginVertical: 10,
        elevation: 3,
        shadowColor: '#2d5016',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    submitButton: {
        backgroundColor: '#558b2f',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
        elevation: 3,
        shadowColor: '#2d5016',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
    },
    speakButtonText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 16,
    },
    ecoDecor: {
        fontSize: 40,
        textAlign: 'center',
        marginBottom: 10,
    }
});