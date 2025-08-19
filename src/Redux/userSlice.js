import { createSlice } from '@reduxjs/toolkit';

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
    },
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
