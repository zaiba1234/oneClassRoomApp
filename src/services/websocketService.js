import io from 'socket.io-client';
import { getApiUrl } from '../API/config';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000; // 3 seconds
    this.listeners = new Map();
  }

  // Initialize WebSocket connection
  connect(userId = null) {
    return new Promise((resolve, reject) => {
      try {
        console.log(' WebSocket: Starting connection...');
        
        // Get server URL from config
        const serverUrl = getApiUrl('').replace('/api', ''); // Remove /api from base URL
        console.log(' WebSocket: Connecting to server:', serverUrl);
        
        this.socket = io(serverUrl, {
          transports: ['websocket'],
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectInterval,
          timeout: 10000, // 10 seconds timeout
        });

        // Connection successful
        this.socket.on('connect', () => {
          console.log(' WebSocket: Connection established successfully!');
          console.log(' WebSocket: Socket ID:', this.socket.id);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Join user room if userId provided
          if (userId) {
            console.log('👤 WebSocket: Joining user room:', userId);
            this.socket.emit('join', userId);
          }
          
          // Setup existing event listeners
          this.setupExistingListeners();
          
          resolve();
        });

        // Connection error
        this.socket.on('connect_error', (error) => {
          console.error(' WebSocket: Connection error:', error);
          this.isConnected = false;
          reject(error);
        });

        // Disconnection
        this.socket.on('disconnect', (reason) => {
          console.log('🔌 WebSocket: Disconnected. Reason:', reason);
          this.isConnected = false;
          
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            console.log('🔄 WebSocket: Server disconnected, attempting to reconnect...');
            this.socket.connect();
          }
        });

        // Reconnection attempts
        this.socket.on('reconnect_attempt', (attemptNumber) => {
          console.log(`🔄 WebSocket: Reconnection attempt ${attemptNumber}/${this.maxReconnectAttempts}`);
          this.reconnectAttempts = attemptNumber;
        });

        // Reconnection successful
        this.socket.on('reconnect', (attemptNumber) => {
          console.log(`✅ WebSocket: Reconnected successfully after ${attemptNumber} attempts!`);
          this.isConnected = true;
          this.reconnectAttempts = 0;
        });

        // Reconnection failed
        this.socket.on('reconnect_failed', () => {
          console.error('❌ WebSocket: Reconnection failed after maximum attempts');
          this.isConnected = false;
          this.handleConnectionFailure();
        });

        // Handle all incoming events
        this.socket.onAny((eventName, ...args) => {
          console.log(`📨 WebSocket: Received event "${eventName}":`, args);
          this.handleIncomingEvent(eventName, args);
        });

      } catch (error) {
        console.error('💥 WebSocket: Failed to initialize connection:', error);
        this.handleConnectionFailure();
        reject(error);
      }
    });
  }

  // Handle connection failure with fallback
  handleConnectionFailure() {
    console.log('🛡️ WebSocket: Connection failed, using fallback mode');
    console.log('🛡️ WebSocket: App will continue to work without real-time features');
    
    // You can implement fallback logic here
    // For example, switch to polling or show offline mode
  }

  // Setup existing event listeners after connection
  setupExistingListeners() {
    console.log('🔧 WebSocket: Setting up existing event listeners...');
    this.listeners.forEach((callbacks, eventName) => {
      console.log(`🔧 WebSocket: Setting up listener for "${eventName}" with ${callbacks.length} callbacks`);
      this.socket.on(eventName, (...args) => {
        console.log(`📨 WebSocket: Event "${eventName}" received:`, args);
        this.handleIncomingEvent(eventName, args);
      });
    });
    console.log('✅ WebSocket: Existing event listeners set up successfully');
  }

  // Handle incoming events
  handleIncomingEvent(eventName, args) {
    console.log(`📨 WebSocket: Handling incoming event "${eventName}" with ${args.length} arguments`);
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      console.log(`📨 WebSocket: Found ${listeners.length} listeners for event "${eventName}"`);
      listeners.forEach((callback, index) => {
        try {
          console.log(`📨 WebSocket: Calling listener ${index + 1} for event "${eventName}"`);
          callback(...args);
        } catch (error) {
          console.error(`💥 WebSocket: Error in event listener for "${eventName}":`, error);
        }
      });
    } else {
      console.log(`⚠️ WebSocket: No listeners found for event "${eventName}"`);
    }
  }

  // Emit event to server
  emit(eventName, data) {
    if (this.socket && this.isConnected) {
      console.log(`📤 WebSocket: Emitting event "${eventName}":`, data);
      this.socket.emit(eventName, data);
    } else {
      console.warn(`⚠️ WebSocket: Cannot emit "${eventName}" - not connected`);
    }
  }

  // Listen to specific events
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
    
    console.log(`👂 WebSocket: Added listener for event "${eventName}"`);
    
    // Set up socket listener if connected
    if (this.socket && this.isConnected) {
      this.socket.on(eventName, (...args) => {
        console.log(`📨 WebSocket: Event "${eventName}" received:`, args);
        this.handleIncomingEvent(eventName, args);
      });
    }
  }

  // Specific event handlers for better organization
  onLiveLesson(callback) {
    this.on('live_lesson', callback);
  }

  onLessonStarted(callback) {
    this.on('lesson_started', callback);
  }

  onBuyCourse(callback) {
    this.on('buy_course', callback);
  }

  onRequestInternshipLetter(callback) {
    this.on('request_internship_letter', callback);
  }

  onUploadInternshipLetter(callback) {
    this.on('upload_internship_letter', callback);
  }

  // Remove event listener
  off(eventName, callback) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
        console.log(`👂 WebSocket: Removed listener for event "${eventName}"`);
      }
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      console.log('🔌 WebSocket: Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
      console.log('✅ WebSocket: Disconnected successfully');
    }
  }

  // Reconnect manually
  reconnect(userId = null) {
    console.log('🔄 WebSocket: Manual reconnection requested');
    this.disconnect();
    return this.connect(userId);
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
