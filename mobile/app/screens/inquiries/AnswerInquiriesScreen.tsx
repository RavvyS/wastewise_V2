import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { apiGet, apiPost, API_ENDPOINTS } from '../../../utils/api';

interface Inquiry {
  id: number;
  title: string;
  question: string;
  category?: string;
  status: 'draft' | 'sent' | 'answered';
  response?: string;
  createdAt: string;
  sentAt?: string;
  respondedAt?: string;
}

export default function AnswerInquiriesScreen() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [truncatedCards, setTruncatedCards] = useState<Set<number>>(new Set());
  const [answerModalVisible, setAnswerModalVisible] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [responseText, setResponseText] = useState('');

  const filterOptions = ['All', 'Pending', 'Answered'];

  useFocusEffect(
    useCallback(() => {
      loadSentInquiries();
    }, [])
  );

  const loadSentInquiries = async () => {
    try {
      const inquiriesData = await apiGet(API_ENDPOINTS.INQUIRIES_SENT);
      setInquiries(inquiriesData);
    } catch (error) {
      console.error('Error loading sent inquiries:', error);
      Alert.alert('Error', 'Failed to load inquiries');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSentInquiries();
    setRefreshing(false);
  };

  const handleAnswerInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setResponseText('');
    setAnswerModalVisible(true);
  };

  const submitAnswer = async () => {
    if (!responseText.trim()) {
      Alert.alert('Validation Error', 'Please enter a response');
      return;
    }

    if (!selectedInquiry) return;

    try {
      await apiPost(API_ENDPOINTS.ANSWER_INQUIRY(selectedInquiry.id), {
        response: responseText.trim()
      });
      Alert.alert('Success', 'Response submitted successfully');
      setAnswerModalVisible(false);
      await loadSentInquiries();
    } catch (error) {
      console.error('Error submitting response:', error);
      Alert.alert('Error', 'Failed to submit response');
    }
  };

  const toggleExpanded = (inquiryId: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(inquiryId)) {
        newSet.delete(inquiryId);
      } else {
        newSet.add(inquiryId);
      }
      return newSet;
    });
  };

  const isExpanded = (inquiryId: number) => expandedCards.has(inquiryId);
  
  const handleTextLayout = (inquiryId: number, event: any) => {
    const { lines } = event.nativeEvent;
    setTruncatedCards(prev => {
      const newSet = new Set(prev);
      if (lines.length > 3) {
        newSet.add(inquiryId);
      } else {
        newSet.delete(inquiryId);
      }
      return newSet;
    });
  };

  const isTruncated = (inquiryId: number) => truncatedCards.has(inquiryId);

  const getCategoryLabel = (category?: string) => {
    const categoryOptions: Record<string, string> = {
      '': 'General Question',
      'knowledge-hub': '📚 Knowledge Hub',
      'scan': '📸 Scan Feature',
      'logs': '📊 Waste Logs',
      'locations': '📍 Recycling Centers',
      'profile': '👤 Profile & Settings',
      'app-issue': '🐛 App Issue/Bug',
      'feature-request': '💡 Feature Request',
      'account': '🔐 Account Related',
      'other': '❓ Other',
    };
    return categoryOptions[category || ''] || category || 'General Question';
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Pending') return inquiry.status === 'sent';
    if (selectedFilter === 'Answered') return inquiry.status === 'answered';
    return true;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (status: string) => {
    const statusConfig: Record<string, {color: string, text: string}> = {
      'sent': { color: '#FF9800', text: 'PENDING' },
      'answered': { color: '#4CAF50', text: 'ANSWERED' }
    };
    return statusConfig[status] || { color: '#9E9E9E', text: status.toUpperCase() };
  };

  const renderInquiryCard = ({ item }: { item: Inquiry }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <View style={[
        styles.inquiryCard, 
        item.status === 'sent' && { borderLeftColor: '#FF9800' }
      ]}>
        <View style={styles.inquiryHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.inquiryTitle}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>
          </View>
        
          <View style={styles.metaInfo}>
            <Text style={styles.sentDate}>
              Sent: {formatDate(item.sentAt)}
            </Text>
            {item.category && (
              <Text style={styles.categoryName}>Category: {getCategoryLabel(item.category)}</Text>
            )}
          </View>
        </View>
      
        <View style={styles.questionContainer}>
          <Text style={styles.sectionLabel}>Question:</Text>
          <Text 
            style={styles.inquiryQuestion} 
            numberOfLines={isExpanded(item.id) ? undefined : 3} 
            ellipsizeMode="tail"
            onTextLayout={(event) => handleTextLayout(item.id, event)}
          >
            {item.question}
          </Text>
          
          {isTruncated(item.id) && (
            <TouchableOpacity 
              style={styles.readMoreButton}
              onPress={() => toggleExpanded(item.id)}
            >
              <Text style={styles.readMoreText}>
                {isExpanded(item.id) ? 'Read Less' : 'Read More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      
        {/* Response Section for Answered Inquiries */}
        {item.response && (
          <View style={styles.responseSection}>
            <Text style={styles.responseSectionLabel}>Your Response:</Text>
            <View style={styles.responseContainer}>
              <Text style={styles.responseText}>{item.response}</Text>
            </View>
            <Text style={styles.responseDate}>
              Answered: {formatDate(item.respondedAt)}
            </Text>
          </View>
        )}

        {/* Answer Button - Only for pending inquiries */}
        {item.status === 'sent' && (
          <View style={styles.answerButtonContainer}>
            <TouchableOpacity
              style={styles.answerButton}
              onPress={() => handleAnswerInquiry(item)}
            >
              <MaterialIcons name="reply" size={20} color="white" />
              <Text style={styles.answerButtonText}>Answer Inquiry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="mark-email-read" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No inquiries found</Text>
      <Text style={styles.emptySubtitle}>
        No inquiries have been sent yet
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Answer Inquiries</Text>
          <Text style={styles.headerSubtitle}>
            {inquiries.filter(i => i.status === 'sent').length} pending, {inquiries.filter(i => i.status === 'answered').length} answered
          </Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{inquiries.filter(i => i.status === 'sent').length}</Text>
        </View>
      </View>

      {/* Filter Options */}
      <View style={styles.filterContainer}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.filterChipActive
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterChipText,
              selectedFilter === filter && styles.filterChipTextActive
            ]}>
              {filter}
            </Text>
            {filter !== 'All' && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>
                  {filter === 'Pending' 
                    ? inquiries.filter(i => i.status === 'sent').length 
                    : inquiries.filter(i => i.status === 'answered').length
                  }
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Inquiries List */}
      <FlatList
        data={filteredInquiries}
        renderItem={renderInquiryCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.inquiriesList}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4CAF50']}
          />
        }
      />

      {/* Answer Modal */}
      <Modal
        visible={answerModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAnswerModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Answer Inquiry</Text>
              <TouchableOpacity onPress={() => setAnswerModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
              {selectedInquiry && (
                <>
                  <Text style={styles.modalInquiryTitle}>{selectedInquiry.title}</Text>
                  <Text style={styles.modalInquiryQuestion}>{selectedInquiry.question}</Text>
                  
                  <Text style={styles.modalLabel}>Your Response:</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={responseText}
                    onChangeText={setResponseText}
                    placeholder="Type your answer here..."
                    placeholderTextColor="#999"
                    multiline={true}
                    numberOfLines={6}
                    textAlignVertical="top"
                    maxLength={500}
                  />
                  <Text style={styles.charCount}>{responseText.length}/500</Text>
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setAnswerModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitAnswer}
              >
                <Text style={styles.submitButtonText}>Submit Answer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  backButton: {
    padding: 8,
    marginRight: 8,
  },
  
  headerContent: {
    flex: 1,
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
  },

  headerBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },

  headerBadgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },

  // Filter Options
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 8,
  },
  
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    gap: 6,
  },
  
  filterChipActive: {
    backgroundColor: '#4CAF50',
  },
  
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  filterChipTextActive: {
    color: 'white',
  },

  filterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },

  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Inquiry Card
  inquiryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },

  inquiryHeader: {
    marginBottom: 16,
  },

  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  inquiryTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },

  statusBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },

  metaInfo: {
    gap: 4,
  },

  sentDate: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },

  questionContainer: {
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },

  inquiryQuestion: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },

  readMoreButton: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },

  readMoreText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },

  // Answer button
  answerButtonContainer: {
    alignItems: 'flex-end',
  },

  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },

  answerButtonText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },

  // Response section for answered inquiries
  responseSection: {
    marginBottom: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 8,
  },

  responseSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 6,
  },

  responseContainer: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },

  responseText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#333',
  },

  responseDate: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },

  // List
  inquiriesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '85%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },

  modalBody: {
    flex: 1,
  },

  modalBodyContent: {
    padding: 20,
    flexGrow: 1,
  },

  modalInquiryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },

  modalInquiryQuestion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },

  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },

  modalTextInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },

  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },

  modalActions: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginRight: 8,
  },

  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },

  submitButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    marginLeft: 8,
  },

  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

