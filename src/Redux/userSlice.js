import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fullName: '',
  mobileNumber: '',
  token: '',
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserData: (state, action) => {
      const { fullName, mobileNumber, token } = action.payload;
      state.fullName = fullName || '';
      state.mobileNumber = mobileNumber || '';
      state.token = token || '';
      state.isAuthenticated = !!token;
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
    clearUserData: (state) => {
      state.fullName = '';
      state.mobileNumber = '';
      state.token = '';
      state.isAuthenticated = false;
    },
    logout: (state) => {
      state.fullName = '';
      state.mobileNumber = '';
      state.token = '';
      state.isAuthenticated = false;
    },
  },
});

export const {
  setUserData,
  setToken,
  setFullName,
  setMobileNumber,
  clearUserData,
  logout,
} = userSlice.actions;

export default userSlice.reducer;
