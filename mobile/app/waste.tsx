import { useEffect, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, Text, TextInput, TouchableWithoutFeedback, View, ListRenderItem } from 'react-native';
import React from 'react'; // Explicit React import for TSX/JSX
// The Picker component is not typed with a generic, so we'll treat the itemValue as string.
import { Picker } from '@react-native-picker/picker'; 

import ActionButton from '../components/ActionButton';
import { SAMPLE_WASTE, WASTE_KEY } from '../constants/constants';
// Assuming 'styles' and 'utils' are also defined/converted
import { styles } from '../styles/styles';
import { loadOrInit, save, uuid } from '../utils/storage';

// --- TYPE DEFINITIONS ---

// Define the structure of a Waste item
interface WasteItem {
  id: string;
  item: string;
  category: string;
  instructions: string;
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

// Define the standard, fixed list of categories
const WASTE_CATEGORIES: string[] = [
  'Plastic',
  'Paper',
  'Glass',
  'Metal',
  'Organic',
  'Electronic',
  'Hazardous',
  'Other'
];

const WasteScreen: React.FC = () => {
  // State for the list of waste items
  const [wastes, setWastes] = useState<WasteItem[]>([]);
  // State for the visibility of the Add/Edit Modal
  const [modalVisible, setModalVisible] = useState(false);
  // State to hold the item being edited, or null for creation
  const [editing, setEditing] = useState<WasteItem | null>(null);
  // States for the form inputs
  const [category, setCategory] = useState<string>(WASTE_CATEGORIES[0]); // Typed as string
  const [item, setItem] = useState('');
  const [instructions, setInstructions] = useState('');
  // State for showing alerts/confirmations
  const [messageBox, setMessageBox] = useState<MessageBoxState>(null);
  // State for search input
  const [searchQuery, setSearchQuery] = useState('');

  // Effect to load data on mount
  useEffect(() => {
    (async () => {
      // Type assertion 'as WasteItem[]' to tell TypeScript the expected data structure
      const data = await loadOrInit(WASTE_KEY, SAMPLE_WASTE) as WasteItem[];
      setWastes(data);
    })();
  }, []);

  // Filter wastes based on search query
  const filteredWastes = wastes.filter(waste =>
    waste.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    waste.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
    waste.instructions.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function openCreate(): void {
    setEditing(null);
    setCategory(WASTE_CATEGORIES[0]); // Set default category for creation
    setItem('');
    setInstructions('');
    setModalVisible(true);
  }

  function openEdit(w: WasteItem): void {
    setEditing(w);
    // Ensure the category is one of the fixed categories, or default
    setCategory(WASTE_CATEGORIES.includes(w.category) ? w.category : WASTE_CATEGORIES[0]);
    setItem(w.item);
    setInstructions(w.instructions);
    setModalVisible(true);
  }

  async function handleSave(): Promise<void> {
    if (!category.trim() || !item.trim()) {
      setMessageBox({ type: 'alert', title: 'Validation', message: 'Category and item are required.' });
      return;
    }
    let updated: WasteItem[];
    // Normalize category to the standard list value before saving
    const normalizedCategory = category.trim(); 
    
    if (editing) {
      // Logic for editing an existing item
      updated = wastes.map(w => (
        w.id === editing.id ? 
          { ...w, category: normalizedCategory, item: item.trim(), instructions: instructions.trim() } : 
          w
      ));
    } else {
      // Logic for creating a new item
      const newW: WasteItem = { id: uuid(), category: normalizedCategory, item: item.trim(), instructions: instructions.trim() };
      updated = [newW, ...wastes];
    }
    setWastes(updated);
    await save(WASTE_KEY, updated);
    setModalVisible(false);
  }

  async function handleDelete(w: WasteItem): Promise<void> {
    setMessageBox({
      type: 'confirm',
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${w.item}"? This action cannot be undone.`,
      onConfirm: async () => {
        const updated = wastes.filter(x => x.id !== w.id);
        setWastes(updated);
        await save(WASTE_KEY, updated);
        setMessageBox(null);
      }
    });
  }

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
            <View style={styles.messageActions}>
              <ActionButton title="Cancel" onPress={() => setMessageBox(null)} style={styles.secondaryButton} />
              {/* onConfirm is guaranteed to exist on ConfirmMessageBox type */}
              <ActionButton title="Delete" onPress={confirmBox.onConfirm} style={styles.deleteButton} /> 
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const getCategoryColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'plastic': '#3498db',
      'paper': '#2ecc71',
      'glass': '#e74c3c',
      'metal': '#f39c12',
      'electronic': '#9b59b6',
      'hazardous': '#e67e22',
      'organic': '#27ae60',
      'other': '#95a5a6'
    };
    // Use the lowercase category to get color consistency
    return colors[category.toLowerCase()] || '#3498db';
  };

  // Type definition for FlatList renderItem prop
  const renderWasteItem: ListRenderItem<WasteItem> = ({ item: w }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemContent}>
        <View style={[styles.avatar, { backgroundColor: getCategoryColor(w.category) }]}>
          <Text style={styles.avatarText}>
            {w.category.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.wasteInfo}>
          <Text style={styles.itemTitle}>{w.item}</Text>
          <Text style={styles.categoryTag}>{w.category}</Text>
          <Text style={styles.itemSubtitle} numberOfLines={2}>{w.instructions}</Text>
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <ActionButton
          title="Edit"
          onPress={() => openEdit(w)}
          style={styles.editButton}
          textStyle={styles.buttonText}
        />
        <ActionButton
          title="Delete"
          onPress={() => handleDelete(w)}
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
        <Text style={styles.title}>Waste Knowledge</Text>
        <Text style={styles.subtitle}>Proper disposal guidelines</Text>
        <ActionButton title="Add New Item" onPress={openCreate} style={styles.primaryButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search by category, item, or instructions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Waste Items List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          {filteredWastes.length} item{filteredWastes.length !== 1 ? 's' : ''} found
        </Text>
        <FlatList
          data={filteredWastes}
          keyExtractor={(item: WasteItem) => item.id}
          renderItem={renderWasteItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No waste items found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Try adjusting your search' : 'Add your first waste item to get started'}
              </Text>
            </View>
          }
        />
      </View>

      {/* Add/Edit Waste Item Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{editing ? 'Edit Waste Item' : 'Add Waste Item'}</Text>
                  <Text style={styles.modalSubtitle}>
                    {editing ? 'Update disposal information' : 'Enter details for proper waste disposal'}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category *</Text>
                  {/* === CATEGORY PICKER (DROPDOWN) IMPLEMENTATION === */}
                  <View style={styles.pickerContainer}> 
                    <Picker
                      selectedValue={category}
                      // itemValue is typed as string based on the Picker.Item values
                      onValueChange={(itemValue: string) => setCategory(itemValue)}
                      style={styles.picker} 
                    >
                      {WASTE_CATEGORIES.map((cat) => (
                        <Picker.Item key={cat} label={cat} value={cat} />
                      ))}
                    </Picker>
                  </View>
                  {/* ================================================= */}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Item Name *</Text>
                  <TextInput
                    placeholder="e.g., Water bottle, Newspaper, Battery"
                    value={item}
                    onChangeText={setItem}
                    style={styles.input}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Disposal Instructions</Text>
                  <TextInput
                    placeholder="Enter proper disposal instructions..."
                    value={instructions}
                    onChangeText={setInstructions}
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    returnKeyType="done"
                  />
                </View>

                <View style={styles.modalActions}>
                  <ActionButton
                    title="Cancel"
                    onPress={() => setModalVisible(false)}
                    style={styles.secondaryButton}
                  />
                  <ActionButton
                    title={editing ? 'Update' : 'Add Item'}
                    onPress={handleSave}
                    style={styles.primaryButton}
                  />
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Message Box (Alerts/Confirmations) */}
      {renderMessageBox()}
    </SafeAreaView>
  );
}

export default WasteScreen;