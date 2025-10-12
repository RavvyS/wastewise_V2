import { API_BASE_URL } from './api';

interface GeminiChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface GeminiResponse {
    response: string;
    error?: string;
}

export class GeminiService {
    private static apiUrl = `${API_BASE_URL}/api/gemini`;

    // EcoZen AI Chatbot - Waste separation education
    static async chatWithEcoZen(message: string, conversationHistory: GeminiChatMessage[] = []): Promise<string> {
        console.log('🤖 EcoZen AI: Processing message:', message);

        try {
            const response = await fetch(`${this.apiUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    conversationHistory,
                    context: 'waste_separation_education'
                }),
            });

            if (!response.ok) {
                console.error('❌ HTTP Error:', response.status, response.statusText);
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('✅ EcoZen AI: Response received:', data);

            if (data.success && data.data && data.data.response) {
                return data.data.response;
            } else {
                console.error('❌ Unexpected response format:', data);
                throw new Error(data.error || 'Invalid response format from server');
            }
        } catch (error) {
            console.error('❌ EcoZen AI Error:', error);
            return "I'm having trouble connecting right now. Please try again later! 🤖";
        }
    }

    // Object Detection - Recycle symbol recognition
    static async detectRecycleSymbol(imageBase64: string): Promise<{
        detectedSymbol?: string;
        recyclingCode?: string;
        materialType?: string;
        disposalInstructions?: string;
        confidence?: number;
        error?: string;
    }> {
        console.log('📷 Object Detection: Analyzing image...');

        try {
            const response = await fetch(`${this.apiUrl}/detect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageBase64
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Object Detection: Analysis complete');

            if (data.success) {
                return data.data.detection;
            } else {
                throw new Error(data.error || 'Detection API returned error');
            }
        } catch (error) {
            console.error('❌ Object Detection Error:', error);
            return {
                error: error instanceof Error ? error.message : 'Detection failed'
            };
        }
    }

    // Get EcoZen welcome message
    static getWelcomeMessage(): string {
        return "🌱 Hi! I'm EcoZen, your AI waste separation assistant! I can help you learn how to properly separate and recycle different types of waste. What would you like to know about recycling today?";
    }
}

export type { GeminiChatMessage, GeminiResponse };