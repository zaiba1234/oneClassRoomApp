# 🔍 Real-Time Notification Testing Guide

## 🚀 **Quick Testing Methods**

### **Method 1: Console Commands (सबसे आसान)**

App को run करने के बाद console में ये commands try करें:

```javascript
// 1. Complete notification system test
global.testNotifications()

// 2. Quick status check
global.quickStatus()

// 3. Individual component tests
global.testFCM()
global.websocketStatus()
global.checkFirebase()
global.showFCMToken()
```

### **Method 2: Debug Button (UI में)**

1. HomeScreen पर top-right corner में 🧪 button दिखेगा
2. इस button को tap करें
3. Complete test run होगा और results alert में दिखेंगे

### **Method 3: Manual Step-by-Step Testing**

## 📱 **Step-by-Step Testing Process**

### **Step 1: App Launch Testing**

1. **App को fresh start करें**
2. **Console logs check करें:**
   ```
   🔔 NotificationService: Initializing...
   ✅ NotificationService: Initialized successfully
   🔌 WebSocket: Connection established successfully!
   🔑 App: FCM Token Value: [TOKEN]
   ```

3. **Console में command run करें:**
   ```javascript
   global.quickStatus()
   ```

4. **Expected Results:**
   - Firebase: READY
   - FCM Token: VALID (150+ characters)
   - WebSocket: CONNECTED (with socket ID)
   - Notification Service: INITIALIZED

### **Step 2: Login Testing**

1. **User login करें**
2. **Console logs check करें:**
   ```
   🔔 App: User logged in, handling post-login tasks...
   ✅ App: FCM token sent to backend on login successfully
   ✅ App: Joined WebSocket user room: [USER_ID]
   ```

3. **Console में command run करें:**
   ```javascript
   global.testNotifications()
   ```

4. **Expected Results:**
   - All tests should pass
   - Backend APIs should work
   - Unread count should be fetched

### **Step 3: Notification Badge Testing**

1. **HomeScreen पर notification icon check करें**
2. **Red badge दिखना चाहिए अगर unread notifications हैं**
3. **Badge पर number दिखना चाहिए**

### **Step 4: Notification Screen Testing**

1. **Notification icon tap करें**
2. **Notification screen open होना चाहिए**
3. **Real notifications दिखने चाहिए**
4. **Pull-to-refresh काम करना चाहिए**
5. **Mark all as read button काम करना चाहिए**

## 🧪 **Backend Integration Testing**

### **Test 1: FCM Token Backend Save**

```javascript
// Console में check करें
global.showFCMToken()

// Backend database में check करें कि token save हुआ है या नहीं
```

### **Test 2: Send Test Notification from Backend**

**Postman या curl से test करें:**

```bash
curl -X POST "https://fcm.googleapis.com/fcm/send" \
-H "Authorization: key=YOUR_SERVER_KEY" \
-H "Content-Type: application/json" \
-d '{
  "to": "YOUR_FCM_TOKEN",
  "notification": {
    "title": "Test Notification",
    "body": "This is a test notification from backend"
  },
  "data": {
    "type": "test",
    "message": "Test data"
  }
}'
```

### **Test 3: WebSocket Test Event**

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
```

## 📊 **Real-Time Monitoring**

### **Console Logs to Watch:**

```javascript
// App startup logs
🔔 NotificationService: Initializing...
✅ NotificationService: Initialized successfully
🔌 WebSocket: Connection established successfully!
🔑 App: FCM Token Value: [TOKEN]

// User login logs
🔔 App: User logged in, handling post-login tasks...
✅ App: FCM token sent to backend on login successfully
✅ App: Joined WebSocket user room: [USER_ID]

// Notification received logs
📨 NotificationService: Foreground message received: [MESSAGE]
📨 WebSocketNotificationHandler: Live lesson event received: [DATA]
🔔 NotificationService: Showing in-app notification: [NOTIFICATION]
```

### **Network Tab Monitoring:**

1. **Chrome DevTools open करें**
2. **Network tab में जाएं**
3. **ये API calls check करें:**
   - `POST /api/notification/save-fcm-token`
   - `GET /api/notification/get-notifications`
   - `GET /api/notification/unread-count`
   - `PATCH /api/notification/read-all`

## 🎯 **Different Scenarios Testing**

### **Scenario 1: App Foreground में है**

1. **App open रखें**
2. **Backend से notification भेजें**
3. **Expected Results:**
   - In-app alert दिखना चाहिए
   - Notification screen में notification add होना चाहिए
   - Badge count update होना चाहिए

### **Scenario 2: App Background में है**

1. **App को background में भेजें (home button press करें)**
2. **Backend से notification भेजें**
3. **Expected Results:**
   - Device notification panel में notification दिखना चाहिए
   - App वापस open करने पर notification screen में दिखना चाहिए

### **Scenario 3: App Completely Closed है**

1. **App को completely close करें**
2. **Backend से notification भेजें**
3. **Expected Results:**
   - Device notification panel में notification दिखना चाहिए
   - Notification tap करने पर app open होना चाहिए

## 🔧 **Troubleshooting Guide**

### **Issue 1: FCM Token नहीं मिल रहा**

**Symptoms:**
- Console में "No FCM token available" message
- Badge नहीं दिख रहा

**Solutions:**
```javascript
// Console में check करें
global.checkFirebase()
global.testFCM()

// Firebase config check करें
console.log('Firebase App:', getFirebaseApp())
```

### **Issue 2: WebSocket Connect नहीं हो रहा**

**Symptoms:**
- Console में "WebSocket connection failed" message
- Real-time notifications नहीं आ रहे

**Solutions:**
```javascript
// Console में check करें
global.websocketStatus()

// Manual reconnect करें
global.reconnectWebSocket()
```

### **Issue 3: Notifications नहीं आ रहे**

**Symptoms:**
- Backend से notification भेजने के बाद भी नहीं आ रहे
- Badge update नहीं हो रहा

**Solutions:**
1. FCM token backend में save हुआ है या नहीं check करें
2. Backend notification sending logs check करें
3. Device notification permissions check करें

### **Issue 4: Badge Update नहीं हो रहा**

**Symptoms:**
- Notification आ रहे हैं लेकिन badge count update नहीं हो रहा

**Solutions:**
1. API calls check करें
2. Component re-rendering check करें
3. Console में unread count logs check करें

## 📱 **Device Settings Check**

### **Android:**
1. **Settings > Apps > Your App > Notifications**
2. **All notification types enable करें**
3. **Background app refresh enable करें**

### **iOS:**
1. **Settings > Notifications > Your App**
2. **Allow Notifications enable करें**
3. **All notification types enable करें**

## 🎉 **Success Indicators**

### **सब कुछ properly work कर रहा है अगर:**

✅ **FCM token generate हो रहा है** (150+ characters)
✅ **WebSocket connection established है** (socket ID दिख रहा है)
✅ **Notification badge दिख रहा है** (unread count के साथ)
✅ **Backend APIs respond कर रहे हैं** (200 status codes)
✅ **Foreground notifications आ रहे हैं** (in-app alerts)
✅ **Background notifications आ रहे हैं** (device notification panel)
✅ **Notification screen में real data दिख रहा है** (backend से fetch हो रहा है)

## 🚨 **Quick Fix Commands**

```javascript
// सब कुछ reset करने के लिए
global.reconnectWebSocket()
global.testNotifications()

// Individual component restart करने के लिए
global.testFCM()
global.websocketStatus()
global.checkFirebase()
```

## 📞 **Emergency Debug Commands**

```javascript
// Complete system status
console.log('=== EMERGENCY DEBUG ===');
console.log('Firebase:', global.checkFirebase());
console.log('WebSocket:', global.websocketStatus());
console.log('FCM Token:', global.showFCMToken());
console.log('Quick Status:', global.quickStatus());
```

## 🎯 **Final Testing Checklist**

- [ ] App startup logs सही हैं
- [ ] FCM token generate हो रहा है
- [ ] WebSocket connect हो रहा है
- [ ] User login के बाद token backend में save हो रहा है
- [ ] Notification badge दिख रहा है
- [ ] Notification screen real data show कर रहा है
- [ ] Foreground notifications आ रहे हैं
- [ ] Background notifications आ रहे हैं
- [ ] WebSocket real-time notifications काम कर रहे हैं
- [ ] Backend APIs सब respond कर रहे हैं

**अगर सब checkmarks ✅ हैं तो आपका notification system perfectly work कर रहा है!** 🎉

---

## 📞 **Support**

अगर कोई issue आ रहा है तो:

1. **Console logs check करें**
2. **Debug commands run करें**
3. **Network tab में API calls check करें**
4. **Device notification permissions check करें**

**Happy Testing!** 🚀
