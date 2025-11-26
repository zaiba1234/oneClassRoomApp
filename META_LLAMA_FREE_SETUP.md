# Meta Llama FREE API Key Setup Guide (हिंदी)

## 🎉 अच्छी खबर: Meta Llama पूरी तरह FREE है!

Groq के through आप **Meta Llama models** को **FREE** में use कर सकते हैं!

---

## 🚀 Step 1: Groq Account बनाएं (FREE)

1. **Website खोलें**: https://console.groq.com/
2. **Sign Up** पर click करें
   - Google account से भी sign up हो सकता है
   - GitHub account से भी sign up हो सकता है
3. Email verify करें (अगर required हो)

---

## 🔑 Step 2: FREE API Key बनाएं

1. Login करने के बाद, **API Keys** section में जाएं
   - Direct link: https://console.groq.com/keys

2. **"Create API Key"** button पर click करें

3. एक **name** दें (जैसे: "My App Chatbot")

4. **"Submit"** button पर click करें

5. **⚠️ IMPORTANT**: API key को **तुरंत copy** कर लें!
   - API key `gsk_` से शुरू होगी
   - Example: `gsk_abc123xyz456def789ghi012jkl345mno678pqr901`

---

## 💰 Step 3: FREE Tier Details

- ✅ **Completely FREE** - No credit card required
- ✅ **Generous daily limits** - बहुत सारे requests
- ✅ **Fast responses** - Groq बहुत fast है
- ✅ **Meta Llama models** - Latest Llama models available

---

## 💻 Step 4: Code में API Key Add करें

### File: `/src/config/env.js`

1. File खोलें: `oneClassRoomApp/src/config/env.js`

2. Line 26 पर जाएं जहाँ लिखा है:
   ```javascript
   GROQ_API_KEY: 'YOUR_GROQ_API_KEY_HERE',
   ```

3. `'YOUR_GROQ_API_KEY_HERE'` को अपनी actual API key से replace करें:
   ```javascript
   GROQ_API_KEY: 'gsk-your-actual-api-key-here',
   ```

4. File save करें

5. App restart करें

---

## ✅ Example:

```javascript
// ❌ WRONG (यह काम नहीं करेगा):
GROQ_API_KEY: 'YOUR_GROQ_API_KEY_HERE',

// ✅ CORRECT (यह काम करेगा):
GROQ_API_KEY: 'gsk_abc123xyz456def789ghi012jkl345mno678pqr901stu234vwx567',
```

---

## 🧪 Test करें

1. App run करें
2. HomeScreen पर chatbot button (blue floating button) पर click करें
3. कोई message type करें
4. अगर chatbot reply करता है, तो सब ठीक है! ✅

---

## 🔄 OpenAI से Groq (Meta Llama) Switch करना

अगर आप OpenAI use कर रहे थे और अब Groq (Meta Llama) use करना चाहते हैं:

1. `env.js` file में:
   ```javascript
   CHATBOT_PROVIDER: 'groq',  // 'groq' या 'openai'
   ```

2. `GROQ_API_KEY` add करें

3. App restart करें

---

## 📊 Available Models (Groq)

Groq में ये Meta Llama models available हैं:

1. **llama-3.1-8b-instant** (Default - Fast और Free)
2. **llama-3.1-70b-versatile** (More powerful)
3. **mixtral-8x7b-32768** (Alternative)

अगर आप model change करना चाहते हैं, तो `chatbotAPI.js` file में model name change करें।

---

## ❌ अगर Error आए:

### Error: "Invalid Groq API key"
- **Solution**: API key सही नहीं है, दोबारा check करें

### Error: "Rate limit exceeded"
- **Solution**: थोड़ी देर wait करें, free tier में daily limit होता है

### Error: "API key is not configured"
- **Solution**: `env.js` file में `GROQ_API_KEY` add करें

---

## 🔒 Security Tips:

1. ✅ API key को **कभी भी GitHub** पर upload न करें
2. ✅ `.gitignore` में `env.js` add करें (अगर sensitive data है)
3. ✅ Production में backend के through API key use करें (more secure)

---

## 📞 Help:

- Groq Documentation: https://console.groq.com/docs
- Groq Discord: https://discord.gg/groq
- Support: support@groq.com

---

## 💡 Important Notes:

- Groq API key **completely FREE** है
- No credit card required
- Daily limits बहुत generous हैं
- Meta Llama models latest और powerful हैं
- Groq बहुत fast है (faster than OpenAI)

---

## 🎯 Quick Summary:

1. ✅ https://console.groq.com/keys पर जाएं
2. ✅ FREE account बनाएं
3. ✅ API key create करें
4. ✅ `env.js` में `GROQ_API_KEY` add करें
5. ✅ App restart करें
6. ✅ Enjoy FREE Meta Llama chatbot! 🎉

---

**अगर कोई problem हो, तो error message को screenshot लेकर check करें!**

