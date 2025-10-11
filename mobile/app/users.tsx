import { useEffect, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableWithoutFeedback, View, ListRenderItem } from 'react-native';
import React from 'react'; // Explicit React import for TSX/JSX

import ActionButton from '../components/ActionButton';
import { SAMPLE_USERS, USERS_KEY } from '../constants/constants';
// Assuming 'styles' and 'utils' are also defined/converted
import { styles } from '../styles/styles';
import { loadOrInit, save, uuid } from '../utils/storage';

// --- TYPE DEFINITIONS ---

// Define the structure of a User item
interface User {
  id: string;
  name: string;
  email: string;
  // Add other properties if they exist in SAMPLE_USERS (e.g., role: string)
}

// Define the structure for the alert message box state
interface AlertMessageBox {
  type: 'alert';
  title: string;
  message: string;
}

// Define the structure for the confirmation message box state
interface ConfirmMessageBox {
  type: 'confirm';
  title: string;
  message: string;
  onConfirm: () => void;
}

// Union type for the message box state
type MessageBoxState = AlertMessageBox | ConfirmMessageBox | null;

const UsersScreen: React.FC = () => {
  // State for the list of users
  const [users, setUsers] = useState<User[]>([]);
  // State for the visibility of the Add/Edit Modal
  const [modalVisible, setModalVisible] = useState(false);
  // State to hold the user being edited, or null for creation
  const [editing, setEditing] = useState<User | null>(null);
  // States for the form inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // State for showing alerts/confirmations
  const [messageBox, setMessageBox] = useState<MessageBoxState>(null);
  // State for search input
  const [searchQuery, setSearchQuery] = useState('');

  // Effect to load data on mount
  useEffect(() => {
    (async () => {
      // Type assertion 'as User[]' to tell TypeScript the expected data structure
      const data = await loadOrInit(USERS_KEY, SAMPLE_USERS) as User[];
      setUsers(data);
    })();
  }, []);

  // Filter users based on search query (Memoized by React automatically since it's only in the render)
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to open the modal for creating a new user
  async function openCreate(): Promise<void> {
    setEditing(null);
    setName('');
    setEmail('');
    setModalVisible(true);
  }

  // Function to open the modal for editing an existing user
  function openEdit(user: User): void {
    setEditing(user);
    setName(user.name);
    setEmail(user.email);
    setModalVisible(true);
  }

  // Function to save/update the user
  async function handleSave(): Promise<void> {
    if (!name.trim() || !email.trim()) {
      setMessageBox({ type: 'alert', title: 'Validation', message: 'Name and email are required.' });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setMessageBox({ type: 'alert', title: 'Validation', message: 'Please enter a valid email address.' });
      return;
    }
    
    let updated: User[];
    if (editing) {
      // Logic for editing an existing user
      updated = users.map(u => (u.id === editing.id ? { ...u, name: name.trim(), email: email.trim() } : u));
    } else {
      // Logic for creating a new user
      const newUser: User = { id: uuid(), name: name.trim(), email: email.trim() };
      updated = [newUser, ...users];
    }
    setUsers(updated);
    await save(USERS_KEY, updated);
    setModalVisible(false);
  }

  // Function to handle user deletion
  async function handleDelete(user: User): Promise<void> {
    setMessageBox({
      type: 'confirm',
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        const updated = users.filter(u => u.id !== user.id);
        setUsers(updated);
        await save(USERS_KEY, updated);
        setMessageBox(null);
      }
    });
  }
  
  // Renderer for the custom message box (Alert or Confirm)
  const renderMessageBox = (): React.ReactElement | null => {
    if (!messageBox) return null;

    if (messageBox.type === 'alert') {
      return (
        <Modal transparent={true} animationType="fade" visible={true}>
          <View style={styles.modalContainer}>
            <View style={styles.messageBox}>
              <Text style={styles.messageTitle}>{messageBox.title}</Text>
              <Text style={styles.messageText}>{messageBox.message}</Text>
              <ActionButton title="OK" onPress={() => setMessageBox(null)} />
            </View>
          </View>
        </Modal>
      );
    } 
    
    // Type is 'confirm'
    const confirmBox = messageBox as ConfirmMessageBox;
    return (
      <Modal transparent={true} animationType="fade" visible={true}>
        <View style={styles.modalContainer}>
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>{confirmBox.title}</Text>
            <Text style={styles.messageText}>{confirmBox.message}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20, gap: 10 }}>
              <ActionButton title="Cancel" onPress={() => setMessageBox(null)} style={{ backgroundColor: '#95a5a6', flex: 1 }} />
              <ActionButton title="Delete" onPress={confirmBox.onConfirm} style={{ backgroundColor: '#e74c3c', flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Type definition for FlatList renderItem prop
  const renderUserItem: ListRenderItem<User> = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemContent}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemSubtitle}>{item.email}</Text>
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <ActionButton 
          title="Edit" 
          onPress={() => openEdit(item)} 
          style={styles.editButton} 
          textStyle={styles.buttonText} 
        />
        <ActionButton 
          title="Delete" 
          onPress={() => handleDelete(item)} 
          style={styles.deleteButton} 
          textStyle={styles.buttonText} 
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Users</Text>
        <Text style={styles.subtitle}>Manage your user list</Text>
        <ActionButton title="Add New User" onPress={openCreate} style={styles.primaryButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Users List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
        </Text>
        <FlatList
          data={filteredUsers}
          // The keyExtractor argument is guaranteed to be a User object
          keyExtractor={(item: User) => item.id}
          renderItem={renderUserItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No users found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Add your first user to get started'}
              </Text>
            </View>
          }
        />
      </View>

      {/* Add/Edit User Modal */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.modalContainer}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editing ? 'Edit User' : 'Add New User'}</Text>
                <Text style={styles.modalSubtitle}>
                  {editing ? 'Update user information' : 'Enter details for the new user'}
                </Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput 
                  placeholder="Enter full name" 
                  value={name} 
                  onChangeText={setName} 
                  style={styles.input} 
                  autoCapitalize="words"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput 
                  placeholder="Enter email address" 
                  value={email} 
                  onChangeText={setEmail} 
                  style={styles.input} 
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.modalActions}>
                <ActionButton 
                  title="Cancel" 
                  onPress={() => setModalVisible(false)} 
                  style={styles.secondaryButton} 
                />
                <ActionButton 
                  title={editing ? 'Update' : 'Create User'} 
                  onPress={handleSave} 
                  style={styles.primaryButton} 
                />
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      {/* Message Box (Alerts/Confirmations) */}
      {renderMessageBox()}
    </SafeAreaView>
  );
}

export default UsersScreen;