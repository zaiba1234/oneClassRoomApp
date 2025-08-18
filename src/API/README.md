# API Configuration & Services

This folder contains all API-related configuration and services for the LearningSaint app.

## 📁 File Structure

```
src/API/
├── config.js          # Main API configuration with environment switching
├── apiService.js      # Common API service functions
├── authAPI.js         # Authentication-specific API calls
└── README.md          # This documentation
```

## 🚀 Quick Start

### 1. Import API Service
```javascript
import { authAPI } from '../API/authAPI';
```

### 2. Use API Functions
```javascript
// Login
const result = await authAPI.login(mobileNumber);

// Register
const result = await authAPI.register(fullName, mobileNumber);

// Verify OTP
const result = await authAPI.verifyOTP(mobileNumber, otp);
```

## ⚙️ Configuration

### Environment Switching
Edit `src/API/config.js` to switch between environments:

```javascript
// In src/API/config.js, change this line:
BASE_URL: 'http://10.0.2.2:3000', // Android Emulator

// To one of these:
// BASE_URL: 'http://localhost:3000', // iOS Simulator
// BASE_URL: 'https://your-production-domain.com', // Production
// BASE_URL: 'https://your-staging-domain.com', // Staging
```

**Quick Steps:**
1. Open `src/API/config.js`
2. Comment out current BASE_URL
3. Uncomment the URL you want to use
4. Save the file

### Base URL Configuration
- **Development (Android Emulator)**: `http://10.0.2.2:3000`
- **Development (iOS Simulator)**: `http://localhost:3000`
- **Production**: `https://your-production-domain.com`

## 🔧 Adding New APIs

### 1. Add Endpoint to config.js
```javascript
ENDPOINTS: {
  // ... existing endpoints
  NEW_API: '/api/new-endpoint',
}
```

### 2. Add Function to apiService.js
```javascript
// New API function
async newAPICall(data) {
  return await apiService.post(ENDPOINTS.NEW_API, data);
}
```

### 3. Use in Your Screen
```javascript
import { apiService } from '../API/apiService';
import { ENDPOINTS } from '../API/config';

const result = await apiService.post(ENDPOINTS.NEW_API, data);
```

## 📱 Response Format

All API calls return a standardized response:

```javascript
{
  success: boolean,      // true if API call successful
  data: object,          // API response data
  status: number         // HTTP status code
}
```

## 🐛 Error Handling

The API service automatically handles:
- Network errors
- JSON parsing errors
- HTTP errors
- Timeout issues

## 🔄 Migration from Hardcoded URLs

**Before:**
```javascript
const response = await fetch('http://10.0.2.2:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

**After:**
```javascript
import { authAPI } from '../API/authAPI';
const result = await authAPI.login(mobileNumber);
```

## 📝 Benefits

✅ **Centralized Configuration** - All URLs in one place  
✅ **Environment Switching** - Easy to switch between dev/staging/prod  
✅ **Standardized Responses** - Consistent error handling  
✅ **Reusable Functions** - No duplicate API code  
✅ **Easy Maintenance** - Update URLs in one place  
✅ **Better Testing** - Mock API services easily
