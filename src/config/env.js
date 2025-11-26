// Environment Configuration
export const ENV_CONFIG = {
  // Razorpay Configuration
  RAZORPAY_KEY_ID: 'rzp_live_ZumwCLoX1AZdm9',

  // API Base URL - Production URL
  API_BASE_URL: 'http://192.168.29.157:3000',

  // Chatbot API Configuration
  // ============================================
  // META LLAMA (FREE) - Groq API Key
  // ============================================
  // Groq provides FREE access to Meta Llama models
  // 
  // FREE API KEY कैसे मिलेगी:
  // 1. Website खोलें: https://console.groq.com/keys
  // 2. Sign up करें (Google/GitHub से भी हो सकता है)
  // 3. "Create API Key" button पर click करें
  // 4. API key copy करें
  // 5. नीचे 'YOUR_GROQ_API_KEY_HERE' को अपनी actual key से replace करें
  //
  // Example:
  // GROQ_API_KEY: 'gsk_abc123xyz456def789ghi012jkl345mno678pqr901',
  //
  // ⚠️ IMPORTANT: 
  // - API key को कभी भी GitHub पर upload न करें
  // - Groq free tier में daily limit होता है (बहुत generous है)
  // ============================================
  GROQ_API_KEY: 'YOUR_GROQ_API_KEY_HERE',
  
  // Together AI API Key (Meta Llama - FREE)
  // This API key is for Together AI which provides Meta Llama models
  TOGETHER_API_KEY: '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',
  
  // OpenRouter API Key (Alternative - if your key is from OpenRouter)
  // OpenRouter also provides access to Meta Llama models
  OPENROUTER_API_KEY: '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',
  
  // OpenAI API Key (Optional - if you want to use OpenAI instead)
  OPENAI_API_KEY: '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',
  
  // Chatbot Provider: 'openrouter' (Meta Llama - FREE), 'together' (Meta Llama - FREE), 'groq' (Meta Llama - FREE), or 'openai'
  // Note: sk-or-v1- format is from OpenRouter, not Together AI
  CHATBOT_PROVIDER: 'openrouter',
  
  // Meta Llama Model to use (OpenRouter format)
  // Valid OpenRouter models:
  // - 'meta-llama/Llama-3-8b-instruct' (FREE - Fast)
  // - 'meta-llama/Llama-3-70b-instruct' (FREE - More powerful)
  // - 'meta-llama/Llama-3.1-8B-Instruct-Turbo' (FREE - Latest)
  // - 'meta-llama/Llama-3.1-70B-Instruct-Turbo' (FREE - Latest and powerful)
  LLAMA_MODEL: 'meta-llama/Llama-3-8b-instruct',

  // Other Environment Variables
  NODE_ENV: 'development',
};

// Export individual constants for easy access
export const RAZORPAY_KEY_ID = ENV_CONFIG.RAZORPAY_KEY_ID;
export const API_BASE_URL = ENV_CONFIG.API_BASE_URL;
export const NODE_ENV = ENV_CONFIG.NODE_ENV;
