// app/ContentForm.tsx - Eco-Themed
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

import { 
    createNewContent, 
    updateExistingContent, 
    deleteContentById,
    Article, 
    Quiz 
} from '../services/sqliteService';

type ContentData = Omit<Article, 'id'> | Omit<Quiz, 'id'>;

interface ContentFormProps {
  type: 'article' | 'quiz';
  initialData?: Article | Quiz; 
}

export default function ContentForm({ type, initialData }: ContentFormProps) {
  const router = useRouter();
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState((initialData as Article)?.content || '');
  const [question, setQuestion] = useState((initialData as Quiz)?.question || '');
  const [answer, setAnswer] = useState((initialData as Quiz)?.answer || '');
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!initialData?.id;
  const collectionName = (type === 'article' ? 'articles' : 'quizzes') as 'articles' | 'quizzes';
  const headerText = isEditing ? `Edit ${type === 'article' ? 'Article' : 'Quiz'}` : `Create New ${type === 'article' ? 'Article' : 'Quiz'}`;

  const handleSubmit = async () => {
    if (!title.trim() || (type === 'article' && !content.trim()) || (type === 'quiz' && (!question.trim() || !answer.trim()))) {
      Alert.alert("⚠️ Missing Fields", "Please fill in all required fields.");
      return;
    }
    
    setIsSaving(true);
    
    const commonData = { title };
    let dataToSave: ContentData;

    if (type === 'article') {
      dataToSave = { ...commonData, content: content };
    } else {
      dataToSave = { ...commonData, question: question, answer: answer };
    }

    try {
        if (isEditing && initialData?.id) {
            await updateExistingContent(collectionName, initialData.id, dataToSave);
            Alert.alert("✅ Success", `${title} updated successfully!`);
        } else {
            await createNewContent(collectionName, dataToSave);
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
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Ionicons 
            name={type === 'article' ? "newspaper" : "bulb"} 
            size={32} 
            color="#2E7D32" 
          />
        </View>
        <Text style={styles.headerTitle}>{headerText}</Text>
      </View>

      {isSaving && (
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#2E7D32" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

      {/* Form Card */}
      <View style={styles.formCard}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            <Ionicons name="text" size={16} color="#388E3C" /> Title
          </Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={`e.g., The ${type} on Plastic Waste`}
            placeholderTextColor="#81C784"
            editable={!isSaving}
          />
        </View>

        {type === 'article' ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              <Ionicons name="document-text" size={16} color="#388E3C" /> Article Content
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              multiline
              placeholder="Write the full article content here..."
              placeholderTextColor="#81C784"
              editable={!isSaving}
            />
          </View>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="help-circle" size={16} color="#388E3C" /> Quiz Question
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={question}
                onChangeText={setQuestion}
                multiline
                placeholder="Enter the quiz question..."
                placeholderTextColor="#81C784"
                editable={!isSaving}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="checkmark-circle" size={16} color="#388E3C" /> Correct Answer
              </Text>
              <TextInput
                style={styles.input}
                value={answer}
                onChangeText={setAnswer}
                placeholder="Enter the exact answer (e.g., 'LED')"
                placeholderTextColor="#81C784"
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
          <Ionicons name={isEditing ? "save" : "add-circle"} size={20} color="#fff" />
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
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.deleteButtonText}>Delete Item</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.cancelButton, isSaving && styles.disabledButton]} 
          onPress={() => router.back()} 
          disabled={isSaving}
        >
          <Ionicons name="close-circle" size={20} color="#666" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  header: {
    backgroundColor: '#C5E1A5',
    paddingTop: 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  iconBadge: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 50,
    marginBottom: 12,
  },
  headerTitle: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: '#1B5E20',
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
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingText: {
    marginLeft: 10,
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#66BB6A',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600',
    color: '#388E3C',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 2,
    borderColor: '#C5E1A5',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#2E7D32',
    backgroundColor: '#F1F8E9',
  },
  textArea: { 
    height: 150, 
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#43A047',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D32F2F',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E0E0',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  footerSpacer: {
    height: 40,
  },
});