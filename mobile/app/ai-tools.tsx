import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ChatBot from '../../components/ChatBot';
import ObjectDetection from '../../components/ObjectDetection';

export default function AITools() {
  const [activeTab, setActiveTab] = React.useState('chatbot'); // 'chatbot' or 'detection'
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Tools</Text>
        <View style={styles.backButton} /> {/* Empty view for symmetry */}
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'chatbot' && styles.activeTabButton
          ]} 
          onPress={() => setActiveTab('chatbot')}
        >
          <Ionicons 
            name="chatbubble" 
            size={20} 
            color={activeTab === 'chatbot' ? "#4CAF50" : "#777"} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'chatbot' && styles.activeTabText
          ]}>
            EcoZen Chat
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'detection' && styles.activeTabButton
          ]} 
          onPress={() => setActiveTab('detection')}
        >
          <Ionicons 
            name="camera" 
            size={20} 
            color={activeTab === 'detection' ? "#4CAF50" : "#777"} 
          />
          <Text style={[
            styles.tabText,
            activeTab === 'detection' && styles.activeTabText
          ]}>
            Waste Detection
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Content Area */}
      <View style={styles.content}>
        {activeTab === 'chatbot' ? (
          <ChatBot />
        ) : (
          <ObjectDetection />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 48,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#777',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});