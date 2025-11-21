# AdMob Crash Fix Guide

## Problem:
App crashing after integrating AdMob with error: `RNGoogleMobileAdsModule could not be found`

## Root Cause:
1. Native module not properly linked
2. Version compatibility issues
3. Build cache issues

## Solutions Applied:

### 1. ✅ Added Platform Check
- AdMob initialization only on Android
- BannerAd component only renders on Android

### 2. ✅ Added Error Handling
- Try-catch blocks to prevent crashes
- App continues even if AdMob fails

### 3. ✅ Updated Dependencies
- Google Play Services Ads: 23.5.0

## Complete Fix Steps:

### Step 1: Uninstall App from Device
```bash
adb uninstall com.learningsaint
```

### Step 2: Clean Everything
```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
```

### Step 3: Clear All Caches
```bash
# Clear Metro cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-*

# Clear watchman
watchman watch-del-all

# Clear Android build cache
cd android
./gradlew cleanBuildCache
cd ..
```

### Step 4: Rebuild
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## If Still Crashing:

### Option 1: Temporarily Disable AdMob
Comment out AdMob initialization in `App.js`:
```javascript
// Temporarily disabled
// mobileAds().initialize()...
```

### Option 2: Check Native Module Linking
```bash
npx react-native config
```
Look for `react-native-google-mobile-ads` in autolinking output.

### Option 3: Manual Linking (if auto-linking fails)
Check if manual linking is needed in `android/settings.gradle`

## Version Compatibility:
- React Native: 0.80.1
- react-native-google-mobile-ads: 16.0.0
- play-services-ads: 23.5.0

## Test After Fix:
1. App should start without crashing
2. Check console for AdMob initialization logs
3. Banner ad should appear on HomeScreen (Android only)

