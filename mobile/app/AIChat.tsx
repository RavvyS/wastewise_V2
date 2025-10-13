// app/AIChat.tsx - Fixed version with working text input and optional voice

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

// Try to import Voice, but handle if it's not available
let Voice: any = null;
try {
    Voice = require('@react-native-community/voice').default;
} catch (error) {
    console.log('Voice module not available, voice input will be disabled');
}

// --- COMPREHENSIVE LOCAL AI LOGIC ---
const fetchAiResponse = async (prompt: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    const lowerPrompt = prompt.trim().toLowerCase();
    
    // Knowledge base with extensive coverage
    const topics = {
        greetings: {
            keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
            responses: [
                "Hello! I'm EcoZen AI, your sustainability companion. I can help with recycling, composting, waste reduction, and eco-friendly living. What's on your mind?",
                "Hi there! Ready to make our planet greener? Ask me about recycling, composting, or sustainable living tips!",
                "Hey! I'm here to help you live more sustainably. What eco-topic interests you today?"
            ]
        },
        
        thanks: {
            keywords: ['thank', 'thanks', 'appreciate', 'helpful'],
            responses: [
                "You're welcome! Happy to help you make eco-friendly choices. Any other questions?",
                "Glad I could help! Together we can make a difference. What else would you like to know?",
                "My pleasure! Keep up the great work on your sustainability journey!"
            ]
        },
        
        plastic: {
            keywords: ['plastic', 'bottle', 'pet', 'hdpe', '#1', '#2', 'polyethylene', 'polymer'],
            responses: [
                "Plastic recycling tips: Rinse and flatten bottles. Look for #1 (PET) and #2 (HDPE) - they're most commonly accepted. Remove caps if they're a different material. Most curbside programs don't accept #3-#7 plastics.",
                "Great question about plastics! PET (#1) bottles and HDPE (#2) containers are widely recyclable. Always rinse thoroughly and check your local recycling guidelines as programs vary by location.",
                "To recycle plastic properly: Check the number on the bottom, rinse thoroughly, flatten to save space, and keep caps separate. Most recycling centers prefer #1 and #2 plastics."
            ]
        },
        
        compost: {
            keywords: ['compost', 'food scrap', 'garden waste', 'organic', 'kitchen waste', 'yard', 'rot'],
            responses: [
                "Composting 101: Add fruit/veggie scraps, coffee grounds, tea bags, eggshells, and yard trimmings. Avoid meat, dairy, and oily foods to prevent pests. Keep your pile moist and turn it regularly!",
                "Start composting today! Layer 'greens' (food scraps, grass) with 'browns' (dry leaves, cardboard). Keep it as moist as a wrung sponge. In 2-6 months, you'll have rich, dark compost!",
                "Composting reduces landfill waste by 30%! Add vegetable peels, coffee grounds, crushed eggshells, and yard waste. Turn your pile weekly and keep it moist for faster decomposition."
            ]
        },
        
        glass: {
            keywords: ['glass', 'jar', 'bottle', 'window', 'mirror'],
            responses: [
                "Glass is infinitely recyclable! Rinse jars and bottles thoroughly, remove metal lids, and recycle by color if required. Most programs accept clear, green, and brown glass.",
                "Glass recycling tip: Clean containers are crucial. Separate by color if your facility requires it. Glass can be recycled endlessly without losing quality!",
                "Recycling glass saves energy and resources. Remove lids, rinse well, and check if your area accepts window glass separately from container glass."
            ]
        },
        
        metal: {
            keywords: ['metal', 'aluminum', 'can', 'tin', 'steel', 'foil', 'aluminium'],
            responses: [
                "Metals are highly recyclable! Aluminum cans, steel cans, and clean aluminum foil are widely accepted. Rinse off food residue. Fun fact: Recycling aluminum saves 95% of the energy needed to make new aluminum!",
                "Metal recycling is super efficient. Aluminum cans can be recycled and back on store shelves in just 60 days! Rinse containers and remove labels when possible.",
                "Recycle all clean metal: cans, foil (crumpled into a ball), and tin containers. Aluminum is endlessly recyclable and one of the most valuable recyclables!"
            ]
        },
        
        ewaste: {
            keywords: ['electronic', 'e-waste', 'battery', 'phone', 'computer', 'device', 'gadget', 'laptop', 'tablet'],
            responses: [
                "E-waste contains hazardous materials like lead and mercury. Never put electronics or batteries in regular trash! Take them to certified e-waste recyclers or retailer take-back programs.",
                "Electronics recycling is crucial for the environment. Find local e-waste collection events or check with retailers like Best Buy. Many offer free drop-off for old devices.",
                "Batteries and electronics need special handling. Look for the 'battery' symbol and take them to dedicated collection points. Many stores and municipalities have free e-waste drop-off."
            ]
        },
        
        paper: {
            keywords: ['paper', 'cardboard', 'newspaper', 'magazine', 'box', 'envelope'],
            responses: [
                "Paper & cardboard are easily recyclable! Flatten boxes, remove tape and staples when possible. Keep paper clean and dry. Greasy pizza boxes should be composted, not recycled.",
                "Paper recycling tips: Most clean paper products are accepted. Shredded paper often needs special handling - put it in a paper bag. Remove plastic windows from envelopes.",
                "Recycle clean paper and cardboard freely! Break down boxes to save space. Contaminated paper (grease, food) goes in compost or trash, not recycling."
            ]
        },
        
        carbon: {
            keywords: ['carbon', 'footprint', 'climate', 'emission', 'greenhouse', 'co2', 'global warming'],
            responses: [
                "Reduce your carbon footprint with these steps: Eat less meat, use public transit or bike, reduce consumption, buy local products, minimize waste, and choose renewable energy when possible.",
                "Fighting climate change starts at home! Walk or bike more, reduce food waste, buy second-hand items, plant trees, support sustainable businesses, and advocate for green policies.",
                "Lower your carbon emissions: Choose plant-based meals, reduce air travel, use energy-efficient appliances, insulate your home, and support renewable energy initiatives."
            ]
        },
        
        water: {
            keywords: ['water', 'conserve', 'save water', 'drought', 'tap', 'shower'],
            responses: [
                "Water conservation tips: Fix leaky faucets, take 5-minute showers, run full loads of laundry and dishes, collect rainwater for plants, and choose drought-resistant landscaping.",
                "Save water daily: Turn off taps while brushing teeth, use a broom instead of a hose, install low-flow fixtures, and mulch your garden to retain moisture.",
                "Water is precious! Fix leaks promptly (a drip can waste 20 gallons/day), take shorter showers, and consider a rain barrel for outdoor watering."
            ]
        },
        
        energy: {
            keywords: ['energy', 'electricity', 'power', 'solar', 'renewable', 'light', 'bulb'],
            responses: [
                "Save energy at home: Switch to LED bulbs (90% more efficient!), unplug idle devices, adjust your thermostat, weatherize your home, and consider solar panels.",
                "Energy efficiency tips: Use smart power strips, choose Energy Star appliances, add insulation, seal drafts, and be mindful about heating and cooling.",
                "Reduce electricity use: Turn off lights in empty rooms, use natural light, run appliances during off-peak hours, and maintain your HVAC system regularly."
            ]
        },
        
        shopping: {
            keywords: ['shop', 'buy', 'purchase', 'store', 'reusable', 'bag'],
            responses: [
                "Sustainable shopping: Bring reusable bags, buy in bulk to reduce packaging, choose products with minimal/recyclable packaging, support local businesses, and prioritize quality over quantity.",
                "Shop green: Choose items with eco-friendly packaging, buy second-hand when possible, use reusable containers, avoid single-use plastics, and support ethical brands.",
                "Eco-friendly shopping tips: Make a list to avoid impulse buys, choose products with less packaging, bring your own bags and containers, and buy local to reduce transportation emissions."
            ]
        },
        
        food: {
            keywords: ['food', 'eat', 'meal', 'diet', 'vegetarian', 'vegan', 'meat'],
            responses: [
                "Sustainable eating: Reduce meat consumption (especially beef), buy local and seasonal produce, minimize food waste, grow your own herbs or vegetables, and compost scraps.",
                "Eco-friendly diet: Plant-based meals have a lower environmental impact. Support local farmers, plan meals to reduce waste, store food properly, and use leftovers creatively.",
                "Food sustainability: Choose seasonal produce, reduce beef intake, avoid food waste (it creates methane in landfills), and consider Meatless Mondays to start!"
            ]
        },
        
        reduce: {
            keywords: ['reduce', 'less', 'minimize', 'cut down', 'decrease'],
            responses: [
                "The best waste is no waste! Reduce by: buying only what you need, choosing reusable over disposable, repairing instead of replacing, and borrowing or renting items you rarely use.",
                "Reduce consumption: Think before you buy, choose quality items that last, avoid single-use products, and embrace minimalism. Every purchase has an environmental cost!",
                "Reducing is the first 'R' for a reason! Buy less, choose durable products, borrow from libraries/friends, and question if you really need something before purchasing."
            ]
        },
        
        reuse: {
            keywords: ['reuse', 'repurpose', 'second hand', 'thrift', 'upcycle'],
            responses: [
                "Reuse creatively! Shop second-hand, use glass jars for storage, turn old clothes into rags, donate items you don't need, and repair broken things instead of discarding them.",
                "Reusing reduces waste: Buy from thrift stores, use refillable containers, repurpose old items, and participate in swap events with friends and community.",
                "Get creative with reuse: Mason jars become storage, old t-shirts become shopping bags, and furniture can be refinished. One person's trash is another's treasure!"
            ]
        },
        
        recycle: {
            keywords: ['recycle', 'recycling', 'recyclable', 'bin'],
            responses: [
                "Recycling basics: Check local guidelines (they vary!), rinse containers, keep recyclables dry, and don't bag them. When in doubt, check with your local recycling program.",
                "Good recycling practice: Know your local rules, avoid 'wishcycling' (putting non-recyclables in hoping they'll be recycled), and keep recyclables clean and separate.",
                "Recycling tips: Remove lids from bottles, flatten cardboard, rinse food containers, and never bag recyclables unless your program specifically asks for it."
            ]
        },
        
        clothes: {
            keywords: ['clothes', 'clothing', 'fashion', 'textile', 'fabric'],
            responses: [
                "Sustainable fashion: Buy fewer, higher-quality items, shop second-hand, swap with friends, repair damaged clothing, and donate or upcycle items you no longer wear.",
                "Textile waste is huge! Choose natural fibers, wash clothes in cold water, air dry when possible, and recycle old textiles at designated drop-offs.",
                "Fashion sustainability: Invest in timeless pieces, care for your clothes properly to extend life, support ethical brands, and participate in clothing swaps."
            ]
        }
    };

    // Check each topic
    for (const [topic, data] of Object.entries(topics)) {
        if (data.keywords.some(keyword => lowerPrompt.includes(keyword))) {
            const randomIndex = Math.floor(Math.random() * data.responses.length);
            return data.responses[randomIndex];
        }
    }

    // Question detection for helpful fallback
    if (lowerPrompt.includes('?') || 
        lowerPrompt.startsWith('what') || 
        lowerPrompt.startsWith('how') || 
        lowerPrompt.startsWith('why') ||
        lowerPrompt.startsWith('when') ||
        lowerPrompt.startsWith('where') ||
        lowerPrompt.startsWith('can') ||
        lowerPrompt.startsWith('should')) {
        
        return `That's an interesting question! While I specialize in sustainability basics, I'd love to help. Try asking about: recycling specific materials (plastic, glass, metal, paper), composting, e-waste disposal, reducing your carbon footprint, water conservation, or sustainable shopping!`;
    }

    // Action words detection
    if (lowerPrompt.includes('help') || lowerPrompt.includes('advice') || lowerPrompt.includes('tip')) {
        return "I'd love to help with your sustainability journey! I can guide you on: recycling (plastic, paper, glass, metal), composting, e-waste disposal, reducing carbon emissions, conserving water and energy, sustainable shopping, and eco-friendly eating. What interests you most?";
    }

    // Generic fallback
    if (lowerPrompt.length > 3) {
        return `I'm learning more every day! Right now I specialize in recycling, composting, waste reduction, and sustainable living. Could you rephrase your question about one of these topics? For example: "How do I compost?" or "What plastics are recyclable?"`;
    }

    // Very short input
    return "I'm here to help! Try questions like: 'How do I start composting?', 'What can I recycle?', 'How can I reduce my carbon footprint?', or 'What is e-waste?'";
};
// ------------------------------

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
    const [voiceAvailable, setVoiceAvailable] = useState(false);
    
    const scrollViewRef = React.useRef<ScrollView>(null);

    // --- SETUP VOICE EVENT LISTENERS (ONLY IF VOICE IS AVAILABLE) ---
    useEffect(() => {
        if (!Voice) {
            console.log('Voice recognition not available');
            setVoiceAvailable(false);
            return;
        }

        // Check if voice recognition is available
        Voice.isAvailable()
            .then((available: boolean) => {
                setVoiceAvailable(available);
                if (available) {
                    Voice.onSpeechStart = () => setIsListening(true);
                    Voice.onSpeechEnd = () => setIsListening(false);
                    
                    Voice.onSpeechResults = (e: any) => {
                        if (e.value && e.value.length > 0) {
                            const finalResult = e.value[0];
                            setInput(finalResult); 
                            handleSend(finalResult); 
                        }
                    };
                    Voice.onSpeechError = (e: any) => {
                        console.error('STT Error:', e);
                        setIsListening(false);
                        Speech.stop(); 
                    };
                }
            })
            .catch((error: any) => {
                console.log('Voice check error:', error);
                setVoiceAvailable(false);
            });

        return () => {
            if (Voice) {
                Voice.destroy().then(Voice.removeAllListeners).catch(console.error);
            }
        };
    }, []); 

    const handleSend = async (textToSend: string = input) => {
        const text = textToSend.trim();
        if (text === "") return;
        
        // Stop any ongoing speech
        if (await Speech.isSpeakingAsync()) {
            await Speech.stop();
        }

        const userMessage: Message = { id: Date.now(), text: text, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput(""); 
        setIsLoading(true);

        try {
            const aiText = await fetchAiResponse(text); 
            const aiMessage: Message = { id: Date.now() + 1, text: aiText, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);

            // Speak the response
            Speech.speak(aiText, {
                language: 'en-US',
                rate: 0.95,
                pitch: 1.05,
            });

        } catch (error) {
            console.error("AI Response Error:", error);
            const errorMessage: Message = { 
                id: Date.now() + 1, 
                text: "Sorry, I'm having trouble right now. Please try asking your question again!", 
                sender: 'ai' 
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleVoiceInput = async () => {
        if (!voiceAvailable || !Voice) {
            Alert.alert(
                'Voice Input Unavailable',
                'Voice recognition is not available on this device. Please type your message instead.',
                [{ text: 'OK' }]
            );
            return;
        }

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
            Alert.alert(
                'Microphone Error',
                'Failed to start voice recognition. Please check microphone permissions.',
                [{ text: 'OK' }]
            );
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
                        <Text style={styles.welcomeSubtitle}>Ask me anything about sustainability, recycling, composting, or waste management!</Text>
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
                    returnKeyType="send"
                />
                
                {/* Only show mic button if voice is available */}
                {voiceAvailable && (
                    <TouchableOpacity 
                        style={[styles.micButton, isListening && styles.listeningMicButton]}
                        onPress={handleVoiceInput}
                        disabled={isLoading}
                    >
                        <Ionicons name={isListening ? "stop" : "mic"} size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                    style={[styles.sendButton, (input.trim() === "" || isLoading) && styles.disabledButton]}
                    onPress={() => handleSend(input)} 
                    disabled={input.trim() === "" || isLoading}
                >
                    <Ionicons name="send" size={24} color="#FFFFFF" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

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