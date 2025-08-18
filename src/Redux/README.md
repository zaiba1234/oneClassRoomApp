# Redux Setup for LearningSaint App

This folder contains the Redux configuration for managing user state in the LearningSaint app.

## 📁 File Structure

```
src/Redux/
├── store.js           # Redux store configuration
├── userSlice.js       # User state slice with actions and reducers
├── userActions.js     # Helper functions for common user actions
├── hooks.js           # Custom hooks for Redux usage
├── index.js           # Main export file
└── README.md          # This documentation
```

## 🚀 Quick Start

### 1. Import Redux Hooks
```javascript
import { useAppDispatch, useAppSelector } from '../Redux';
```

### 2. Use in Your Component
```javascript
const MyComponent = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);
  
  // Access user data
  console.log('User name:', user.fullName);
  console.log('Mobile:', user.mobileNumber);
  console.log('Token:', user.token);
  console.log('Is authenticated:', user.isAuthenticated);
  
  return (
    // Your component JSX
  );
};
```

## 🔧 Available Actions

### Store User Data
```javascript
import { storeUserData } from '../Redux';

// Store complete user data
dispatch(storeUserData({
  fullName: 'John Doe',
  mobileNumber: '+919876543210',
  token: 'jwt_token_here'
}));
```

### Store Individual Fields
```javascript
import { storeToken, storeFullName, storeMobileNumber } from '../Redux';

// Store token after OTP verification
dispatch(storeToken('jwt_token_here'));

// Store full name
dispatch(storeFullName('John Doe'));

// Store mobile number
dispatch(storeMobileNumber('+919876543210'));
```

### Clear User Data
```javascript
import { clearUser, logoutUser } from '../Redux';

// Clear all user data
dispatch(clearUser());

// Logout user
dispatch(logoutUser());
```

## 📱 State Structure

```javascript
{
  user: {
    fullName: '',           // User's full name
    mobileNumber: '',       // User's mobile number
    token: '',              // JWT token for authentication
    isAuthenticated: false  // Whether user is logged in
  }
}
```

## 🔄 Integration with API Calls

### After Successful Login/Registration
```javascript
const handleLogin = async () => {
  try {
    const result = await authAPI.login(mobileNumber);
    if (result.success) {
      // Store user data in Redux
      dispatch(storeUserData({
        fullName: result.data.fullName,
        mobileNumber: mobileNumber,
        token: result.data.token
      }));
      
      // Navigate to next screen
      navigation.navigate('Verify');
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

### After OTP Verification
```javascript
const handleVerifyOTP = async () => {
  try {
    const result = await authAPI.verifyOTP(mobileNumber, otp);
    if (result.success) {
      // Store token in Redux
      dispatch(storeToken(result.data.token));
      
      // Navigate to Home
      navigation.navigate('Home');
    }
  } catch (error) {
    console.error('OTP verification error:', error);
  }
};
```

## 🎯 Benefits

✅ **Centralized State** - All user data in one place  
✅ **Easy Access** - Use hooks to access data anywhere  
✅ **Persistent** - Data persists across screen navigation  
✅ **Type Safe** - Clear structure for user data  
✅ **Easy Testing** - Mock Redux state easily  

## 🔍 Debugging

To see the current Redux state in your component:

```javascript
const user = useAppSelector((state) => state.user);
console.log('Current Redux state:', user);
```

## 📝 Notes

- The Redux store is already configured in `App.js`
- All screens can access user data using the hooks
- User data is automatically cleared on logout
- Token is stored separately for easy access
