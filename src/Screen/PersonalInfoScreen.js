import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  PermissionsAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import {  setProfileData } from '../Redux/userSlice';
import { profileAPI } from '../API/profileAPI';
import { getApiUrl, ENDPOINTS } from '../API/config';
import BackButton from '../Component/BackButton';

const PersonalInfoScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { fullName, mobileNumber, token, profileImageUrl, address, email } = useAppSelector((state) => state.user);
  const [name, setName] = useState(fullName || '');
  const [userAddress, setUserAddress] = useState(address || '');
  const [userEmail, setUserEmail] = useState(email || '');
  
  // Debug current state values
  console.log('🔍 [PersonalInfoScreen] Current state values:', {
    userEmail: userEmail,
    emailFromRedux: email,
    isEmailVerified: isEmailVerified,
    userEmailEmpty: userEmail === '',
    emailFromReduxEmpty: email === '',
    userEmailType: typeof userEmail,
    emailFromReduxType: typeof email
  });
  const [phone, setPhone] = useState(mobileNumber || '+91');
  const [profileImage, setProfileImage] = useState(profileImageUrl ? { uri: profileImageUrl } : require('../assests/images/Profile.png'));
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user profile data on component mount
  useEffect(() => {
    console.log('🚀 [PersonalInfoScreen] Component mounted, fetching user profile');
    fetchUserProfile();
  }, []);

  // Listen for focus events to refresh profile data when returning from Verify page
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 [PersonalInfoScreen] Screen focused, refreshing profile data');
      fetchUserProfile();
    });

    return unsubscribe;
  }, [navigation]);

  // Update local state when Redux state changes
  useEffect(() => {
    console.log('🔄 [PersonalInfoScreen] Redux state changed, updating local state:', {
      fullName: fullName !== undefined ? 'Present' : 'Undefined',
      mobileNumber: mobileNumber !== undefined ? 'Present' : 'Undefined',
      address: address !== undefined ? 'Present' : 'Undefined',
      email: email !== undefined ? 'Present' : 'Undefined',
      profileImageUrl: profileImageUrl ? 'Present' : 'Not present'
    });

    if (fullName !== undefined) {
      console.log('🔄 [PersonalInfoScreen] Updating name from Redux:', fullName);
      setName(fullName);
    }
    if (mobileNumber !== undefined) {
      console.log('🔄 [PersonalInfoScreen] Updating phone from Redux:', mobileNumber);
      setPhone(mobileNumber);
    }
    if (address !== undefined) {
      console.log('🔄 [PersonalInfoScreen] Updating address from Redux:', address);
      setUserAddress(address);
    }
    if (email !== undefined) {
      console.log('🔄 [PersonalInfoScreen] Updating email from Redux:', {
        email: email,
        isEmpty: email === '',
        isEmailVerified: isEmailVerified,
        emailType: typeof email
      });
      // Always update email from Redux, regardless of verification status
      setUserEmail(email);
      console.log('🔄 [PersonalInfoScreen] Email updated from Redux:', email);
    }
    if (profileImageUrl) {
      console.log('🔄 [PersonalInfoScreen] Updating profile image from Redux:', profileImageUrl);
      setProfileImage({ uri: profileImageUrl });
    }
  }, [fullName, mobileNumber, address, email, profileImageUrl]);

  const testBasicConnectivity = async () => {
    try {
      // Test with a simple GET request first
      const baseUrl = getApiUrl('').replace('/api/user/profile/get-profile', '');

      const response = await fetch(baseUrl, {
        method: 'GET',
      });

      return true;
    } catch (error) {
      return false;
    }
  };

const fetchUserProfile = async (isRefresh = false) => {
  console.log('🚀 [PersonalInfoScreen] fetchUserProfile called', {
    isRefresh,
    hasToken: !!token,
    timestamp: new Date().toISOString()
  });

  if (!token) {
    console.log('❌ [PersonalInfoScreen] No token available for getUserProfile');
    setIsLoadingProfile(false);
    setRefreshing(false);
    return;
  }

  try {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoadingProfile(true);
    }
    
    // Enhanced request logging
    console.log('📱 [PersonalInfoScreen] getUserProfile Request Details:', {
      url: 'profileAPI.getUserProfile',
      endpoint: '/api/user/profile/get-profile',
      token: token ? `${token.substring(0, 10)}...` : 'Missing',
      isRefresh: isRefresh,
      timestamp: new Date().toISOString()
    });
    
    const result = await profileAPI.getUserProfile(token);
    
    // DETAILED API RESPONSE DEBUG FOR DEBUGGER
    console.log('🔥🔥🔥 GET USER PROFILE API RESPONSE DEBUG 🔥🔥🔥');
    console.log('🔥 API Name: getUserProfile');
    console.log('🔥 Endpoint: /api/user/profile/get-profile');
    console.log('🔥 Full API Response:', JSON.stringify(result, null, 2));
    console.log('🔥 Response Success:', result.success);
    console.log('🔥 Response Status:', result.status);
    console.log('🔥 Response Data:', result.data);
    console.log('🔥 Response Data Success:', result.data?.success);
    console.log('🔥 Response Data Keys:', result.data ? Object.keys(result.data) : 'No data');
    console.log('🔥 Response Data Message:', result.data?.message);
    console.log('🔥 Response Data Data:', result.data?.data);
    console.log('🔥 Response Data Data Keys:', result.data?.data ? Object.keys(result.data.data) : 'No data');
    if (result.data?.data) {
      console.log('🔥 Profile Data Details:');
      console.log('🔥 - fullName:', result.data.data.fullName);
      console.log('🔥 - mobileNumber:', result.data.data.mobileNumber);
      console.log('🔥 - email:', result.data.data.email);
      console.log('🔥 - address:', result.data.data.address);
      console.log('🔥 - isEmailVerified:', result.data.data.isEmailVerified);
      console.log('🔥 - profileImageUrl:', result.data.data.profileImageUrl);
    }
    console.log('🔥🔥🔥 END GET USER PROFILE DEBUG 🔥🔥🔥');

    if (result.success && result.data.success) {
      const profileData = result.data.data;
      console.log('📱 [PersonalInfoScreen] Profile Data Received:', {
        fullName: profileData.fullName,
        mobileNumber: profileData.mobileNumber,
        email: profileData.email,
        address: profileData.address,
        isEmailVerified: profileData.isEmailVerified,
        hasProfileImage: !!profileData.profileImageUrl,
        profileImageUrl: profileData.profileImageUrl ? 'Present' : 'Not present',
        fullData: JSON.stringify(profileData, null, 2)
      });

      // Update Redux store with fetched data
      console.log('🔄 [PersonalInfoScreen] Updating Redux store with profile data');
      
      // Ensure email is included in Redux store even if it's undefined from API
      const profileDataForRedux = {
        ...profileData,
        email: profileData.email || userEmail || '', // Keep current email if API doesn't provide it
        address: profileData.address || userAddress || '', // Keep current address if API doesn't provide it
        mobileNumber: profileData.mobileNumber || phone || '', // Ensure mobile number is included
        fullName: profileData.fullName || name || '' // Ensure full name is included
      };
      
      console.log('🔄 [PersonalInfoScreen] Profile data for Redux (before dispatch):', {
        email: profileDataForRedux.email,
        address: profileDataForRedux.address,
        isEmailVerified: profileDataForRedux.isEmailVerified,
        fullData: profileDataForRedux
      });
      
      console.log('🔄 [PersonalInfoScreen] Profile data for Redux:', profileDataForRedux);
      dispatch(setProfileData(profileDataForRedux));

      // Update local state
      console.log('🔄 [PersonalInfoScreen] Updating local state variables');
      setName(profileData.fullName || '');
      setPhone(profileData.mobileNumber || '+91');
      setUserAddress(profileData.address || '');
      
      // Handle email field - if email is undefined but isEmailVerified is true, 
      // it means email was verified but not stored in profile, so we keep the current email
      if (profileData.email !== undefined && profileData.email !== null && profileData.email !== '') {
        console.log('🔄 [PersonalInfoScreen] Setting email from API:', profileData.email);
        setUserEmail(profileData.email);
      } else if (profileData.isEmailVerified) {
        console.log('⚠️ [PersonalInfoScreen] Email verified but not in profile data, keeping current email field');
        // If email is verified but not in profile data, keep current email or show placeholder
        if (userEmail && userEmail.trim() !== '') {
          console.log('🔄 [PersonalInfoScreen] Keeping existing email:', userEmail);
          // Keep the existing email if it exists
        } else {
          console.log('🔄 [PersonalInfoScreen] No existing email, showing placeholder');
          setUserEmail(''); // Show placeholder
        }
      } else {
        console.log('🔄 [PersonalInfoScreen] Email not verified, clearing email field');
        setUserEmail('');
      }
      
      setIsEmailVerified(profileData.isEmailVerified || false);
      
      if (profileData.profileImageUrl) {
        console.log('🖼️ [PersonalInfoScreen] Setting profile image:', profileData.profileImageUrl);
        setProfileImage({ uri: profileData.profileImageUrl });
      }
      
      console.log('✅ [PersonalInfoScreen] Profile data updated successfully in Redux and local state');
    } else {
      console.log('❌ [PersonalInfoScreen] getUserProfile failed:', {
        resultSuccess: result.success,
        dataSuccess: result.data?.success,
        errorMessage: result.data?.message,
        status: result.status,
        fullResult: JSON.stringify(result, null, 2)
      });
      Alert.alert('Error', 'Failed to load profile data');
    }
  } catch (error) {
    console.log('❌ [PersonalInfoScreen] getUserProfile Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    Alert.alert('Error', 'Failed to load profile data');
  } finally {
    console.log('🏁 [PersonalInfoScreen] fetchUserProfile completed, setting loading states to false');
    setIsLoadingProfile(false);
    setRefreshing(false);
  }
};

const testNetworkConnectivity = async () => {
  console.log('🌐 [PersonalInfoScreen] Starting network connectivity test');
  
  try {
    const testUrl = getApiUrl('/api/user/profile/get-profile');
    console.log('🌐 [PersonalInfoScreen] Testing network connectivity with URL:', {
      url: testUrl,
      method: 'GET',
      hasToken: !!token,
      timestamp: new Date().toISOString()
    });

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('🌐 [PersonalInfoScreen] Network test response received:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      timestamp: new Date().toISOString()
    });
    
    const isOk = response.ok;
    console.log(isOk ? '✅ [PersonalInfoScreen] Network connectivity test PASSED' : '❌ [PersonalInfoScreen] Network connectivity test FAILED');
    return isOk;
  } catch (error) {
    console.log('❌ [PersonalInfoScreen] Network test error occurred:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return false;
  }
};

const handleEmailVerification = async () => {
  console.log('📧 [PersonalInfoScreen] handleEmailVerification called', {
    isEmailVerified,
    userEmail,
    hasToken: !!token,
    timestamp: new Date().toISOString()
  });

  if (isEmailVerified) {
    console.log('ℹ️ [PersonalInfoScreen] Email already verified, skipping verification');
    Alert.alert('Already Verified', 'Your email is already verified');
    return;
  }

  if (!userEmail || !userEmail.trim()) {
    console.log('❌ [PersonalInfoScreen] No email provided for verification');
    Alert.alert('Error', 'Please enter an email address first');
    return;
  }

  if (!userEmail.includes('@') || !userEmail.includes('.')) {
    console.log('❌ [PersonalInfoScreen] Invalid email format:', {
      email: userEmail,
      hasAt: userEmail.includes('@'),
      hasDot: userEmail.includes('.')
    });
    Alert.alert('Error', 'Please enter a valid email address');
    return;
  }

  if (!token) {
    console.log('❌ [PersonalInfoScreen] No token available for email verification');
    Alert.alert('Error', 'Please login to verify email');
    return;
  }

  try {
    console.log('🔄 [PersonalInfoScreen] Setting loading state to true');
    setIsLoading(true);
    
    // Call send-emailotp API first
    console.log('📧 [PersonalInfoScreen] Sending email OTP request for:', userEmail.trim());
    const response = await fetch(getApiUrl('/api/auth/send-emailotp'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: userEmail.trim()
      })
    });

    console.log('📧 [PersonalInfoScreen] Email OTP Response Status:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ [PersonalInfoScreen] Email OTP Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    // DETAILED API RESPONSE DEBUG FOR EMAIL OTP
    console.log('🔥🔥🔥 EMAIL OTP API RESPONSE DEBUG 🔥🔥🔥');
    console.log('🔥 API Name: send-emailotp');
    console.log('🔥 Endpoint: /api/auth/send-emailotp');
    console.log('🔥 Full API Response:', JSON.stringify(result, null, 2));
    console.log('🔥 Response Success:', result.success);
    console.log('🔥 Response Status:', response.status);
    console.log('🔥 Response Data:', result.data);
    console.log('🔥 Response Message:', result.message);
    console.log('🔥 Response Keys:', Object.keys(result));
    console.log('🔥🔥🔥 END EMAIL OTP DEBUG 🔥🔥🔥');

    if (result.success) {
      console.log('✅ [PersonalInfoScreen] Email OTP sent successfully, navigating to Verify page');
      // Directly navigate to verification screen
      navigation.navigate('Verify', {
        email: userEmail.trim(),
        isEmailVerification: true,
        token: token
      });
    } else {
      console.log('❌ [PersonalInfoScreen] Email OTP failed:', result);
      Alert.alert('Error', result.message || 'Failed to send OTP');
    }
  } catch (error) {
    console.log('❌ [PersonalInfoScreen] Email OTP Error:', error);
    Alert.alert('Error', 'Failed to send OTP. Please try again.');
  } finally {
    console.log('🏁 [PersonalInfoScreen] Email verification process completed, setting loading to false');
    setIsLoading(false);
  }
};

const handleSaveProfile = async () => {
  console.log('💾 [PersonalInfoScreen] handleSaveProfile called', {
    hasToken: !!token,
    userAddress,
    userEmail,
    profileImageType: profileImage?.uri ? 'URI' : 'Default',
    timestamp: new Date().toISOString()
  });

  if (!token) {
    console.log('❌ [PersonalInfoScreen] No token available for profile update');
    Alert.alert('Error', 'Please login to save profile');
    return;
  }

  try {
    console.log('🔄 [PersonalInfoScreen] Setting loading state to true');
    setIsLoading(true);

    // Test network connectivity first
    console.log('🌐 [PersonalInfoScreen] Testing network connectivity before profile update...');
    const isNetworkWorking = await testNetworkConnectivity();
    if (!isNetworkWorking) {
      console.log('❌ [PersonalInfoScreen] Network connectivity test failed, aborting profile update');
      Alert.alert('Network Error', 'Unable to connect to server. Please check your internet connection.');
      setIsLoading(false);
      return;
    }
    console.log('✅ [PersonalInfoScreen] Network connectivity test passed, proceeding with profile update');

    const profileData = {
      profileImageUrl: profileImage,
      address: userAddress,
      email: userEmail,
    };

    // Enhanced request logging
    const requestData = {
      url: 'profileAPI.updateUserProfile',
      endpoint: '/api/user/profile/update-profile',
      token: token ? `${token.substring(0, 10)}...` : 'Missing',
      profileData: {
        address: profileData.address,
        email: profileData.email,
        hasProfileImage: !!profileData.profileImageUrl,
        profileImageType: profileData.profileImageUrl?.uri ? 'URI' : 'Default'
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('💾 [PersonalInfoScreen] Profile Update Request Details:', JSON.stringify(requestData, null, 2));
    
    console.log('💾 [PersonalInfoScreen] Updating profile with data:', {
      address: profileData.address,
      email: profileData.email,
      profileImageUrl: profileData.profileImageUrl?.uri ? 'Present' : 'Not present',
      fullData: JSON.stringify(profileData, null, 2)
    });
    
    const result = await profileAPI.updateUserProfile(token, profileData);
    
    // DETAILED API RESPONSE DEBUG FOR UPDATE PROFILE
    console.log('🔥🔥🔥 UPDATE USER PROFILE API RESPONSE DEBUG 🔥🔥🔥');
    console.log('🔥 API Name: updateUserProfile');
    console.log('🔥 Endpoint: /api/user/profile/update-profile');
    console.log('🔥 Full API Response:', JSON.stringify(result, null, 2));
    console.log('🔥 Response Success:', result.success);
    console.log('🔥 Response Status:', result.status);
    console.log('🔥 Response Data:', result.data);
    console.log('🔥 Response Data Success:', result.data?.success);
    console.log('🔥 Response Data Keys:', result.data ? Object.keys(result.data) : 'No data');
    console.log('🔥 Response Data Message:', result.data?.message);
    console.log('🔥 Response Data Data:', result.data?.data);
    console.log('🔥 Response Data Data Keys:', result.data?.data ? Object.keys(result.data.data) : 'No data');
    if (result.data?.data) {
      console.log('🔥 Updated Profile Data Details:');
      console.log('🔥 - fullName:', result.data.data.fullName);
      console.log('🔥 - mobileNumber:', result.data.data.mobileNumber);
      console.log('🔥 - email:', result.data.data.email);
      console.log('🔥 - address:', result.data.data.address);
      console.log('🔥 - isEmailVerified:', result.data.data.isEmailVerified);
      console.log('🔥 - profileImageUrl:', result.data.data.profileImageUrl);
    }
    console.log('🔥🔥🔥 END UPDATE USER PROFILE DEBUG 🔥🔥🔥');

    if (result.success && result.data.success) {
      console.log('✅ [PersonalInfoScreen] Profile updated successfully');
      
      // Update Redux store with new data
      console.log('🔄 [PersonalInfoScreen] Updating Redux store with updated profile data');
      dispatch(setProfileData({
        ...result.data.data,
        fullName: name,
        mobileNumber: phone,
      }));

      console.log('✅ [PersonalInfoScreen] Profile update completed successfully');
      Alert.alert('Success', 'Profile updated successfully');
    } else {
      console.log('❌ [PersonalInfoScreen] Profile update failed, attempting fallback without image...');
      
      // Try updating without image if the full update failed
      if (profileData.profileImageUrl && profileData.profileImageUrl.uri) {
        const fallbackProfileData = {
          address: userAddress,
          email: userEmail,
        };

        console.log('💾 [PersonalInfoScreen] Fallback update with data (without image):', {
          address: fallbackProfileData.address,
          email: fallbackProfileData.email,
          fullData: JSON.stringify(fallbackProfileData, null, 2)
        });
        
        const fallbackResult = await profileAPI.updateUserProfile(token, fallbackProfileData);
        
        // DETAILED API RESPONSE DEBUG FOR FALLBACK UPDATE PROFILE
        console.log('🔥🔥🔥 FALLBACK UPDATE USER PROFILE API RESPONSE DEBUG 🔥🔥🔥');
        console.log('🔥 API Name: updateUserProfile (Fallback)');
        console.log('🔥 Endpoint: /api/user/profile/update-profile');
        console.log('🔥 Full API Response:', JSON.stringify(fallbackResult, null, 2));
        console.log('🔥 Response Success:', fallbackResult.success);
        console.log('🔥 Response Status:', fallbackResult.status);
        console.log('🔥 Response Data:', fallbackResult.data);
        console.log('🔥 Response Data Success:', fallbackResult.data?.success);
        console.log('🔥 Response Data Keys:', fallbackResult.data ? Object.keys(fallbackResult.data) : 'No data');
        console.log('🔥 Response Data Message:', fallbackResult.data?.message);
        console.log('🔥 Response Data Data:', fallbackResult.data?.data);
        console.log('🔥 Response Data Data Keys:', fallbackResult.data?.data ? Object.keys(fallbackResult.data.data) : 'No data');
        if (fallbackResult.data?.data) {
          console.log('🔥 Fallback Updated Profile Data Details:');
          console.log('🔥 - fullName:', fallbackResult.data.data.fullName);
          console.log('🔥 - mobileNumber:', fallbackResult.data.data.mobileNumber);
          console.log('🔥 - email:', fallbackResult.data.data.email);
          console.log('🔥 - address:', fallbackResult.data.data.address);
          console.log('🔥 - isEmailVerified:', fallbackResult.data.data.isEmailVerified);
          console.log('🔥 - profileImageUrl:', fallbackResult.data.data.profileImageUrl);
        }
        console.log('🔥🔥🔥 END FALLBACK UPDATE USER PROFILE DEBUG 🔥🔥🔥');

        if (fallbackResult.success && fallbackResult.data.success) {
          console.log('✅ [PersonalInfoScreen] Fallback profile update successful (image update failed)');
          
          // Update Redux store with new data
          console.log('🔄 [PersonalInfoScreen] Updating Redux store with fallback profile data');
          dispatch(setProfileData({
            ...fallbackResult.data.data,
            fullName: name,
            mobileNumber: phone,
          }));

          console.log('✅ [PersonalInfoScreen] Fallback profile update completed');
          Alert.alert('Success', 'Profile updated successfully (image update failed)');
        } else {
          console.log('❌ [PersonalInfoScreen] Fallback profile update failed:', {
            success: fallbackResult.success,
            dataSuccess: fallbackResult.data?.success,
            message: fallbackResult.data?.message,
            fullResult: JSON.stringify(fallbackResult, null, 2)
          });
          Alert.alert('Error', fallbackResult.data?.message || 'Failed to update profile');
        }
      } else {
        console.log('❌ [PersonalInfoScreen] Profile update failed (no image to fallback):', {
          success: result.success,
          dataSuccess: result.data?.success,
          message: result.data?.message,
          fullResult: JSON.stringify(result, null, 2)
        });
        Alert.alert('Error', result.data?.message || 'Failed to update profile');
      }
    }
  } catch (error) {
    console.log('❌ [PersonalInfoScreen] Profile Update Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    Alert.alert('Error', `Failed to update profile: ${error.message}`);
  } finally {
    console.log('🏁 [PersonalInfoScreen] Profile update process completed, setting loading to false');
    setIsLoading(false);
  }
};





  const showImagePickerOptions = () => {
    console.log('📷 [PersonalInfoScreen] showImagePickerOptions called');
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => {
            console.log('📷 [PersonalInfoScreen] User selected Camera option');
            openCamera();
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            console.log('📷 [PersonalInfoScreen] User selected Gallery option');
            openGallery();
          },
        },
        {
          text: 'Cancel',
          onPress: () => {
            console.log('📷 [PersonalInfoScreen] User cancelled image picker');
          },
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to take photos for your profile picture.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS handles permissions automatically
  };

  const openCamera = async () => {
    console.log('📷 [PersonalInfoScreen] openCamera called');
    
    // Check camera permission first
    console.log('📷 [PersonalInfoScreen] Checking camera permission...');
    const hasPermission = await requestCameraPermission();
    
    if (!hasPermission) {
      console.log('❌ [PersonalInfoScreen] Camera permission denied');
      Alert.alert(
        'Camera Permission Required',
        'You need to grant camera permission to take photos. Please go to your device settings and allow camera access for this app.',
        [
          {
            text: 'OK',
            style: 'default'
          }
        ]
      );
      return;
    }

    console.log('✅ [PersonalInfoScreen] Camera permission granted, launching camera');

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      // Use Android Photo Picker for better privacy compliance
      selectionLimit: 1,
    };

    console.log('📷 [PersonalInfoScreen] Camera options:', options);

    launchCamera(options, (response) => {
      console.log('📷 [PersonalInfoScreen] Camera response received:', {
        didCancel: response.didCancel,
        hasError: !!response.error,
        hasAssets: !!(response.assets && response.assets.length > 0),
        assetsCount: response.assets ? response.assets.length : 0
      });

      if (response.didCancel) {
        console.log('📷 [PersonalInfoScreen] User cancelled camera');
      } else if (response.error) {
        console.log('❌ [PersonalInfoScreen] Camera Error:', {
          code: response.error.code,
          message: response.error.message,
          fullError: response.error
        });
        
        if (response.error.code === 'camera_unavailable') {
          console.log('❌ [PersonalInfoScreen] Camera unavailable error');
          Alert.alert(
            'Camera Permission Required',
            'Camera access is not available. Please check if you have granted camera permission in your device settings.',
            [
              {
                text: 'OK',
                style: 'default'
              }
            ]
          );
        } else {
          console.log('❌ [PersonalInfoScreen] Generic camera error');
          Alert.alert('Camera Error', 'Failed to open camera. Please try again.');
        }
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        console.log('✅ [PersonalInfoScreen] Image captured successfully:', {
          uri: imageUri,
          fileName: response.assets[0].fileName,
          fileSize: response.assets[0].fileSize,
          type: response.assets[0].type
        });
        setProfileImage({ uri: imageUri });
      }
    });
  };

  const openGallery = () => {
    console.log('🖼️ [PersonalInfoScreen] openGallery called');
    
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
      // Use Android Photo Picker for better privacy compliance
      selectionLimit: 1,
    };

    console.log('🖼️ [PersonalInfoScreen] Gallery options:', options);

    launchImageLibrary(options, (response) => {
      console.log('🖼️ [PersonalInfoScreen] Gallery response received:', {
        didCancel: response.didCancel,
        hasError: !!response.error,
        hasAssets: !!(response.assets && response.assets.length > 0),
        assetsCount: response.assets ? response.assets.length : 0
      });

      if (response.didCancel) {
        console.log('🖼️ [PersonalInfoScreen] User cancelled image picker');
      } else if (response.error) {
        console.log('❌ [PersonalInfoScreen] ImagePicker Error:', {
          code: response.error.code,
          message: response.error.message,
          fullError: response.error
        });
        Alert.alert('Gallery Error', 'Failed to select image. Please try again.');
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        console.log('✅ [PersonalInfoScreen] Image selected successfully:', {
          uri: imageUri,
          fileName: response.assets[0].fileName,
          fileSize: response.assets[0].fileSize,
          type: response.assets[0].type
        });
        setProfileImage({ uri: imageUri });
      }
    });
  };

  const onRefresh = () => {
    console.log('🔄 [PersonalInfoScreen] onRefresh called - pulling to refresh');
    fetchUserProfile(true);
  };

  if (isLoadingProfile) {
    console.log('⏳ [PersonalInfoScreen] Rendering loading state');
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <BackButton onPress={() => {
            console.log('🔙 [PersonalInfoScreen] Back button pressed from loading state');
            navigation.goBack();
          }} />
          <Text style={styles.headerTitle}>Personal Info</Text>
         
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('🎨 [PersonalInfoScreen] Rendering main component', {
    isLoading,
    isLoadingProfile,
    refreshing,
    isEmailVerified,
    hasProfileImage: !!profileImage?.uri,
    userEmail: userEmail || 'EMPTY',
    userAddress: userAddress || 'EMPTY',
    emailFromRedux: email || 'EMPTY'
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => {
          console.log('🔙 [PersonalInfoScreen] Back button pressed from main view');
          navigation.goBack();
        }} />
        <Text style={styles.headerTitle}>Personal Info</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FF8800', '#FFB800']}
            tintColor="#FF8800"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Image */}
        <View style={styles.profileImageContainer}>
          <Image
            source={profileImage}
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.editIconContainer}
            onPress={() => {
              console.log('📷 [PersonalInfoScreen] Profile image edit button pressed', {
                currentImageType: profileImage?.uri ? 'URI' : 'Default',
                currentImageUri: profileImage?.uri
              });
              showImagePickerOptions();
            }}
          >
            <LinearGradient
              colors={['#FF8800', '#FFB800']}
              style={styles.editIconCircle}
            >
              <Image
                source={require('../assests/images/CameraIcon.png')}
                style={styles.cameraIcon}
                resizeMode="contain"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <View style={[styles.inputContainer, styles.disabledInputContainer]}>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={name}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>

          {/* Address */}
          <Text style={styles.label}>Address</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={userAddress}
              onChangeText={setUserAddress}
            />
            <TouchableOpacity style={styles.editIconBtn}>
              <Icon name="create-outline" size={20} color="#00AEEF" />
            </TouchableOpacity>
          </View>

          {/* E-mail */}
          <Text style={styles.label}>E-mail</Text>
          <View style={[
            styles.inputContainer,
            isEmailVerified && styles.disabledInputContainer
          ]}>
            <TextInput
              style={[
                styles.input,
                isEmailVerified && styles.disabledInput
              ]}
              value={userEmail || ''}
              onChangeText={isEmailVerified ? null : setUserEmail}
              keyboardType="email-address"
              editable={!isEmailVerified}
              selectTextOnFocus={!isEmailVerified}
              placeholder="Enter your email"
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={[
                styles.verifyBtn, 
                isEmailVerified && styles.verifyBtnDisabled
              ]} 
              onPress={isEmailVerified ? null : () => {
                console.log('📧 [PersonalInfoScreen] Email verify button pressed', {
                  isEmailVerified,
                  userEmail,
                  hasToken: !!token
                });
                handleEmailVerification();
              }}
              disabled={isEmailVerified}
            >
              <Text style={[
                styles.verifyBtnText,
                isEmailVerified && styles.verifyBtnTextDisabled
              ]}>
                {isEmailVerified ? 'Verified' : 'Verify'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Phone Number</Text>
          <View style={[styles.inputContainer, styles.disabledInputContainer]}>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={phone}
              editable={false}
              selectTextOnFocus={false}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]}
          onPress={() => {
            console.log('💾 [PersonalInfoScreen] Save button pressed', {
              isLoading,
              userAddress,
              userEmail,
              hasProfileImage: !!profileImage?.uri
            });
            handleSaveProfile();
          }}
          disabled={isLoading}
        >
          <LinearGradient
            colors={['#FFB800','#FF8800' ]}
            style={styles.saveBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.saveBtnText}>
              {isLoading ? 'Saving...' : 'Save Details'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>App version 1.0.0.1</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PersonalInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  header: {
    marginTop: 30,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 10,
   
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },

  
  profileImageContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: '#F6B800',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  editIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    width: 16,
    height: 16,
    tintColor: '#fff',
  },
  form: {
    width: '88%',
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
    marginTop: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#222',
  },
  editIconBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineEditBtn: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineEditIcon: {
    width: 16,
    height: 16,
    tintColor: '#00AEEF',
  },
  verifyBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#00AEEF',
    borderRadius: 6,
    marginRight: 8,
  },

  verifyBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  inlineEditText: {
    color: '#00AEEF',
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    width: '88%',
    alignSelf: 'center',
    marginTop: 24,
    borderRadius: 10,
    overflow: 'hidden',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnGradient: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  versionText: {
    color: '#B0B0B0',
    fontSize: 12,
    alignSelf: 'center',
    marginTop: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  testBtn: {
    width: '88%',
    alignSelf: 'center',
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#00AEEF',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  disabledInputContainer: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  disabledInput: {
    color: '#999',
    backgroundColor: 'transparent',
  },
  verifyBtnDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  verifyBtnTextDisabled: {
    color: '#666',
  },
});