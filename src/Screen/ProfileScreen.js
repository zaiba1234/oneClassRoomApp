import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Profilebg from '../assests/images/Profilebg.png';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import { logout, clearUserFromStorage } from '../Redux/userSlice';
import { useNavigation } from '@react-navigation/native';
import { getApiUrl } from '../API/config';


const ProfileScreen = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const nav = useNavigation();

  // State for refreshing
  const [refreshing, setRefreshing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get user data from Redux
  const { fullName, mobileNumber, _id, userId, profileImageUrl, address, email, token } = useAppSelector((state) => state.user);

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
      title: 'Invoice History',
      iconName: 'receipt-outline',
      iconColor: '#4CAF50',
      screenName: 'InvoiceHistory',
      group: 2,
    },
    {
      id: 3,
      title: 'Settings',
      iconName: 'settings-outline',
      iconColor: '#2196F3',
      screenName: 'Setting',
      group: 2,
    },
    {
      id: 4,
      title: 'Privacy and Policy',
      iconName: 'shield-checkmark-outline',
      iconColor: '#4CAF50',
      screenName: 'PrivacyPolicy',
      group: 3,
    },
    {
      id: 5,
      title: 'Terms and Condition',
      iconName: 'document-text-outline',
      iconColor: '#2196F3',
      screenName: 'TermsCondition',
      group: 3,
    },
    {
      id: 6,
      title: 'Contact Us',
      iconName: 'call-outline',
      iconColor: '#FF9800',
      screenName: 'ContactUs',
      group: 3,
    },
    {
      id: 7,
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
        console.log('Screen not implemented yet');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            // Clear from storage first, then logout
            await dispatch(clearUserFromStorage());
            dispatch(logout());
            nav.navigate('Login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // Show second confirmation
            Alert.alert(
              'Final Confirmation',
              'This is your last chance. Are you absolutely sure you want to delete your account?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Yes, Delete Forever',
                  style: 'destructive',
                  onPress: deleteAccountAPI,
                },
              ]
            );
          },
        },
      ]
    );
  };

  const deleteAccountAPI = async () => {
    try {
      setIsDeleting(true);
      console.log('🗑️ Starting account deletion process...');

      const apiUrl = getApiUrl('/api/user/profile/delete-profile');

      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Delete account response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Account deleted successfully:', result);

        Alert.alert(
          'Account Deleted',
          'Your account has been successfully deleted. We\'re sorry to see you go.',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Clear user data and navigate to login
                await dispatch(clearUserFromStorage());
                dispatch(logout());
                nav.navigate('Login');
              },
            },
          ]
        );
      } else {
        const errorData = await response.json();
        console.error('❌ Delete account failed:', errorData);

        Alert.alert(
          'Delete Failed',
          errorData.message || 'Failed to delete account. Please try again later.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('💥 Delete account error:', error);
      Alert.alert(
        'Error',
        'Something went wrong while deleting your account. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    console.log('🔄 ProfileScreen: Pull-to-refresh triggered');
    setRefreshing(true);

    // Simulate refresh delay and refresh user data
    setTimeout(() => {
      console.log('✅ ProfileScreen: Pull-to-refresh completed');
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
      {refreshing && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator size="small" color="#FF8800" />
          <Text style={styles.refreshText}>Refreshing...</Text>
        </View>
      )}

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
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  refreshText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#FF8800',
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



});