import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import { setFullName, setMobileNumber, setProfileData } from '../Redux/userSlice';
import { profileAPI } from '../API/profileAPI';
import { getApiUrl, ENDPOINTS } from '../API/config';
import BackButton from '../Component/BackButton';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const PersonalInfoScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { fullName, mobileNumber, token, profileImageUrl, address, email } = useAppSelector((state) => state.user);

  console.log('🔄 PersonalInfoScreen: Initial Redux state:', { fullName, mobileNumber, token, profileImageUrl, address, email });

  const [name, setName] = useState(fullName || '');
  const [userAddress, setUserAddress] = useState(address || '');
  const [userEmail, setUserEmail] = useState(email || '');
  const [phone, setPhone] = useState(mobileNumber || '+91');
  const [profileImage, setProfileImage] = useState(profileImageUrl ? { uri: profileImageUrl } : require('../assests/images/Profile.png'));
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  // Custom Modal State
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'success', 'error', 'warning', 'loading'
    buttons: [],
    showSpinner: false
  });

  console.log('🔄 PersonalInfoScreen: Initial local state:', { name, userAddress, userEmail, phone });

  // Custom Modal Component
  const CustomAlert = () => (
    <Modal
      visible={customAlert.visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setCustomAlert(prev => ({ ...prev, visible: false }))}
    >
      <View style={styles.alertOverlay}>
        <View style={styles.alertContainer}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setCustomAlert(prev => ({ ...prev, visible: false }))}
          >
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          
          <View style={[styles.alertIcon, { backgroundColor: getAlertColor(customAlert.type) }]}>
            {customAlert.showSpinner ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <Text style={styles.alertIconText}>
                {getAlertIcon(customAlert.type)}
              </Text>
            )}
          </View>
          <Text style={styles.alertTitle}>{customAlert.title}</Text>
          <Text style={styles.alertMessage}>{customAlert.message}</Text>
          <View style={styles.alertButtons}>
            {customAlert.buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.alertButton,
                  button.style === 'primary' && styles.alertButtonPrimary,
                  button.style === 'secondary' && styles.alertButtonSecondary,
                  button.style === 'danger' && styles.alertButtonDanger
                ]}
                onPress={() => {
                  setCustomAlert(prev => ({ ...prev, visible: false }));
                  if (button.onPress) {
                    try {
                      button.onPress();
                    } catch (error) {
                      showCustomAlert(
                        'Error',
                        'An error occurred while handling the alert button.',
                        'error',
                        [{ text: 'OK', style: 'primary' }]
                      );
                    }
                  }
                }}
              >
                <Text style={[
                  styles.alertButtonText,
                  button.style === 'primary' && styles.alertButtonTextPrimary,
                  button.style === 'secondary' && styles.alertButtonTextSecondary,
                  button.style === 'danger' && styles.alertButtonTextDanger
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  // Helper functions for custom alert
  const getAlertColor = (type) => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      case 'loading': return '#2196F3';
      default: return '#2196F3';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      case 'loading': return '⏳';
      default: return 'ℹ';
    }
  };

  // Safe alert function
  const showCustomAlert = useCallback((title, message, type = 'info', buttons = [], showSpinner = false) => {
    try {
      setCustomAlert({
        visible: true,
        title: title || 'Alert',
        message: message || '',
        type,
        buttons: buttons.length > 0 ? buttons : [{ text: 'OK', style: 'primary' }],
        showSpinner
      });
    } catch (error) {
      console.error('Error showing custom alert:', error);
    }
  }, []);

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Update local state when Redux state changes
  useEffect(() => {
    console.log('🔄 PersonalInfoScreen: Redux state changed:');
    console.log('🔄 PersonalInfoScreen: fullName:', fullName);
    console.log('🔄 PersonalInfoScreen: mobileNumber:', mobileNumber);
    console.log('🔄 PersonalInfoScreen: address:', address);
    console.log('🔄 PersonalInfoScreen: email:', email);
    console.log('🔄 PersonalInfoScreen: profileImageUrl:', profileImageUrl);
    
    if (fullName !== undefined) {
      console.log('📝 PersonalInfoScreen: Setting name from Redux:', fullName);
      setName(fullName);
    }
    if (mobileNumber !== undefined) {
      console.log('📱 PersonalInfoScreen: Setting phone from Redux:', mobileNumber);
      setPhone(mobileNumber);
    }
    if (address !== undefined) {
      console.log('🏠 PersonalInfoScreen: Setting address from Redux:', address);
      setUserAddress(address);
    }
    if (email !== undefined) {
      console.log('📧 PersonalInfoScreen: Updating email from Redux:', email);
      console.log('📧 PersonalInfoScreen: Current userEmail state:', userEmail);
      setUserEmail(email);
      console.log('📧 PersonalInfoScreen: Email state updated to:', email);
    }
    if (profileImageUrl) {
      console.log('🖼️ PersonalInfoScreen: Setting profile image from Redux:', profileImageUrl);
      setProfileImage({ uri: profileImageUrl });
    }
  }, [fullName, mobileNumber, address, email, profileImageUrl]);

  const fetchUserProfile = async () => {
    if (!token) {
      console.log('❌ PersonalInfoScreen: No token available for profile fetch');
      setIsLoadingProfile(false);
      showCustomAlert(
        'Authentication Required',
        'Please login to view your profile information.',
        'warning',
        [
          { text: 'OK', style: 'primary' },
          { 
            text: 'Go to Login', 
            style: 'secondary',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      return;
    }

    try {
      setIsLoadingProfile(true);
      console.log('🔄 PersonalInfoScreen: Starting profile fetch...');
      console.log('🔄 PersonalInfoScreen: Using token:', token ? `${token.substring(0, 20)}...` : 'No token');
      
      const result = await profileAPI.getUserProfile(token);
      
      console.log('📡 PersonalInfoScreen: Profile API response received:');
      console.log('📡 PersonalInfoScreen: result.success:', result.success);
      console.log('📡 PersonalInfoScreen: result.status:', result.status);
      console.log('📡 PersonalInfoScreen: result.data:', result.data);
      console.log('📡 PersonalInfoScreen: result.data.success:', result.data?.success);
      console.log('📡 PersonalInfoScreen: result.data.data:', result.data?.data);

      if (result.success && result.data.success) {
        const profileData = result.data.data;
        console.log('✅ PersonalInfoScreen: Profile data fetched successfully:');
        console.log('✅ PersonalInfoScreen: profileData:', profileData);
        console.log('✅ PersonalInfoScreen: profileData.email:', profileData.email);
        console.log('✅ PersonalInfoScreen: profileData.fullName:', profileData.fullName);
        console.log('✅ PersonalInfoScreen: profileData.address:', profileData.address);
        console.log('✅ PersonalInfoScreen: profileData.mobileNumber:', profileData.mobileNumber);

        // Update Redux store with fetched data
        console.log('🔄 PersonalInfoScreen: Updating Redux store with profile data...');
        dispatch(setProfileData(profileData));

        // Update local state
        console.log('🔄 PersonalInfoScreen: Updating local state...');
        setName(profileData.fullName || '');
        setPhone(profileData.mobileNumber || '+91');
        setUserAddress(profileData.address || '');
        setUserEmail(profileData.email || '');
        console.log('📧 PersonalInfoScreen: Set userEmail to:', profileData.email || '');
        
        if (profileData.profileImageUrl) {
          setProfileImage({ uri: profileData.profileImageUrl });
          console.log('🖼️ PersonalInfoScreen: Set profile image to:', profileData.profileImageUrl);
        }
      } else {
        console.log('❌ PersonalInfoScreen: Failed to fetch profile:');
        console.log('❌ PersonalInfoScreen: result.success:', result.success);
        console.log('❌ PersonalInfoScreen: result.data.success:', result.data?.success);
        console.log('❌ PersonalInfoScreen: Error message:', result.data?.message);
        console.log('❌ PersonalInfoScreen: Full result:', result);
        
        showCustomAlert(
          'Profile Load Error',
          result.data?.message || 'Failed to load your profile data. Please try again.',
          'error',
          [
            { text: 'Retry', style: 'primary', onPress: () => fetchUserProfile() },
            { text: 'Cancel', style: 'secondary' }
          ]
        );
      }
    } catch (error) {
      console.error('💥 PersonalInfoScreen: Error fetching profile:', error);
      console.error('💥 PersonalInfoScreen: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Determine error type and show appropriate message
      let errorTitle = 'Network Error';
      let errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      
      if (error.message.includes('timeout')) {
        errorTitle = 'Request Timeout';
        errorMessage = 'The request took too long to complete. Please check your internet connection and try again.';
      } else if (error.message.includes('Network request failed')) {
        errorTitle = 'Connection Failed';
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.message.includes('JSON')) {
        errorTitle = 'Data Error';
        errorMessage = 'Received invalid data from the server. Please try again.';
      }
      
      showCustomAlert(
        errorTitle,
        errorMessage,
        'error',
        [
          { text: 'Retry', style: 'primary', onPress: () => fetchUserProfile() },
          { text: 'Cancel', style: 'secondary' }
        ]
      );
    } finally {
      setIsLoadingProfile(false);
      console.log('🔄 PersonalInfoScreen: Profile fetch completed');
    }
  };

  const testNetworkConnectivity = async () => {
    try {
      console.log('PersonalInfoScreen - Testing network connectivity...');
      const testUrl = getApiUrl('/api/user/profile/get-profile');
      console.log('PersonalInfoScreen - Test URL:', testUrl);

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('PersonalInfoScreen - Test response status:', response.status);
      console.log('PersonalInfoScreen - Test response ok:', response.ok);

      return response.ok;
    } catch (error) {
      console.error('PersonalInfoScreen - Network test failed:', error);
      return false;
    }
  };

  const testBasicConnectivity = async () => {
    try {
      console.log('PersonalInfoScreen - Testing basic connectivity...');

      // Test with a simple GET request first
      const baseUrl = getApiUrl('').replace('/api/user/profile/get-profile', '');
      console.log('PersonalInfoScreen - Base URL:', baseUrl);

      const response = await fetch(baseUrl, {
        method: 'GET',
      });

      console.log('PersonalInfoScreen - Basic connectivity test status:', response.status);
      return true;
    } catch (error) {
      console.error('PersonalInfoScreen - Basic connectivity test failed:', error);
      return false;
    }
  };

  const handleEmailVerification = async () => {
    if (!userEmail || !userEmail.trim()) {
      showCustomAlert(
        'Email Required',
        'Please enter an email address first.',
        'warning',
        [{ text: 'OK', style: 'primary' }]
      );
      return;
    }

    if (!userEmail.includes('@') || !userEmail.includes('.')) {
      showCustomAlert(
        'Invalid Email',
        'Please enter a valid email address format.',
        'error',
        [{ text: 'OK', style: 'primary' }]
      );
      return;
    }

    if (!token) {
      showCustomAlert(
        'Authentication Required',
        'Please login to verify your email address.',
        'warning',
        [
          { text: 'OK', style: 'primary' },
          { 
            text: 'Go to Login', 
            style: 'secondary',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      return;
    }

    try {
      setIsLoading(true);
      console.log('📧 PersonalInfoScreen: Starting email verification...');
      console.log('📧 PersonalInfoScreen: Email to verify:', userEmail);
      console.log('📧 PersonalInfoScreen: Using token:', token ? `${token.substring(0, 20)}...` : 'No token');

      // Call send-emailotp API with correct endpoint and headers
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

      console.log('📡 PersonalInfoScreen: Response status:', response.status);
      console.log('📡 PersonalInfoScreen: Response headers:', response.headers);

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ PersonalInfoScreen: API error response:', errorText);
        
        let errorTitle = 'Verification Failed';
        let errorMessage = 'Unable to send verification email. Please try again.';
        
        if (response.status === 400) {
          errorTitle = 'Invalid Request';
          errorMessage = 'Please check your email address and try again.';
        } else if (response.status === 401) {
          errorTitle = 'Authentication Error';
          errorMessage = 'Your session has expired. Please login again.';
        } else if (response.status === 429) {
          errorTitle = 'Too Many Requests';
          errorMessage = 'Please wait a moment before requesting another verification email.';
        } else if (response.status >= 500) {
          errorTitle = 'Server Error';
          errorMessage = 'Our servers are experiencing issues. Please try again later.';
        }
        
        showCustomAlert(
          errorTitle,
          errorMessage,
          'error',
          [
            { text: 'Retry', style: 'primary', onPress: () => handleEmailVerification() },
            { text: 'Cancel', style: 'secondary' }
          ]
        );
        return;
      }

      let result;
      try {
        result = await response.json();
        console.log('📡 PersonalInfoScreen: Send email OTP response:', result);
      } catch (parseError) {
        console.error('💥 PersonalInfoScreen: JSON parse error:', parseError);
        console.log('📡 PersonalInfoScreen: Raw response text:', await response.text());
        showCustomAlert(
          'Data Error',
          'Received invalid response from server. Please try again.',
          'error',
          [
            { text: 'Retry', style: 'primary', onPress: () => handleEmailVerification() },
            { text: 'Cancel', style: 'secondary' }
          ]
        );
        return;
      }

      if (result.success) {
        console.log('✅ PersonalInfoScreen: Email OTP sent successfully!');
        showCustomAlert(
          'OTP Sent Successfully! 📧',
          `A verification code has been sent to ${userEmail}. Please check your email and enter the code to verify your email address.`,
          'success',
          [
            {
              text: 'Verify Now',
              style: 'primary',
              onPress: () => {
                // Navigate to verification screen with email
                navigation.navigate('Verify', {
                  email: userEmail.trim(),
                  isEmailVerification: true,
                  token: token
                });
              }
            },
            {
              text: 'Cancel',
              style: 'secondary'
            }
          ]
        );
      } else {
        console.log('❌ PersonalInfoScreen: Failed to send email OTP:', result.message);
        showCustomAlert(
          'Verification Failed',
          result.message || 'Failed to send verification email. Please try again.',
          'error',
          [
            { text: 'Retry', style: 'primary', onPress: () => handleEmailVerification() },
            { text: 'Cancel', style: 'secondary' }
          ]
        );
      }
    } catch (error) {
      console.error('💥 PersonalInfoScreen: Email verification error:', error);
      
      let errorTitle = 'Network Error';
      let errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      
      if (error.message.includes('timeout')) {
        errorTitle = 'Request Timeout';
        errorMessage = 'The request took too long to complete. Please check your internet connection and try again.';
      } else if (error.message.includes('Network request failed')) {
        errorTitle = 'Connection Failed';
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      showCustomAlert(
        errorTitle,
        errorMessage,
        'error',
        [
          { text: 'Retry', style: 'primary', onPress: () => handleEmailVerification() },
          { text: 'Cancel', style: 'secondary' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!token) {
      showCustomAlert(
        'Authentication Required',
        'Please login to save your profile changes.',
        'warning',
        [
          { text: 'OK', style: 'primary' },
          { 
            text: 'Go to Login', 
            style: 'secondary',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
      return;
    }

    // Validate required fields
    if (!name || !name.trim()) {
      showCustomAlert(
        'Name Required',
        'Please enter your full name.',
        'warning',
        [{ text: 'OK', style: 'primary' }]
      );
      return;
    }

    if (!userEmail || !userEmail.trim()) {
      showCustomAlert(
        'Email Required',
        'Please enter your email address.',
        'warning',
        [{ text: 'OK', style: 'primary' }]
      );
      return;
    }

    if (!userEmail.includes('@') || !userEmail.includes('.')) {
      showCustomAlert(
        'Invalid Email',
        'Please enter a valid email address format.',
        'error',
        [{ text: 'OK', style: 'primary' }]
      );
      return;
    }

    try {
      setIsLoading(true);

      // Test network connectivity first
      const isNetworkWorking = await testNetworkConnectivity();
      if (!isNetworkWorking) {
        showCustomAlert(
          'Network Error',
          'Unable to connect to server. Please check your internet connection and try again.',
          'error',
          [
            { text: 'Retry', style: 'primary', onPress: () => handleSaveProfile() },
            { text: 'Cancel', style: 'secondary' }
          ]
        );
        setIsLoading(false);
        return;
      }

      const profileData = {
        profileImageUrl: profileImage,
        address: userAddress,
        email: userEmail,
      };

      console.log('PersonalInfoScreen - About to call updateUserProfile with:', {
        token: token ? `${token.substring(0, 20)}...` : 'No token',
        profileData: profileData,
        profileImageType: typeof profileImage,
        profileImageKeys: profileImage ? Object.keys(profileImage) : 'No profileImage'
      });

      const result = await profileAPI.updateUserProfile(token, profileData);

      console.log('PersonalInfoScreen - updateUserProfile result:', result);

      if (result.success && result.data.success) {
        console.log('Profile updated successfully:', result.data);

        // Update Redux store with new data
        dispatch(setProfileData({
          ...result.data.data,
          fullName: name,
          mobileNumber: phone,
        }));

        showCustomAlert(
          'Profile Updated Successfully! 🎉',
          'Your profile information has been saved successfully.',
          'success',
          [{ text: 'OK', style: 'primary' }]
        );
      } else {
        console.log('Failed to update profile:', result.data?.message);
        console.log('Full result:', result);

        // Try updating without image if the full update failed
        if (profileData.profileImageUrl && profileData.profileImageUrl.uri) {
          console.log('PersonalInfoScreen - Trying update without image...');
          const fallbackProfileData = {
            address: userAddress,
            email: userEmail,
          };

          const fallbackResult = await profileAPI.updateUserProfile(token, fallbackProfileData);

          if (fallbackResult.success && fallbackResult.data.success) {
            console.log('Profile updated successfully without image:', fallbackResult.data);

            // Update Redux store with new data
            dispatch(setProfileData({
              ...fallbackResult.data.data,
              fullName: name,
              mobileNumber: phone,
            }));

            showCustomAlert(
              'Profile Updated with Warning ⚠️',
              'Your profile information has been saved successfully, but the image update failed. You can try updating the image again later.',
              'warning',
              [{ text: 'OK', style: 'primary' }]
            );
          } else {
            showCustomAlert(
              'Update Failed',
              fallbackResult.data?.message || 'Failed to update your profile. Please try again.',
              'error',
              [
                { text: 'Retry', style: 'primary', onPress: () => handleSaveProfile() },
                { text: 'Cancel', style: 'secondary' }
              ]
            );
          }
        } else {
          showCustomAlert(
            'Update Failed',
            result.data?.message || 'Failed to update your profile. Please try again.',
            'error',
            [
              { text: 'Retry', style: 'primary', onPress: () => handleSaveProfile() },
              { text: 'Cancel', style: 'secondary' }
            ]
          );
        }
      }
    } catch (error) {
      console.error('PersonalInfoScreen - Error updating profile:', error);
      console.error('PersonalInfoScreen - Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorTitle = 'Update Error';
      let errorMessage = 'Failed to update your profile. Please try again.';
      
      if (error.message.includes('timeout')) {
        errorTitle = 'Request Timeout';
        errorMessage = 'The update request took too long to complete. Please check your internet connection and try again.';
      } else if (error.message.includes('Network request failed')) {
        errorTitle = 'Connection Failed';
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.message.includes('JSON')) {
        errorTitle = 'Data Error';
        errorMessage = 'Received invalid data from the server. Please try again.';
      }
      
      showCustomAlert(
        errorTitle,
        errorMessage,
        'error',
        [
          { text: 'Retry', style: 'primary', onPress: () => handleSaveProfile() },
          { text: 'Cancel', style: 'secondary' }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showImagePickerOptions = () => {
    showCustomAlert(
      'Select Profile Image',
      'Choose how you would like to update your profile picture.',
      'info',
      [
        {
          text: 'Camera',
          style: 'primary',
          onPress: () => openCamera(),
        },
        {
          text: 'Gallery',
          style: 'primary',
          onPress: () => openGallery(),
        },
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.log('Camera Error: ', response.error);
        showCustomAlert(
          'Camera Error',
          response.error.message || 'Unable to access camera. Please check camera permissions.',
          'error',
          [{ text: 'OK', style: 'primary' }]
        );
      } else if (response.assets && response.assets.length > 0) {
        setProfileImage({ uri: response.assets[0].uri });
        showCustomAlert(
          'Image Selected',
          'Profile image updated successfully!',
          'success',
          [{ text: 'OK', style: 'primary' }]
        );
      } else {
        showCustomAlert(
          'No Image Selected',
          'No image was captured. Please try again.',
          'warning',
          [{ text: 'OK', style: 'primary' }]
        );
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled gallery');
      } else if (response.error) {
        console.log('Gallery Error: ', response.error);
        showCustomAlert(
          'Gallery Error',
          response.error.message || 'Unable to access gallery. Please check storage permissions.',
          'error',
          [{ text: 'OK', style: 'primary' }]
        );
      } else if (response.assets && response.assets.length > 0) {
        setProfileImage({ uri: response.assets[0].uri });
        showCustomAlert(
          'Image Selected',
          'Profile image updated successfully!',
          'success',
          [{ text: 'OK', style: 'primary' }]
        );
      } else {
        showCustomAlert(
          'No Image Selected',
          'No image was selected. Please try again.',
          'warning',
          [{ text: 'OK', style: 'primary' }]
        );
      }
    });
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <BackButton onPress={() => navigation.goBack()} />
          <Text style={styles.headerTitle}>Personal Info</Text>
         
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF8800" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
        <CustomAlert />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <CustomAlert />
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Personal Info</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Profile Image */}
      <View style={styles.profileImageContainer}>
        <Image
          source={profileImage}
          style={styles.profileImage}
        />
        <TouchableOpacity
          style={styles.editIconContainer}
          onPress={showImagePickerOptions}
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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity style={styles.editIconBtn}>
            <Icon name="create-outline" size={20} color="#00AEEF" />
          </TouchableOpacity>
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
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={userEmail}
            onChangeText={setUserEmail}
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.verifyBtn} onPress={handleEmailVerification}>
            <Text style={styles.verifyBtnText}>Verify</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.editIconBtn}>
            <Icon name="create-outline" size={20} color="#00AEEF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]}
        onPress={handleSaveProfile}
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


    </SafeAreaView>
  );
};

export default PersonalInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
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
  // Custom Alert Styles
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(20),
  },
  alertContainer: {
    backgroundColor: '#fff',
    borderRadius: getResponsiveSize(16),
    padding: getResponsiveSize(24),
    alignItems: 'center',
    minWidth: getResponsiveSize(280),
    maxWidth: getResponsiveSize(320),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: getResponsiveSize(-10),
    right: getResponsiveSize(8),
    width: getResponsiveSize(32),
    height: getResponsiveSize(32),
    borderRadius: getResponsiveSize(16),
    backgroundColor: '#FF8800',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  alertIcon: {
    width: getResponsiveSize(60),
    height: getResponsiveSize(60),
    borderRadius: getResponsiveSize(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSize(16),
  },
  alertIconText: {
    fontSize: getResponsiveSize(30),
    color: '#fff',
    fontWeight: 'bold',
  },
  alertTitle: {
    fontSize: getResponsiveSize(20),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: getResponsiveSize(12),
  },
  alertMessage: {
    fontSize: getResponsiveSize(16),
    color: '#666',
    textAlign: 'center',
    lineHeight: getResponsiveSize(22),
    marginBottom: getResponsiveSize(24),
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: getResponsiveSize(12),
    flexWrap: 'wrap',
  },
  alertButton: {
    flex: 1,
    paddingVertical: getResponsiveSize(12),
    paddingHorizontal: getResponsiveSize(16),
    borderRadius: getResponsiveSize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonPrimary: {
    backgroundColor: '#FF8800',
  },
  alertButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF8800',
  },
  alertButtonDanger: {
    backgroundColor: '#F44336',
  },
  alertButtonText: {
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
  },
  alertButtonTextPrimary: {
    color: '#fff',
  },
  alertButtonTextSecondary: {
    color: '#FF8800',
  },
  alertButtonTextDanger: {
    color: '#fff',
  },
});