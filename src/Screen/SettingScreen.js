import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Switch,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BackButton from '../Component/BackButton';
import GlobalNotificationTester from '../Component/GlobalNotificationTester';

const SettingScreen = ({ navigation }) => {
  const [fingerprintEnabled, setFingerprintEnabled] = useState(true);

  const handleLanguageSetting = () => {
    console.log('Language setting pressed');
    // Add language selection logic here
  };

  const handleNotificationSetting = () => {
    console.log('Notification setting pressed');
    navigation.navigate('Notification');
  };

  const handleFingerprintToggle = (value) => {
    setFingerprintEnabled(value);
    console.log('Fingerprint login:', value ? 'enabled' : 'disabled');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Setting */}
        <TouchableOpacity style={styles.settingCard} onPress={handleLanguageSetting}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Language </Text>
            <View style={styles.settingRight}>
              <Text style={styles.languageValue}>English</Text>
           
            </View>
          </View>
        </TouchableOpacity>

        {/* Notification Setting */}
        <TouchableOpacity style={styles.settingCard} onPress={handleNotificationSetting}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Notification Setting</Text>
            <Icon name="chevron-forward" size={20} color="#000000" />
          </View>
        </TouchableOpacity>

        {/* Global Notification Tester */}
        <TouchableOpacity style={styles.settingCard} onPress={() => navigation.navigate('GlobalNotificationTester')}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Global Notification Tester</Text>
            <Icon name="chevron-forward" size={20} color="#000000" />
          </View>
        </TouchableOpacity>

        
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 10,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF8800',
  },
}); 