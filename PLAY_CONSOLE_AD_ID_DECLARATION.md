# Google Play Console - AD_ID Declaration Guide

## ⚠️ IMPORTANT: You MUST fill this correctly!

Since you're using **Google AdMob** in your app, you MUST declare that your app uses Advertising ID.

## Step-by-Step Declaration:

### 1. **Does your app use advertising ID?**
   - ✅ **Select: "Yes"**
   - ⚠️ **DO NOT select "No"** - This will cause the error you're seeing!

### 2. **Why does your app need to use advertising ID?**
   - ✅ **Check ONLY: "Advertising or marketing"**
   - This is because you're using AdMob to display ads in your app

### 3. **Turn off release errors**
   - ❌ **DO NOT CHECK THIS BOX**
   - Leave it **unchecked**

### 4. **Save the declaration**

## Why This Matters:

- Your app uses **Google AdMob SDK** (`react-native-google-mobile-ads`)
- AdMob **requires** the `AD_ID` permission to function properly
- If you declare "No" but your manifest has the permission, Play Console will show an error
- If you declare "No" and remove the permission, your ads won't work!

## After Declaration:

1. **Rebuild your app** with the fixed manifest:
   ```bash
   cd android
   ./gradlew clean
   ./gradlew bundleRelease
   ```

2. **Upload the new AAB** to Play Console

3. The error should disappear once:
   - ✅ Declaration says "Yes" 
   - ✅ New AAB includes the AD_ID permission
   - ✅ Both match!

## Current Status:

- ✅ Manifest has AD_ID permission (fixed)
- ⚠️ You need to update Play Console declaration to "Yes" + "Advertising or marketing"
- ⚠️ Then rebuild and upload new AAB

