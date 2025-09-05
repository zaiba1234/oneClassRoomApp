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
        
        // Get server URL from config
        const serverUrl = getApiUrl('').replace('/api', ''); // Remove /api from base URL
        
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
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Join user room if userId provided
          if (userId) {
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
          this.isConnected = false;
          
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            this.socket.connect();
          }
        });

        // Reconnection attempts
        this.socket.on('reconnect_attempt', (attemptNumber) => {
          this.reconnectAttempts = attemptNumber;
        });

        // Reconnection successful
        this.socket.on('reconnect', (attemptNumber) => {
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
    
    // You can implement fallback logic here
    // For example, switch to polling or show offline mode
  }

  // Setup existing event listeners after connection
  setupExistingListeners() {
    this.listeners.forEach((callbacks, eventName) => {
      this.socket.on(eventName, (...args) => {
        this.handleIncomingEvent(eventName, args);
      });
    });
  }

  // Handle incoming events
  handleIncomingEvent(eventName, args) {
    const listeners = this.listeners.get(eventName);
    if (listeners) {
      listeners.forEach((callback, index) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`💥 WebSocket: Error in event listener for "${eventName}":`, error);
        }
      });
    } else {
    }
  }

  // Emit event to server
  emit(eventName, data) {
    if (this.socket && this.isConnected) {
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
    
    
    // Set up socket listener if connected
    if (this.socket && this.isConnected) {
      this.socket.on(eventName, (...args) => {
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
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.listeners.clear();
    }
  }

  // Reconnect manually
  reconnect(userId = null) {
    this.disconnect();
    return this.connect(userId);
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
