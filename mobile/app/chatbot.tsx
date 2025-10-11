import React from 'react';
// ... rest of the imports and code
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  ScrollViewProps, // Import ScrollViewProps for use with useRef
} from 'react-native';
// CRITICAL IMPORT: This hook is the standard way to run effects on screen focus
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack'; // For potential future typing if this were a stack screen

import ActionButton from '../components/ActionButton';
import { SAMPLE_WASTE, WASTE_KEY } from '../constants/constants';
// Assuming 'styles' and 'utils' are also defined/converted
import { styles } from '../styles/styles';
import { loadOrInit, uuid } from '../utils/storage';

// --- TYPE DEFINITIONS ---

// Define the structure of a Waste item from your data file
interface WasteItem {
  id: string;
  item: string;
  category: string;
  instructions: string;
}

// Define the structure of a chat message
interface ChatMessage {
  id: string;
  author: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

// NOTE: This component no longer needs to accept the 'navigation' prop,
// but we define its type as a React Functional Component (React.FC)
const ChatbotScreen: React.FC = () => {
  // State for the list of waste items loaded from storage
  const [wastes, setWastes] = useState<WasteItem[]>([]);
  // State for the text input field
  const [query, setQuery] = useState('');
  // State for the chat messages displayed in the UI
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Ref for the ScrollView to enable auto-scrolling. We use ScrollViewProps as a base.
  const scrollViewRef = useRef<ScrollView | null>(null);
  // Ref to ensure the welcome message is only added on the first-ever mount/focus
  const isInitialLoad = useRef(true);

  // 1. Function to load the data from storage
  const loadWasteData = useCallback(async () => {
    // The type assertion 'as WasteItem[]' tells TypeScript the expected return structure
    const data = await loadOrInit(WASTE_KEY, SAMPLE_WASTE) as WasteItem[];
    setWastes(data);
  }, []);

  // Helper function to safely add a message to the state
  const addMessage = useCallback((author: ChatMessage['author'], text: string) => {
    setMessages(m => [...m, { id: uuid(), author, text, timestamp: new Date() }]);
  }, []);

  // 2. Use useFocusEffect for reliable data reloading
  // This hook runs the effect every time the screen comes into focus.
  useFocusEffect(
    useCallback(() => {
      loadWasteData();

      // Add the welcome message ONLY on the very first mount.
      if (isInitialLoad.current) {
        // Now using the memoized addMessage function
        addMessage('bot', "Hello there! 👋 I'm WasteBot, your friendly recycling assistant! ♻️\n\nI can help you find the right way to dispose of various items. Try asking me about something like 'plastic bottles', 'batteries', or 'pizza boxes'!");
        isInitialLoad.current = false;
      }
      
      // Cleanup function
      return () => {};
    }, [loadWasteData, addMessage]) // Depend on loadWasteData and addMessage
  );
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        // Use optional chaining on the ref's current value
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Function to process the user's query and generate a response
  function answerQuery(q: string): string {
    const normalized = q.toLowerCase().trim();
    
    // --- Friendly greetings and small talk (logic is unchanged) ---
    const greetings = ['hello', 'hi', 'hey', 'hola', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    const thanks = ['thanks', 'thank you', 'thank', 'ty', 'appreciate it'];
    const howAreYou = ['how are you', 'how are u', 'how do you do', 'how is it going'];
    
    // ... (unchanged logic for friendly responses) ...
    if (greetings.some(greet => normalized.includes(greet))) {
      const friendlyResponses = [
        "Hello there! 👋 How can I help you with waste disposal today?",
        "Hi! 😊 Ready to learn about proper waste disposal?",
        "Hey! ♻️ What waste item would you like to know about?",
        "Greetings! 🌟 I'm here to help you recycle smarter!"
      ];
      return friendlyResponses[Math.floor(Math.random() * friendlyResponses.length)];
    }
    
    if (thanks.some(thank => normalized.includes(thank))) {
      const thankYouResponses = [
        "You're welcome! 😊 Happy to help with your recycling questions!",
        "Anytime! ♻️ Feel free to ask more waste-related questions!",
        "No problem! 🌟 I'm always here to help you dispose responsibly!",
        "My pleasure! 😄 Let me know if you have more recycling questions!"
      ];
      return thankYouResponses[Math.floor(Math.random() * thankYouResponses.length)];
    }
    
    if (howAreYou.some(phrase => normalized.includes(phrase))) {
      const feelingResponses = [
        "I'm doing great, thanks for asking! 😊 Ready to help you recycle!",
        "I'm wonderful! ♻️ Helping people recycle properly makes me happy!",
        "I'm doing awesome! 🌟 Excited to help you with waste disposal!",
        "I'm fantastic! 😄 Always happy to assist with recycling questions!"
      ];
      return feelingResponses[Math.floor(Math.random() * feelingResponses.length)];
    }
    
    // Check for empty or very short queries
    if (normalized.length < 2) {
      return "I'd love to help! 😊 Could you tell me what waste item you're wondering about?";
    }
    
    // 1. Check for exact item match
    const byItem = wastes.find(w => w.item.toLowerCase() === normalized);
    if (byItem) return `**${byItem.item}** belongs to **${byItem.category}** waste. ♻️\n\n💡 *${byItem.instructions}*`;

    // 2. Fuzzy contains search
    const contains = wastes.find(w => 
      normalized.includes(w.item.toLowerCase()) || 
      w.item.toLowerCase().includes(normalized) ||
      normalized.includes(w.category.toLowerCase())
    );
    if (contains) return `I found a close match! 🎯 **${contains.item}** is **${contains.category}** waste.\n\n💡 *${contains.instructions}*`;

    // 3. Fallback search for any matching word
    const queryWords = normalized.split(/\s+/).filter(word => word.length > 2);
    const matches = wastes.filter(w => 
      queryWords.some(word => 
        w.item.toLowerCase().includes(word) || 
        w.category.toLowerCase().includes(word) ||
        w.instructions.toLowerCase().includes(word)
      )
    );

    if (matches.length > 0) {
      if (matches.length === 1) {
        const match = matches[0];
        return `This might be helpful! 🤔 **${match.item}** — **${match.category}** waste.\n\n💡 *${match.instructions}*`;
      } else {
        let response = `I found ${matches.length} possible matches: 🔍\n\n`;
        matches.slice(0, 3).forEach((match, index) => {
          response += `${index + 1}. **${match.item}** (${match.category})\n`;
        });
        if (matches.length > 3) {
          response += `\n...and ${matches.length - 3} more. Try being more specific!`;
        } else {
          response += `\nWhich one are you looking for? 😊`;
        }
        return response;
      }
    }

    return "I'm not sure about that one. 🧐\n\nTry asking about specific items like:\n• 'Where to throw pizza boxes?'\n• 'How to dispose of batteries?'\n• 'What bin for glass bottles?'\n\nI'm here to help! 😊";
  }

  // Handler for the send button/submit action
  function handleSend() {
    if (!query.trim()) return;
    
    const userQuery = query.trim();
    addMessage('user', userQuery); // User's message
    setQuery('');
    
    // Simulate "typing" delay before showing the bot's reply
    setTimeout(() => {
      const reply = answerQuery(userQuery);
      addMessage('bot', reply); // Bot's reply
    }, 800);
  }

  // Function to convert simple **bold** markdown to React Native Text components
  function formatMessageText(text: string): React.ReactNode[] {
    const parts = text.split('**');
    return parts.map((part, index) => {
      // Every odd index (1, 3, 5, ...) is the text inside the **...**
      if (index % 2 === 1) {
        return <Text key={index} style={styles.boldText}>{part}</Text>;
      }
      // Every even index (0, 2, 4, ...) is the plain text
      return part.split('\n').map((line, lineIndex) => (
        <React.Fragment key={`${index}-${lineIndex}`}>
          {line}
          {/* Add a line break for every newline character, except after the last line */}
          {lineIndex < part.split('\n').length - 1 ? '\n' : null}
        </React.Fragment>
      ));
    }).flat(); // .flat() is used to handle the nested array from the second map
  }
  
  // Renderer for a single chat message
  const renderMessage = (m: ChatMessage) => {
    const isUser = m.author === 'user';
    return (
      <View key={m.id} style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.botMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={styles.messageSender}>
            {isUser ? 'You' : 'WasteBot 🤖'}
          </Text>
          {/* The main text content, formatted */}
          <Text style={styles.messageText}>
            {formatMessageText(m.text)}
          </Text>
          <Text style={styles.messageTime}>
            {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.chatHeader}>
        <View style={styles.botAvatar}>
          <Text style={styles.botAvatarText}>♻️</Text>
        </View>
        <View>
          <Text style={styles.chatTitle}>WasteBot Assistant</Text>
          <Text style={styles.chatSubtitle}>Your friendly recycling helper</Text>
        </View>
      </View>

      {/* Chat Messages and Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }} 
        // Adjust the offset for a better fit on iOS/Android if needed
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        {/* Touch to dismiss keyboard */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
          <View style={styles.messagesWrapper}> 
            {messages.length === 0 && isInitialLoad.current ? (
              // Welcome Message (only shown before the first official bot welcome message is added)
              <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeTitle}>Welcome to WasteBot! ♻️</Text>
                <Text style={styles.welcomeText}>
                  Hello! I'm your friendly waste disposal assistant. I can help you find the right way to recycle and dispose of various items. 
                </Text>
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleItem}>• "Hello! 👋"</Text>
                  <Text style={styles.exampleItem}>• "How do I recycle plastic bottles?"</Text>
                  <Text style={styles.exampleItem}>• "Where should I throw batteries?"</Text>
                  <Text style={styles.exampleItem}>• "What about pizza boxes?"</Text>
                </View>
                <Text style={styles.welcomeHint}>Just ask me anything! I'm here to help 😊</Text>
              </View>
            ) : (
              // Message ScrollView
              <ScrollView 
                ref={scrollViewRef}
                contentContainerStyle={styles.messagesContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled" 
              >
                {messages.map(renderMessage)}
              </ScrollView>
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Ask me about any waste item..."
            style={styles.chatInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            maxLength={200}
          />
          <ActionButton 
            title="Send" 
            onPress={handleSend} 
            style={[styles.sendButton, !query.trim() && styles.sendButtonDisabled]}
            disabled={!query.trim()}
            textStyle={styles.sendButtonText}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default ChatbotScreen;