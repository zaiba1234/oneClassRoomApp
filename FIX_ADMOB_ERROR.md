# Fix AdMob Native Module Error

## Error:
`RNGoogleMobileAdsModule could not be found`

## Solution Steps:

### Step 1: Clean Build
```bash
cd android
./gradlew clean
cd ..
```

### Step 2: Clear Metro Cache
```bash
npx react-native start --reset-cache
```

### Step 3: Rebuild App
```bash
npx react-native run-android
```

### Alternative: Full Clean Rebuild
If above doesn't work, try:

```bash
# 1. Stop Metro bundler (Ctrl+C)

# 2. Clean everything
cd android
./gradlew clean
cd ..

# 3. Remove node_modules and reinstall
rm -rf node_modules
npm install

# 4. Clear watchman
watchman watch-del-all

# 5. Clear Metro cache
rm -rf /tmp/metro-*

# 6. Rebuild
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## What Was Fixed:
1. ✅ Added Google Play Services Ads dependency in `android/app/build.gradle`
2. ✅ AdMob App ID added in `AndroidManifest.xml`
3. ✅ AdMob initialization in `App.js`
4. ✅ BannerAd component in `HomeScreen.js`

## If Still Not Working:
Check if auto-linking is working:
```bash
npx react-native config
```

Look for `react-native-google-mobile-ads` in the output.

