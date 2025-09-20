import { setUserData, setToken, setFullName, setMobileNumber, clearUserData, logout } from './userSlice';

// Helper function to store user data after successful login/registration
export const storeUserData = (userData) => {
  return setUserData({
    fullName: userData.fullName || '',
    mobileNumber: userData.mobileNumber || '',
    token: userData.token || '',
  });
};

// Helper function to store token after OTP verification
export const storeToken = (token) => {
  return setToken(token);
};

// Helper function to store full name
export const storeFullName = (fullName) => {
  return setFullName(fullName);
};

// Helper function to store mobile number
export const storeMobileNumber = (mobileNumber) => {
  return setMobileNumber(mobileNumber);
};

// Helper function to clear all user data (logout)
export const clearUser = () => {
  return clearUserData();
};

// Helper function to logout user
export const logoutUser = () => {
  return logout();
};