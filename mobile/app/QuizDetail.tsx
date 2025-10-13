// app/QuizDetail.tsx - EcoZen Themed UI

import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    ViewStyle, 
    TextStyle,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import * as Speech from "expo-speech";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { getContentById, Quiz } from '../services/sqliteService'; 

interface QuizDetailParams {
    itemId: string;
    itemTitle: string; 
}

interface Styles {
    container: ViewStyle;
    header: ViewStyle;
    headerContent: ViewStyle; // <-- MISSING PROPERTY
    backIconButton: ViewStyle;
    headerTitle: TextStyle;
    editIconButton: ViewStyle; // <-- MISSING PROPERTY
    scrollContent: ViewStyle;
    quizCard: ViewStyle;
    title: TextStyle;
    question: TextStyle;
    input: TextStyle;
    centerContainer: ViewStyle;
    errorText: TextStyle;
    feedbackCard: ViewStyle;
    correctFeedback: TextStyle;
    wrongFeedback: TextStyle;
    correctAnswer: TextStyle;
    buttonRow: ViewStyle;
    listenButton: ViewStyle;
    listenButtonText: TextStyle;
    submitButton: ViewStyle;
    submitButtonText: TextStyle;
    secondaryButton: ViewStyle;
    secondaryButtonText: TextStyle;
    primaryButton: ViewStyle;
    primaryButtonText: TextStyle;
    footerSpacer: ViewStyle;
    iconContainer: ViewStyle;
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
    const [isSpeaking, setIsSpeaking] = useState(false);

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
                setError("Error loading content.");
            } finally {
                setIsLoading(false);
            }
        };
        
        loadQuiz();
    }, [itemId]);

    const handleListenQuestion = async () => {
        if (!quiz) return;
        
        if (isSpeaking) {
            await Speech.stop();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);
            Speech.speak(quiz.question, {
                onDone: () => setIsSpeaking(false),
                onStopped: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false),
            });
        }
    };

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

    if (error || !quiz) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Learning</Text>
                </View>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle" size={64} color="#E53935" />
                    <Text style={styles.errorText}>{error || 'Quiz unavailable.'}</Text>
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
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        style={styles.backIconButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Learning</Text>
                </View>
                
                {/* Edit Button */}
                <Link 
                    href={{
                        pathname: "/edit/[id]",
                        params: { id: quiz.id, type: 'quiz' }
                    } as any}
                    asChild
                >
                    <TouchableOpacity style={styles.editIconButton}>
                        <Ionicons name="pencil" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </Link>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Quiz Card */}
                <View style={styles.quizCard}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="help-circle" size={48} color="#67A859" />
                    </View>
                    
                    <Text style={styles.title}>{quiz.title}</Text>
                    <Text style={styles.question}>{quiz.question}</Text>
                    
                    {/* Listen Button */}
                    <TouchableOpacity 
                        style={styles.listenButton}
                        onPress={handleListenQuestion}
                    >
                        <Ionicons 
                            name={isSpeaking ? "stop-circle" : "volume-high"} 
                            size={20} 
                            color="#67A859" 
                        />
                        <Text style={styles.listenButtonText}>
                            {isSpeaking ? "Stop Reading" : "Listen to Question"}
                        </Text>
                    </TouchableOpacity>
                    
                    {/* Feedback Card */}
                    {showFeedback && (
                        <View style={styles.feedbackCard}>
                            {isCorrect ? (
                                <>
                                    <Ionicons name="checkmark-circle" size={48} color="#4CAF50" style={{alignSelf: 'center', marginBottom: 8}} />
                                    <Text style={styles.correctFeedback}>Correct! Nice work!</Text>
                                </>
                            ) : (
                                <>
                                    <Ionicons name="close-circle" size={48} color="#E53935" style={{alignSelf: 'center', marginBottom: 8}} />
                                    <Text style={styles.wrongFeedback}>Wrong Answer</Text>
                                    <Text style={styles.correctAnswer}>
                                        The correct answer is: <Text style={{fontWeight: 'bold'}}>{quiz.answer}</Text>
                                    </Text>
                                    <View style={styles.buttonRow}>
                                        <TouchableOpacity 
                                            style={styles.secondaryButton} 
                                            onPress={speakCorrectAnswer}
                                        >
                                            <Ionicons name="volume-high" size={18} color="#67A859" />
                                            <Text style={styles.secondaryButtonText}>Hear Answer</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.secondaryButton} 
                                            onPress={tryAgain}
                                        >
                                            <Ionicons name="refresh" size={18} color="#67A859" />
                                            <Text style={styles.secondaryButtonText}>Try Again</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                        </View>
                    )}
                    
                    {/* Answer Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="Type your answer"
                        placeholderTextColor="#999"
                        value={answer}
                        onChangeText={setAnswer}
                        editable={!showFeedback || !isCorrect}
                    />
                    
                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            {opacity: answer.trim().length === 0 || (showFeedback && isCorrect) ? 0.5 : 1}
                        ]}
                        disabled={answer.trim().length === 0 || (showFeedback && isCorrect)}
                        onPress={checkAnswer}
                    >
                        <Text style={styles.submitButtonText}>Submit Answer</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footerSpacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create<Styles>({
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
        justifyContent: 'space-between', // Added to push edit button to the right
    },
    // === FIX APPLIED: Added missing style property ===
    headerContent: {
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
    // === FIX APPLIED: Added missing style property ===
    editIconButton: {
        padding: 4,
    },
    scrollContent: {
        flex: 1,
    },
    quizCard: {
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
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: { 
        fontSize: 24, 
        fontWeight: "bold", 
        marginBottom: 16,
        color: '#2C2C2C',
        textAlign: 'center',
    },
    question: { 
        fontSize: 18, 
        lineHeight: 28,
        color: '#424242',
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
        backgroundColor: '#FAFAFA',
        fontSize: 16,
        color: '#2C2C2C',
    },
    centerContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: 20,
    },
    errorText: { 
        color: '#E53935', 
        marginVertical: 20,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '600',
    },
    feedbackCard: {
        marginVertical: 20,
        padding: 20,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    correctFeedback: {
        fontSize: 18,
        color: '#4CAF50',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    wrongFeedback: {
        fontSize: 18,
        color: '#E53935',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    correctAnswer: {
        fontSize: 16,
        color: '#424242',
        textAlign: 'center',
        marginTop: 8,
    },
    buttonRow: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 10,
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
        marginBottom: 20,
    },
    listenButtonText: {
        color: '#67A859',
        fontWeight: '600',
        fontSize: 16,
        marginLeft: 8,
    },
    submitButton: {
        backgroundColor: '#67A859',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: '#E8F5E9',
        paddingVertical: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: '#67A859',
    },
    secondaryButtonText: {
        color: '#67A859',
        fontWeight: '600',
        fontSize: 14,
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
    footerSpacer: {
        height: 40,
    },
});