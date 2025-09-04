# 🔔 Complete Notification System Setup Guide

## Overview
This guide explains how the comprehensive notification system works in your React Native app. The system handles:
- **Background notifications** (when app is closed)
- **Foreground notifications** (when app is open)
- **In-app notifications** (real-time WebSocket notifications)
- **Push notifications** via Firebase Cloud Messaging (FCM)

## 🏗️ Architecture

### 1. Core Services
- **`notificationService.js`** - Main notification service handling FCM, backend APIs
- **`websocketNotificationHandler.js`** - Handles real-time WebSocket notifications
- **`fcmTokenService.js`** - Manages FCM token lifecycle
- **`firebaseConfig.js`** - Firebase configuration and setup

### 2. Components
- **`NotificationBadge.js`** - Shows unread count badge
- **`NotificationIcon.js`** - Custom notification icon component
- **`NotificationScreen.js`** - Real notification list screen

## 🔧 Backend API Integration

### FCM Token Management
```javascript
// Save FCM token
POST {{baseUrl}}/api/notification/save-fcm-token
Body: { "fcmToken": "", "deviceId": "" }

// Remove FCM token (logout)
POST {{baseUrl}}/api/notification/remove-fcm-token
Body: { "fcmToken": "", "deviceId": "" }
```

### Notification Management
```javascript
// Get notifications
GET {{baseUrl}}/api/notification/get-notifications?page=1&limit=20

// Mark all as read
PATCH {{baseUrl}}/api/notification/read-all

// Get unread count
GET {{baseUrl}}/api/notification/unread-count
```

## 📱 Notification Types

### 1. Live Lesson Notifications
- **Trigger**: 15 minutes before lesson starts
- **WebSocket Event**: `live_lesson`
- **Action**: Navigate to lesson video screen
- **Icon**: Blue gradient with play symbol

### 2. Course Purchase Notifications
- **Trigger**: After successful payment
- **WebSocket Event**: `buy_course`
- **Action**: Navigate to enrolled course
- **Icon**: Green gradient with checkmark

### 3. Internship Letter Request
- **Trigger**: When student requests internship letter
- **WebSocket Event**: `request_internship_letter`
- **Action**: Navigate to internship letter screen
- **Icon**: Yellow gradient with document symbol

### 4. Internship Letter Upload
- **Trigger**: When internship letter is uploaded
- **WebSocket Event**: `upload_internship_letter`
- **Action**: Navigate to internship letter screen
- **Icon**: Green gradient with upload symbol

## 🚀 How It Works

### 1. App Initialization
```javascript
// In App.js
useEffect(() => {
  // Initialize notification service
  await notificationService.initialize();
  
  // Initialize WebSocket notification handler
  await websocketNotificationHandler.initialize();
  
  // Get FCM token and send to backend
  const fcmToken = await initializeFirebaseMessaging();
  await fcmService.initializeAndSendToken();
}, []);
```

### 2. User Login
```javascript
// When user logs in
useEffect(() => {
  if (token) {
    // Send FCM token to backend
    await fcmService.sendStoredTokenToBackend();
    
    // Initialize FCM with notification service
    await notificationService.initializeFCMToken(token);
    
    // Join WebSocket user room
    websocketService.emit('join', { userId: userIdentifier });
  }
}, [token]);
```

### 3. Background Notifications
```javascript
// In notificationService.js
setupBackgroundHandler() {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    // Handle background notification
    await this.handleBackgroundNotification(remoteMessage);
  });
}
```

### 4. Foreground Notifications
```javascript
// In notificationService.js
setupForegroundHandler() {
  messaging().onMessage(async (remoteMessage) => {
    // Show in-app notification
    this.showInAppNotification(remoteMessage);
    
    // Store notification locally
    await this.storeNotification(remoteMessage);
  });
}
```

### 5. WebSocket Notifications
```javascript
// In websocketNotificationHandler.js
setupEventListeners() {
  websocketService.on('live_lesson', (data) => {
    this.handleLiveLessonNotification(data);
  });
  
  websocketService.on('buy_course', (data) => {
    this.handleBuyCourseNotification(data);
  });
  // ... other events
}
```

## 🎯 Usage Examples

### 1. Check Unread Count
```javascript
import notificationService from '../services/notificationService';

const unreadCount = await notificationService.getUnreadCount(userToken);
console.log('Unread notifications:', unreadCount);
```

### 2. Get Notifications
```javascript
const result = await notificationService.getNotifications(userToken, 1, 20);
console.log('Notifications:', result.notifications);
```

### 3. Mark All as Read
```javascript
const success = await notificationService.markAllAsRead(userToken);
if (success) {
  console.log('All notifications marked as read');
}
```

### 4. Show Notification Badge
```javascript
import NotificationBadge from '../Component/NotificationBadge';

<NotificationBadge size={24} color="#000000" showBadge={true} />
```

## 🔄 Notification Flow

### 1. Backend Triggers Notification
```
Backend → FCM → Device → App
```

### 2. WebSocket Real-time Notification
```
Backend → WebSocket → App → In-app Alert
```

### 3. User Interaction
```
User taps notification → Navigate to relevant screen
```

## 🛠️ Testing

### 1. Test FCM Token Generation
```javascript
// In console
global.testFCM()
```

### 2. Test WebSocket Connection
```javascript
// In console
global.websocketStatus()
```

### 3. Test Notification Service
```javascript
// In console
global.showFCMToken()
```

## 📋 Features Implemented

✅ **FCM Token Management**
- Automatic token generation and refresh
- Backend API integration
- Token cleanup on logout

✅ **Background Notifications**
- Firebase background message handler
- Local notification storage
- Automatic processing

✅ **Foreground Notifications**
- In-app notification alerts
- Custom notification handling
- User interaction support

✅ **WebSocket Real-time Notifications**
- Live lesson notifications
- Course purchase notifications
- Internship letter notifications
- Real-time event handling

✅ **Notification Screen**
- Real-time notification list
- Pull-to-refresh functionality
- Mark as read functionality
- Unread count display

✅ **Notification Badge**
- Unread count display
- Auto-updating badge
- Header integration

## 🎨 UI Components

### Notification Screen Features
- **Loading states** with activity indicators
- **Error handling** with retry buttons
- **Empty states** with helpful messages
- **Pull-to-refresh** functionality
- **Unread indicators** with visual styling
- **Time formatting** (e.g., "2h ago", "Just now")

### Notification Badge Features
- **Dynamic unread count** display
- **99+ limit** for large numbers
- **Auto-refresh** on screen focus
- **Responsive sizing** for different screen sizes

## 🔧 Configuration

### Firebase Setup
- FCM configuration in `firebaseConfig.js`
- Background message handler setup
- Token refresh handling

### WebSocket Setup
- Connection management in `websocketService.js`
- Event listener setup in `websocketNotificationHandler.js`
- User room joining on login

### Backend Integration
- API endpoints configured in `notificationService.js`
- Error handling and retry logic
- Token management and cleanup

## 🚨 Troubleshooting

### Common Issues

1. **FCM Token Not Generated**
   - Check Firebase configuration
   - Verify app permissions
   - Check console logs

2. **WebSocket Connection Failed**
   - Check server URL configuration
   - Verify network connectivity
   - Check server status

3. **Notifications Not Received**
   - Verify FCM token is sent to backend
   - Check notification permissions
   - Verify backend notification sending

4. **Badge Not Updating**
   - Check token availability
   - Verify API calls are successful
   - Check component re-rendering

### Debug Commands
```javascript
// Check FCM status
global.checkFirebase()

// Test FCM token generation
global.testFCM()

// Check WebSocket status
global.websocketStatus()

// Show current FCM token
global.showFCMToken()
```

## 📱 Platform Support

### Android
- ✅ Background notifications
- ✅ Foreground notifications
- ✅ In-app notifications
- ✅ Notification badges

### iOS
- ✅ Background notifications
- ✅ Foreground notifications
- ✅ In-app notifications
- ✅ Notification badges

## 🔐 Security

- FCM tokens are securely stored in AsyncStorage
- API calls use Bearer token authentication
- Device IDs are generated and managed securely
- Notification data is validated before processing

## 📈 Performance

- Notifications are cached locally for offline access
- WebSocket connections are managed efficiently
- FCM tokens are refreshed automatically
- Background processing is optimized

## 🎯 Next Steps

1. **Custom Notification UI**: Replace Alert with custom notification component
2. **Notification Categories**: Add filtering by notification type
3. **Notification Actions**: Add quick actions (Reply, Mark as Read, etc.)
4. **Rich Notifications**: Add images and action buttons
5. **Notification Scheduling**: Add local notification scheduling
6. **Analytics**: Add notification engagement tracking

---

## 📞 Support

If you encounter any issues with the notification system:

1. Check the console logs for error messages
2. Verify Firebase configuration
3. Test FCM token generation
4. Check WebSocket connection status
5. Verify backend API endpoints

The notification system is now fully integrated and ready to use! 🎉
