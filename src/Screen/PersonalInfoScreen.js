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
  BackHandler,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import { setProfileData } from '../Redux/userSlice';
import { profileAPI } from '../API/profileAPI';
import { getApiUrl, ENDPOINTS } from '../API/config';
import BackButton from '../Component/BackButton';

const PersonalInfoScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((state) => state.user);
  
  // Local state for form fields - will be populated from API
  const [name, setName] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState(require('../assests/images/Profile.png'));
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
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

  // Handle hardware back button for Android
  useEffect(() => {
    const backAction = () => {
      console.log('🔙 [PersonalInfoScreen] Hardware back button pressed');
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      } else {
        navigation.navigate('Home');
        return true;
      }
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);


const fetchUserProfile = async (isRefresh = false) => {
  console.log('🚀 [PersonalInfoScreen] Fetching user profile from API');

  if (!token) {
    console.log('❌ [PersonalInfoScreen] No token available');
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
    
    // Call the API to get profile data
    const result = await profileAPI.getUserProfile(token);
    
    console.log('📱 [PersonalInfoScreen] API Response:', {
      success: result.success,
      status: result.status,
      hasData: !!result.data?.data
    });

    if (result.success && result.data?.success && result.data?.data) {
      const profileData = result.data.data;
      
      console.log('✅ [PersonalInfoScreen] Profile data received from API:', {
        fullName: profileData.fullName,
        mobileNumber: profileData.mobileNumber,
        email: profileData.email,
        address: profileData.address,
        isEmailVerified: profileData.isEmailVerified,
        hasProfileImage: !!profileData.profileImageUrl
      });

      // Populate all form fields directly from API data
      setName(profileData.fullName || '');
      setPhone(profileData.mobileNumber || '');
      setUserAddress(profileData.address || '');
      setUserEmail(profileData.email || '');
      setIsEmailVerified(profileData.isEmailVerified || false);
      
      // Set profile image
      if (profileData.profileImageUrl) {
        setProfileImage({ uri: profileData.profileImageUrl });
      } else {
        setProfileImage(require('../assests/images/Profile.png'));
      }

      // Update Redux store with the complete profile data
      dispatch(setProfileData({
        fullName: profileData.fullName || '',
        mobileNumber: profileData.mobileNumber || '',
        email: profileData.email || '',
        address: profileData.address || '',
        isEmailVerified: profileData.isEmailVerified || false,
        profileImageUrl: profileData.profileImageUrl || '',
        _id: profileData._id || '',
        userId: profileData.userId || ''
      }));

      console.log('✅ [PersonalInfoScreen] All form fields populated from API data');
    } else {
      console.log('❌ [PersonalInfoScreen] API call failed:', {
        resultSuccess: result.success,
        dataSuccess: result.data?.success,
        message: result.data?.message
      });
      Alert.alert('Error', result.data?.message || 'Failed to load profile data');
    }
  } catch (error) {
    console.log('❌ [PersonalInfoScreen] Error fetching profile:', error.message);
    Alert.alert('Error', 'Failed to load profile data');
  } finally {
    setIsLoadingProfile(false);
    setRefreshing(false);
  }
};


const handleEmailVerification = async () => {
  console.log('📧 [PersonalInfoScreen] Starting email verification');

  if (isEmailVerified) {
    Alert.alert('Already Verified', 'Your email is already verified');
    return;
  }

  if (!userEmail || !userEmail.trim()) {
    Alert.alert('Error', 'Please enter an email address first');
    return;
  }

  if (!userEmail.includes('@') || !userEmail.includes('.')) {
    Alert.alert('Error', 'Please enter a valid email address');
    return;
  }

  if (!token) {
    Alert.alert('Error', 'Please login to verify email');
    return;
  }

  try {
    setIsLoading(true);
    
    // Send email OTP
    const response = await fetch(getApiUrl('/api/auth/send-emailotp'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: (userEmail || '').trim()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      console.log('✅ [PersonalInfoScreen] Email OTP sent successfully');
      navigation.push('Verify', {
        email: (userEmail || '').trim(),
        isEmailVerification: true,
        token: token
      });
    } else {
      Alert.alert('Error', result.message || 'Failed to send OTP');
    }
  } catch (error) {
    console.log('❌ [PersonalInfoScreen] Email verification error:', error.message);
    Alert.alert('Error', 'Failed to send OTP. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

const handleSaveProfile = async () => {
  console.log('💾 [PersonalInfoScreen] Saving profile data');

  if (!token) {
    Alert.alert('Error', 'Please login to save profile');
    return;
  }

  try {
    setIsLoading(true);

    const profileData = {
      profileImageUrl: profileImage,
      address: userAddress,
      email: userEmail,
    };

    console.log('💾 [PersonalInfoScreen] Updating profile with:', {
      address: profileData.address,
      email: profileData.email,
      hasProfileImage: !!profileData.profileImageUrl?.uri
    });
    
    const result = await profileAPI.updateUserProfile(token, profileData);
    
    console.log('📱 [PersonalInfoScreen] Update response:', {
      success: result.success,
      status: result.status,
      hasData: !!result.data?.data
    });

    if (result.success && result.data?.success) {
      console.log('✅ [PersonalInfoScreen] Profile updated successfully');
      
      // Update Redux store with the updated data
      dispatch(setProfileData({
        fullName: name,
        mobileNumber: phone,
        email: userEmail,
        address: userAddress,
        isEmailVerified: result.data.data?.isEmailVerified || isEmailVerified,
        profileImageUrl: result.data.data?.profileImageUrl || (profileImage?.uri || ''),
        _id: result.data.data?._id || '',
        userId: result.data.data?.userId || ''
      }));

      Alert.alert('Success', 'Profile updated successfully');
    } else {
      console.log('❌ [PersonalInfoScreen] Profile update failed:', result.data?.message);
      Alert.alert('Error', result.data?.message || 'Failed to update profile');
    }
  } catch (error) {
    console.log('❌ [PersonalInfoScreen] Profile update error:', error.message);
    Alert.alert('Error', `Failed to update profile: ${error.message}`);
  } finally {
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
          fileName: response.assets[0]?.fileName || 'unknown',
          fileSize: response.assets[0]?.fileSize || 0,
          type: response.assets[0]?.type || 'unknown'
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
          fileName: response.assets[0]?.fileName || 'unknown',
          fileSize: response.assets[0]?.fileSize || 0,
          type: response.assets[0]?.type || 'unknown'
        });
        setProfileImage({ uri: imageUri });
      }
    });
  };

  // Simple email input handler
  const handleEmailChange = (newEmail) => {
    setUserEmail(newEmail);
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
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Home');
          }
        }} />
          <Text style={styles.headerTitle}>Personal Info</Text>
         
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('🎨 [PersonalInfoScreen] Rendering component with data:', {
    isLoading,
    isLoadingProfile,
    isEmailVerified,
    hasProfileImage: !!profileImage?.uri,
    userEmail: userEmail || 'Empty',
    userAddress: userAddress || 'Empty',
    name: name || 'Empty'
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => {
          console.log('🔙 [PersonalInfoScreen] Back button pressed from main view');
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Home');
          }
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
          <Text style={styles.label}>E-mail </Text>
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
              onChangeText={isEmailVerified ? null : handleEmailChange}
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