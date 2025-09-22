import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Linking,
  Clipboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Profilebg from '../assests/images/Profilebg.png';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import { logout, clearUserFromStorage } from '../Redux/userSlice';
import { useNavigation } from '@react-navigation/native';
import { getApiUrl } from '../API/config';
import notificationService from '../services/notificationService';
import { getStoredFCMToken } from '../services/firebaseConfig';


const ProfileScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const nav = useNavigation();

  // Get screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Responsive size function
  const getResponsiveSize = useCallback((size) => {
    const baseWidth = 375; // iPhone X width as base
    return (screenWidth / baseWidth) * size;
  }, [screenWidth]);

  // State for refreshing
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [privacyPolicyAccepted, setPrivacyPolicyAccepted] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);

  // Custom alert state
  const [customAlert, setCustomAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // info, success, error, warning, loading
    buttons: [],
    showSpinner: false,
  });

  // Get user data from Redux
  const { fullName, mobileNumber, _id, userId, profileImageUrl, address, email, token } = useAppSelector((state) => state.user);

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
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      case 'loading': return 'refresh';
      default: return 'information-circle';
    }
  };

  const showCustomAlert = (title, message, type = 'info', buttons = [], showSpinner = false) => {
    setOverlayVisible(true);
    setCustomAlert({
      visible: true,
      title,
      message,
      type,
      buttons,
      showSpinner,
    });
  };

  const hideCustomAlert = () => {
    setOverlayVisible(false);
    setCustomAlert(prev => ({ ...prev, visible: false }));
  };

  const menuItems = [
    {
      id: 1,
      title: 'Personal Info',
      iconName: 'person-outline',
      iconColor: '#FF9800',
      screenName: 'PersonalInfo',
      group: 1,
    },
    
    {
      id: 2,
      title: 'Settings',
      iconName: 'settings-outline',
      iconColor: '#2196F3',
      screenName: 'Setting',
      group: 2,
    },
    {
      id: 3,
      title: 'Privacy and Policy',
      iconName: 'shield-checkmark-outline',
      iconColor: '#4CAF50',
      screenName: 'PrivacyPolicy',
      group: 3,
    },
    {
      id: 4,
      title: 'Terms and Condition',
      iconName: 'document-text-outline',
      iconColor: '#2196F3',
      screenName: 'TermsCondition',
      group: 3,
    },
    {
      id: 5,
      title: 'Contact Us',
      iconName: 'call-outline',
      iconColor: '#FF9800',
      screenName: 'ContactUs',
      group: 3,
    },
    {
      id: 6,
      title: 'Delete Account',
      iconName: 'trash-outline',
      iconColor: '#FF4444',
      screenName: 'DeleteAccount',
      isDestructive: true,
      group: 4,
    },
  ];

  const handleMenuItemPress = (screenName) => {
    switch (screenName) {
      case 'PersonalInfo':
        navigation.navigate('PersonalInfo');
        break;
      case 'PaymentMethod':
        navigation.navigate('PaymentGateway');
        break;
      case 'InvoiceHistory':
        navigation.navigate('InvoiceHistory');
        break;
      case 'Setting':
        navigation.navigate('Setting');
        break;
      case 'PrivacyPolicy':
        navigation.navigate('PrivacyPolicy');
        break;
      case 'TermsCondition':
        navigation.navigate('TermsCondition');
        break;
      case 'ContactUs':
        navigation.navigate('ContactUs');
        break;
      case 'DeleteAccount':
        handleDeleteAccount();
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    showCustomAlert(
      'Logout',
      'Are you sure you want to logout?',
      'warning',
      [
        {
          text: 'Cancel',
          onPress: hideCustomAlert,
          style: 'secondary',
        },
        {
          text: 'Logout',
          onPress: async () => {
            hideCustomAlert();
            
            try {
              // Show loading state
              showCustomAlert(
                'Logging Out',
                'Please wait while we log you out...',
                'loading',
                [],
                true
              );

              // Remove FCM token from backend before logout
              console.log('🔔 ProfileScreen: Starting logout process with FCM token removal...');
              
              // Get FCM token and user token before clearing user data
              const fcmToken = await getStoredFCMToken();
              const userToken = token; // Get token from Redux state before clearing
              
              if (fcmToken && userToken) {
                console.log('🔔 ProfileScreen: Removing FCM token from backend...');
                const removed = await notificationService.removeFCMTokenFromBackend(fcmToken, userToken);
                if (removed) {
                  console.log('✅ ProfileScreen: FCM token removed from backend successfully');
                } else {
                  console.log('⚠️ ProfileScreen: Failed to remove FCM token from backend');
                }
              } else {
                console.log('ℹ️ ProfileScreen: No FCM token or user token to remove');
              }
              
              // Clear local FCM token and notifications
              await notificationService.cleanup();
              
              console.log('✅ ProfileScreen: FCM cleanup completed');
              
              // Clear from storage and logout
              await dispatch(clearUserFromStorage());
              dispatch(logout());
              
              // Hide loading alert
              hideCustomAlert();
              
              // Navigate to login
              nav.navigate('Login');
              
            } catch (error) {
              console.error('❌ ProfileScreen: Error during logout:', error);
              
              // Hide loading alert
              hideCustomAlert();
              
              // Show error but still proceed with logout
              showCustomAlert(
                'Logout Warning',
                'There was an issue removing your notification settings, but you have been logged out successfully.',
                'warning',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      hideCustomAlert();
                      nav.navigate('Login');
                    },
                    style: 'primary',
                  },
                ]
              );
            }
          },
          style: 'danger',
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    setPrivacyPolicyAccepted(false); // Reset checkbox state
    showCustomAlert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
      'error',
      [
        {
          text: 'Cancel',
          onPress: hideCustomAlert,
          style: 'secondary',
        },
        {
          text: 'Delete ',
          onPress: () => {
            if (privacyPolicyAccepted) {
              hideCustomAlert();
              // Show second confirmation
              showCustomAlert(
                'Final Confirmation',
                'This is your last chance. Are you absolutely sure you want to delete your account?',
                'error',
                [
                  {
                    text: 'Cancel',
                    onPress: hideCustomAlert,
                    style: 'secondary',
                  },
                  {
                    text: 'Yes, Delete Forever',
                    onPress: () => {
                      hideCustomAlert();
                      deleteAccountAPI();
                    },
                    style: 'danger',
                  },
                ]
              );
            } else {
              // Show error that checkbox must be checked
              showCustomAlert(
                'Acceptance Required',
                'Please accept the privacy policy by checking the checkbox to proceed with account deletion.',
                'error',
                [
                  {
                    text: 'OK',
                    onPress: hideCustomAlert,
                    style: 'primary',
                  },
                ]
              );
            }
          },
          style: 'danger',
        },
      ]
    );
  };



  const openPrivacyPolicyPage = async () => {
    try {
      const privacyPolicyUrl = 'https://onerupeeclassroom.learningsaint.com/delete';
      
      const supported = await Linking.canOpenURL(privacyPolicyUrl);
      
      if (supported) {
        await Linking.openURL(privacyPolicyUrl);
      } else {
        showCustomAlert(
          'Error',
          'Unable to open the privacy policy page. Please visit the page manually.',
          'error',
          [
            {
              text: 'Copy URL',
              onPress: () => {
                Clipboard.setString(privacyPolicyUrl);
                hideCustomAlert();
                showCustomAlert(
                  'URL Copied',
                  'The privacy policy URL has been copied to your clipboard.',
                  'success',
                  [
                    {
                      text: 'OK',
                      onPress: hideCustomAlert,
                      style: 'primary',
                    },
                  ]
                );
              },
              style: 'primary',
            },
            {
              text: 'OK',
              onPress: hideCustomAlert,
              style: 'secondary',
            },
          ]
        );
      }
    } catch (error) {
      showCustomAlert(
        'Error',
        `Unable to open the privacy policy page. Error: ${error.message || 'Unknown error'}`,
        'error',
        [
          {
            text: 'Copy URL',
            onPress: () => {
              const privacyPolicyUrl = 'https://onerupeeclassroom.learningsaint.com/delete';
              Clipboard.setString(privacyPolicyUrl);
              hideCustomAlert();
              showCustomAlert(
                'URL Copied',
                'The privacy policy URL has been copied to your clipboard.',
                'success',
                [
                  {
                    text: 'OK',
                    onPress: hideCustomAlert,
                    style: 'primary',
                  },
                ]
              );
            },
            style: 'primary',
          },
          {
            text: 'OK',
            onPress: hideCustomAlert,
            style: 'secondary',
          },
        ]
      );
    }
  };

  const showPrivacyPolicyAcceptanceModal = () => {
    showCustomAlert(
      'Privacy Policy Acceptance',
      'Please confirm that you have read and understood our privacy policy regarding account deletion.',
      'info',
      [
        {
          text: 'Cancel',
          onPress: hideCustomAlert,
          style: 'secondary',
        },
        {
          text: 'Accept & Delete',
          onPress: () => {
            if (privacyPolicyAccepted) {
              hideCustomAlert();
              deleteAccountAPI();
            } else {
              // Show error that checkbox must be checked
              showCustomAlert(
                'Acceptance Required',
                'Please accept the privacy policy by checking the checkbox to proceed with account deletion.',
                'error',
                [
                  {
                    text: 'OK',
                    onPress: hideCustomAlert,
                    style: 'primary',
                  },
                ]
              );
            }
          },
          style: 'danger',
        },
      ]
    );
  };

  const deleteAccountAPI = async () => {
    try {
      setIsDeleting(true);

      const apiUrl = getApiUrl('/api/user/profile/delete-profile');

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();

        // Remove FCM token from backend before clearing user data
        try {
          console.log('🔔 ProfileScreen: Removing FCM token during account deletion...');
          
          // Get FCM token and user token before clearing user data
          const fcmToken = await getStoredFCMToken();
          const userToken = token; // Get token from Redux state before clearing
          
          if (fcmToken && userToken) {
            console.log('🔔 ProfileScreen: Removing FCM token from backend...');
            const removed = await notificationService.removeFCMTokenFromBackend(fcmToken, userToken);
            if (removed) {
              console.log('✅ ProfileScreen: FCM token removed from backend successfully');
            } else {
              console.log('⚠️ ProfileScreen: Failed to remove FCM token from backend');
            }
          } else {
            console.log('ℹ️ ProfileScreen: No FCM token or user token to remove');
          }
          
          // Clear local FCM token and notifications
          await notificationService.cleanup();
          console.log('✅ ProfileScreen: FCM cleanup completed during account deletion');
        } catch (fcmError) {
          console.error('⚠️ ProfileScreen: Error removing FCM token during account deletion:', fcmError);
          // Continue with account deletion even if FCM cleanup fails
        }

        showCustomAlert(
          'Account Deleted',
          'Your account has been successfully deleted. We\'re sorry to see you go.',
          'success',
          [
            {
              text: 'OK',
              onPress: async () => {
                hideCustomAlert();
                // Clear user data and navigate to login
                await dispatch(clearUserFromStorage());
                dispatch(logout());
                nav.navigate('Login');
              },
              style: 'primary',
            },
          ]
        );
      } else {
        const errorData = await response.json();

        showCustomAlert(
          'Delete Failed',
          errorData.message || 'Failed to delete account. Please try again later.',
          'error',
          [
            {
              text: 'OK',
              onPress: hideCustomAlert,
              style: 'primary',
            },
          ]
        );
      }
    } catch (error) {
      showCustomAlert(
        'Error',
        'Something went wrong while deleting your account. Please check your internet connection and try again.',
        'error',
        [
          {
            text: 'OK',
            onPress: hideCustomAlert,
            style: 'primary',
          },
        ]
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);

    // Simulate refresh delay and refresh user data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  const renderMenuItem = (item, isLastInGroup = false) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuItem,
        isLastInGroup && styles.lastMenuItem,
      ]}
      onPress={() => handleMenuItemPress(item?.screenName)}
      disabled={isDeleting && item.isDestructive}
      activeOpacity={0.7}
    >
      {/* Icon inside circular background */}
      <View style={[
        styles.iconWrapper,
        { backgroundColor: item.isDestructive ? "#FFE5E5" : item.iconColor + "20" }
      ]}>
        <Icon
          name={item.iconName}
          size={20}
          color={item.isDestructive ? "#FF4444" : item.iconColor}
        />
      </View>

      <Text style={[
        styles.menuTitle,
        item.isDestructive && styles.destructiveMenuTitle
      ]}>
        {item.title}
      </Text>

      {isDeleting && item.isDestructive ? (
        <ActivityIndicator size="small" color="#FF4444" />
      ) : (
        <Icon
          name="chevron-forward"
          size={20}
          color={item.isDestructive ? "#FF4444" : "#999"}
        />
      )}
    </TouchableOpacity>
  );

  const renderMenuGroup = (groupItems, groupNumber) => (
    <View key={groupNumber} style={styles.menuGroup}>
      {groupItems.map((item, index) =>
        renderMenuItem(item, index === groupItems.length - 1)
      )}
    </View>
  );

  // Overlay Component
  const Overlay = () => {
    if (!overlayVisible) return null;
    
    return (
      <View style={styles.alertOverlay}>
        <View style={styles.alertContainer}>
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={hideCustomAlert}
            activeOpacity={0.7}
          >
            <Icon name="close" size={getResponsiveSize(20)} color="#fff" />
          </TouchableOpacity>

          {/* Icon */}
          <View style={[styles.alertIcon, { backgroundColor: getAlertColor(customAlert.type) + '20' }]}>
            {customAlert.showSpinner ? (
              <ActivityIndicator size="large" color={getAlertColor(customAlert.type)} />
            ) : (
              <Icon
                name={getAlertIcon(customAlert.type)}
                size={getResponsiveSize(40)}
                color={getAlertColor(customAlert.type)}
              />
            )}
          </View>

          {/* Title */}
          <Text style={styles.alertTitle}>{customAlert.title}</Text>

          {/* Message */}
          <Text style={styles.alertMessage}>{customAlert.message}</Text>

          {/* Privacy Policy Checkbox - Only show for delete account and privacy policy modals */}
          {(customAlert.title === 'Delete Account' || customAlert.title === 'Privacy Policy Confirmation' || customAlert.title === 'Privacy Policy Acceptance') && (
            <View style={styles.checkboxContainer}>
              <View style={styles.checkbox}>
                <TouchableOpacity
                  style={styles.checkboxTop}
                  onPress={() => setPrivacyPolicyAccepted(!privacyPolicyAccepted)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.checkboxBox,
                    privacyPolicyAccepted && styles.checkboxBoxChecked
                  ]}>
                    {privacyPolicyAccepted && (
                      <Icon name="checkmark" size={16} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxText}>
                    I have read and accept the privacy policy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkboxBottom}
                  onPress={() => {
                    openPrivacyPolicyPage();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.privacyPolicyLink}>
                    Read Privacy Policy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Buttons */}
          {customAlert.buttons.length > 0 && (
            <View style={styles.alertButtons}>
              {customAlert.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.alertButton,
                    button.style === 'primary' && styles.alertButtonPrimary,
                    button.style === 'secondary' && styles.alertButtonSecondary,
                    button.style === 'danger' && styles.alertButtonDanger,
                  ]}
                  onPress={button.onPress}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.alertButtonText,
                      button.style === 'primary' && styles.alertButtonTextPrimary,
                      button.style === 'secondary' && styles.alertButtonTextSecondary,
                      button.style === 'danger' && styles.alertButtonTextDanger,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Icon name="log-out-outline" size={20} color="#006C99" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCardContainer}>
        <View style={styles.profileCard}>
          <Image
            source={Profilebg}
            style={styles.profileBackgroundImage}
            resizeMode="cover"
          />
          <View style={styles.profileContent}>
            <Image
              source={profileImageUrl ? { uri: profileImageUrl } : require('../assests/images/Profile.png')}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{fullName || 'User'}</Text>
              <Text style={styles.profileEmail}>{email || mobileNumber || 'No email'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.menuContainer}>
          {[1, 2, 3, 4].map(groupNumber => {
            const groupItems = menuItems.filter(item => item.group === groupNumber);
            return groupItems.length > 0 ? renderMenuGroup(groupItems, groupNumber) : null;
          })}
        </View>
      </ScrollView>

      {/* Custom Alert Overlay */}
      <Overlay />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F8FF',
    borderWidth: 1,
    borderColor: '#E0F2FF',
  },
  logoutIcon: {
    marginRight: 6,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#006C99',
  },
  profileCardContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 30,
  },
  profileCard: {
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
    height: 120,
    minHeight: 120,
  },
  profileBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
    zIndex: 1,
    height: '100%',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  profileAddress: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.7,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuGroup: {
    backgroundColor: '#F6F8FA',
    borderRadius: 16,
    marginBottom: 20,
    shadowRadius: 4,
    overflow: 'hidden',
  },


  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
   
  },

  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  menuIconContainer: {
    marginRight: 15,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  destructiveMenuItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF4444',
  },
  destructiveMenuIcon: {
    tintColor: '#FF4444',
  },
  destructiveMenuTitle: {
    color: '#FF4444',
    fontWeight: '600',
  },

  // Custom Alert Styles
  alertOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 9999,
    elevation: 9999,
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10000,
    minHeight: 200,
    zIndex: 10000,
  },
  closeButton: {
    position: 'absolute',
    top: -10,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF8800',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  alertIconText: {
    fontSize: 40,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  alertMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  alertButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  alertButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  alertButtonPrimary: {
    backgroundColor: '#2196F3',
  },
  alertButtonSecondary: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  alertButtonDanger: {
    backgroundColor: '#F44336',
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertButtonTextPrimary: {
    color: '#fff',
  },
  alertButtonTextSecondary: {
    color: '#666',
  },
  alertButtonTextDanger: {
    color: '#fff',
  },

  // Checkbox Styles
  checkboxContainer: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  checkbox: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkboxTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxBottom: {
    alignItems: 'center',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxBoxChecked: {
    backgroundColor: '#FF8800',
    borderColor: '#FF8800',
  },
  checkboxText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  privacyPolicyLink: {
    fontSize: 14,
    color: '#FF8800',
    lineHeight: 20,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },

});