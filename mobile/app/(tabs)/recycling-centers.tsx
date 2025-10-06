import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  RefreshControl,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { apiGet, apiDelete, API_ENDPOINTS } from '../../utils/api';

interface RecyclingCenter {
  id: number;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  hours?: string;
  services?: string[];
  rating?: number;
  distance?: number;
  createdAt?: string;
}

export default function RecyclingCentersTab() {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [recyclingCenters, setRecyclingCenters] = useState<RecyclingCenter[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedHours, setExpandedHours] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const filterOptions = ['All', 'Plastic', 'Glass', 'Metal', 'Paper', 'Electronics', 'Batteries', 'Organic Waste'];

  useFocusEffect(
    useCallback(() => {
      loadRecyclingCenters();
    }, [])
  );

  const loadRecyclingCenters = async () => {
    try {
      setLoading(true);
      const centers = await apiGet(API_ENDPOINTS.CENTERS);
      setRecyclingCenters(centers);
    } catch (error) {
      console.error('Error loading recycling centers:', error);
      Alert.alert('Error', 'Failed to load recycling centers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecyclingCenters();
    setRefreshing(false);
  };

  const handleDeleteCenter = (center: RecyclingCenter) => {
    Alert.alert(
      'Delete Center',
      `Are you sure you want to delete "${center.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDelete(`${API_ENDPOINTS.CENTERS}/${center.id}`);
              Alert.alert('Success', 'Recycling center deleted successfully');
              await loadRecyclingCenters();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete recycling center');
            }
          }
        }
      ]
    );
  };

  const filteredAndSortedCenters = recyclingCenters
    .filter(center => {
      if (selectedFilter === 'All') return true;
      const services = center.services || [];
      return services.includes(selectedFilter);
    })
    .sort((a, b) => {
      if (sortBy === 'distance') return (a.distance || 0) - (b.distance || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  const callCenter = (phone?: string) => {
    if (phone && phone.trim()) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('No Phone Number', 'This center does not have a phone number listed.');
    }
  };

  const openWebsite = (website?: string) => {
    if (website && website.trim()) {
      Linking.openURL(website);
    } else {
      Alert.alert('No Website', 'This center does not have a website listed.');
    }
  };

  const getDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
  };

  const parseOperatingHours = (hoursString?: string) => {
    if (!hoursString) return [];
    
    const dayHours = hoursString.split(', ').map(dayHour => {
      const [day, hours] = dayHour.split(': ');
      return { day: day?.trim() || '', hours: hours?.trim() || '' };
    }).filter(item => item.day && item.hours);
    
    return dayHours;
  };

  const toggleHoursExpansion = (centerId: number) => {
    setExpandedHours(prev => {
      const newSet = new Set(prev);
      if (newSet.has(centerId)) {
        newSet.delete(centerId);
      } else {
        newSet.add(centerId);
      }
      return newSet;
    });
  };

  const renderOperatingHours = (center: RecyclingCenter) => {
    if (!center.hours) return null;
    
    const dayHours = parseOperatingHours(center.hours);
    if (dayHours.length === 0) return null;
    
    const isExpanded = expandedHours.has(center.id);
    const displayHours = isExpanded ? dayHours : dayHours.slice(0, 3);
    const hasMore = dayHours.length > 3;
    
    return (
      <View style={styles.hoursContainer}>
        <MaterialIcons name="access-time" size={16} color="#666" />
        <View style={styles.hoursContent}>
          {displayHours.map((dayHour, index) => (
            <View key={index} style={styles.dayHourRow}>
              <Text style={styles.dayText}>{dayHour.day}:</Text>
              <Text style={styles.hoursText}>{dayHour.hours}</Text>
            </View>
          ))}
          
          {hasMore && (
            <TouchableOpacity
              style={styles.moreHoursButton}
              onPress={() => toggleHoursExpansion(center.id)}
            >
              <Text style={styles.moreHoursText}>
                {isExpanded ? 'Show Less' : `+${dayHours.length - 3} more days`}
              </Text>
              <MaterialIcons 
                name={isExpanded ? 'expand-less' : 'expand-more'} 
                size={16} 
                color="#4CAF50" 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const handleEditCenter = (center: RecyclingCenter) => {
    router.push({
      pathname: '/screens/recyclingcenters/AddRecyclingCenterScreen',
      params: { editCenter: JSON.stringify(center) }
    });
  };

  const renderCenterCard = ({ item }: { item: RecyclingCenter }) => (
    <View style={styles.centerCard}>
      <View style={styles.centerHeader}>
        <View style={styles.centerInfo}>
          <Text style={styles.centerName}>{item.name}</Text>
          <Text style={styles.centerAddress}>{item.address}</Text>
        </View>
        <View style={styles.centerMeta}>
          {item.rating !== undefined && item.rating > 0 && (
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          )}
          {item.distance !== undefined && item.distance > 0 && (
            <Text style={styles.distanceText}>{item.distance} miles</Text>
          )}
        </View>
      </View>

      {/* Services */}
      {item.services && item.services.length > 0 && (
        <View style={styles.servicesContainer}>
          <Text style={styles.servicesLabel}>Services:</Text>
          <View style={styles.servicesTags}>
            {item.services.map((service, index) => (
              <View key={index} style={styles.serviceTag}>
                <Text style={styles.serviceTagText}>{service}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Hours */}
      {renderOperatingHours(item)}

      {/* Edit and Delete Buttons */}
      <View style={styles.cardActionsBottom}>
        <TouchableOpacity
          style={styles.editButtonLarge}
          onPress={() => handleEditCenter(item)}
        >
          <MaterialIcons name="edit" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButtonLarge}
          onPress={() => handleDeleteCenter(item)}
        >
          <MaterialIcons name="delete" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {item.phone && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => callCenter(item.phone)}
          >
            <MaterialIcons name="phone" size={18} color="#4CAF50" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => getDirections(item.address)}
        >
          <MaterialIcons name="directions" size={18} color="#2196F3" />
          <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>Directions</Text>
        </TouchableOpacity>

        {item.website && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openWebsite(item.website)}
          >
            <MaterialIcons name="language" size={18} color="#FF9800" />
            <Text style={[styles.actionButtonText, { color: "#FF9800" }]}>Website</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="location-off" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No recycling centers yet</Text>
      <Text style={styles.emptySubtitle}>Start adding recycling centers to your database!</Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => router.push('/screens/recyclingcenters/AddRecyclingCenterScreen')}
      >
        <MaterialIcons name="add" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.emptyButtonText}>Add Your First Center</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recycling centers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📍 Recycling Centers</Text>
          <Text style={styles.headerSubtitle}>
            {recyclingCenters.length} centers found
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/screens/recyclingcenters/AddRecyclingCenterScreen')}
        >
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
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
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          {[
            { key: 'distance', label: 'Distance', icon: 'near-me' },
            { key: 'rating', label: 'Rating', icon: 'star' },
            { key: 'name', label: 'Name', icon: 'sort-by-alpha' }
          ].map((sort) => (
            <TouchableOpacity
              key={sort.key}
              style={[
                styles.sortButton,
                sortBy === sort.key && styles.sortButtonActive
              ]}
              onPress={() => setSortBy(sort.key)}
            >
              <MaterialIcons 
                name={sort.icon as any} 
                size={16} 
                color={sortBy === sort.key ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.sortButtonText,
                sortBy === sort.key && styles.sortButtonTextActive
              ]}>
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Centers List */}
      {recyclingCenters.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredAndSortedCenters}
          renderItem={renderCenterCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.centersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 50,
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filterChip: {
    backgroundColor: '#F5F5F5',
    height: 30,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sortLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 15,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 4,
  },
  sortButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: 'white',
  },
  centersList: {
    padding: 15,
  },
  centerCard: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  centerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  centerInfo: {
    flex: 1,
    marginRight: 12,
  },
  centerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  centerAddress: {
    fontSize: 16,
    color: '#666',
    lineHeight: 20,
  },
  centerMeta: {
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  servicesContainer: {
    marginBottom: 12,
  },
  servicesLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  servicesTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  serviceTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceTagText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  hoursContent: {
    flex: 1,
  },
  dayHourRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    marginBottom: 2,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
    marginRight: 8,
  },
  hoursText: {
    fontSize: 12,
    color: '#666',
  },
  moreHoursButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  moreHoursText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  cardActionsBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 12,
    paddingTop: 4,
  },
  editButtonLarge: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonLarge: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
