// 🔑 FCM Token Testing and Usage Guide
// Your FCM Token: edtXKqYoSgKjp8GV55YiZJ:APA91bGairaAP7vQcj2LoX7yMusnIEjNPxyUIbOutDhKMKNDn9FSm6rriryD_07RTTdrl_bkuLqO6k5TISRwkIWJZz7HZ4WkESSYJnvCG0HJ-IHCIvUl4Ew

console.log('🔑 === FCM TOKEN USAGE GUIDE ===');

// Your FCM Token
const YOUR_FCM_TOKEN = 'edtXKqYoSgKjp8GV55YiZJ:APA91bGairaAP7vQcj2LoX7yMusnIEjNPxyUIbOutDhKMKNDn9FSm6rriryD_07RTTdrl_bkuLqO6k5TISRwkIWJZz7HZ4WkESSYJnvCG0HJ-IHCIvUl4Ew';

console.log('📱 Your FCM Token:', YOUR_FCM_TOKEN);
console.log('📏 Token Length:', YOUR_FCM_TOKEN.length);
console.log('✅ Token Status: VALID (142 characters)');

// Test 1: Send FCM Token to Backend 
const testSendTokenToBackend = async () => {
  console.log('\n🌐 === TEST 1: SEND FCM TOKEN TO BACKEND ===');
  
  try {
    // Get user token from AsyncStorage
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userToken = await AsyncStorage.getItem('user_token');
    
    if (!userToken) {
      console.log('❌ User not logged in. Please login first.');
      return;
    }

    const { getApiUrl } = require('./src/API/config');
    const apiUrl = getApiUrl('/api/notification/save-fcm-token');
    
    console.log('📤 Sending FCM token to backend...');
    console.log('🔑 Token:', YOUR_FCM_TOKEN.substring(0, 50) + '...');
    
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
      console.log('✅ FCM Token sent to backend successfully!');
      console.log('📊 Response:', result);
    } else {
      console.log('❌ Failed to send FCM token:', result.message);
    }
  } catch (error) {
    console.log('❌ Error sending FCM token:', error.message);
  }
};

// Test 2: Send Test Notification using FCM Token
const testSendNotification = async () => {
  console.log('\n📤 === TEST 2: SEND TEST NOTIFICATION ===');
  
  try {
    const { getApiUrl } = require('./src/API/config');
    const baseUrl = getApiUrl('/api/notification');
    
    // Get user token
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userToken = await AsyncStorage.getItem('user_token');
    
    if (!userToken) {
      console.log('❌ User not logged in. Please login first.');
      return;
    }

    console.log('📤 Sending test notification...');
    
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
      console.log('✅ Test notification sent successfully!');
      console.log('📊 Response:', result);
      console.log('📱 Check your device for the notification!');
    } else {
      console.log('❌ Failed to send test notification:', result.message);
    }
  } catch (error) {
    console.log('❌ Error sending test notification:', error.message);
  }
};

// Test 2.1: Send Notification using NEW API Endpoint
const testSendNotificationNewAPI = async () => {
  console.log('\n📤 === TEST 2.1: SEND NOTIFICATION USING NEW API ===');
  
  try {
    const { getApiUrl } = require('./src/API/config');
    const baseUrl = getApiUrl('/api/notification');
    
    // Get user token
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userToken = await AsyncStorage.getItem('user_token');
    
    if (!userToken) {
      console.log('❌ User not logged in. Please login first.');
      return;
    }

    console.log('📤 Sending notification using new API endpoint...');
    
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
      console.log('✅ Notification sent successfully using new API!');
      console.log('📊 Response:', result);
      console.log('📱 Check your device for the notification!');
    } else {
      console.log('❌ Failed to send notification using new API:', result.message);
    }
  } catch (error) {
    console.log('❌ Error sending notification using new API:', error.message);
  }
};

// Test 3: Check FCM Token in Backend
const checkFCMTokenInBackend = async () => {
  console.log('\n🔍 === TEST 3: CHECK FCM TOKEN IN BACKEND ===');
  
  try {
    const { getApiUrl } = require('./src/API/config');
    const baseUrl = getApiUrl('/api/notification');
    
    // Get user token
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const userToken = await AsyncStorage.getItem('user_token');
    
    if (!userToken) {
      console.log('❌ User not logged in. Please login first.');
      return;
    }

    console.log('🔍 Checking FCM tokens in backend...');
    
    const response = await fetch(`${baseUrl}/test/fcm-tokens`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ FCM tokens found in backend!');
      console.log('📊 Total Tokens:', result.data.totalTokens);
      console.log('📊 Active Tokens:', result.data.activeTokens);
      console.log('🔑 Tokens:', result.data.tokens);
    } else {
      console.log('❌ No FCM tokens found in backend:', result.message);
    }
  } catch (error) {
    console.log('❌ Error checking FCM tokens:', error.message);
  }
};

// Test 4: Direct FCM API Test (using curl command)
const showCurlCommand = () => {
  console.log('\n🌐 === TEST 4: DIRECT FCM API TEST (CURL) ===');
  
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

  console.log('📋 Use this curl command to test FCM directly:');
  console.log('🔧 Replace YOUR_SERVER_KEY with your Firebase server key');
  console.log('📤 Command:');
  console.log(curlCommand);
};

// Run all tests
const runAllFCMTests = async () => {
  console.log('\n🚀 === RUNNING ALL FCM TESTS ===');
  
  await testSendTokenToBackend();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testSendNotification();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await checkFCMTokenInBackend();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  showCurlCommand();
  
  console.log('\n🎉 === ALL FCM TESTS COMPLETED ===');
  console.log('📱 Check your device for notifications!');
  console.log('📊 Check backend console for logs!');
};

// Export functions for manual testing
global.testFCMToken = runAllFCMTests;
global.sendFCMTokenToBackend = testSendTokenToBackend;
global.sendTestNotification = testSendNotification;
global.sendNotificationNewAPI = testSendNotificationNewAPI;
global.checkFCMTokenInBackend = checkFCMTokenInBackend;
global.showCurlCommand = showCurlCommand;

console.log('\n📋 === MANUAL TEST COMMANDS AVAILABLE ===');
console.log('• global.testFCMToken() - Run all FCM tests');
console.log('• global.sendFCMTokenToBackend() - Send token to backend');
console.log('• global.sendTestNotification() - Send test notification (old API)');
console.log('• global.sendNotificationNewAPI() - Send notification (new API)');
console.log('• global.checkFCMTokenInBackend() - Check token in backend');
console.log('• global.showCurlCommand() - Show curl command for direct FCM test');

console.log('\n⏰ Auto-running FCM tests in 3 seconds...');
setTimeout(runAllFCMTests, 3000);
