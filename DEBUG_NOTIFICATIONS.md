# 🔍 Real-Time Notification Testing Guide

## 📱 **Step 1: App Console में Debug Commands**

App को run करने के बाद console में ये commands try करें:

```javascript
// 1. FCM Token Check करें
global.testFCM()
global.showFCMToken()

// 2. WebSocket Status Check करें
global.websocketStatus()

// 3. Firebase Status Check करें
global.checkFirebase()

// 4. WebSocket Reconnect करें
global.reconnectWebSocket()
```

## 🧪 **Step 2: Manual Testing Steps**

### **A. FCM Token Testing**
1. App open करें
2. Console में `global.showFCMToken()` run करें
3. FCM token दिखना चाहिए
4. Token length check करें (should be around 150+ characters)

### **B. WebSocket Connection Testing**
1. Console में `global.websocketStatus()` run करें
2. `isConnected: true` दिखना चाहिए
3. `socketId` भी दिखना चाहिए

### **C. Notification Badge Testing**
1. HomeScreen पर notification icon check करें
2. Red badge दिखना चाहिए अगर unread notifications हैं
3. Badge पर number दिखना चाहिए

## 🔔 **Step 3: Backend से Test Notifications भेजें**

### **A. FCM Test Notification भेजें**
```bash
# Postman या curl से test करें
curl -X POST "https://fcm.googleapis.com/fcm/send" \
-H "Authorization: key=YOUR_SERVER_KEY" \
-H "Content-Type: application/json" \
-d '{
  "to": "YOUR_FCM_TOKEN",
  "notification": {
    "title": "Test Notification",
    "body": "This is a test notification"
  },
  "data": {
    "type": "test",
    "message": "Test data"
  }
}'
```

### **B. WebSocket Test Event भेजें**
Backend में test करने के लिए:

```javascript
// Backend में test करें
const io = require('socket.io')(server);

// Test live lesson notification
io.to('USER_ID').emit('live_lesson', {
  lessonId: 'test_lesson_id',
  courseId: 'test_course_id',
  lessonName: 'Test Live Lesson',
  startTime: '15:30'
});

// Test buy course notification
io.to('USER_ID').emit('buy_course', {
  courseId: 'test_course_id',
  subcourseId: 'test_subcourse_id',
  courseName: 'Test Course',
  paymentId: 'test_payment_id'
});
```

## 📊 **Step 4: Real-Time Monitoring**

### **A. Console Logs Monitor करें**
App console में ये logs दिखने चाहिए:

```
🔔 NotificationService: Initializing...
✅ NotificationService: Initialized successfully
🔌 WebSocket: Connection established successfully!
✅ WebSocket: WebSocket notification handler initialized!
🔑 App: FCM Token Value: [TOKEN]
✅ App: FCM token sent to backend successfully
```

### **B. Network Tab Check करें**
1. Chrome DevTools open करें
2. Network tab में जाएं
3. FCM token API calls check करें:
   - `POST /api/notification/save-fcm-token`
   - `GET /api/notification/get-notifications`
   - `GET /api/notification/unread-count`

## 🎯 **Step 5: Different Scenarios Test करें**

### **Scenario 1: App Foreground में है**
1. App open रखें
2. Backend से notification भेजें
3. In-app alert दिखना चाहिए
4. Notification screen में notification add होना चाहिए

### **Scenario 2: App Background में है**
1. App को background में भेजें
2. Backend से notification भेजें
3. Device notification panel में notification दिखना चाहिए
4. App वापस open करने पर notification screen में दिखना चाहिए

### **Scenario 3: App Completely Closed है**
1. App को completely close करें
2. Backend से notification भेजें
3. Device notification panel में notification दिखना चाहिए
4. Notification tap करने पर app open होना चाहिए

## 🔧 **Step 6: Troubleshooting**

### **अगर FCM Token नहीं मिल रहा:**
```javascript
// Console में check करें
global.checkFirebase()
global.testFCM()

// Firebase config check करें
console.log('Firebase App:', getFirebaseApp())
```

### **अगर WebSocket Connect नहीं हो रहा:**
```javascript
// Console में check करें
global.websocketStatus()

// Manual reconnect करें
global.reconnectWebSocket()
```

### **अगर Notifications नहीं आ रहे:**
1. FCM token backend में save हुआ है या नहीं check करें
2. Backend notification sending logs check करें
3. Device notification permissions check करें

## 📱 **Step 7: Device Settings Check करें**

### **Android:**
1. Settings > Apps > Your App > Notifications
2. All notification types enable करें
3. Background app refresh enable करें

### **iOS:**
1. Settings > Notifications > Your App
2. Allow Notifications enable करें
3. All notification types enable करें

## 🎉 **Success Indicators**

### **सब कुछ properly work कर रहा है अगर:**
✅ FCM token generate हो रहा है
✅ WebSocket connection established है
✅ Notification badge दिख रहा है
✅ Backend APIs respond कर रहे हैं
✅ Foreground notifications आ रहे हैं
✅ Background notifications आ रहे हैं
✅ Notification screen में real data दिख रहा है

## 🚨 **Common Issues और Solutions**

### **Issue 1: FCM Token नहीं मिल रहा**
**Solution:** Firebase config check करें, permissions enable करें

### **Issue 2: WebSocket Connect नहीं हो रहा**
**Solution:** Server URL check करें, network connectivity check करें

### **Issue 3: Notifications नहीं आ रहे**
**Solution:** Backend notification sending check करें, FCM token validity check करें

### **Issue 4: Badge Update नहीं हो रहा**
**Solution:** API calls check करें, component re-rendering check करें

## 📞 **Quick Test Commands**

```javascript
// सब कुछ एक साथ test करने के लिए
console.log('=== NOTIFICATION SYSTEM TEST ===');
console.log('1. FCM Status:', global.checkFirebase());
console.log('2. WebSocket Status:', global.websocketStatus());
console.log('3. FCM Token:', global.showFCMToken());
console.log('4. Test FCM:', global.testFCM());
```

ये सब steps follow करने के बाद आपको पता चल जाएगा कि notification system properly work कर रहा है या नहीं! 🎯
