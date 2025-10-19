import { Platform } from 'react-native';

// Get API key from environment variables
const GEMINI_API_KEY = Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_GEMINI_API_KEY
    : process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyB-hxrN3gtLfNAZSeAx_dI2GXRvsHzMaQA';

// Base URL for Gemini API
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1';

/**
 * Generate text using Gemini API
 * @param prompt Text prompt for generation
 * @param model Gemini model to use (default: gemini-pro)
 * @returns Generated text response
 */
export const generateText = async (
    prompt: string,
    model: string = 'gemini-pro'
): Promise<string> => {
    try {
        const response = await fetch(
            `${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1024,
                    },
                }),
            }
        );

        const data = await response.json();

        // Check if we have a valid response
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected response structure:', data);
            return 'Sorry, I couldn\'t process your request.';
        }
    } catch (error) {
        console.error('Error generating text with Gemini:', error);
        return 'Sorry, there was an error communicating with the AI service.';
    }
};

/**
 * Analyze image using Gemini Vision API
 * @param imageBase64 Base64 encoded image
 * @param prompt Text prompt for image analysis
 * @param model Gemini vision model to use (default: gemini-pro-vision)
 * @returns Analysis result
 */
export const analyzeImage = async (
    imageBase64: string,
    prompt: string = "What's in this image? Identify any recyclable or waste items.",
    model: string = 'gemini-pro-vision'
): Promise<string> => {
    try {
        const response = await fetch(
            `${GEMINI_API_BASE_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                                {
                                    inlineData: {
                                        mimeType: 'image/jpeg',
                                        data: imageBase64,
                                    },
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.4,
                        maxOutputTokens: 1024,
                    },
                }),
            }
        );

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            console.error('Unexpected response structure:', data);
            return 'Sorry, I couldn\'t analyze this image.';
        }
    } catch (error) {
        console.error('Error analyzing image with Gemini:', error);
        return 'Sorry, there was an error communicating with the AI vision service.';
    }
};

// Testing if API key is valid and service is accessible
export const testGeminiConnection = async (): Promise<boolean> => {
    try {
        const response = await generateText('Hello, are you working?');
        return response && !response.includes('error');
    } catch (error) {
        console.error('Gemini API connection test failed:', error);
        return false;
    }
};