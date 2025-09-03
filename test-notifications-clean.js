// 🔔 Clean Notification Testing Script (No Warnings)
// Run this script in React Native console to test all notification features

console.log('🚀 === STARTING CLEAN NOTIFICATION TESTING (NO WARNINGS) ===');

// Wait for app to initialize
setTimeout(async () => {
  console.log('⏰ App initialization complete, starting clean tests...');
  
  try {
    // Test 1: Quick Status Check
    console.log('\n📊 === TEST 1: QUICK STATUS CHECK ===');
    if (typeof global.quickStatus === 'function') {
      const status = await global.quickStatus();
      console.log('✅ Quick Status Check Completed:', status);
    } else {
      console.log('❌ global.quickStatus function not available');
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: FCM Token Check
    console.log('\n🔑 === TEST 2: FCM TOKEN CHECK ===');
    if (typeof global.showFCMToken === 'function') {
      const token = await global.showFCMToken();
      if (token) {
        console.log('✅ FCM Token Available:', token.substring(0, 50) + '...');
        console.log('📏 Token Length:', token.length);
      } else {
        console.log('❌ No FCM Token Found');
      }
    } else {
      console.log('❌ global.showFCMToken function not available');
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: WebSocket Status
    console.log('\n🔌 === TEST 3: WEBSOCKET STATUS ===');
    if (typeof global.websocketStatus === 'function') {
      const wsStatus = global.websocketStatus();
      console.log('✅ WebSocket Status:', wsStatus);
    } else {
      console.log('❌ global.websocketStatus function not available');
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 4: Firebase Status
    console.log('\n🔥 === TEST 4: FIREBASE STATUS ===');
    if (typeof global.checkFirebase === 'function') {
      const firebaseStatus = global.checkFirebase();
      console.log('✅ Firebase Status:', firebaseStatus ? 'READY' : 'NOT READY');
    } else {
      console.log('❌ global.checkFirebase function not available');
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 5: Complete System Test
    console.log('\n🧪 === TEST 5: COMPLETE SYSTEM TEST ===');
    if (typeof global.testNotifications === 'function') {
      console.log('Running complete system test...');
      await global.testNotifications();
      console.log('✅ Complete System Test Completed');
    } else {
      console.log('❌ global.testNotifications function not available');
    }
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 6: Backend API Test
    console.log('\n🌐 === TEST 6: BACKEND API TEST ===');
    if (typeof global.testBackendAPIs === 'function') {
      console.log('Testing backend APIs...');
      await global.testBackendAPIs();
      console.log('✅ Backend API Test Completed');
    } else {
      console.log('❌ global.testBackendAPIs function not available');
    }
    
    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 7: Real-time Notification Test
    console.log('\n⚡ === TEST 7: REAL-TIME NOTIFICATION TEST ===');
    if (typeof global.testRealTime === 'function') {
      console.log('Testing real-time notifications...');
      await global.testRealTime();
      console.log('✅ Real-time Notification Test Completed');
    } else {
      console.log('❌ global.testRealTime function not available');
    }
    
    // Wait 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 8: Start Monitoring
    console.log('\n👀 === TEST 8: START NOTIFICATION MONITORING ===');
    if (typeof global.startMonitoring === 'function') {
      global.startMonitoring();
      console.log('✅ Notification Monitoring Started');
    } else {
      console.log('❌ global.startMonitoring function not available');
    }
    
    console.log('\n🎉 === ALL CLEAN TESTS COMPLETED ===');
    console.log('📱 Check your device for notifications!');
    console.log('📊 Check console logs for detailed results');
    console.log('🔔 Watch for in-app alerts and device notifications');
    console.log('🔇 No Firebase warnings should appear!');
    
  } catch (error) {
    console.error('❌ Test Error:', error);
  }
}, 5000); // Wait 5 seconds for app to initialize

// Manual test functions for individual testing
console.log('\n📋 === MANUAL TEST COMMANDS AVAILABLE ===');
console.log('Run these commands individually in console:');
console.log('• global.quickStatus() - Quick system check');
console.log('• global.testNotifications() - Complete system test');
console.log('• global.testBackendAPIs() - Test backend APIs');
console.log('• global.testRealTime() - Test real-time notifications');
console.log('• global.startMonitoring() - Start notification monitoring');
console.log('• global.showFCMToken() - Show FCM token');
console.log('• global.websocketStatus() - Check WebSocket status');
console.log('• global.checkFirebase() - Check Firebase status');
console.log('• global.reconnectWebSocket() - Reconnect WebSocket');

console.log('\n⏰ Clean tests will start automatically in 5 seconds...');
console.log('🔇 Firebase warnings are now suppressed!');
