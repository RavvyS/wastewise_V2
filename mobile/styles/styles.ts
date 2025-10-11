import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// We define the type for the styles object using the return type of StyleSheet.create
// This ensures all consuming components know the exact keys and types of the styles.
// We only need to list the missing 'userInfo' to fix the error and ensure it exists.
// I'll add 'userInfo' here, assuming it belongs in the Item List Styles section, 
// based on its usage in users.tsx.

export const styles = StyleSheet.create({
  // Container & Layout
  container: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  listContainer: {
    flex: 1,
    padding: 16,
  },

  // Header Styles
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#2c3e50' 
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },

  // Chat Header
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  botAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#27ae60',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  botAvatarText: {
    fontSize: 24,
  },
  chatTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  chatSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },

  // Chat Container
  chatContainer: {
    flex: 1,
  },
  messagesWrapper: {
    flex: 1,
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  exampleContainer: {
    alignSelf: 'stretch',
    paddingHorizontal: 20,
  },
  exampleItem: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeHint: { 
    fontSize: 16,
    color: '#27ae60',
    marginTop: 20,
    fontWeight: '500',
  },

  // Message Styles
  messageContainer: {
    marginVertical: 8,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#3498db',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  messageSender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#7f8c8d',
  },
  // FIRST DEFINITION OF 'messageText'
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#2c3e50',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  messageTime: {
    fontSize: 10,
    color: '#95a5a6',
    marginTop: 6,
    textAlign: 'right',
  },

  // Input Area
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 60,
  },
  sendButtonText: { 
    color: '#fff',
    fontWeight: '600',
  },
  sendButtonDisabled: { 
    backgroundColor: '#bdc3c7',
  },

  // Search Styles
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    fontSize: 16,
  },
  listTitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 12,
    fontWeight: '500',
  },

  // Item List Styles
  itemRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    marginBottom: 8, 
    paddingHorizontal: 12, 
    elevation: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 2 
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  // *** THIS WAS THE MISSING KEY CAUSING CODE 2339 IN users.tsx ***
  userInfo: { 
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  // *************************************************************
  wasteInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#2c3e50',
    marginBottom: 4,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#3498db',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  itemSubtitle: { 
    fontSize: 14, 
    color: '#7f8c8d',
    lineHeight: 18,
  },

  // Avatar Styles
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Action Buttons
  actionsColumn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end', 
    minWidth: 100 
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 60,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Button Styles
  smallButton: { 
    padding: 8, 
    borderWidth: 1, 
    borderRadius: 8, 
    borderColor: '#ccc', 
    minWidth: 64, 
    alignItems: 'center', 
    marginHorizontal: 4 
  },
  primaryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#95a5a6',
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },

  // Separator & Spacing
  separator: { 
    height: 8 
  },

  // Modal Styles
  modalContainer: { 
    flex: 1, 
    backgroundColor: '#f8f9fa' 
  },
  modalContent: {
    flexGrow: 1,
    padding: 20,
  },
  modalHeader: {
    marginBottom: 30,
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#2c3e50', 
    marginBottom: 8 
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },

  // Input Styles
  input: { 
    backgroundColor: '#fff',
    borderWidth: 1, 
    borderColor: '#e9ecef', 
    padding: 12, 
    borderRadius: 8, 
    fontSize: 16 
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },

  // NEW: Picker/Dropdown Styles
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9ecef', 
    borderRadius: 8,
    overflow: 'hidden', 
    marginBottom: 0, 
  },
  picker: {
    height: 50,
    width: '100%',
  },

  // Message Box Styles
  messageBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#2c3e50',
  },
  // SECOND DEFINITION OF 'messageText' RENAMED TO FIX TS1117 ERROR
  messageBoxText: { 
    fontSize: 16,
    color: '#495057',
    lineHeight: 22,
    marginBottom: 20,
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  messageButton: {
    padding: 10,
    backgroundColor: '#3498db',
    borderRadius: 5,
  },
  messageButtonText: {
    color: 'white',
    textAlign: 'center',
  },

  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
});