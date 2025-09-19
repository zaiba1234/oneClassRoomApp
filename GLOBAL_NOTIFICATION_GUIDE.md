# 🌍 Global Notification Implementation Guide

## Overview
This guide explains how to implement and use global notifications in your React Native app. Global notifications are system-wide announcements that can be sent to all users or specific groups of users.

## 🚀 Features Implemented

### 1. **WebSocket Integration**
- Real-time global notification delivery via Socket.IO
- Automatic reconnection and error handling
- Event listener for `global_notification` events

### 2. **Push Notifications**
- Background notifications when app is closed/inactive
- Foreground notifications when app is active
- Android notification channels for proper categorization

### 3. **In-App Notifications**
- Custom alert dialogs for foreground notifications
- Navigation handling based on notification data
- Local storage of notification history

### 4. **Testing Interface**
- Built-in notification tester component
- Send custom test notifications
- View stored notification history

## 📁 Files Created/Modified

### New Files:
- `src/services/globalNotificationService.js` - Main service for global notifications
- `src/Component/GlobalNotificationTester.js` - Testing interface
- `GLOBAL_NOTIFICATION_GUIDE.md` - This guide

### Modified Files:
- `src/services/websocketService.js` - Added global notification handler
- `src/Screen/SettingScreen.js` - Added tester navigation
- `App.js` - Added service initialization and navigation

## 🔧 Setup Instructions

### 1. Install Required Dependencies
```bash
npm install react-native-push-notification
# For iOS, you might need additional setup
cd ios && pod install
```

### 2. Android Permissions
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
```

### 3. iOS Setup
For iOS, you may need to configure push notifications in your Apple Developer account.

## 🎯 How to Use

### 1. **Send Global Notification from Backend**
Use the API endpoint:
```http
POST {{baseUrl}}/api/notification/send-global-notification
Authorization: Bearer {userToken}
Content-Type: application/json

{
  "title": "System-Wide Announcement",
  "body": "New features are now available in the app! Check them out in your settings.",
  "data": {
    "customData": {
      "feature": "New Dashboard Update",
      "version": "2.1.0"
    }
  }
}
```

### 2. **Test Notifications in App**
1. Go to **Settings** → **Global Notification Tester**
2. Enter custom title and body
3. Tap **Send Custom Test** or **Send Quick Test**
4. View stored notifications in the list

### 3. **WebSocket Event Structure**
The backend should emit events like this:
```javascript
socket.emit('global_notification', {
  id: 'unique_notification_id',
  title: 'Notification Title',
  body: 'Notification Body',
  data: {
    customData: {
      feature: 'Feature Name',
      version: '1.0.0'
    }
  },
  priority: 'normal', // or 'high'
  category: 'announcement' // or 'update', 'alert', etc.
});
```

## 🔄 Notification Flow

### 1. **Backend Triggers Notification**
- Backend calls API or emits WebSocket event
- All connected users receive the notification

### 2. **App Receives Notification**
- WebSocket listener catches the event
- Service processes the notification data

### 3. **Notification Display**
- **Background/Inactive**: Shows push notification
- **Foreground**: Shows in-app alert dialog

### 4. **User Interaction**
- Tap notification → Navigate to relevant screen
- Notification stored locally for history

## 🎨 Customization Options

### 1. **Notification Actions**
Add custom actions in notification data:
```javascript
{
  "data": {
    "action": "open_course",
    "courseId": "12345"
  }
}
```

### 2. **Navigation Handling**
Modify `handleNotificationAction()` in `globalNotificationService.js`:
```javascript
case 'open_course':
  this.navigateToCourse(data.courseId);
  break;
case 'open_lesson':
  this.navigateToLesson(data.lessonId);
  break;
// Add more cases as needed
```

### 3. **Notification Styling**
Customize notification appearance in `showInAppNotification()`:
```javascript
Alert.alert(
  notificationData.title,
  notificationData.body,
  [
    { text: 'View Details', onPress: () => {...} },
    { text: 'Dismiss', style: 'cancel' }
  ],
  { cancelable: true }
);
```

## 🐛 Troubleshooting

### 1. **Notifications Not Appearing**
- Check WebSocket connection status
- Verify notification permissions
- Check console logs for errors

### 2. **Push Notifications Not Working**
- Verify FCM token is registered
- Check Android notification channels
- Ensure proper permissions

### 3. **WebSocket Connection Issues**
- Check server URL configuration
- Verify Socket.IO server is running
- Check network connectivity

## 📱 Testing Checklist

- [ ] WebSocket connects successfully
- [ ] Global notification service initializes
- [ ] Test notifications can be sent
- [ ] Notifications appear in foreground
- [ ] Notifications appear in background
- [ ] Notification taps navigate correctly
- [ ] Notification history is stored
- [ ] App handles reconnection properly

## 🔐 Security Considerations

1. **Authentication**: Ensure only authorized users can send global notifications
2. **Rate Limiting**: Implement rate limiting on the backend
3. **Content Validation**: Validate notification content before sending
4. **User Privacy**: Respect user notification preferences

## 📊 Monitoring

Monitor these metrics:
- WebSocket connection success rate
- Notification delivery success rate
- User engagement with notifications
- Error rates and types

## 🚀 Next Steps

1. **Custom Notification UI**: Replace Alert.alert with custom notification component
2. **Notification Categories**: Implement different notification types
3. **User Preferences**: Add notification settings for users
4. **Analytics**: Track notification performance
5. **Scheduling**: Add scheduled notification support

## 📞 Support

If you encounter issues:
1. Check console logs for error messages
2. Verify all dependencies are installed
3. Test with the built-in tester component
4. Check WebSocket connection status

---

**Happy Coding! 🎉**
