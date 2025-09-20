# Firebase Cloud Messaging (FCM) Implementation

This directory contains the Firebase Cloud Messaging implementation for the Learning Saint app.

## Files Overview

### 1. `firebaseConfig.js`
Main Firebase configuration and FCM token management.

**Key Functions:**
- `requestUserPermission()` - Request notification permissions
- `getFCMToken()` - Generate and store FCM token
- `getStoredFCMToken()` - Retrieve stored FCM token
- `refreshFCMToken()` - Refresh FCM token
- `initializeFirebaseMessaging()` - Initialize Firebase messaging
- `sendFCMTokenToBackend()` - Send FCM token to backend API
- `onMessageReceived()` - Handle foreground messages
- `onBackgroundMessage()` - Handle background messages

### 2. `fcmTokenService.js`
Redux-integrated FCM token service for managing tokens with the app state.

**Key Functions:**
- `initializeAndSendToken()` - Initialize and send FCM token
- `sendStoredTokenToBackend()` - Send stored token when user logs in
- `refreshAndSendToken()` - Refresh and send new token
- `validateAndSendToken()` - Validate existing token

### 3. `fcmTest.js`
Test utilities for debugging FCM token generation.

**Key Functions:**
- `testFCMTokenGeneration()` - Test FCM token generation
- `testFCMTokenSending()` - Test sending token to backend
- `getFCMTokenInfo()` - Get FCM token information

## Firebase Configuration

The Firebase configuration is based on your `google-services.json` file:

```json
{
  "apiKey": "AIzaSyBJn8hIkaO-MCKB_HJFyz1mNi3IwMUdiAg",
  "projectId": "learningsaint-971bd",
  "storageBucket": "learningsaint-971bd.firebasestorage.app",
  "messagingSenderId": "830620644032",
  "appId": "1:830620644032:android:54d5247078117e3726f325"
}
```

## How It Works

### 1. App Initialization
When the app starts:
- Firebase messaging is initialized
- FCM token is generated and stored locally
- If user is logged in, token is sent to backend
- Foreground message listener is set up

### 2. User Login
When user logs in:
- Stored FCM token is retrieved
- Token is sent to backend API
- Backend stores token for sending notifications

### 3. Token Refresh
- FCM tokens are automatically refreshed by Firebase
- New tokens are stored locally and sent to backend
- Background message handler processes notifications

### 4. Message Handling
- **Foreground**: Messages are handled by `onMessageReceived`
- **Background**: Messages are handled by `onBackgroundMessage`

## API Endpoints

### Send FCM Token to Backend
```
POST /api/user/fcm-token/update
Headers: {
  "Authorization": "Bearer {userToken}",
  "Content-Type": "application/json"
}
Body: {
  "fcmToken": "fcm_token_here",
  "platform": "android" | "ios"
}
```

## Console Logs

The implementation includes comprehensive logging:

- `🔔 Firebase:` - Firebase initialization and permissions
- `✅ Firebase:` - Success messages
- `❌ Firebase:` - Error messages
- `📡 Firebase:` - API calls
- `💾 Firebase:` - Local storage operations
- `🔄 Firebase:` - Token refresh operations
- `📨 Firebase:` - Message handling

## Testing

To test FCM token generation:

```javascript
import { testFCMTokenGeneration } from './src/services/fcmTest';

// Test FCM token generation
testFCMTokenGeneration()
  .then((success) => {
    console.log('Test result:', success);
  });
```

## Dependencies

Required packages (already installed):
- `@react-native-firebase/app`
- `@react-native-firebase/messaging`
- `@react-native-async-storage/async-storage`

## Platform Differences

### Android
- Permissions are handled automatically
- No additional setup required

### iOS
- Requires explicit permission request
- Uses `messaging().requestPermission()`

## Troubleshooting

### Common Issues

1. **No FCM Token Generated**
   - Check Firebase configuration
   - Verify `google-services.json` is in correct location
   - Check notification permissions

2. **Token Not Sent to Backend**
   - Verify user is logged in
   - Check network connectivity
   - Verify backend API endpoint

3. **Notifications Not Received**
   - Check FCM token is valid
   - Verify backend is sending to correct token
   - Check app notification settings

### Debug Commands

```javascript
// Get FCM token info
import { getFCMTokenInfo } from './src/services/fcmTest';
getFCMTokenInfo();

// Test token generation
import { testFCMTokenGeneration } from './src/services/fcmTest';
testFCMTokenGeneration();
```

## Security Notes

- FCM tokens are stored locally using AsyncStorage
- Tokens are sent to backend over HTTPS
- Backend should validate tokens before storing
- Tokens should be refreshed periodically

## Future Enhancements

- Add notification categories
- Implement notification actions
- Add notification history
- Implement notification preferences
- Add notification analytics
