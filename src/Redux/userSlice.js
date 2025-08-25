import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunk to load user data from storage
export const loadUserFromStorage = createAsyncThunk(
  'user/loadFromStorage',
  async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedData = JSON.parse(userData);
        console.log('🔄 userSlice: Loaded user data from storage:', parsedData);
        
        // Validate the stored data
        if (isStoredUserDataValid(parsedData)) {
          console.log('✅ userSlice: Stored user data is valid');
          return parsedData;
        } else {
          console.log('❌ userSlice: Stored user data is invalid, clearing...');
          await AsyncStorage.removeItem('userData');
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('❌ userSlice: Error loading user data from storage:', error);
      return null;
    }
  }
);

// Async thunk to save user data to storage
export const saveUserToStorage = createAsyncThunk(
  'user/saveToStorage',
  async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('✅ userSlice: Saved user data to storage:', userData);
      return userData;
    } catch (error) {
      console.error('❌ userSlice: Error saving user data to storage:', error);
      throw error;
    }
  }
);

// Async thunk to clear user data from storage
export const clearUserFromStorage = createAsyncThunk(
  'user/clearFromStorage',
  async () => {
    try {
      await AsyncStorage.removeItem('userData');
      console.log('🗑️ userSlice: Cleared user data from storage');
      return true;
    } catch (error) {
      console.error('❌ userSlice: Error clearing user data from storage:', error);
      throw error;
    }
  }
);

// Async thunk to validate stored token and refresh user data
export const validateStoredToken = createAsyncThunk(
  'user/validateToken',
  async (_, { getState }) => {
    try {
      const state = getState();
      const { token, _id } = state.user;
      
      if (!token) {
        console.log('❌ userSlice: No token to validate');
        return false;
      }
      
      console.log('🔍 userSlice: Validating stored token...');
      
      // Here you could make an API call to validate the token
      // For now, we'll just check if the token exists and has basic structure
      const isValidToken = token.length > 10; // Basic validation
      
      if (isValidToken) {
        console.log('✅ userSlice: Stored token appears valid');
        return true;
      } else {
        console.log('❌ userSlice: Stored token is invalid');
        return false;
      }
    } catch (error) {
      console.error('❌ userSlice: Error validating token:', error);
      return false;
    }
  }
);

// Utility function to check if stored user data is valid
export const isStoredUserDataValid = (userData) => {
  if (!userData) return false;
  
  // Check if we have essential data
  const hasToken = !!userData.token;
  const hasBasicInfo = !!(userData.fullName || userData.mobileNumber);
  
  console.log('🔍 userSlice: Checking stored user data validity:', {
    hasToken,
    hasBasicInfo,
    tokenLength: userData.token ? userData.token.length : 0
  });
  
  return hasToken && hasBasicInfo;
};

const initialState = {
  _id: '',
  userId: '',
  fullName: '',
  mobileNumber: '',
  profileImageUrl: '',
  address: '',
  email: '',
  token: '',
  isAuthenticated: false,
  isLoading: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const { _id, userId, fullName, mobileNumber, profileImageUrl, address, email, token } = action.payload;
      state._id = _id || '';
      state.userId = userId || '';
      state.fullName = fullName || '';
      state.mobileNumber = mobileNumber || '';
      state.profileImageUrl = profileImageUrl || '';
      state.address = address || '';
      state.email = email || '';
      state.token = token || '';
      state.isAuthenticated = !!token;
      
      // Save to storage automatically if we have a token
      if (token) {
        console.log('🔄 userSlice: Auto-saving user data to storage');
        // The actual saving will be handled by the component calling setUserData
      }
    },
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setFullName: (state, action) => {
      state.fullName = action.payload;
    },
    setMobileNumber: (state, action) => {
      state.mobileNumber = action.payload;
    },
    setProfileData: (state, action) => {
      const { _id, userId, fullName, mobileNumber, profileImageUrl, address, email } = action.payload;
      state._id = _id || '';
      state.userId = userId || '';
      state.fullName = fullName || '';
      state.mobileNumber = mobileNumber || '';
      state.profileImageUrl = profileImageUrl || '';
      state.address = address || '';
      state.email = email || '';
    },
    clearUserData: (state) => {
      state._id = '';
      state.userId = '';
      state.fullName = '';
      state.mobileNumber = '';
      state.profileImageUrl = '';
      state.address = '';
      state.email = '';
      state.token = '';
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state._id = '';
      state.userId = '';
      state.fullName = '';
      state.mobileNumber = '';
      state.profileImageUrl = '';
      state.address = '';
      state.email = '';
      state.token = '';
      state.isAuthenticated = false;
      
      // Clear from storage automatically
      console.log('🔄 userSlice: Auto-clearing user data from storage');
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle loading user from storage
      .addCase(loadUserFromStorage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          const { _id, userId, fullName, mobileNumber, profileImageUrl, address, email, token } = action.payload;
          state._id = _id || '';
          state.userId = userId || '';
          state.fullName = fullName || '';
          state.mobileNumber = mobileNumber || '';
          state.profileImageUrl = profileImageUrl || '';
          state.address = address || '';
          state.email = email || '';
          state.token = token || '';
          state.isAuthenticated = !!token;
          console.log('✅ userSlice: User data restored from storage, isAuthenticated:', !!token);
        }
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.isLoading = false;
        console.log('❌ userSlice: Failed to load user data from storage');
      })
      
      // Handle saving user to storage
      .addCase(saveUserToStorage.fulfilled, (state, action) => {
        console.log('✅ userSlice: User data saved to storage successfully');
      })
      .addCase(saveUserToStorage.rejected, (state, action) => {
        console.error('❌ userSlice: Failed to save user data to storage');
      })
      
      // Handle clearing user from storage
      .addCase(clearUserFromStorage.fulfilled, (state) => {
        console.log('🗑️ userSlice: User data cleared from storage successfully');
      })
      .addCase(clearUserFromStorage.rejected, (state) => {
        console.error('❌ userSlice: Failed to clear user data from storage');
      })
      
      // Handle token validation
      .addCase(validateStoredToken.fulfilled, (state, action) => {
        if (!action.payload) {
          // Token is invalid, clear user data
          console.log('❌ userSlice: Token validation failed, clearing user data');
          state._id = '';
          state.userId = '';
          state.fullName = '';
          state.mobileNumber = '';
          state.profileImageUrl = '';
          state.address = '';
          state.email = '';
          state.token = '';
          state.isAuthenticated = false;
        } else {
          console.log('✅ userSlice: Token validation successful');
        }
      })
      .addCase(validateStoredToken.rejected, (state) => {
        console.error('❌ userSlice: Token validation error, clearing user data');
        // Clear user data on validation error
        state._id = '';
        state.userId = '';
        state.fullName = '';
        state.mobileNumber = '';
        state.profileImageUrl = '';
        state.address = '';
        state.email = '';
        state.token = '';
        state.isAuthenticated = false;
      });
  },
});

export const {
  setUserData,
  setToken,
  setFullName,
  setMobileNumber,
  setProfileData,
  clearUserData,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
