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
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import { logout, clearUserFromStorage } from '../Redux/userSlice';
import { useNavigation } from '@react-navigation/native';
import { getApiUrl } from '../API/config';

const { width, height } = Dimensions.get('window');

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
      iconColor: '#4CAF50',
      screenName: 'PersonalInfo',
    },
   
    {
      id: 3,
      title: 'Invoice History',
      iconName: 'receipt-outline',
      iconColor: '#2196F3',
      screenName: 'InvoiceHistory',
    },
    {
      id: 4,
      title: 'Settings',
      iconName: 'settings-outline',
      iconColor: '#FF9800',
      screenName: 'Setting',
    },
         {
       id: 5,
       title: 'Privacy and Policy',
       iconName: 'shield-checkmark-outline',
       iconColor: '#9C27B0',
       screenName: 'PrivacyPolicy',
     },
     {
       id: 6,
       title: 'Terms and Condition',
       iconName: 'document-text-outline',
       iconColor: '#607D8B',
       screenName: 'TermsCondition',
     },
     {
       id: 7,
       title: 'Contact Us',
       iconName: 'mail-outline',
       iconColor: '#E91E63',
       screenName: 'ContactUs',
     },
     {
       id: 8,
       title: 'Delete Account',
       iconName: 'trash-outline',
       iconColor: '#FF4444',
       screenName: 'DeleteAccount',
       isDestructive: true,
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

  const renderMenuItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={[
        styles.menuItem,
        item.isDestructive && styles.destructiveMenuItem
      ]}
      onPress={() => handleMenuItemPress(item?.screenName)}
      disabled={isDeleting && item.isDestructive}
    >
      {item.imageSource ? (
        <Image 
          source={item.imageSource} 
          style={[
            styles.menuIcon,
            item.isDestructive && styles.destructiveMenuIcon
          ]} 
        />
      ) : (
        <Icon 
          name={item.iconName} 
          size={24} 
          color={item.iconColor || (item.isDestructive ? "#FF4444" : "#666")}
          style={styles.menuIconContainer}
        />
      )}
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
          color={item.isDestructive ? "#FF4444" : "#666"} 
        />
      )}
    </TouchableOpacity>
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
        <LinearGradient
          colors={['#FF8800', '#FFB800']}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Image 
            source={profileImageUrl ? { uri: profileImageUrl } : require('../assests/images/Profile.png')} 
            style={styles.profileImage} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{fullName || 'User'}</Text>
            <Text style={styles.profileEmail}>{email || mobileNumber || 'No email'}</Text>
            {address && <Text style={styles.profileAddress}>{address}</Text>}
          </View>
          <View style={styles.profileNumber}>
            <Text style={styles.numberText}>1</Text>
          </View>
        </LinearGradient>
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
          {menuItems.map((item) => renderMenuItem(item))}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
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
  profileNumber: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  numberText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
    opacity: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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