import { apiService } from './apiService';
import { ENV_CONFIG } from '../config/env';

/**
 * Chatbot API Service
 * Supports both Groq (Meta Llama - FREE) and OpenAI
 */

// API URLs
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Send a message to the chatbot using Groq (Meta Llama - FREE)
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {string} apiKey - Groq API key
 * @returns {Promise<Object>} Response from Groq API
 */
export const sendChatbotMessageGroq = async (message, conversationHistory = [], apiKey) => {
  try {
    // Check if API key is provided and valid
    if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY_HERE' || apiKey.trim() === '') {
      throw new Error('Groq API key is required. Please configure your API key in src/config/env.js');
    }

    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    // Build conversation history for context
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant for a learning platform. Help users with questions about courses, learning, and general inquiries. Be friendly, concise, and informative.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message.trim()
      }
    ];

    // Make request to Groq API (Meta Llama models)
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast and free - Meta Llama model
        // Other available models: 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API Error: ${response.status}`;
      
      // Provide more helpful error messages
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        throw new Error('Invalid Groq API key. Please check your API key in src/config/env.js');
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return {
        success: true,
        message: data.choices[0].message.content,
        usage: data.usage
      };
    } else {
      throw new Error('No response from chatbot');
    }
  } catch (error) {
    console.error('❌ [ChatbotAPI] Groq Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get response from chatbot'
    };
  }
};

/**
 * Send a message to the chatbot using OpenAI
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {string} apiKey - OpenAI API key
 * @returns {Promise<Object>} Response from OpenAI API
 */
export const sendChatbotMessageOpenAI = async (message, conversationHistory = [], apiKey) => {
  try {
    // Check if API key is provided and valid
    if (!apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE' || apiKey.trim() === '') {
      throw new Error('OpenAI API key is required. Please configure your API key in src/config/env.js');
    }

    // Check if API key format is valid (should start with 'sk-')
    if (!apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format. API key should start with "sk-"');
    }

    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    // Build conversation history for context
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant for a learning platform. Help users with questions about courses, learning, and general inquiries. Be friendly, concise, and informative.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message.trim()
      }
    ];

    // Make request to OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // You can change to 'gpt-4' if you have access
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `API Error: ${response.status}`;
      
      // Provide more helpful error messages
      if (errorMessage.includes('Incorrect API key') || errorMessage.includes('Invalid API key')) {
        throw new Error('Invalid OpenAI API key. Please check your API key in src/config/env.js and ensure it is correct.');
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return {
        success: true,
        message: data.choices[0].message.content,
        usage: data.usage
      };
    } else {
      throw new Error('No response from chatbot');
    }
  } catch (error) {
    console.error('❌ [ChatbotAPI] OpenAI Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get response from chatbot'
    };
  }
};

/**
 * Send a message to the chatbot using Together AI (Meta Llama - FREE)
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {string} apiKey - Together AI API key
 * @returns {Promise<Object>} Response from Together AI
 */
export const sendChatbotMessageTogether = async (message, conversationHistory = [], apiKey) => {
  try {
    // Check if API key is provided and valid
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Together AI API key is required. Please configure your API key in src/config/env.js');
    }

    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    // Get model from config (OpenRouter format)
    const model = ENV_CONFIG.LLAMA_MODEL || 'meta-llama/Llama-3-8b-instruct';

    // Build conversation history for context
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant for a learning platform. Help users with questions about courses, learning, and general inquiries. Be friendly, concise, and informative.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message.trim()
      }
    ];

    // Make request to Together AI API (Meta Llama models)
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model, // Meta Llama model
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorText = await response.text().catch(() => '');
      
      // Try to get detailed error message
      let errorMessage = errorData.error?.message || errorData.message || `API Error: ${response.status}`;
      
      // If we have error text, log it for debugging
      if (errorText) {
        console.error('❌ [ChatbotAPI] Together AI Error Response:', errorText);
        try {
          const parsedError = JSON.parse(errorText);
          errorMessage = parsedError.error?.message || parsedError.message || errorMessage;
        } catch (e) {
          // If not JSON, use the text as is
          if (errorText.length < 200) {
            errorMessage = errorText;
          }
        }
      }
      
      // Provide more helpful error messages
      if (errorMessage.includes('API key') || errorMessage.includes('authentication') || errorMessage.includes('Unauthorized')) {
        throw new Error(`Invalid Together AI API key. Error: ${errorMessage}. Please check your API key in src/config/env.js`);
      }
      
      if (errorMessage.includes('model') || errorMessage.includes('Model')) {
        throw new Error(`Model error: ${errorMessage}. The model '${model}' might not be available. Please check the model name in src/config/env.js`);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return {
        success: true,
        message: data.choices[0].message.content,
        usage: data.usage
      };
    } else {
      throw new Error('No response from chatbot');
    }
  } catch (error) {
    console.error('❌ [ChatbotAPI] Together AI Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get response from chatbot'
    };
  }
};

/**
 * Send a message to the chatbot using OpenRouter (Meta Llama - FREE)
 * OpenRouter provides access to multiple models including Meta Llama
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<Object>} Response from OpenRouter
 */
export const sendChatbotMessageOpenRouter = async (message, conversationHistory = [], apiKey) => {
  try {
    // Check if API key is provided and valid
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('OpenRouter API key is required. Please configure your API key in src/config/env.js');
    }

    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    // Get model from config (OpenRouter format)
    const model = ENV_CONFIG.LLAMA_MODEL || 'meta-llama/Llama-3-8b-instruct';

    // Build conversation history for context
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant for a learning platform. Help users with questions about courses, learning, and general inquiries. Be friendly, concise, and informative.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message.trim()
      }
    ];

    // Make request to OpenRouter API (Meta Llama models)
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://learningsaint.com', // Optional: for analytics
        'X-Title': 'LearningSaint App' // Optional: for analytics
      },
      body: JSON.stringify({
        model: model, // Meta Llama model
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorText = await response.text().catch(() => '');
      
      // Try to get detailed error message
      let errorMessage = errorData.error?.message || errorData.message || `API Error: ${response.status}`;
      
      // If we have error text, log it for debugging
      if (errorText) {
        console.error('❌ [ChatbotAPI] OpenRouter Error Response:', errorText);
        try {
          const parsedError = JSON.parse(errorText);
          errorMessage = parsedError.error?.message || parsedError.message || errorMessage;
        } catch (e) {
          // If not JSON, use the text as is
          if (errorText.length < 200) {
            errorMessage = errorText;
          }
        }
      }
      
      // Provide more helpful error messages
      if (errorMessage.includes('API key') || errorMessage.includes('authentication') || errorMessage.includes('Unauthorized')) {
        throw new Error(`Invalid OpenRouter API key. Error: ${errorMessage}. Please check your API key in src/config/env.js`);
      }
      
      if (errorMessage.includes('model') || errorMessage.includes('Model')) {
        throw new Error(`Model error: ${errorMessage}. The model '${model}' might not be available. Please check the model name in src/config/env.js`);
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return {
        success: true,
        message: data.choices[0].message.content,
        usage: data.usage
      };
    } else {
      throw new Error('No response from chatbot');
    }
  } catch (error) {
    console.error('❌ [ChatbotAPI] OpenRouter Error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get response from chatbot'
    };
  }
};

/**
 * Main function - automatically uses the configured provider
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages in the conversation
 * @param {string} apiKey - API key (OpenRouter, Together AI, Groq or OpenAI based on provider)
 * @returns {Promise<Object>} Response from chatbot
 */
export const sendChatbotMessage = async (message, conversationHistory = [], apiKey) => {
  const provider = ENV_CONFIG.CHATBOT_PROVIDER || 'openrouter';
  
  if (provider === 'openrouter') {
    return await sendChatbotMessageOpenRouter(message, conversationHistory, apiKey);
  } else if (provider === 'together') {
    return await sendChatbotMessageTogether(message, conversationHistory, apiKey);
  } else if (provider === 'groq') {
    return await sendChatbotMessageGroq(message, conversationHistory, apiKey);
  } else {
    return await sendChatbotMessageOpenAI(message, conversationHistory, apiKey);
  }
};

/**
 * Alternative: If you want to use your backend as a proxy for OpenAI
 * This keeps the API key secure on the backend
 */
export const sendChatbotMessageViaBackend = async (message, conversationHistory = [], token) => {
  try {
    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    const result = await apiService.post('/api/chatbot/message', {
      message: message.trim(),
      conversationHistory: conversationHistory
    });

    if (result.success && result.data.success) {
      return {
        success: true,
        message: result.data.message,
        usage: result.data.usage
      };
    } else {
      return {
        success: false,
        error: result.data.message || 'Failed to get response from chatbot'
      };
    }
  } catch (error) {
    console.error('❌ [ChatbotAPI] Error:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred'
    };
  }
};

