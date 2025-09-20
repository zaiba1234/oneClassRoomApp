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
    
    try {
      const isFirebaseReady = checkFirebaseStatus();
      this.addTestResult('Firebase Status', isFirebaseReady, isFirebaseReady ? 'Firebase is ready' : 'Firebase not initialized');
      
      if (isFirebaseReady) {
      } else {
      }
    } catch (error) {
      this.addTestResult('Firebase Status', false, `Error: ${error.message}`);
    }
  }

  // Test FCM Token
  async testFCMToken() {
    
    try {
      const fcmToken = await getStoredFCMToken();
      
      if (fcmToken && fcmToken.length > 100) {
        this.addTestResult('FCM Token', true, `Token length: ${fcmToken.length} characters`);
      } else {
        this.addTestResult('FCM Token', false, 'No valid FCM token found');
      }
    } catch (error) {
      this.addTestResult('FCM Token', false, `Error: ${error.message}`);
    }
  }

  // Test WebSocket Connection
  async testWebSocketConnection() {
    
    try {
      const status = websocketService.getConnectionStatus();
      
      if (status.isConnected) {
        this.addTestResult('WebSocket Connection', true, `Connected with ID: ${status.socketId}`);
      } else {
        this.addTestResult('WebSocket Connection', false, 'Not connected');
        
        // Try to reconnect
        try {
          await websocketService.connect();
          const newStatus = websocketService.getConnectionStatus();
          if (newStatus.isConnected) {
            this.addTestResult('WebSocket Reconnection', true, 'Successfully reconnected');
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
    
    try {
      // Check if notification service is initialized
      if (notificationService.isInitialized) {
        this.addTestResult('Notification Service', true, 'Service is initialized');
      } else {
        this.addTestResult('Notification Service', false, 'Service not initialized');
        
        // Try to initialize
        try {
          await notificationService.initialize();
          this.addTestResult('Notification Service Init', true, 'Successfully initialized');
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
    
    try {
      // Get user token from AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const userToken = await AsyncStorage.getItem('user_token');
      
      if (!userToken) {
        this.addTestResult('Backend APIs', false, 'No user token found - user not logged in');
        return;
      }

      // Test unread count API
      try {
        const unreadCount = await notificationService.getUnreadCount(userToken);
        this.addTestResult('Unread Count API', true, `Unread count: ${unreadCount}`);
      } catch (apiError) {
        this.addTestResult('Unread Count API', false, `API error: ${apiError.message}`);
      }

      // Test get notifications API
      try {
        const notifications = await notificationService.getNotifications(userToken, 1, 5);
        if (notifications) {
          this.addTestResult('Get Notifications API', true, `Found ${notifications.notifications?.length || 0} notifications`);
        } else {
          this.addTestResult('Get Notifications API', false, 'No response from API');
        }
      } catch (apiError) {
        this.addTestResult('Get Notifications API', false, `API error: ${apiError.message}`);
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
    
    let successCount = 0;
    let totalCount = this.testResults.length;
    
    this.testResults.forEach((result, index) => {
      const status = result.success ? '✅' : '❌';
      if (result.success) successCount++;
    });
    
    
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
    
    const fcmToken = await getStoredFCMToken();
    const wsStatus = websocketService.getConnectionStatus();
    const firebaseReady = checkFirebaseStatus();
    
    
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
