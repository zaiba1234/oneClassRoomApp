import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { getApiUrl } from '../API/config';
import { useAppSelector } from '../Redux/hooks';
import Voice from '@react-native-voice/voice';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

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

const ChatbotScreen = () => {
  const navigation = useNavigation();
  const { token } = useAppSelector(state => state.user);
  const scrollRef = useRef(null);

  const [messages, setMessages] = useState([
    { id: '1', text: "Hello! I'm your AI assistant. How can I help you today?", isUser: false }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [loadingAudioId, setLoadingAudioId] = useState(null);
  const [audioHtml, setAudioHtml] = useState('<html><body></body></html>');
  const [isMuted, setIsMuted] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' for English, 'hi' for Hindi
  const audioWebViewRef = useRef(null);

  // Scroll to bottom when new message
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
    const originalMessage = inputText.trim();
    const textToSend = originalMessage.toLowerCase();
    
    // Detect language preference from user message
    let currentLanguage = language;
    if (textToSend.includes('hindi') || textToSend.includes('हिंदी') || 
        textToSend.includes('hindi me') || textToSend.includes('hindi mein') ||
        textToSend.includes('hindi mai') || textToSend.includes('hindi me baat') ||
        textToSend.includes('hindi me bol') || textToSend.includes('hindi me speak')) {
      currentLanguage = 'hi';
      setLanguage('hi');
    } else if (textToSend.includes('english') || textToSend.includes('angrezi') ||
               textToSend.includes('english me') || textToSend.includes('english mein')) {
      currentLanguage = 'en';
      setLanguage('en');
    }
    
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/chatbot/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ 
          message: originalMessage,
          language: currentLanguage 
        }),
      });
      const data = await res.json();

      const botReply = data.success ? data.data?.reply || "I'm here!" : "Error, try again.";
      const botMessageId = (Date.now() + 1).toString();
      
      setMessages(prev => [...prev, {
        id: botMessageId,
        text: botReply,
        isUser: false,
      }]);

      // Auto-play audio for bot response using speak API - Instant playback
      if (data.success && botReply && !isMuted) {
        // Reduced delay for instant audio playback
        setTimeout(() => {
          readAloud(botMessageId, botReply, currentLanguage);
        }, 100);
      }
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

  const stopAudio = () => {
    setPlayingAudioId(null);
    setAudioHtml('<html><body></body></html>');
  };

  const readAloud = async (messageId, text, lang = language) => {
    // If already playing this message, stop it (mute)
    if (playingAudioId === messageId) {
      stopAudio();
      return;
    }
    
    // If loading or already playing another message, return
    if (loadingAudioId === messageId) return;
    
    try {
      setLoadingAudioId(messageId);
      
      // Call speak API with text from chat response and language
      const res = await fetch(getApiUrl('/api/chatbot/speak'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ 
          text: text,
          language: lang || language 
        }),
      });
      
      const data = await res.json();
      
      if (data.success && data.data?.audioUrl) {
        setPlayingAudioId(messageId);
        setLoadingAudioId(null);
        
        // Play audio using WebView
        const audioHtmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
              <audio id="audioPlayer" autoplay>
                <source src="${data.data.audioUrl}" type="audio/mp3">
              </audio>
              <script>
                const audio = document.getElementById('audioPlayer');
                audio.addEventListener('ended', function() {
                  window.ReactNativeWebView.postMessage('audioEnded');
                });
                audio.addEventListener('error', function() {
                  window.ReactNativeWebView.postMessage('audioError');
                });
                audio.addEventListener('pause', function() {
                  window.ReactNativeWebView.postMessage('audioPaused');
                });
              </script>
            </body>
          </html>
        `;
        
        setAudioHtml(audioHtmlContent);
      } else {
        setLoadingAudioId(null);
      }
    } catch (error) {
      console.error('Read aloud error:', error);
      setLoadingAudioId(null);
    }
  };

  const handleAudioMessage = (event) => {
    const message = event.nativeEvent.data;
    if (message === 'audioEnded' || message === 'audioError' || message === 'audioPaused') {
      setPlayingAudioId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF8800" />
      
      {/* Header - Fixed at top */}
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => {
              setIsMuted(!isMuted);
              if (playingAudioId) {
                stopAudio();
              }
            }} 
            style={styles.muteButton}
          >
            <Icon 
              name={isMuted ? "volume-mute" : "volume-high"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={clearChat} style={styles.headerIconButton}>
            <Icon name="trash-outline" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconButton}>
            <Icon name="close" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
        enabled={true} >
        <View style={{ flex: 1 }}>
          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none" >
            {messages.map(msg => (
              <View key={msg.id} style={[styles.messageRow, msg.isUser ? styles.userRow : styles.botRow]}>
                {!msg.isUser && (
                  <LinearGradient colors={['#FF8800', '#F6B800']} style={styles.botAvatarSmall}>
                    <Icon name="chatbubbles" size={16} color="#fff" />
                  </LinearGradient>
                )}
                <View style={styles.messageContentContainer}>
                  <View style={[
                    styles.bubble,
                    msg.isUser ? styles.userBubble : styles.botBubble,
                    msg.isError && { backgroundColor: '#ffe5e5' }
                  ]}>
                    <Text style={[styles.messageText, msg.isUser ? { color: '#fff' } : { color: '#333' }]}>
                      {msg.text}
                    </Text>
                  </View>
                  {!msg.isUser && !msg.isError && (
                    <TouchableOpacity
                      onPress={() => {
                        if (playingAudioId === msg.id) {
                          stopAudio();
                        } else {
                          readAloud(msg.id, msg.text);
                        }
                      }}
                      style={styles.speakerIcon}
                      disabled={loadingAudioId === msg.id}
                    >
                      {loadingAudioId === msg.id ? (
                        <ActivityIndicator size="small" color="#FF8800" />
                      ) : (
                        <Icon 
                          name={playingAudioId === msg.id ? "volume-high" : "volume-medium-outline"} 
                          size={20} 
                          color={playingAudioId === msg.id ? "#FF8800" : "#666"} 
                        />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
            {isLoading && <ThinkingDots />}
          </ScrollView>

          {/* Input - Fixed at bottom, moves up with keyboard */}
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
              blurOnSubmit={false}
              multiline={false}
              selectionColor="#FF8800"
              underlineColorAndroid="transparent"
            />

            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim() || isLoading}
              style={{ marginLeft: 8 }} >
              <LinearGradient
                colors={!inputText.trim() || isLoading ? ['#ccc', '#ccc'] : ['#FF8800', '#F6B800']}
                style={styles.sendBtn} >
                {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Icon name="send" size={20} color="#fff" />}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      
      {/* Hidden WebView for audio playback */}
      <WebView
        ref={audioWebViewRef}
        source={{ html: audioHtml }}
        style={{ width: 0, height: 0, position: 'absolute' }}
        onMessage={handleAudioMessage}
        javaScriptEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
      />
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 30,
    paddingBottom: 16,
    flexShrink: 0,
    zIndex: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  botAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 12, color: '#fff' },
  muteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  messageRow: { flexDirection: 'row', marginVertical: 8, alignItems: 'flex-end' },
  userRow: { justifyContent: 'flex-end' },
  botRow: { justifyContent: 'flex-start' },
  botAvatarSmall: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  messageContentContainer: { flexDirection: 'row', alignItems: 'flex-end', flex: 1, minWidth: 0 },
  bubble: { maxWidth: width * 0.7, padding: 14, borderRadius: 20, flexShrink: 1 },
  userBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: '#f0f0f0', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15.5, lineHeight: 22 },

  thinkingContainer: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 10 },
  thinkingBubble: { backgroundColor: '#f0f0f0', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20, borderBottomLeftRadius: 4 },
  thinkingText: { color: '#333', fontSize: 15.5 },

  inputBar: { 
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#fff', 
    borderTopWidth: 1, 
    borderColor: '#eee', 
    alignItems: 'center',
    width: '100%',
    minHeight: 70,
    zIndex: 10,
  },
  micBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  textInput: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 23, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, maxHeight: 100, color: '#333' },
  sendBtn: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  speakerIcon: { 
    marginLeft: 8, 
    padding: 6, 
    justifyContent: 'center', 
    alignItems: 'center',
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 136, 0, 0.1)',
  },
});

export default ChatbotScreen;

