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
  SafeAreaView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { getApiUrl } from '../API/config';
import { useAppSelector } from '../Redux/hooks';
import Voice from '@react-native-voice/voice';

const { width } = Dimensions.get('window');

const ThinkingDots = () => (
  <View style={styles.thinkingContainer}>
    <LinearGradient colors={['#FF8800', '#F6B800']} style={styles.botAvatarSmall}>
      <Icon name="chatbubbles" size={16} color="#fff" />
    </LinearGradient>
    <View style={styles.thinkingBubble}>
      <Text style={styles.thinkingText}>Thinking...</Text>
    </View>
  </View>
);

const ChatbotModal = ({ visible, onClose }) => {
  const { token } = useAppSelector(state => state.user);
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I'm your AI assistant. How can I help you today?", isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Critical Fix: Scroll to bottom when modal opens or new message
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      if (e.value?.[0]) setInputText(e.value[0]);
    };
    return () => Voice.destroy();
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), text: inputText.trim(), isUser: true };
    setMessages(prev => [...prev, userMsg]);
    const textToSend = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/chatbot/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: data.success ? data.data?.reply || "I'm here!" : "Error, try again.",
        isUser: false,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "No internet connection.",
        isUser: false,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoice = async () => {
    if (isRecording) {
      Voice.stop();
      setIsRecording(false);
    } else {
      await Voice.start('en-US');
      setIsRecording(true);
    }
  };

  const clearChat = () => {
    setMessages([{ id: '1', text: "Hello! I'm your AI assistant. How can I help you today?", isUser: false }]);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      {/* Full screen background */}
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
        
        {/* Main Chat Container (Rounded + Margin) */}
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            {/* Header */}
            <LinearGradient colors={['#FF8800', '#F6B800']} style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.botAvatar}>
                  <Icon name="chatbubbles" size={24} color="#fff" />
                </View>
                <View>
                  <Text style={styles.title}>AI Assistant</Text>
                  <Text style={styles.subtitle}>Always here to help</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity onPress={clearChat} style={{ padding: 8 }}>
                  <Icon name="trash-outline" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={onClose} style={{ padding: 8 }}>
                  <Icon name="close" size={26} color="#fff" />
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map(msg => (
                <View key={msg.id} style={[styles.messageRow, msg.isUser ? styles.userRow : styles.botRow]}>
                  {!msg.isUser && (
                    <LinearGradient colors={['#FF8800', '#F6B800']} style={styles.botAvatarSmall}>
                      <Icon name="chatbubbles" size={16} color="#fff" />
                    </LinearGradient>
                  )}
                  <View style={[
                    styles.bubble,
                    msg.isUser ? styles.userBubble : styles.botBubble,
                    msg.isError && { backgroundColor: '#ffe5e5' }
                  ]}>
                    <Text style={[styles.messageText, msg.isUser ? { color: '#fff' } : { color: '#333' }]}>
                      {msg.text}
                    </Text>
                  </View>
                </View>
              ))}
              {isLoading && <ThinkingDots />}
            </ScrollView>

            {/* Input */}
            <View style={styles.inputBar}>
              <TouchableOpacity onPress={startVoice} style={[styles.micBtn, isRecording && { backgroundColor: '#FF3B30' }]}>
                <Icon name={isRecording ? "mic" : "mic-outline"} size={22} color={isRecording ? "#fff" : "#666"} />
              </TouchableOpacity>

              <TextInput
                style={styles.textInput}
                placeholder={isRecording ? "Listening..." : "Type a message..."}
                placeholderTextColor="#333"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={sendMessage}
                returnKeyType="send"
              />

              <TouchableOpacity
                onPress={sendMessage}
                disabled={!inputText.trim() || isLoading}
                style={{ marginLeft: 8 }}
              >
                <LinearGradient
                  colors={!inputText.trim() || isLoading ? ['#ccc', '#ccc'] : ['#FF8800', '#F6B800']}
                  style={styles.sendBtn}
                >
                  {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Icon name="send" size={20} color="#fff" />}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 50,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  botAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 12, color: '#fff' },

  messageRow: { flexDirection: 'row', marginVertical: 8, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  botRow: { justifyContent: 'flex-start' },
  botAvatarSmall: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  bubble: { maxWidth: width * 0.7, padding: 14, borderRadius: 20 },
  userBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: '#f0f0f0', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15.5, lineHeight: 22 },

  thinkingContainer: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 10 },
  thinkingBubble: { backgroundColor: '#f0f0f0', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderBottomLeftRadius: 4 },
  thinkingText: { color: '#333', fontSize: 15.5 },

  inputBar: { flexDirection: 'row', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', alignItems: 'flex-end' },
  micBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  textInput: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 23, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, maxHeight: 100, color: '#333' },
  sendBtn: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
});

export default ChatbotModal;