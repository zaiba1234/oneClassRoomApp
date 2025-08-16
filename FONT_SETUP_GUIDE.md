# 🎨 Brilliant Font Setup Guide for LearningSaint

## 📁 What I've Already Set Up:

✅ **Fonts Directory**: Created `src/fonts/` folder  
✅ **React Native Config**: Added `react-native.config.js`  
✅ **BadgeCourseScreen**: Updated to use Brilliant font  
✅ **Font Fallback**: Added serif fallback for better compatibility  

## 🚀 Complete Setup Steps:

### 1. **Download the Brilliant Font**
- Go to a reliable font source (Google Fonts, FontSquirrel, etc.)
- Download `Brilliant.ttf` or `Brilliant-Regular.ttf`
- Make sure it's the exact font you want

### 2. **Add Font to Project**
```bash
# Place the downloaded font file in:
src/fonts/Brilliant.ttf
```

### 3. **Link Fonts (Android & iOS)**
```bash
# Link the fonts to your project
npx react-native link

# For iOS, also run:
cd ios && pod install && cd ..
```

### 4. **Clean & Rebuild**
```bash
# Clean the project
npx react-native start --reset-cache

# In another terminal, rebuild:
npx react-native run-android
# OR
npx react-native run-ios
```

## 🔧 Current Configuration:

### **BadgeCourseScreen.js**
```javascript
congratulationsText: {
  fontSize: getResponsiveSize(36),
  fontWeight: 'bold',
  color: '#2285FA',
  fontStyle: 'italic',
  textAlign: 'center',
  fontFamily: 'Brilliant, serif', // ← This is already set!
}
```

### **react-native.config.js**
```javascript
module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./src/fonts/'], // ← Fonts will be linked here
};
```

## 📱 Platform-Specific Notes:

### **Android**
- Fonts are automatically linked to `android/app/src/main/assets/fonts/`
- No additional configuration needed

### **iOS**
- Fonts are added to the Xcode project
- `Info.plist` is automatically updated
- Run `pod install` after linking

## 🎯 Result:
Once you complete the setup, the "Congratulations" text in BadgeCourseScreen will display in the beautiful **Brilliant** font, exactly as shown in your screenshot!

## 🆘 Troubleshooting:
- **Font not showing?** Make sure you've rebuilt the project
- **Build errors?** Check that the font filename matches exactly
- **iOS issues?** Make sure to run `pod install`

## 📞 Need Help?
The font configuration is already complete in your code. Just add the font file and rebuild!
