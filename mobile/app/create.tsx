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
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { createArticle, createQuiz, createQuizQuestion } from '../utils/api';
import { Colors } from "../constants/Colors";

// Constants for Categories and Levels
const CATEGORIES = ['Plastic', 'Water', 'Energy', 'Soil', 'Air Quality', 'General'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function CreatePage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const type = (params.type as 'article' | 'quiz') || 'article';
    
    const isArticle = type === 'article';
    
    // Core content state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    
    // State for Category & Level
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [level, setLevel] = useState(LEVELS[0]);
    
    const [isSaving, setIsSaving] = useState(false);

    const collectionName = (type === 'article' ? 'articles' : 'quizzes') as 'articles' | 'quizzes';
    const headerText = `Create New ${type === 'article' ? 'Article' : 'Quiz'}`;

    const handleSubmit = async () => {
        if (!title.trim() || 
            (type === 'article' && !content.trim()) || 
            (type === 'quiz' && (!question.trim() || !answer.trim()))) {
          Alert.alert("⚠️ Missing Fields", "Please fill in all required fields.");
          return;
        }
        
        setIsSaving(true);

        try {
    if (type === 'article') {
        await createArticle({
            title: title.trim(),
            content: content.trim(),
            category: category,
            level: level,
        });
        Alert.alert("✅ Success", `New article "${title}" created!`);
    } else {
                const quiz = await createQuiz({
                    title: title.trim(),
                });
                // Create a question for the quiz
                if (question.trim() && answer.trim()) {
                    await createQuizQuestion({
                        quizId: quiz.id,
                        question: question.trim(),
                        correctAnswer: answer.trim(),
                    });
                }
                Alert.alert("✅ Success", `New quiz "${title}" created!`);
            }
            
            router.back();
        } catch (error) {
            console.error("Create content failed:", error);
            Alert.alert("❌ Error", "Could not create content. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Single Green Header */}
            <View style={styles.topHeader}>
                <TouchableOpacity 
                    style={styles.backIconButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create New Article</Text>
            </View>

            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.pageSubtitle}>
                    Create educational content for EcoZen.
                </Text>

                {isSaving && (
                    <View style={styles.loadingCard}>
                        <ActivityIndicator size="small" color={Colors.secondary} />
                        <Text style={styles.loadingText}>Processing...</Text>
                    </View>
                )}

                {/* Form Fields */}
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
                        <>
                            {/* Category Selector */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Category</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={category}
                                        onValueChange={(itemValue) => setCategory(itemValue)}
                                        style={styles.picker}
                                        enabled={!isSaving}
                                    >
                                        {CATEGORIES.map(c => <Picker.Item key={c} label={c} value={c} />)}
                                    </Picker>
                                </View>
                            </View>

                            {/* Level Selector */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Difficulty Level</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={level}
                                        onValueChange={(itemValue) => setLevel(itemValue)}
                                        style={styles.picker}
                                        enabled={!isSaving}
                                    >
                                        {LEVELS.map(l => <Picker.Item key={l} label={l} value={l} />)}
                                    </Picker>
                                </View>
                            </View>

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
                        </>
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

                {/* Action Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.primaryButton, isSaving && styles.disabledButton]}
                        onPress={handleSubmit} 
                        disabled={isSaving}
                    >
                        <Text style={styles.primaryButtonText}>
                            {isSaving ? "Creating..." : "Create Content"}
                        </Text>
                    </TouchableOpacity>

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
    topHeader: {
        backgroundColor: Colors.secondary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    learningHeader: {
        backgroundColor: Colors.secondary,
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backIconButton: {
        marginRight: 12,
        padding: 4,
    },
    backIconButtonWhite: {
        marginRight: 12,
        padding: 4,
    },
    headerTitle: { 
        fontSize: 20, 
        fontWeight: "bold", 
        color: '#FFFFFF',
        fontFamily: 'System',
        marginLeft: 12,
    },
    learningTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'System',
    },
    scrollContent: {
        flex: 1,
        padding: 20,
    },
    pageHeader: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 8,
        fontFamily: 'System',
    },
    pageSubtitle: {
        fontSize: 16,
        color: '#757575',
        lineHeight: 22,
        marginBottom: 20,
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
        width: '100%',
    },
    primaryButtonText: {
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
