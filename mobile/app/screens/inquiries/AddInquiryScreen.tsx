import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  StatusBar,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { apiPost, apiPut, API_ENDPOINTS } from "../../../utils/api";

interface CategoryOption {
  value: string;
  label: string;
}

const categoryOptions: CategoryOption[] = [
  { value: "knowledge-hub", label: "📚 Knowledge Hub" },
  { value: "scan", label: "📸 Scan Feature" },
  { value: "logs", label: "📊 Waste Logs" },
  { value: "locations", label: "📍 Recycling Centers" },
  { value: "profile", label: "👤 Profile & Settings" },
  { value: "app-issue", label: "🐛 App Issue/Bug" },
  { value: "feature-request", label: "💡 Feature Request" },
  { value: "account", label: "🔐 Account Related" },
  { value: "other", label: "❓ Other" },
];

export default function AddInquiryScreen() {
  const params = useLocalSearchParams();
  const editInquiry = params.editInquiry
    ? JSON.parse(params.editInquiry as string)
    : null;
  const isEditing = !!editInquiry;

  const [title, setTitle] = useState(editInquiry ? editInquiry.title : "");
  const [question, setQuestion] = useState(
    editInquiry ? editInquiry.question : ""
  );
  const [category, setCategory] = useState(
    editInquiry ? editInquiry.category || "" : ""
  );
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Required Field", "Please enter a title for your inquiry");
      return;
    }

    if (!category.trim()) {
      Alert.alert(
        "Required Field",
        "Please select a category for your inquiry"
      );
      return;
    }

    if (!question.trim()) {
      Alert.alert("Required Field", "Please enter your question");
      return;
    }

    try {
      if (isEditing) {
        await apiPut(API_ENDPOINTS.INQUIRY_BY_ID(editInquiry.id), {
          title: title.trim(),
          question: question.trim(),
          category,
        });
        Alert.alert("Success", "Inquiry updated successfully");
      } else {
        await apiPost(API_ENDPOINTS.INQUIRIES, {
          title: title.trim(),
          question: question.trim(),
          category,
        });
        Alert.alert("Success", "Inquiry saved as draft");
      }
      router.back();
    } catch (error) {
      console.error("Error saving inquiry:", error);
      Alert.alert("Error", "Failed to save inquiry");
    }
  };

  const handleSaveAndSend = async () => {
    if (!title.trim()) {
      Alert.alert("Required Field", "Please enter a title for your inquiry");
      return;
    }

    if (!category.trim()) {
      Alert.alert(
        "Required Field",
        "Please select a category for your inquiry"
      );
      return;
    }

    if (!question.trim()) {
      Alert.alert("Required Field", "Please enter your question");
      return;
    }

    Alert.alert(
      "Send Inquiry",
      "Are you sure you want to send this inquiry? You won't be able to edit it after sending.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            try {
              let inquiryId;
              if (isEditing) {
                await apiPut(API_ENDPOINTS.INQUIRY_BY_ID(editInquiry.id), {
                  title: title.trim(),
                  question: question.trim(),
                  category,
                });
                inquiryId = editInquiry.id;
              } else {
                const newInquiry = await apiPost(API_ENDPOINTS.INQUIRIES, {
                  title: title.trim(),
                  question: question.trim(),
                  category,
                });
                inquiryId = newInquiry.id;
              }

              // Send the inquiry
              await apiPost(API_ENDPOINTS.SEND_INQUIRY(inquiryId), {});
              Alert.alert("Success", "Inquiry sent successfully");
              router.back();
            } catch (error) {
              console.error("Error sending inquiry:", error);
              Alert.alert("Error", "Failed to send inquiry");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Inquiry" : "New Inquiry"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Brief title for your inquiry"
            placeholderTextColor="#999"
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text
              style={[styles.dropdownText, !category && styles.placeholderText]}
            >
              {category
                ? categoryOptions.find((opt) => opt.value === category)
                    ?.label || "Select Category"
                : "Select what your question is about"}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Question Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Question *</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={question}
            onChangeText={setQuestion}
            placeholder="Describe your question in detail..."
            placeholderTextColor="#999"
            multiline={true}
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          <Text style={styles.charCount}>{question.length}/500</Text>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color="#4CAF50" />
          <Text style={styles.infoText}>
            {isEditing
              ? "You can edit this inquiry until you send it."
              : "Save as draft to edit later, or send directly to our support team."}
          </Text>
        </View>
      </ScrollView>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
        presentationStyle="overFullScreen"
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                style={styles.modalCloseButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={categoryOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    category === item.value && styles.selectedCategoryItem,
                  ]}
                  onPress={() => {
                    setCategory(item.value);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      category === item.value && styles.selectedCategoryText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {category === item.value && (
                    <MaterialIcons name="check" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <MaterialIcons name="save" size={20} color="#4CAF50" />
          <Text style={styles.saveButtonText}>Save Draft</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sendButton} onPress={handleSaveAndSend}>
          <MaterialIcons name="send" size={20} color="white" />
          <Text style={styles.sendButtonText}>Send Inquiry</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },

  backButton: {
    padding: 8,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },

  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  inputGroup: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },

  textInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    fontSize: 16,
  },

  multilineInput: {
    minHeight: 120,
    paddingTop: 12,
  },

  charCount: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 4,
  },

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },

  infoText: {
    fontSize: 14,
    color: "#4CAF50",
    flex: 1,
    lineHeight: 18,
  },

  buttonContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "white",
    gap: 12,
  },

  saveButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4CAF50",
    backgroundColor: "white",
    gap: 8,
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4CAF50",
  },

  sendButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    gap: 8,
  },

  sendButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },

  // Dropdown styles
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    minHeight: 48,
  },

  dropdownText: {
    fontSize: 16,
    flex: 1,
  },

  placeholderText: {
    color: "#999",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 8,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "white",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },

  modalCloseButton: {
    padding: 4,
  },

  // Category item styles
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  selectedCategoryItem: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },

  categoryText: {
    fontSize: 16,
    flex: 1,
  },

  selectedCategoryText: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});
