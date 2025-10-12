// Test the Gemini API endpoints
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5001';

async function testGeminiChat() {
  try {
    console.log('🧪 Testing Gemini Chat API...');
    
    const response = await fetch(`${API_BASE_URL}/api/gemini/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello! Can you teach me about recycling plastic bottles?',
        conversationHistory: []
      })
    });

    const data = await response.json();
    console.log('✅ Chat API Response:', data);
    
    if (data.success) {
      console.log('🤖 EcoZen says:', data.data.response);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function testGeminiDetection() {
  try {
    console.log('🧪 Testing Gemini Detection API...');
    
    // Sample base64 image (small transparent pixel)
    const sampleImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    const response = await fetch(`${API_BASE_URL}/api/gemini/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: sampleImage
      })
    });

    const data = await response.json();
    console.log('✅ Detection API Response:', data);
    
    if (data.success) {
      console.log('📷 Detection Result:', data.data.detection);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
console.log('🚀 Starting Gemini AI API Tests...\n');

// Wait a moment for server to be ready
setTimeout(async () => {
  await testGeminiChat();
  console.log('\n');
  await testGeminiDetection();
  console.log('\n✨ Tests completed!');
}, 2000);