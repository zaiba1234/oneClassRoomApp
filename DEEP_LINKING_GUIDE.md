# Deep Linking Guide for Notifications

## What is Deep Linking?

Deep linking allows your app to open directly to a specific screen when a user taps on a notification, even when the app is closed. Instead of just opening the app, it navigates to the exact screen relevant to the notification.

## How It Works

### 1. **URL Scheme**
- Custom URL scheme: `learningsaint://`
- Example: `learningsaint://lesson/123` opens lesson with ID 123

### 2. **Deep Link Flow**
```
Notification Tap → Deep Link URL Generated → App Opens → Navigation to Specific Screen
```

### 3. **Supported Deep Links**

| Notification Type | Deep Link Format | Navigates To |
|------------------|------------------|--------------|
| Live Lesson | `learningsaint://lesson/live/{lessonId}` | LessonVideo screen |
| Recorded Lesson | `learningsaint://lesson/{lessonId}` | LessonVideo screen |
| Course/Enroll | `learningsaint://enroll/{courseId}` | Enroll screen |
| Course Details | `learningsaint://course/{courseId}` | SubCourse screen |
| Internship | `learningsaint://internship` | Internship screen |
| General Notification | `learningsaint://notification` | Notification screen |
| Notification Detail | `learningsaint://notification/{notificationId}` | Notification screen with specific ID |

## Implementation Steps

### Step 1: Native Configuration ✅

#### Android (AndroidManifest.xml)
- Added intent filters for custom URL scheme
- Added universal links support

#### iOS (Info.plist)
- Added CFBundleURLTypes with learningsaint scheme
- Added associated domains for universal links

### Step 2: Navigation Configuration ✅

#### App.js
- Added `linking` configuration to NavigationContainer
- Added URL event listeners
- Handles initial URL and ongoing URL changes

### Step 3: Deep Linking Utility ✅

#### src/utils/deepLinking.js
- `generateDeepLinkFromNotification()` - Creates deep link from notification data
- `parseDeepLink()` - Parses URL to route and params
- `navigateWithDeepLink()` - Navigates using deep link

### Step 4: Notification Handler Updates ✅

#### notificationService.js
- Updated `handleNotificationTap()` to use deep linking
- Generates deep link URL from notification data
- Uses navigation with deep link

## How to Test

### Test Deep Links Manually

#### Android:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "learningsaint://lesson/123" com.learningsaint
```

#### iOS (Simulator):
```bash
xcrun simctl openurl booted "learningsaint://lesson/123"
```

### Test from Notification

1. Send a test notification from backend with `data` field:
```json
{
  "notification": {
    "title": "New Lesson Available",
    "body": "Check out this lesson"
  },
  "data": {
    "type": "lesson",
    "lessonId": "123"
  }
}
```

2. Tap notification when app is:
   - **Closed** → App opens directly to LessonVideo screen
   - **Background** → App comes to foreground and navigates to LessonVideo
   - **Foreground** → Navigates to LessonVideo screen

## Backend Notification Format

For deep linking to work, notifications should include `data` field:

```json
{
  "notification": {
    "title": "Notification Title",
    "body": "Notification Body"
  },
  "data": {
    "type": "lesson|live_lesson|course|buy_course|internship|notification",
    "lessonId": "optional_lesson_id",
    "courseId": "optional_course_id",
    "subcourseId": "optional_subcourse_id",
    "notificationId": "optional_notification_id"
  }
}
```

## Notification Types & Deep Links

### 1. Live Lesson Notification
```json
{
  "data": {
    "type": "live_lesson",
    "lessonId": "12345"
  }
}
```
→ Opens: `learningsaint://lesson/live/12345`

### 2. Recorded Lesson Notification
```json
{
  "data": {
    "type": "lesson",
    "lessonId": "12345"
  }
}
```
→ Opens: `learningsaint://lesson/12345`

### 3. Course Enrollment Notification
```json
{
  "data": {
    "type": "buy_course",
    "subcourseId": "67890"
  }
}
```
→ Opens: `learningsaint://enroll/67890`

### 4. Internship Notification
```json
{
  "data": {
    "type": "request_internship_letter"
  }
}
```
→ Opens: `learningsaint://internship`

### 5. General Notification
```json
{
  "data": {
    "type": "notification",
    "notificationId": "99999"
  }
}
```
→ Opens: `learningsaint://notification/99999`

## Troubleshooting

### Issue: Deep link not working
1. Check if URL scheme is correct: `learningsaint://`
2. Verify AndroidManifest.xml has intent filters
3. Verify Info.plist has CFBundleURLTypes
4. Check console logs for deep link generation

### Issue: App opens but doesn't navigate
1. Check if navigation is ready (wait for 2 seconds after app opens)
2. Verify notification data format
3. Check console logs for parse errors

### Issue: Deep link works when app is open but not when closed
1. Verify background message handler is set up
2. Check if notification data is included in background notification
3. Verify initial URL handling in App.js

## Files Modified

1. ✅ `App.js` - Added linking configuration and URL listeners
2. ✅ `src/utils/deepLinking.js` - Created deep linking utility
3. ✅ `src/services/notificationService.js` - Updated to use deep links
4. ✅ `android/app/src/main/AndroidManifest.xml` - Added intent filters
5. ✅ `ios/LearningSaint/Info.plist` - Added URL schemes

## Next Steps

1. **Test with real notifications** from backend
2. **Add more deep link routes** as needed
3. **Configure universal links** on server (apple-app-site-association file)
4. **Test on both platforms** (Android & iOS)

