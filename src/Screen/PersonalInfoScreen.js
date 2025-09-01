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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import { setFullName, setMobileNumber, setProfileData } from '../Redux/userSlice';
import { profileAPI } from '../API/profileAPI';
import { getApiUrl, ENDPOINTS } from '../API/config';

const PersonalInfoScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { fullName, mobileNumber, token, profileImageUrl, address, email } = useAppSelector((state) => state.user);
  
  const [name, setName] = useState(fullName || '');
  const [userAddress, setUserAddress] = useState(address || '');
  const [userEmail, setUserEmail] = useState(email || '');
  const [phone, setPhone] = useState(mobileNumber || '+91');
  const [profileImage, setProfileImage] = useState(profileImageUrl ? { uri: profileImageUrl } : require('../assests/images/Profile.png'));
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Update local state when Redux state changes
  useEffect(() => {
    if (fullName) setName(fullName);
    if (mobileNumber) setPhone(mobileNumber);
    if (address) setUserAddress(address);
    if (email) setUserEmail(email);
    if (profileImageUrl) setProfileImage({ uri: profileImageUrl });
  }, [fullName, mobileNumber, address, email, profileImageUrl]);

  const fetchUserProfile = async () => {
    if (!token) {
      setIsLoadingProfile(false);
      return;
    }

    try {
      setIsLoadingProfile(true);
      const result = await profileAPI.getUserProfile(token);
      
      if (result.success && result.data.success) {
        const profileData = result.data.data;
        console.log('Profile data fetched:', profileData);
        
        // Update Redux store with fetched data
        dispatch(setProfileData(profileData));
        
        // Update local state
        setName(profileData.fullName || '');
        setPhone(profileData.mobileNumber || '+91');
        setUserAddress(profileData.address || '');
        setUserEmail(profileData.email || '');
        if (profileData.profileImageUrl) {
          setProfileImage({ uri: profileData.profileImageUrl });
        }
      } else {
        console.log('Failed to fetch profile:', result.data?.message);
        Alert.alert('Error', 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoadingProfile(false);
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
      Alert.alert('Error', 'Please enter an email address first');
      return;
    }

    if (!userEmail.includes('@') || !userEmail.includes('.')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      console.log('📧 PersonalInfoScreen: Starting email verification...');
      console.log('📧 PersonalInfoScreen: Email to verify:', userEmail);

      // Call send-emailotp API
      const response = await fetch(getApiUrl(ENDPOINTS.SEND_EMAIL_OTP), {
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        result = await response.json();
        console.log('📡 PersonalInfoScreen: Send email OTP response:', result);
      } catch (parseError) {
        console.error('💥 PersonalInfoScreen: JSON parse error:', parseError);
        console.log('📡 PersonalInfoScreen: Raw response text:', await response.text());
        throw new Error('Invalid response from server. Please try again.');
      }

      if (result.success) {
        console.log('✅ PersonalInfoScreen: Email OTP sent successfully!');
        Alert.alert(
          'OTP Sent', 
          `OTP has been sent to ${userEmail}`,
          [
            {
              text: 'Verify Now',
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
              style: 'cancel'
            }
          ]
        );
      } else {
        console.log('❌ PersonalInfoScreen: Failed to send email OTP:', result.message);
        Alert.alert('Error', result.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('💥 PersonalInfoScreen: Email verification error:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!token) {
      Alert.alert('Error', 'Please login to save profile');
      return;
    }

    try {
      setIsLoading(true);
      
      // Test network connectivity first
      const isNetworkWorking = await testNetworkConnectivity();
      if (!isNetworkWorking) {
        Alert.alert('Network Error', 'Unable to connect to server. Please check your internet connection.');
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
        
        Alert.alert('Success', 'Profile updated successfully');
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
            
            Alert.alert('Success', 'Profile updated successfully (image update failed)');
          } else {
            Alert.alert('Error', fallbackResult.data?.message || 'Failed to update profile');
          }
        } else {
          Alert.alert('Error', result.data?.message || 'Failed to update profile');
        }
      }
    } catch (error) {
      console.error('PersonalInfoScreen - Error updating profile:', error);
      console.error('PersonalInfoScreen - Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      Alert.alert('Error', `Failed to update profile: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
      } else if (response.error) {
        console.log('Camera Error: ', response.error);
      } else {
        setProfileImage({ uri: response.assets[0].uri });
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled gallery');
      } else if (response.error) {
        console.log('Gallery Error: ', response.error);
      } else {
        setProfileImage({ uri: response.assets[0].uri });
      }
    });
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <LinearGradient
              colors={['#FF8800', '#FFB800']}
              style={styles.backBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.backArrow}>{'<'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Info</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <LinearGradient
            colors={['#FF8800', '#FFB800']}
            style={styles.backBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.backArrow}>{'<'}</Text>
          </LinearGradient>
        </TouchableOpacity>
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
        </View>

        <Text style={styles.label}>Address</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={userAddress}
            onChangeText={setUserAddress}
          />
        </View>

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
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveBtn, isLoading && styles.saveBtnDisabled]} 
        onPress={handleSaveProfile}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#FF8800', '#FFB800']}
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
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  backBtnGradient: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
  inlineEditBtn: {
    padding: 8,
  },
  inlineEditIcon: {
    width: 16,
    height: 16,
    tintColor: '#00AEEF',
  },
  verifyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#00AEEF',
    borderRadius: 6,
    marginRight: 8,
  },
  verifyBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
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
});