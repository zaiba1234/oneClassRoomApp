import { Alert } from 'react-native';
import notificationService from './notificationService';
import websocketService from './websocketService';
import { getStoredFCMToken, checkFirebaseStatus } from './firebaseConfig';

// Notification System Tester
class NotificationTester {
  constructor() {
    this.testResults = [];
  }

  // Complete notification system test
  async runCompleteTest() {
    console.log('🧪 === NOTIFICATION SYSTEM COMPLETE TEST ===');
    this.testResults = [];

    try {
      // Test 1: Firebase Status
      await this.testFirebaseStatus();
      
      // Test 2: FCM Token
      await this.testFCMToken();
      
      // Test 3: WebSocket Connection
      await this.testWebSocketConnection();
      
      // Test 4: Notification Service
      await this.testNotificationService();
      
      // Test 5: Backend APIs (if user logged in)
      await this.testBackendAPIs();
      
      // Show results
      this.showTestResults();
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      Alert.alert('Test Failed', `Error: ${error.message}`);
    }
  }

  // Test Firebase Status
  async testFirebaseStatus() {
    console.log('🔥 Testing Firebase Status...');
    
    try {
      const isFirebaseReady = checkFirebaseStatus();
      this.addTestResult('Firebase Status', isFirebaseReady, isFirebaseReady ? 'Firebase is ready' : 'Firebase not initialized');
      
      if (isFirebaseReady) {
        console.log('✅ Firebase Status: READY');
      } else {
        console.log('❌ Firebase Status: NOT READY');
      }
    } catch (error) {
      this.addTestResult('Firebase Status', false, `Error: ${error.message}`);
    }
  }

  // Test FCM Token
  async testFCMToken() {
    console.log('🔑 Testing FCM Token...');
    
    try {
      const fcmToken = await getStoredFCMToken();
      
      if (fcmToken && fcmToken.length > 100) {
        this.addTestResult('FCM Token', true, `Token length: ${fcmToken.length} characters`);
        console.log('✅ FCM Token: VALID');
        console.log('🔑 Token Preview:', fcmToken.substring(0, 50) + '...');
      } else {
        this.addTestResult('FCM Token', false, 'No valid FCM token found');
        console.log('❌ FCM Token: INVALID OR MISSING');
      }
    } catch (error) {
      this.addTestResult('FCM Token', false, `Error: ${error.message}`);
    }
  }

  // Test WebSocket Connection
  async testWebSocketConnection() {
    console.log('🔌 Testing WebSocket Connection...');
    
    try {
      const status = websocketService.getConnectionStatus();
      
      if (status.isConnected) {
        this.addTestResult('WebSocket Connection', true, `Connected with ID: ${status.socketId}`);
        console.log('✅ WebSocket: CONNECTED');
        console.log('🆔 Socket ID:', status.socketId);
      } else {
        this.addTestResult('WebSocket Connection', false, 'Not connected');
        console.log('❌ WebSocket: NOT CONNECTED');
        
        // Try to reconnect
        console.log('🔄 Attempting to reconnect...');
        try {
          await websocketService.connect();
          const newStatus = websocketService.getConnectionStatus();
          if (newStatus.isConnected) {
            this.addTestResult('WebSocket Reconnection', true, 'Successfully reconnected');
            console.log('✅ WebSocket: RECONNECTED');
          } else {
            this.addTestResult('WebSocket Reconnection', false, 'Reconnection failed');
          }
        } catch (reconnectError) {
          this.addTestResult('WebSocket Reconnection', false, `Reconnection error: ${reconnectError.message}`);
        }
      }
    } catch (error) {
      this.addTestResult('WebSocket Connection', false, `Error: ${error.message}`);
    }
  }

  // Test Notification Service
  async testNotificationService() {
    console.log('🔔 Testing Notification Service...');
    
    try {
      // Check if notification service is initialized
      if (notificationService.isInitialized) {
        this.addTestResult('Notification Service', true, 'Service is initialized');
        console.log('✅ Notification Service: INITIALIZED');
      } else {
        this.addTestResult('Notification Service', false, 'Service not initialized');
        console.log('❌ Notification Service: NOT INITIALIZED');
        
        // Try to initialize
        console.log('🔄 Attempting to initialize...');
        try {
          await notificationService.initialize();
          this.addTestResult('Notification Service Init', true, 'Successfully initialized');
          console.log('✅ Notification Service: INITIALIZED');
        } catch (initError) {
          this.addTestResult('Notification Service Init', false, `Init error: ${initError.message}`);
        }
      }
    } catch (error) {
      this.addTestResult('Notification Service', false, `Error: ${error.message}`);
    }
  }

  // Test Backend APIs
  async testBackendAPIs() {
    console.log('🌐 Testing Backend APIs...');
    
    try {
      // Get user token from AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userToken = await AsyncStorage.getItem('user_token');
      
      if (!userToken) {
        this.addTestResult('Backend APIs', false, 'No user token found - user not logged in');
        console.log('ℹ️ Backend APIs: SKIPPED (User not logged in)');
        return;
      }

      // Test unread count API
      try {
        const unreadCount = await notificationService.getUnreadCount(userToken);
        this.addTestResult('Unread Count API', true, `Unread count: ${unreadCount}`);
        console.log('✅ Unread Count API: WORKING');
      } catch (apiError) {
        this.addTestResult('Unread Count API', false, `API error: ${apiError.message}`);
        console.log('❌ Unread Count API: FAILED');
      }

      // Test get notifications API
      try {
        const notifications = await notificationService.getNotifications(userToken, 1, 5);
        if (notifications) {
          this.addTestResult('Get Notifications API', true, `Found ${notifications.notifications?.length || 0} notifications`);
          console.log('✅ Get Notifications API: WORKING');
        } else {
          this.addTestResult('Get Notifications API', false, 'No response from API');
        }
      } catch (apiError) {
        this.addTestResult('Get Notifications API', false, `API error: ${apiError.message}`);
        console.log('❌ Get Notifications API: FAILED');
      }

    } catch (error) {
      this.addTestResult('Backend APIs', false, `Error: ${error.message}`);
    }
  }

  // Add test result
  addTestResult(testName, success, message) {
    this.testResults.push({
      test: testName,
      success: success,
      message: message,
      timestamp: new Date().toLocaleTimeString()
    });
  }

  // Show test results
  showTestResults() {
    console.log('📊 === TEST RESULTS ===');
    
    let successCount = 0;
    let totalCount = this.testResults.length;
    
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.test}: ${result.message}`);
      if (result.success) successCount++;
    });
    
    console.log(`\n📈 Summary: ${successCount}/${totalCount} tests passed`);
    
    // Show alert with results
    const successRate = Math.round((successCount / totalCount) * 100);
    const alertTitle = successRate === 100 ? 'All Tests Passed! 🎉' : 
                      successRate >= 70 ? 'Most Tests Passed ✅' : 
                      'Some Tests Failed ❌';
    
    const alertMessage = this.testResults.map(result => 
      `${result.success ? '✅' : '❌'} ${result.test}: ${result.message}`
    ).join('\n');
    
    Alert.alert(
      alertTitle,
      `Success Rate: ${successRate}%\n\n${alertMessage}`,
      [{ text: 'OK' }]
    );
  }

  // Quick status check
  async quickStatusCheck() {
    console.log('⚡ === QUICK STATUS CHECK ===');
    
    const fcmToken = await getStoredFCMToken();
    const wsStatus = websocketService.getConnectionStatus();
    const firebaseReady = checkFirebaseStatus();
    
    console.log('🔥 Firebase:', firebaseReady ? 'READY' : 'NOT READY');
    console.log('🔑 FCM Token:', fcmToken ? `VALID (${fcmToken.length} chars)` : 'MISSING');
    console.log('🔌 WebSocket:', wsStatus.isConnected ? `CONNECTED (${wsStatus.socketId})` : 'DISCONNECTED');
    console.log('🔔 Notification Service:', notificationService.isInitialized ? 'INITIALIZED' : 'NOT INITIALIZED');
    
    return {
      firebase: firebaseReady,
      fcmToken: !!fcmToken,
      websocket: wsStatus.isConnected,
      notificationService: notificationService.isInitialized
    };
  }
}

// Create singleton instance
const notificationTester = new NotificationTester();

export default notificationTester;
