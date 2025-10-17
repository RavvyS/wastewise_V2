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
// Cast the import to 'any' to resolve module not found error
const { Picker } = require('@react-native-picker/picker') as { Picker: any };

// Import original types and functions, aliasing the types
import { 
    createNewContent, 
    updateExistingContent, 
    deleteContentById,
    Article as ImportedArticle,
    Quiz as ImportedQuiz
} from '../services/sqliteService';

// Define local types used by this component that ensure the presence of required fields
// FIX: Changed id type from number to string to match sqliteService types
export interface Article extends ImportedArticle {
    category: string; 
    level: string; 
    content: string;
    id: string; // Changed from number to string
}

export interface Quiz extends ImportedQuiz {
    question: string;
    answer: string;
    id: string; // Changed from number to string
}

// Data shape for content being created/updated (no ID required)
type ContentData = Omit<Article, 'id'> | Omit<Quiz, 'id'>;

// Constants for Categories and Levels
const CATEGORIES = ['Plastic', 'Water', 'Energy', 'Soil', 'Air Quality', 'Carbon Footprint', 'Sustainable Living', 'General'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

interface ContentFormProps {
    type: 'article' | 'quiz';
    initialData?: Article | Quiz; 
}

export default function ContentForm({ type, initialData }: ContentFormProps) {
    const router = useRouter();
    
    const isArticle = type === 'article';
    // Use the locally defined Article/Quiz types for safer casting
    const articleData = initialData && isArticle ? initialData as Article : null;
    const quizData = initialData && !isArticle ? initialData as Quiz : null;
    
    // Core content state
    const [title, setTitle] = useState(initialData?.title || '');
    const [content, setContent] = useState(articleData?.content || '');
    const [question, setQuestion] = useState(quizData?.question || '');
    const [answer, setAnswer] = useState(quizData?.answer || '');
    
    // State for Category & Level
    const [category, setCategory] = useState(articleData?.category || CATEGORIES[0]);
    const [level, setLevel] = useState(articleData?.level || LEVELS[0]);
    
    const [isSaving, setIsSaving] = useState(false);

    const isEditing = !!initialData?.id;
    const collectionName = (type === 'article' ? 'articles' : 'quizzes') as 'articles' | 'quizzes';
    const headerText = isEditing ? `Edit ${type === 'article' ? 'Article' : 'Quiz'}` : `Create New ${type === 'article' ? 'Article' : 'Quiz'}`;

    const handleSubmit = async () => {
        if (!title.trim() || 
            (type === 'article' && !content.trim()) || 
            (type === 'quiz' && (!question.trim() || !answer.trim()))) {
          Alert.alert("⚠️ Missing Fields", "Please fill in all required fields.");
          return;
        }
        
        setIsSaving(true);
        
        const commonData = { title };
        let dataToSave: ContentData;

        if (type === 'article') {
            dataToSave = { 
                ...commonData, 
                content: content,
                category: category, 
                level: level,      
            };
        } else {
            dataToSave = { ...commonData, question: question, answer: answer };
        }

        try {
            if (isEditing && initialData?.id) {
                // FIX: Removed 'as number' cast since id is now string
                await updateExistingContent(collectionName, initialData.id, dataToSave as ImportedArticle | ImportedQuiz);
                Alert.alert("✅ Success", `${title} updated successfully!`);
            } else {
                await createNewContent(collectionName, dataToSave as ImportedArticle | ImportedQuiz);
                Alert.alert("✅ Success", `New ${title} created!`);
            }
        } catch (error) {
            console.error("DB Save/Update Failed:", error);
            Alert.alert("❌ Error", "Could not save content to the database.");
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
                            // FIX: Removed 'as number' cast since id is now string
                            await deleteContentById(collectionName, initialData.id);
                            Alert.alert("✅ Deleted", `${initialData.title} was removed.`);
                        } catch (error) {
                            console.error("Delete Failed:", error);
                            Alert.alert("❌ Error", "Could not delete content.");
                        } finally {
                            setIsSaving(false);
                            router.back();
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
                        <ActivityIndicator size="small" color="#67A859" />
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
                        <>
                            {/* Category Selector */}
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Category</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={category}
                                        onValueChange={(itemValue: string) => setCategory(itemValue)}
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
                                        onValueChange={(itemValue: string) => setLevel(itemValue)}
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
        color: '#67A859',
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
        backgroundColor: '#67A859',
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