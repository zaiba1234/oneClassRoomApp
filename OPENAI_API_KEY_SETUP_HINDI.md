# OpenAI API Key कैसे लगाएं - Step by Step Guide

## 📝 API Key कहाँ से मिलेगी?

OpenAI API key आपको **OpenAI की website** से मिलेगी। यह **FREE नहीं है**, लेकिन आपको पहले कुछ credits मिलते हैं trial के लिए।

---

## 🚀 Step 1: OpenAI Account बनाएं

1. **Website खोलें**: https://platform.openai.com/
2. **Sign Up** पर click करें
3. Email और password से account बनाएं
4. Email verify करें

---

## 🔑 Step 2: API Key बनाएं

1. Login करने के बाद, **left sidebar** में **"API keys"** पर click करें
   - या direct link: https://platform.openai.com/api-keys

2. **"Create new secret key"** button पर click करें

3. एक **name** दें (जैसे: "My App Chatbot")

4. **"Create secret key"** button पर click करें

5. **⚠️ IMPORTANT**: API key को **तुरंत copy** कर लें क्योंकि यह सिर्फ **एक बार** दिखती है!
   - API key `sk-` से शुरू होगी
   - Example: `sk-proj-abc123xyz456...`

---

## 💰 Step 3: Credits Add करें (Optional)

1. **Billing** section में जाएं
2. Payment method add करें
3. कुछ credits purchase करें (minimum $5)
4. या free trial credits use करें (अगर available हैं)

---

## 💻 Step 4: Code में API Key Add करें

### File: `/src/config/env.js`

1. File खोलें: `oneClassRoomApp/src/config/env.js`

2. Line 21 पर जाएं जहाँ लिखा है:
   ```javascript
   OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',
   ```

3. `'YOUR_OPENAI_API_KEY_HERE'` को अपनी actual API key से replace करें:
   ```javascript
   OPENAI_API_KEY: 'sk-proj-your-actual-api-key-here',
   ```

4. File save करें

5. App restart करें

---

## ✅ Example:

```javascript
// ❌ WRONG (यह काम नहीं करेगा):
OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY_HERE',

// ✅ CORRECT (यह काम करेगा):
OPENAI_API_KEY: 'sk-proj-abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567',
```

---

## 🧪 Test करें

1. App run करें
2. HomeScreen पर chatbot button (blue floating button) पर click करें
3. कोई message type करें
4. अगर chatbot reply करता है, तो सब ठीक है! ✅

---

## ❌ अगर Error आए:

### Error: "Incorrect API key provided"
- **Solution**: API key सही नहीं है, दोबारा check करें

### Error: "You exceeded your current quota"
- **Solution**: Credits खत्म हो गए हैं, billing में credits add करें

### Error: "API key is not configured"
- **Solution**: `env.js` file में API key add करें

---

## 🔒 Security Tips:

1. ✅ API key को **कभी भी GitHub** पर upload न करें
2. ✅ `.gitignore` में `env.js` add करें (अगर sensitive data है)
3. ✅ Production में backend के through API key use करें (more secure)

---

## 📞 Help:

- OpenAI Support: https://help.openai.com/
- API Documentation: https://platform.openai.com/docs
- Pricing: https://openai.com/pricing

---

## 💡 Important Notes:

- API key **personal** है, किसी के साथ share न करें
- हर request के लिए **पैसे** लगते हैं (very cheap, लेकिन फिर भी)
- Free trial credits limited होते हैं
- API key `sk-` से start होनी चाहिए

---

**अगर कोई problem हो, तो error message को screenshot लेकर check करें!**

