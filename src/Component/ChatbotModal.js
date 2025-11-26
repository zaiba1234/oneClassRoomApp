import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { sendChatbotMessage } from '../API/chatbotAPI';
import { ENV_CONFIG } from '../config/env';

const { width, height } = Dimensions.get('window');

const ChatbotModal = ({ visible, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I\'m your AI assistant. How can I help you today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);
  const configMessageAddedRef = useRef(false); // Track if config message was added

  // Get API key from environment config (OpenRouter, Together AI, Groq, or OpenAI)
  // Use useMemo to prevent recalculation on every render
  const { provider, API_KEY, isApiKeyConfigured } = React.useMemo(() => {
    const prov = ENV_CONFIG.CHATBOT_PROVIDER || 'openrouter';
    const OPENROUTER_API_KEY = ENV_CONFIG.OPENROUTER_API_KEY || '';
    const TOGETHER_API_KEY = ENV_CONFIG.TOGETHER_API_KEY || '';
    const GROQ_API_KEY = ENV_CONFIG.GROQ_API_KEY || '';
    const OPENAI_API_KEY = ENV_CONFIG.OPENAI_API_KEY || '';
    
    // Use the appropriate API key based on provider
    const key = prov === 'openrouter' ? OPENROUTER_API_KEY :
                prov === 'together' ? TOGETHER_API_KEY : 
                prov === 'groq' ? GROQ_API_KEY : 
                OPENAI_API_KEY;
    
    // Check if API key is configured
    const isConfigured = key && 
      key !== 'YOUR_GROQ_API_KEY_HERE' && 
      key !== 'YOUR_OPENAI_API_KEY_HERE' &&
      key !== 'YOUR_TOGETHER_API_KEY_HERE' &&
      key !== 'YOUR_OPENROUTER_API_KEY_HERE' &&
      key.trim() !== '' &&
      (prov === 'groq' ? key.startsWith('gsk_') : 
       prov === 'openrouter' ? (key.startsWith('sk-or-v1-') || key.startsWith('sk-')) :
       prov === 'together' ? (key.startsWith('sk-') || key.startsWith('sk-or-v1-')) : 
       key.startsWith('sk-'));
    
    return { provider: prov, API_KEY: key, isApiKeyConfigured: isConfigured };
  }, []);

  // Scroll to bottom when new message is added (separate effect)
  useEffect(() => {
    if (visible && messages.length > 0) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });
    }
  }, [messages.length, visible]); // Only depend on length, not entire messages array

  // Show API key configuration message if not configured (only once)
  useEffect(() => {
    if (visible && !isApiKeyConfigured && messages.length === 1 && !configMessageAddedRef.current) {
      const providerName = provider === 'openrouter' ? 'OpenRouter (Meta Llama - FREE)' :
                          provider === 'together' ? 'Together AI (Meta Llama - FREE)' : 
                          provider === 'groq' ? 'Groq (Meta Llama - FREE)' : 
                          'OpenAI';
      const apiKeyUrl = provider === 'openrouter' ? 'https://openrouter.ai/keys' :
                       provider === 'together' ? 'https://api.together.xyz/' : 
                       provider === 'groq' ? 'https://console.groq.com/keys' : 
                       'https://platform.openai.com/api-keys';
      const configMessage = {
        id: Date.now(),
        text: `⚠️ ${providerName} API key is not configured. Please add your API key in src/config/env.js to use the chatbot. Get your FREE API key from: ${apiKeyUrl}`,
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, configMessage]);
      configMessageAddedRef.current = true; // Mark as added
    }
  }, [visible, isApiKeyConfigured, provider]); // Removed messages from dependencies

  // Reset config message flag when modal closes
  useEffect(() => {
    if (!visible) {
      configMessageAddedRef.current = false;
    }
  }, [visible]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    // Check if API key is configured
    if (!isApiKeyConfigured) {
      const providerName = provider === 'openrouter' ? 'OpenRouter (Meta Llama - FREE)' :
                          provider === 'together' ? 'Together AI (Meta Llama - FREE)' : 
                          provider === 'groq' ? 'Groq (Meta Llama - FREE)' : 
                          'OpenAI';
      const apiKeyUrl = provider === 'openrouter' ? 'https://openrouter.ai/keys' :
                       provider === 'together' ? 'https://api.together.xyz/' : 
                       provider === 'groq' ? 'https://console.groq.com/keys' : 
                       'https://platform.openai.com/api-keys';
      const errorMessage = {
        id: Date.now() + 1,
        text: `⚠️ ${providerName} API key is not configured. Please add your API key in src/config/env.js file. Get your FREE API key from: ${apiKeyUrl}`,
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage = inputText.trim();
    setInputText('');
    
    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    // Build conversation history (last 10 messages for context)
    const conversationHistory = messages
      .slice(-10)
      .map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));

    try {
      // Send message to chatbot
      const response = await sendChatbotMessage(
        userMessage,
        conversationHistory,
        API_KEY
      );

      setIsLoading(false);

      if (response.success) {
        // Add bot response to chat
        const botMessage = {
          id: Date.now() + 1,
          text: response.message,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        // Show error message with better handling
        let errorText = `Sorry, I encountered an error: ${response.error || 'Unknown error'}.`;
        
        // Provide helpful message for API key errors
        if (response.error && response.error.includes('API key')) {
          const providerName = provider === 'openrouter' ? 'OpenRouter (Meta Llama)' :
                              provider === 'together' ? 'Together AI (Meta Llama)' : 
                              provider === 'groq' ? 'Groq (Meta Llama)' : 
                              'OpenAI';
          const apiKeyUrl = provider === 'openrouter' ? 'https://openrouter.ai/keys' :
                           provider === 'together' ? 'https://api.together.xyz/' : 
                           provider === 'groq' ? 'https://console.groq.com/keys' : 
                           'https://platform.openai.com/api-keys';
          errorText = `⚠️ Invalid ${providerName} API key. Please check your API key in src/config/env.js. Get your FREE API key from: ${apiKeyUrl}`;
        }
        
        const errorMessage = {
          id: Date.now() + 1,
          text: errorText,
          isUser: false,
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, something went wrong. Please check your internet connection and try again.`,
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        text: 'Hello! I\'m your AI assistant. How can I help you today?',
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.botAvatar}>
                <Icon name="chatbubbles" size={24} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>AI Assistant</Text>
                <Text style={styles.headerSubtitle}>Always here to help</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleClearChat} style={styles.clearButton}>
                <Icon name="trash-outline" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Messages Container */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageWrapper,
                  message.isUser ? styles.userMessageWrapper : styles.botMessageWrapper
                ]}
              >
                {!message.isUser && (
                  <View style={styles.botAvatarSmall}>
                    <Icon name="chatbubbles" size={16} color="#fff" />
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    message.isUser ? styles.userBubble : styles.botBubble,
                    message.isError && styles.errorBubble
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      message.isUser ? styles.userMessageText : styles.botMessageText,
                      message.isError && styles.errorText
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
                {message.isUser && (
                  <View style={styles.userAvatar}>
                    <Icon name="person" size={16} color="#fff" />
                  </View>
                )}
              </View>
            ))}
            {isLoading && (
              <View style={styles.loadingWrapper}>
                <View style={styles.botAvatarSmall}>
                  <Icon name="chatbubbles" size={16} color="#fff" />
                </View>
                <View style={styles.loadingBubble}>
                  <ActivityIndicator size="small" color="#666" />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Input Container */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={isApiKeyConfigured ? "Type your message..." : "API key not configured"}
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading && isApiKeyConfigured}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading || !isApiKeyConfigured) && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading || !isApiKeyConfigured}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    padding: 8,
    marginRight: 8,
  },
  closeButton: {
    padding: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  botMessageWrapper: {
    justifyContent: 'flex-start',
  },
  botAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: width * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  errorBubble: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#333',
  },
  errorText: {
    color: '#FF3B30',
  },
  loadingWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
  },
  loadingBubble: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

export default ChatbotModal;

