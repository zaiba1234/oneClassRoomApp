# AdMob Ads Local Environment में नहीं दिख रहे - Fix Guide

## ✅ Current Implementation Status

### Ads Implemented:
1. **Banner Ad** - HomeScreen में (Line 2044-2056)
   - Ad Unit ID: `ca-app-pub-7361876223006934/6909446326`
   - Location: HomeScreen.js में search bar के नीचे

2. **Interstitial Ad** - HomeScreen में course click पर (Line 178-238, 1865-1886)
   - Ad Unit ID: `ca-app-pub-7361876223006934/3796924172`
   - Trigger: Course card click करने पर

3. **AdMob Initialization** - App.js में (Line 75-88)
   - Platform: Android only
   - Status: ✅ Properly initialized

### Configuration:
- **AdMob App ID**: `ca-app-pub-7361876223006934~2095500703` (AndroidManifest.xml में)
- **Package**: `react-native-google-mobile-ads@^16.0.0` ✅ Installed

---

## ❌ Problem: Local/Development में Ads नहीं दिख रहे

### Reason:
1. **Production Ad Unit IDs** use हो रहे हैं local environment में
2. Google AdMob **development/debug builds** में production ads serve नहीं करता
3. **Test Device Registration** नहीं है
4. **Test Ad IDs** use नहीं हो रहे

---

## 🔧 Solutions:

### Solution 1: Test Ad IDs Use करें (Recommended for Development)

#### Step 1: HomeScreen.js में Test IDs add करें

```javascript
// Line 178-184 को replace करें:
const interstitialAdRef = useRef(
  Platform.OS === 'android'
    ? InterstitialAd.createForAdRequest(
        __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-7361876223006934/3796924172',
        {
          requestNonPersonalizedAdsOnly: true,
        }
      )
    : null
);

// Line 2045 को replace करें:
<BannerAd
  unitId={__DEV__ ? TestIds.BANNER : "ca-app-pub-7361876223006934/6909446326"}
  size={BannerAdSize.BANNER}
  // ... rest of props
/>
```

#### Step 2: EnrollScreen.js में भी check करें (अगर वहाँ ads हैं)

---

### Solution 2: Test Device Register करें

#### Step 1: Device ID निकालें
```bash
# Android device connected होने पर:
adb logcat | grep -i "advertisingid"
```

या app में log add करें:
```javascript
// App.js में mobileAds().initialize() के बाद:
mobileAds()
  .initialize()
  .then(() => {
    // Get test device ID
    mobileAds()
      .requestConfiguration()
      .setTestDeviceIds(['YOUR_DEVICE_ID_HERE']);
  });
```

#### Step 2: AdMob Console में Test Device add करें
1. AdMob Console → Settings → Test devices
2. Device ID add करें
3. App rebuild करें

---

### Solution 3: Development Mode Check करें

#### App.js में update करें:
```javascript
// Line 75-88 को replace करें:
if (Platform.OS === 'android') {
  try {
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log('✅ AdMob initialized successfully');
        console.log('📊 AdMob adapter statuses:', adapterStatuses);
        
        // Development mode में test device IDs set करें
        if (__DEV__) {
          mobileAds()
            .requestConfiguration()
            .setTestDeviceIds(['YOUR_DEVICE_ID']); // Add your device ID
          console.log('🧪 Test mode enabled for AdMob');
        }
      })
      .catch(error => {
        console.error('❌ AdMob initialization failed:', error);
      });
  } catch (error) {
    console.error('❌ AdMob initialization error:', error);
  }
}
```

---

## 📋 Quick Fix (Immediate):

### Option A: Test IDs Use करें (Fastest)
```javascript
// HomeScreen.js Line 180:
unitId: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-7361876223006934/3796924172'

// HomeScreen.js Line 2045:
unitId={__DEV__ ? TestIds.BANNER : "ca-app-pub-7361876223006934/6909446326"}
```

### Option B: Production Build Test करें
```bash
# Release build बनाएं:
cd android
./gradlew assembleRelease

# Install करें:
adb install app/build/outputs/apk/release/app-release.apk
```

---

## 🔍 Debugging Steps:

### 1. Check AdMob Initialization:
```bash
# Logcat में check करें:
adb logcat | grep -i "admob\|mobileads"
```

### 2. Check Ad Loading Errors:
- HomeScreen.js में `onAdFailedToLoad` callback में error log check करें
- Console में error message देखें

### 3. Verify Network:
- Internet connection check करें
- AdMob servers accessible हैं या नहीं

---

## ✅ Expected Behavior:

### Development Mode:
- Test ads दिखेंगे (TestIds use करने पर)
- या "No ads available" message

### Production Mode:
- Real ads दिखेंगे
- Revenue generate होगा

---

## 📝 Summary:

**Current Status:**
- ✅ Ads properly implemented
- ✅ AdMob initialized
- ❌ Local में ads नहीं दिख रहे (expected behavior)

**Fix:**
1. `__DEV__` check add करें
2. Test IDs use करें development में
3. Production IDs use करें production में
4. Test device register करें (optional)

**Note:** Production में ads काम कर रहे हैं, यह normal है। Local में test IDs use करने से development में भी ads दिखेंगे।

