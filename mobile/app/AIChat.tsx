// app/AIChat.tsx

import React, { useState, useEffect } from "react";
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    StyleSheet, 
    ActivityIndicator,
    Alert, 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import * as Speech from "expo-speech";
import Voice from '@react-native-community/voice'; 

// ✅ Import the real AI service
import { chatWithEcoZen } from "../services/EcoZenAI";

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}

export default function AIChat() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    
    const scrollViewRef = React.useRef<ScrollView>(null);
    
    // --- SETUP VOICE EVENT LISTENERS ---
    useEffect(() => {
  let voiceAvailable = true;

  const setupVoice = async () => {
    try {
      await Voice.isAvailable(); // just to ensure it loads
      Voice.onSpeechStart = () => setIsListening(true);
      Voice.onSpeechEnd = () => setIsListening(false);
      Voice.onSpeechResults = (e) => {
        if (e.value?.length) {
          const result = e.value[0];
          setInput(result);
          handleSend(result);
        }
      };
      Voice.onSpeechError = (e) => {
        console.error("Speech error:", e);
        Alert.alert("Speech Error", "Microphone access or recognition failed.");
      };
    } catch (err) {
      console.warn("Voice initialization failed:", err);
      voiceAvailable = false;
    }
  };

  setupVoice();

  return () => {
    if (voiceAvailable) {
      try {
        Voice.removeAllListeners();
        Voice.destroy();
      } catch (err) {
        console.warn("Voice cleanup error:", err);
      }
    }
  };
}, []); 

    const handleSend = async (textToSend: string = input) => {
        const text = textToSend.trim();
        if (text === "") return;
        
        if (await Speech.isSpeakingAsync()) {
            await Speech.stop();
        }

        const userMessage: Message = { id: Date.now(), text: text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput(""); 
        setIsLoading(true);

        try {
            // ✅ Call the real OpenAI API function
            const aiText = await chatWithEcoZen(text); 

            const aiMessage: Message = { id: Date.now() + 1, text: aiText, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);

            Speech.speak(aiText, {
                language: 'en-US',
                rate: 0.95,
                pitch: 1.05,
            });

        } catch (error) {
            const errorMessage: Message = { 
                id: Date.now() + 1, 
                text: "Sorry, I am having trouble connecting to EcoZen AI right now. Check your backend/API key.", 
                sender: 'ai' 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleVoiceInput = async () => {
        try {
            if (isListening) {
                await Voice.stop();
                setIsListening(false); 
            } else {
                if (await Speech.isSpeakingAsync()) {
                    await Speech.stop();
                }
                setInput(""); 
                await Voice.start('en-US'); 
            }
        } catch (e) {
            console.error('Voice Start/Stop Error:', e);
            setIsListening(false);
            Alert.alert("Microphone Error", "Microphone failed to start. Ensure permissions are granted for this app.");
        }
    };
    
    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages, isLoading]);

    const renderMessage = (message: Message) => (
        <View 
            key={message.id} 
            style={[
                styles.messageBubble, 
                message.sender === 'user' ? styles.userBubble : styles.aiBubble
            ]}
        >
            <Text style={message.sender === 'user' ? styles.userText : styles.aiText}>
                {message.text}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backIconButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>EcoZen AI Chat</Text>
            </View>

            <ScrollView 
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                ref={scrollViewRef}
            >
                {messages.length === 0 && (
                    <View style={styles.welcomeContainer}>
                        <Ionicons name="leaf" size={48} color="#67A859" />
                        <Text style={styles.welcomeText}>Hi there! I'm EcoZen AI.</Text>
                        <Text style={styles.welcomeSubtitle}>Ask me anything about sustainability, recycling, or waste management!</Text>
                    </View>
                )}
                {messages.map(renderMessage)}
                {isLoading && (
                    <View style={[styles.messageBubble, styles.aiBubble]}>
                        <ActivityIndicator size="small" color="#67A859" />
                    </View>
                )}
            </ScrollView>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={input}
                    onChangeText={setInput}
                    placeholder={isListening ? "Listening..." : "Type your message..."}
                    placeholderTextColor={isListening ? "#E53935" : "#9E9E9E"}
                    editable={!isLoading && !isListening}
                    onSubmitEditing={() => handleSend(input)}
                />
                
                <TouchableOpacity 
                    style={[styles.micButton, isListening && styles.listeningMicButton]}
                    onPress={handleVoiceInput}
                    disabled={isLoading}
                >
                    <Ionicons name={isListening ? "stop" : "mic"} size={24} color="#FFFFFF" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={[styles.sendButton, input.trim() === "" || isLoading ? styles.disabledButton : {}]}
                    onPress={() => handleSend(input)} 
                    disabled={input.trim() === "" || isLoading}
                >
                    <Ionicons name="send" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5F5F5' },
    header: {
        backgroundColor: '#67A859',
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backIconButton: { marginRight: 12, padding: 4 },
    headerTitle: { fontSize: 22, fontWeight: "bold", color: '#FFFFFF' },
    
    chatContainer: { flex: 1, paddingHorizontal: 15 },
    chatContent: { paddingVertical: 15 },
    
    welcomeContainer: { 
        alignItems: 'center', 
        paddingVertical: 50,
        backgroundColor: '#FFFFFF',
        marginVertical: 20,
        borderRadius: 12,
    },
    welcomeText: { fontSize: 20, fontWeight: 'bold', color: '#2C2C2C', marginTop: 10 },
    welcomeSubtitle: { fontSize: 14, color: '#757575', textAlign: 'center', paddingHorizontal: 20, marginTop: 5 },
    
    messageBubble: {
        maxWidth: '80%',
        marginVertical: 4,
        padding: 12,
        borderRadius: 16,
        elevation: 1,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#67A859',
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    userText: { color: '#FFFFFF', fontSize: 16 },
    aiText: { color: '#2C2C2C', fontSize: 16 },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderColor: '#E0E0E0',
    },
    input: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 24,
        paddingHorizontal: 15,
        fontSize: 16,
        marginRight: 10,
        backgroundColor: '#FAFAFA',
    },
    micButton: {
        backgroundColor: '#FFB300',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    listeningMicButton: {
        backgroundColor: '#E53935',
    },
    sendButton: {
        backgroundColor: '#67A859',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
});
