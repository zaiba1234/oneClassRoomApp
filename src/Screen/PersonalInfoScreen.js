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
import { setFullName, setMobileNumber } from '../Redux/userSlice';

const PersonalInfoScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { fullName, mobileNumber } = useAppSelector((state) => state.user);
  
  const [name, setName] = useState(fullName || '');
  const [address, setAddress] = useState('123 Main St, Springfield');
  const [email, setEmail] = useState('xyz@gmail.com');
  const [phone, setPhone] = useState(mobileNumber || '+91');
  const [profileImage, setProfileImage] = useState(require('../assests/images/Profile.png'));

  // Update local state when Redux state changes
  useEffect(() => {
    if (fullName) setName(fullName);
    if (mobileNumber) setPhone(mobileNumber);
  }, [fullName, mobileNumber]);

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
          <TouchableOpacity style={styles.inlineEditBtn} onPress={() => { /* Add edit logic here if needed */ }}>
            <Image 
              source={require('../assests/images/Edit.png')} 
              style={styles.inlineEditIcon}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Address</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
          />
          <TouchableOpacity style={styles.inlineEditBtn} onPress={() => { /* Add edit logic here if needed */ }}>
            <Image 
              source={require('../assests/images/Edit.png')} 
              style={styles.inlineEditIcon}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>E-mail</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TouchableOpacity style={styles.inlineEditBtn} onPress={() => { /* Add verify logic here if needed */ }}>
            <Text style={styles.inlineEditText}>Verify</Text>
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
          <TouchableOpacity style={styles.inlineEditBtn} onPress={() => { /* Add edit logic here if needed */ }}>
            <Text style={styles.inlineEditText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn}>
        <LinearGradient
          colors={['#FF8800', '#FFB800']}
          style={styles.saveBtnGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.saveBtnText}>Save Details</Text>
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
});