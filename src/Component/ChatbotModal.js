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
  PermissionsAndroid,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getApiUrl } from '../API/config';
import { useAppSelector } from '../Redux/hooks';
import Voice from '@react-native-voice/voice';
import Tts from 'react-native-tts'; 

const { width, height } = Dimensions.get('window');

// Thinking Animation Component with dots
const ThinkingAnimation = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      const createAnimation = (dot, delay) => {
        return Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]);
      };

      Animated.loop(
        Animated.parallel([
          createAnimation(dot1, 0),
          createAnimation(dot2, 200),
          createAnimation(dot3, 400),
        ])
      ).start();
    };

    animateDots();
  }, [dot1, dot2, dot3]);

  const opacity1 = dot1.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const opacity2 = dot2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const opacity3 = dot3.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  return (
    <View style={styles.loadingWrapper}>
      <View style={styles.botAvatarSmall}>
        <Icon name="chatbubbles" size={16} color="#fff" />
      </View>
      <View style={styles.loadingBubble}>
        <Text style={styles.thinkingText}>Thinking</Text>
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: opacity1 }]} />
          <Animated.View style={[styles.dot, { opacity: opacity2 }]} />
          <Animated.View style={[styles.dot, { opacity: opacity3 }]} />
        </View>
      </View>
    </View>
  );
};

const ChatbotModal = ({ visible, onClose }) => {
  // Get token from Redux for API authentication
  const { token } = useAppSelector((state) => state.user);
  
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
  
  // Voice-to-text states
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  
  
  // Initialize Voice and TTS
  useEffect(() => {
    // Initialize TTS
    Tts.setDefaultLanguage('en-US');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
    
    // Voice event handlers
    Voice.onSpeechStart = () => {
      console.log('🎤 [Voice] Speech recognition started');
      setIsRecording(true);
    };
    
    Voice.onSpeechEnd = () => {
      console.log('🎤 [Voice] Speech recognition ended');
      setIsRecording(false);
    };
    
    Voice.onSpeechResults = (e) => {
      console.log('🎤 [Voice] Speech results:', e.value);
      if (e.value && e.value.length > 0) {
        setInputText(e.value[0]); // Set the recognized text to input
      }
      setIsRecording(false);
    };
    
    Voice.onSpeechError = (e) => {
      console.error('❌ [Voice] Speech recognition error:', e);
      setIsRecording(false);
      Alert.alert('Voice Recognition Error', e.error?.message || 'Failed to recognize speech');
    };
    
    // TTS event handlers
    Tts.addEventListener('tts-start', () => {
      console.log('🔊 [TTS] Speech started');
      setIsSpeaking(true);
    });
    
    Tts.addEventListener('tts-finish', () => {
      console.log('🔊 [TTS] Speech finished');
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    });
    
    Tts.addEventListener('tts-cancel', () => {
      console.log('🔊 [TTS] Speech cancelled');
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    });
    
    return () => {
      // Cleanup
      Voice.destroy().then(Voice.removeAllListeners);
      Tts.stop();
      Tts.removeAllListeners('tts-start');
      Tts.removeAllListeners('tts-finish');
      Tts.removeAllListeners('tts-cancel');
    };
  }, []);
  
  // Stop recording when modal closes
  useEffect(() => {
    if (!visible) {
      if (isRecording) {
        Voice.stop();
        setIsRecording(false);
      }
      if (isSpeaking) {
        Tts.stop();
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      }
    }
  }, [visible, isRecording, isSpeaking]);
  
  // Scroll to bottom when new message is added (separate effect)
  useEffect(() => {
    if (visible && messages.length > 0) {
      // Use requestAnimationFrame for smoother scrolling - prevent flicker
      const timeoutId = setTimeout(() => {
        requestAnimationFrame(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        });
      }, 150); // Slightly longer delay to prevent flicker
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages.length, visible]); // Only depend on length, not entire messages array

  

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = inputText.trim();
    const messageId = Date.now();
    
    // Batch all state updates together to prevent flicker
    const newUserMessage = {
      id: messageId,
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    // Update all states in a single batch using React's automatic batching
    setInputText('');
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Use backend API instead of OpenRouter
      const apiUrl = getApiUrl('/api/chatbot/chat');
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      console.log('📡 [ChatbotModal] Sending message to backend API:', apiUrl);
      console.log('📡 [ChatbotModal] Request body:', { message: userMessage });
      
      // Send POST request to backend API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          message: userMessage
        })
      });

      // Better error handling for JSON parsing
      let result;
      try {
        const responseText = await response.text();
        result = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        console.error('❌ [ChatbotModal] JSON parse error:', parseError);
        throw new Error('Invalid response from server');
      }
      
      console.log('📡 [ChatbotModal] Backend API response:', result);

      if (response.ok && result.success) {
        // Add bot response to chat
        // Access reply from result.data.reply
        const botMessage = {
          id: messageId + 1,
          text: result.data?.reply || result.data?.message || result.message || 'Sorry, I couldn\'t process that.',
          isUser: false,
          timestamp: new Date()
        };
        
        // Batch loading state and message update together
        React.startTransition(() => {
          setIsLoading(false);
          setMessages(prev => [...prev, botMessage]);
        });
      } else {
        // Show error message
        const errorText = result.message || result.error || 'Sorry, I encountered an error. Please try again.';
        const errorMessage = {
          id: messageId + 1,
          text: errorText,
          isUser: false,
          timestamp: new Date(),
          isError: true
        };
        
        // Batch loading state and error message together
        React.startTransition(() => {
          setIsLoading(false);
          setMessages(prev => [...prev, errorMessage]);
        });
      }
    } catch (error) {
      console.error('❌ [ChatbotModal] Error:', error);
      const errorMessage = {
        id: messageId + 1,
        text: `Sorry, something went wrong. Please check your internet connection and try again.`,
        isUser: false,
        timestamp: new Date(),
        isError: true
      };
      
      // Batch loading state and error message together
      React.startTransition(() => {
        setIsLoading(false);
        setMessages(prev => [...prev, errorMessage]);
      });
    }
  };

  const handleClearChat = () => {
    // Stop any ongoing speech
    if (isSpeaking) {
      Tts.stop();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
    
    setMessages([
      {
        id: 1,
        text: 'Hello! I\'m your AI assistant. How can I help you today?',
        isUser: false,
        timestamp: new Date()
      }
    ]);
  };

  // Request microphone permission (Android)
  const requestMicrophonePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone for voice recognition.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('❌ [Voice] Permission error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  // Handle voice recording start/stop
  const handleVoiceRecord = async () => {
    try {
      if (isRecording) {
        // Stop recording
        await Voice.stop();
        setIsRecording(false);
      } else {
        // Request permission first
        const hasPermission = await requestMicrophonePermission();
        if (!hasPermission) {
          Alert.alert('Permission Denied', 'Microphone permission is required for voice recognition.');
          return;
        }
        
        // Start recording
        await Voice.start('en-US');
        setIsRecording(true);
      }
    } catch (error) {
      console.error('❌ [Voice] Recording error:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start voice recognition. Please try again.');
    }
  };

  // Handle text-to-speech
  const handleTextToSpeech = (messageText, messageId) => {
    try {
      if (isSpeaking && speakingMessageId === messageId) {
        // Stop current speech
        Tts.stop();
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      } else {
        // Stop any ongoing speech
        if (isSpeaking) {
          Tts.stop();
        }
        
        // Start speaking
        setSpeakingMessageId(messageId);
        Tts.speak(messageText, {
          androidParams: {
            KEY_PARAM_PAN: -1,
            KEY_PARAM_VOLUME: 0.8,
            KEY_PARAM_STREAM: 'STREAM_MUSIC',
          },
          iosVoiceId: 'com.apple.ttsbundle.Samantha-compact',
          rate: 0.5,
        });
      }
    } catch (error) {
      console.error('❌ [TTS] Error:', error);
      Alert.alert('Error', 'Failed to read message. Please try again.');
    }
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
                  {/* Text-to-Speech button for bot messages */}
                  {!message.isUser && !message.isError && (
                    <TouchableOpacity
                      style={styles.ttsButton}
                      onPress={() => handleTextToSpeech(message.text, message.id)}
                    >
                      <Icon
                        name={isSpeaking && speakingMessageId === message.id ? "volume-high" : "volume-low-outline"}
                        size={16}
                        color={isSpeaking && speakingMessageId === message.id ? "#007AFF" : "#666"}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {message.isUser && (
                  <View style={styles.userAvatar}>
                    <Icon name="person" size={16} color="#fff" />
                  </View>
                )}
              </View>
            ))}
            {isLoading && (
              <ThinkingAnimation />
            )}
          </ScrollView>

          {/* Input Container */}
          <View style={styles.inputContainer}>
            {/* Voice-to-Text Button (Microphone) */}
            <TouchableOpacity
              style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
              onPress={handleVoiceRecord}
              disabled={isLoading}
            >
              <Icon
                name={isRecording ? "mic" : "mic-outline"}
                size={22}
                color={isRecording ? "#fff" : "#666"}
              />
            </TouchableOpacity>
            
            <TextInput
              style={styles.input}
              placeholder={isRecording ? "Listening..." : "Type your message..."}
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading && !isRecording}
            />
            
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isLoading || isRecording) && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading || isRecording}
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
    position: 'relative',
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  thinkingText: {
    fontSize: 15,
    color: '#666',
    marginRight: 6,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666',
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
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  voiceButtonActive: {
    backgroundColor: '#FF3B30',
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
  ttsButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    padding: 4,
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

