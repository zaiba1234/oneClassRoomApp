// 🔑 FCM Token Testing and Usage Guide
// Your FCM Token: edtXKqYoSgKjp8GV55YiZJ:APA91bGairaAP7vQcj2LoX7yMusnIEjNPxyUIbOutDhKMKNDn9FSm6rriryD_07RTTdrl_bkuLqO6k5TISRwkIWJZz7HZ4WkESSYJnvCG0HJ-IHCIvUl4Ew


// Your FCM Token
const YOUR_FCM_TOKEN = 'edtXKqYoSgKjp8GV55YiZJ:APA91bGairaAP7vQcj2LoX7yMusnIEjNPxyUIbOutDhKMKNDn9FSm6rriryD_07RTTdrl_bkuLqO6k5TISRwkIWJZz7HZ4WkESSYJnvCG0HJ-IHCIvUl4Ew';


// Test 1: Send FCM Token to Backend 
const testSendTokenToBackend = async () => {
  
  try {
    // Get user token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userToken = await AsyncStorage.getItem('user_token');
    
    if (!userToken) {
      return;
    }

    const { getApiUrl } = require('./src/API/config');
    const apiUrl = getApiUrl('/api/notification/save-fcm-token');
    
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fcmToken: YOUR_FCM_TOKEN,
        deviceId: 'android_device_' + Date.now()
      }),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
    } else {
    }
  } catch (error) {
  }
};

// Test 2: Send Test Notification using FCM Token
const testSendNotification = async () => {
  
  try {
    const { getApiUrl } = require('./src/API/config');
    const baseUrl = getApiUrl('/api/notification');
    
    // Get user token
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userToken = await AsyncStorage.getItem('user_token');
    
    if (!userToken) {
      return;
    }

    
    const response = await fetch(`${baseUrl}/test/send-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'fcm_token_test',
        title: 'FCM Token Test',
        body: 'This notification was sent using your FCM token!',
        data: {
          test: true,
          token: YOUR_FCM_TOKEN.substring(0, 20) + '...',
          timestamp: new Date().toISOString()
        }
      }),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
    } else {
    }
  } catch (error) {
  }
};

// Test 2.1: Send Notification using NEW API Endpoint
const testSendNotificationNewAPI = async () => {
  
  try {
    const { getApiUrl } = require('./src/API/config');
    const baseUrl = getApiUrl('/api/notification');
    
    // Get user token
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userToken = await AsyncStorage.getItem('user_token');
    
    if (!userToken) {
      return;
    }

    
    const response = await fetch(`${baseUrl}/send-notification`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipientId: 'self', // Send to self for testing
        title: 'New API Test Notification',
        body: 'This notification was sent using the new send-notification API endpoint!',
        type: 'test',
        data: {
          test: true,
          api: 'send-notification',
          token: YOUR_FCM_TOKEN.substring(0, 20) + '...',
          timestamp: new Date().toISOString()
        }
      }),
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
    } else {
    }
  } catch (error) {
  }
};

// Test 3: Check FCM Token in Backend
const checkFCMTokenInBackend = async () => {
  
  try {
    const { getApiUrl } = require('./src/API/config');
    const baseUrl = getApiUrl('/api/notification');
    
    // Get user token
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userToken = await AsyncStorage.getItem('user_token');
    
    if (!userToken) {
      return;
    }

    
    const response = await fetch(`${baseUrl}/test/fcm-tokens`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
    } else {
    }
  } catch (error) {
  }
};

// Test 4: Direct FCM API Test (using curl command)
const showCurlCommand = () => {
  
  const curlCommand = `curl -X POST "https://fcm.googleapis.com/fcm/send" \\
-H "Authorization: key=YOUR_SERVER_KEY" \\
-H "Content-Type: application/json" \\
-d '{
  "to": "${YOUR_FCM_TOKEN}",
  "notification": {
    "title": "Direct FCM Test",
    "body": "This notification was sent directly via FCM API"
  },
  "data": {
    "type": "direct_fcm_test",
    "timestamp": "${new Date().toISOString()}"
  }
}'`;

};

// Run all tests
const runAllFCMTests = async () => {
  
  await testSendTokenToBackend();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testSendNotification();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await checkFCMTokenInBackend();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  showCurlCommand();
  
};

// Export functions for manual testing
global.testFCMToken = runAllFCMTests;
global.sendFCMTokenToBackend = testSendTokenToBackend;
global.sendTestNotification = testSendNotification;
global.sendNotificationNewAPI = testSendNotificationNewAPI;
global.checkFCMTokenInBackend = checkFCMTokenInBackend;
global.showCurlCommand = showCurlCommand;


setTimeout(runAllFCMTests, 3000);
