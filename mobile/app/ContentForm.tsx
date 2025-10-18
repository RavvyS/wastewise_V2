import React, { useState } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    StyleSheet, 
    ScrollView, 
    Alert, 
    ActivityIndicator, 
    TouchableOpacity 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { updateArticle, updateQuiz, deleteArticle, deleteQuiz, createQuizQuestion, updateQuizQuestion } from '../utils/api';
import { Colors } from "../constants/Colors";

// Constants for Categories and Levels
const CATEGORIES = ['Plastic', 'Water', 'Energy', 'Soil', 'Air Quality', 'General'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

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

interface ContentFormProps {
    type: 'article' | 'quiz';
    initialData?: Article | Quiz; 
}

export default function ContentForm({ type, initialData }: ContentFormProps) {
    const router = useRouter();
    
    const isArticle = type === 'article';
    const articleData = initialData && isArticle ? initialData as Article : null;
    const quizData = initialData && !isArticle ? initialData as Quiz : null;
    
    // Core content state
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(articleData?.content || '');
    const [question, setQuestion] = useState(quizData?.questions && quizData.questions.length > 0 ? quizData.questions[0].question : '');
    const [answer, setAnswer] = useState(quizData?.questions && quizData.questions.length > 0 ? quizData.questions[0].correctAnswer : '');
    
    // State for Category & Level
    const [category, setCategory] = useState(articleData?.category || CATEGORIES[0]);
    const [level, setLevel] = useState(articleData?.level || LEVELS[0]);
    
    const [isSaving, setIsSaving] = useState(false);

    const isEditing = !!initialData?.id;
    const headerText = isEditing ? `Edit ${type === 'article' ? 'Article' : 'Quiz'}` : `Create New ${type === 'article' ? 'Article' : 'Quiz'}`;

    const handleSubmit = async () => {
        if (!title.trim() || 
            (type === 'article' && !content.trim()) || 
            (type === 'quiz' && (!question.trim() || !answer.trim()))) {
          Alert.alert("⚠️ Missing Fields", "Please fill in all required fields.");
          return;
        }
        
        setIsSaving(true);

        try {
            if (isEditing && initialData?.id) {
                if (type === 'article') {
                    await updateArticle(initialData.id, {
                        title: title.trim(),
                        content: content.trim(),
                    });
                    Alert.alert("✅ Success", `Article "${title}" updated successfully!`);
                } else {
                    await updateQuiz(initialData.id, {
                        title: title.trim(),
                    });
                    // Update or create quiz question
                    if (question.trim() && answer.trim()) {
                        // For now, we'll create a new question. In a real app, you'd need to handle updating existing questions
                        await createQuizQuestion({
                            quizId: initialData.id,
                            question: question.trim(),
                            correctAnswer: answer.trim(),
                        });
                    }
                    Alert.alert("✅ Success", `Quiz "${title}" updated successfully!`);
                }
            } else {
                Alert.alert("❌ Error", "Invalid editing state");
            }
        } catch (error) {
            console.error("Update failed:", error);
            Alert.alert("❌ Error", "Could not update content. Please try again.");
        } finally {
            setIsSaving(false);
            router.back();
        }
    };
    
    const handleDelete = async () => {
        if (!isEditing || !initialData?.id) return;
        
        Alert.alert(
            "🗑️ Confirm Delete",
            `Are you sure you want to permanently delete "${initialData.title}"? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setIsSaving(true);
                        try {
                            if (type === 'article') {
                                await deleteArticle(initialData.id);
                            } else {
                                await deleteQuiz(initialData.id);
                            }
                            Alert.alert("✅ Deleted", `${initialData.title} was removed.`);
                            router.back();
                        } catch (error) {
                            console.error("Delete Failed:", error);
                            Alert.alert("❌ Error", "Could not delete content.");
                        } finally {
                            setIsSaving(false);
                        }
                    },
                },
            ]
        );
    };

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
                {/* Page Title */}
                <View style={styles.pageHeader}>
                    <Text style={styles.pageTitle}>{headerText}</Text>
                    <Text style={styles.pageSubtitle}>
                        {isEditing ? 'Update your content' : 'Create educational content for EcoZen'}
                    </Text>
                </View>

                {isSaving && (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="small" color={Colors.secondary} />
                        <Text style={styles.loadingText}>Processing...</Text>
                    </View>
                )}

                {/* Form Card */}
                <View style={styles.formCard}>
                    {/* Title Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Title</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder={`e.g., The Complete Guide to ${type === 'article' ? 'Plastic Recycling' : 'Recycling'}`}
                            placeholderTextColor="#999"
                            editable={!isSaving}
                        />
                    </View>

                    {type === 'article' ? (
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Article Content</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={content}
                                onChangeText={setContent}
                                multiline
                                placeholder="Learn about different types of plastics and how to properly recycle them..."
                                placeholderTextColor="#999"
                                editable={!isSaving}
                            />
                        </View>
                    ) : (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Quiz Question</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={question}
                                    onChangeText={setQuestion}
                                    multiline
                                    placeholder="Enter the quiz question..."
                                    placeholderTextColor="#999"
                                    editable={!isSaving}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Correct Answer</Text>
                                <TextInput
                                    style={styles.input}
                                    value={answer}
                                    onChangeText={setAnswer}
                                    placeholder="Enter the correct answer"
                                    placeholderTextColor="#999"
                                    editable={!isSaving}
                                />
                            </View>
                        </>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.primaryButton, isSaving && styles.disabledButton]}
                        onPress={handleSubmit} 
                        disabled={isSaving}
                    >
                        <Text style={styles.primaryButtonText}>
                            {isSaving ? "Saving..." : (isEditing ? "Save Changes" : "Create Content")}
                        </Text>
                    </TouchableOpacity>
                    
                    {isEditing && (
                        <TouchableOpacity 
                            style={[styles.deleteButton, isSaving && styles.disabledButton]}
                            onPress={handleDelete} 
                            disabled={isSaving}
                        >
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                        style={[styles.cancelButton, isSaving && styles.disabledButton]} 
                        onPress={() => router.back()} 
                        disabled={isSaving}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
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
        backgroundColor: Colors.secondary,
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
    pageHeader: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
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
        lineHeight: 22,
    },
    loadingCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    loadingText: {
        marginLeft: 10,
        color: Colors.secondary,
        fontSize: 14,
        fontWeight: '500',
    },
    formCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: { 
        fontSize: 14, 
        fontWeight: '600',
        color: '#2C2C2C',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 14,
        fontSize: 15,
        color: '#2C2C2C',
        backgroundColor: '#FAFAFA',
    },
    textArea: { 
        height: 120, 
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        backgroundColor: '#FAFAFA',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
        color: '#2C2C2C',
    },
    buttonContainer: {
        paddingHorizontal: 20,
    },
    primaryButton: {
        backgroundColor: Colors.secondary,
        paddingVertical: 16,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    deleteButton: {
        backgroundColor: '#E53935',
        paddingVertical: 16,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 16,
        borderRadius: 8,
        marginBottom: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    cancelButtonText: {
        color: '#757575',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
    footerSpacer: {
        height: 40,
    },
});
