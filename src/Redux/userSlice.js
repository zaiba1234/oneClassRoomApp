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
        
        // Validate the stored data
        if (isStoredUserDataValid(parsedData)) {
          return parsedData;
        } else {
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
        return false;
      }
      
      
      // Here you could make an API call to validate the token
      // For now, we'll just check if the token exists and has basic structure
      const isValidToken = token.length > 10; // Basic validation
      
      if (isValidToken) {
        return true;
      } else {
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
  isNewUser: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const { _id, userId, fullName, mobileNumber, profileImageUrl, address, email, token, isNewUser } = action.payload;
      state._id = _id || '';
      state.userId = userId || '';
      state.fullName = fullName || '';
      state.mobileNumber = mobileNumber || '';
      state.profileImageUrl = profileImageUrl || '';
      state.address = address || '';
      state.email = email || '';
      state.token = token || '';
      state.isAuthenticated = !!token;
      state.isNewUser = isNewUser || false;
      
      // Save to storage automatically if we have a token
      if (token) {
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
      state.isNewUser = false;
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
      state.isNewUser = false;
      
      // Clear from storage automatically
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
          const { _id, userId, fullName, mobileNumber, profileImageUrl, address, email, token, isNewUser } = action.payload;
          state._id = _id || '';
          state.userId = userId || '';
          state.fullName = fullName || '';
          state.mobileNumber = mobileNumber || '';
          state.profileImageUrl = profileImageUrl || '';
          state.address = address || '';
          state.email = email || '';
          state.token = token || '';
          state.isAuthenticated = !!token;
          state.isNewUser = isNewUser || false;
        }
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.isLoading = false;
      })
      
      // Handle saving user to storage
      .addCase(saveUserToStorage.fulfilled, (state, action) => {
      })
      .addCase(saveUserToStorage.rejected, (state, action) => {
        console.error('❌ userSlice: Failed to save user data to storage');
      })
      
      // Handle clearing user from storage
      .addCase(clearUserFromStorage.fulfilled, (state) => {
      })
      .addCase(clearUserFromStorage.rejected, (state) => {
        console.error('❌ userSlice: Failed to clear user data from storage');
      })
      
      // Handle token validation
      .addCase(validateStoredToken.fulfilled, (state, action) => {
        if (!action.payload) {
          // Token is invalid, clear user data
          state._id = '';
          state.userId = '';
          state.fullName = '';
          state.mobileNumber = '';
          state.profileImageUrl = '';
          state.address = '';
          state.email = '';
          state.token = '';
          state.isAuthenticated = false;
          state.isNewUser = false;
        } else {
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
        state.isNewUser = false;
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