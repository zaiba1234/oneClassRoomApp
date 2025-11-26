# Chatbot Integration Setup Guide

## Overview
A ChatGPT-like AI chatbot has been integrated into your HomeScreen. Users can access it via a floating button that appears on the homepage.

## Features
- ✅ Floating chatbot button on HomeScreen
- ✅ Full-screen chat modal interface
- ✅ OpenAI GPT-3.5-turbo integration
- ✅ Conversation history support
- ✅ Modern, user-friendly UI
- ✅ Error handling and loading states

## Setup Instructions

### Step 1: Get OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Create a new API key
5. Copy the API key (it starts with `sk-`)

### Step 2: Configure API Key
1. Open `/src/config/env.js`
2. Find the `OPENAI_API_KEY` field
3. Replace `'YOUR_OPENAI_API_KEY_HERE'` with your actual API key:

```javascript
OPENAI_API_KEY: 'sk-your-actual-api-key-here',
```

### Step 3: Test the Integration
1. Run your app: `npm start` or `react-native run-android` / `react-native run-ios`
2. Navigate to the HomeScreen
3. Look for the blue floating button in the bottom-right corner
4. Tap the button to open the chatbot
5. Start chatting!

## Files Created/Modified

### New Files:
1. **`/src/API/chatbotAPI.js`**
   - Handles OpenAI API communication
   - Functions: `sendChatbotMessage()` and `sendChatbotMessageViaBackend()`

2. **`/src/Component/ChatbotModal.js`**
   - Chatbot UI component
   - Full-screen modal with chat interface
   - Message history and input handling

### Modified Files:
1. **`/src/Screen/HomeScreen.js`**
   - Added chatbot state management
   - Added floating button
   - Integrated ChatbotModal component

2. **`/src/config/env.js`**
   - Added `OPENAI_API_KEY` configuration

## Security Note

⚠️ **Important**: For production apps, it's recommended to:
- Use your backend as a proxy for OpenAI API calls
- Keep the API key on your server, not in the mobile app
- Implement rate limiting and usage monitoring

The code includes a `sendChatbotMessageViaBackend()` function that you can use if you create a backend endpoint.

## Customization

### Change Chatbot Model
In `/src/API/chatbotAPI.js`, you can change the model:
```javascript
model: 'gpt-4', // Change from 'gpt-3.5-turbo' to 'gpt-4' if you have access
```

### Adjust Response Length
Modify `max_tokens` in the API call:
```javascript
max_tokens: 1000, // Increase for longer responses
```

### Change Chatbot Personality
Modify the system message in `chatbotAPI.js`:
```javascript
content: 'You are a helpful assistant for a learning platform...'
```

### Customize UI
Edit styles in `/src/Component/ChatbotModal.js` to match your app's design.

## Troubleshooting

### Chatbot not responding?
1. Check if your API key is correctly set in `env.js`
2. Verify your OpenAI account has credits/usage available
3. Check the console for error messages
4. Ensure you have an active internet connection

### API Key errors?
- Make sure the API key starts with `sk-`
- Verify the key hasn't expired
- Check if your OpenAI account is active

### UI Issues?
- The floating button should appear in the bottom-right corner
- If it's hidden, check the `zIndex` in styles
- Adjust `bottom` position in `chatbotButton` style if needed

## Support
For issues or questions, check:
- OpenAI API Documentation: https://platform.openai.com/docs
- React Native Documentation: https://reactnative.dev/docs

