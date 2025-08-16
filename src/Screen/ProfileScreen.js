import React from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const menuItems = [
    {
      id: 1,
      title: 'Personal Info',
      imageSource: require('../assests/images/PersonalInfo.png'),
      screenName: 'PersonalInfo',
    },
    {
      id: 2,
      title: 'Payment Method',
      imageSource: require('../assests/images/PaymentMethod.png'),
      screenName: 'PaymentMethod',
    },
    {
      id: 3,
      title: 'Invoice History',
      imageSource: require('../assests/images/PaymentMethod.png'),
      screenName: 'InvoiceHistory',
    },
    {
      id: 4,
      title: 'Settings',
      imageSource: require('../assests/images/Setting.png'),
      screenName: 'Setting',
    },
         {
       id: 5,
       title: 'Privacy and Policy',
       imageSource: require('../assests/images/PrivacyPolicy.png'),
       screenName: 'PrivacyPolicy',
     },
     {
       id: 6,
       title: 'Terms and Condition',
       imageSource: require('../assests/images/TermsCondition.png'),
       screenName: 'TermsCondition',
     },
     {
       id: 7,
       title: 'Contact Us',
       imageSource: require('../assests/images/Contactus.png'),
       screenName: 'ContactUs',
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
      default:
        console.log('Screen not implemented yet');
    }
  };

  const renderMenuItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.menuItem}
      onPress={() => handleMenuItemPress(item?.screenName)}
    >
      <Image source={item.imageSource} style={styles.menuIcon} />
      <Text style={styles.menuTitle}>{item.title}</Text>
      <Icon name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.logoutButton}>
          <Image source={require('../assests/images/Logout.png')} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCardContainer}>
        <LinearGradient
          colors={['#FF8800', '#FFB800']}
          style={styles.profileCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Image source={require('../assests/images/Profile.png')} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>John Smith</Text>
            <Text style={styles.profileEmail}>John@gmail.com</Text>
          </View>
          <View style={styles.profileNumber}>
            <Text style={styles.numberText}>1</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Menu Items */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color:'#006C99'
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
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },

});