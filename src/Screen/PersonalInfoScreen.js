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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import { setFullName, setMobileNumber, setProfileData } from '../Redux/userSlice';
import { profileAPI } from '../API/profileAPI';
import { getApiUrl, ENDPOINTS } from '../API/config';
import BackButton from '../Component/BackButton';

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
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user profile data on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Update local state when Redux state changes
  useEffect(() => {
    if (fullName !== undefined) {
      setName(fullName);
    }
    if (mobileNumber !== undefined) {
      setPhone(mobileNumber);
    }
    if (address !== undefined) {
      setUserAddress(address);
    }
    if (email !== undefined) {
      setUserEmail(email);
    }
    if (profileImageUrl) {
      setProfileImage({ uri: profileImageUrl });
    }
  }, [fullName, mobileNumber, address, email, profileImageUrl]);

  const fetchUserProfile = async (isRefresh = false) => {
    if (!token) {
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
      
      const result = await profileAPI.getUserProfile(token);

      if (result.success && result.data.success) {
        const profileData = result.data.data;

        // Update Redux store with fetched data
        dispatch(setProfileData(profileData));

        // Update local state
        setName(profileData.fullName || '');
        setPhone(profileData.mobileNumber || '+91');
        setUserAddress(profileData.address || '');
        setUserEmail(profileData.email || '');
        setIsEmailVerified(profileData.isEmailVerified || false);
        
        if (profileData.profileImageUrl) {
          setProfileImage({ uri: profileData.profileImageUrl });
        }
      } else {
        Alert.alert('Error', 'Failed to load profile data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setIsLoadingProfile(false);
      setRefreshing(false);
    }
  };

  const testNetworkConnectivity = async () => {
    try {
      const testUrl = getApiUrl('/api/user/profile/get-profile');

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  };

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

  const handleEmailVerification = async () => {
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

      // Check if response is ok before parsing JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response from server. Please try again.');
      }

      if (result.success) {
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
        Alert.alert('Error', result.message || 'Failed to send OTP');
      }
    } catch (error) {
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

      const result = await profileAPI.updateUserProfile(token, profileData);

      if (result.success && result.data.success) {
        // Update Redux store with new data
        dispatch(setProfileData({
          ...result.data.data,
          fullName: name,
          mobileNumber: phone,
        }));

        Alert.alert('Success', 'Profile updated successfully');
      } else {
        // Try updating without image if the full update failed
        if (profileData.profileImageUrl && profileData.profileImageUrl.uri) {
          const fallbackProfileData = {
            address: userAddress,
            email: userEmail,
          };

          const fallbackResult = await profileAPI.updateUserProfile(token, fallbackProfileData);

          if (fallbackResult.success && fallbackResult.data.success) {
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
      } else if (response.error) {
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
      } else if (response.error) {
      } else {
        setProfileImage({ uri: response.assets[0].uri });
      }
    });
  };

  const onRefresh = () => {
    fetchUserProfile(true);
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
        <BackButton onPress={() => navigation.goBack()} />
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
              value={userEmail}
              onChangeText={isEmailVerified ? null : setUserEmail}
              keyboardType="email-address"
              editable={!isEmailVerified}
              selectTextOnFocus={!isEmailVerified}
            />
            <TouchableOpacity 
              style={[
                styles.verifyBtn, 
                isEmailVerified && styles.verifyBtnDisabled
              ]} 
              onPress={isEmailVerified ? null : handleEmailVerification}
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