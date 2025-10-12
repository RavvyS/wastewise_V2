import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { apiGet, apiPost, apiDelete, API_ENDPOINTS } from '../../../utils/api';

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

export default function InquiriesScreen() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filterOptions = ['All', 'Draft', 'Sent', 'Answered'];

  useFocusEffect(
    useCallback(() => {
      loadInquiries();
    }, [])
  );

  const loadInquiries = async () => {
    try {
      const inquiriesData = await apiGet(API_ENDPOINTS.INQUIRIES);
      setInquiries(inquiriesData);
    } catch (error) {
      console.error('Error loading inquiries:', error);
      Alert.alert('Error', 'Failed to load inquiries');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInquiries();
    setRefreshing(false);
  };

  const handleSendInquiry = (inquiry: Inquiry) => {
    Alert.alert(
      'Send Inquiry',
      `Are you sure you want to send "${inquiry.title}"? You won't be able to edit it after sending.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              await apiPost(API_ENDPOINTS.SEND_INQUIRY(inquiry.id), {});
              Alert.alert('Success', 'Inquiry sent successfully');
              await loadInquiries();
            } catch (error) {
              console.error('Error sending inquiry:', error);
              Alert.alert('Error', 'Failed to send inquiry');
            }
          }
        }
      ]
    );
  };

  const handleDeleteInquiry = (inquiry: Inquiry) => {
    Alert.alert(
      'Delete Inquiry',
      `Are you sure you want to delete "${inquiry.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDelete(API_ENDPOINTS.INQUIRY_BY_ID(inquiry.id));
              Alert.alert('Success', 'Inquiry deleted successfully');
              await loadInquiries();
            } catch (error) {
              console.error('Error deleting inquiry:', error);
              Alert.alert('Error', 'Failed to delete inquiry');
            }
          }
        }
      ]
    );
  };

  const handleEditInquiry = (inquiry: Inquiry) => {
    router.push({
      pathname: '/screens/inquiries/AddInquiryScreen',
      params: { editInquiry: JSON.stringify(inquiry) }
    });
  };

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
    if (selectedFilter === 'Draft') return inquiry.status === 'draft';
    if (selectedFilter === 'Sent') return inquiry.status === 'sent';
    if (selectedFilter === 'Answered') return inquiry.status === 'answered';
    return true;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusInfo = (status: string) => {
    const statusConfig: Record<string, {color: string, text: string}> = {
      'draft': { color: '#9E9E9E', text: 'DRAFT' },
      'sent': { color: '#FF9800', text: 'SENT' },
      'answered': { color: '#4CAF50', text: 'ANSWERED' }
    };
    return statusConfig[status] || { color: '#9E9E9E', text: status.toUpperCase() };
  };

  const renderInquiryCard = ({ item }: { item: Inquiry }) => {
    const statusInfo = getStatusInfo(item.status);
    
    return (
      <View style={styles.inquiryCard}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.inquiryTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>
          </View>
          {item.category && (
            <Text style={styles.category}>{getCategoryLabel(item.category)}</Text>
          )}
          <Text style={styles.date}>Created: {formatDate(item.createdAt)}</Text>
        </View>

        <Text style={styles.question} numberOfLines={2}>
          {item.question}
        </Text>

        {item.response && (
          <View style={styles.responsePreview}>
            <Text style={styles.responseLabel}>Response:</Text>
            <Text style={styles.responseText} numberOfLines={2}>{item.response}</Text>
          </View>
        )}

        <View style={styles.cardActions}>
          {item.status === 'draft' && (
            <>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleEditInquiry(item)}
              >
                <MaterialIcons name="edit" size={20} color="#2196F3" />
                <Text style={[styles.actionText, { color: '#2196F3' }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleSendInquiry(item)}
              >
                <MaterialIcons name="send" size={20} color="#4CAF50" />
                <Text style={[styles.actionText, { color: '#4CAF50' }]}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteInquiry(item)}
              >
                <MaterialIcons name="delete" size={20} color="#F44336" />
                <Text style={[styles.actionText, { color: '#F44336' }]}>Delete</Text>
              </TouchableOpacity>
            </>
          )}
          {(item.status === 'sent' || item.status === 'answered') && (
            <Text style={styles.infoText}>
              {item.status === 'sent' ? 'Waiting for response...' : 'Inquiry has been answered'}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="question-answer" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No inquiries yet</Text>
      <Text style={styles.emptySubtitle}>
        Start by creating your first inquiry
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/screens/inquiries/AddInquiryScreen')}
      >
        <MaterialIcons name="add" size={20} color="white" />
        <Text style={styles.createButtonText}>Create Inquiry</Text>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>My Inquiries</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/screens/inquiries/AddInquiryScreen')}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
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
                  {filter === 'Draft' 
                    ? inquiries.filter(i => i.status === 'draft').length 
                    : filter === 'Sent'
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
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
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
  },

  cardHeader: {
    marginBottom: 12,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  inquiryTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  statusText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '600',
  },

  category: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 4,
  },

  date: {
    fontSize: 12,
    color: '#666',
  },

  question: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },

  responsePreview: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },

  responseText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },

  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },

  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },

  infoText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
    marginBottom: 24,
  },

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

