// 🔔 Clean Notification Testing Script (No Warnings)
// Run this script in React Native console to test all notification features


// Wait for app to initialize
setTimeout(async () => {
  
  try {
    // Test 1: Quick Status Check
    if (typeof global.quickStatus === 'function') {
      const status = await global.quickStatus();
    } else {
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: FCM Token Check
    if (typeof global.showFCMToken === 'function') {
      const token = await global.showFCMToken();
      if (token) {
      } else {
      }
    } else {
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: WebSocket Status
    if (typeof global.websocketStatus === 'function') {
      const wsStatus = global.websocketStatus();
    } else {
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 4: Firebase Status
    if (typeof global.checkFirebase === 'function') {
      const firebaseStatus = global.checkFirebase();
    } else {
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 5: Complete System Test
    if (typeof global.testNotifications === 'function') {
      await global.testNotifications();
    } else {
    }
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 6: Backend API Test
    if (typeof global.testBackendAPIs === 'function') {
      await global.testBackendAPIs();
    } else {
    }
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 7: Real-time Notification Test
    if (typeof global.testRealTime === 'function') {
      await global.testRealTime();
    } else {
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 8: Start Monitoring
    if (typeof global.startMonitoring === 'function') {
      global.startMonitoring();
    } else {
    }
    
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}, 5000); // Wait 5 seconds for app to initialize

// Manual test functions for individual testing

