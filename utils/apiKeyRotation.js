import dotenv from 'dotenv';
dotenv.config();

// Initialize the state
const state = {
    apiKeys: [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5
    ].filter(Boolean), // Remove any undefined keys
    currentKeyIndex: 0,
    usageCount: 0
};

// Function to rotate the key
function rotateKey() {
    state.currentKeyIndex = (state.currentKeyIndex + 1) % state.apiKeys.length;
    state.usageCount = 0;
}

// Function to get the current API key
function getApiKey() {
    const apiKey = state.apiKeys[state.currentKeyIndex];
    state.usageCount++;

    if (state.usageCount >= 8) {
        rotateKey();
        console.log('Rotating API key');
    }

    return apiKey;
}

export { getApiKey };