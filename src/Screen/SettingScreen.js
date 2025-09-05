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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const SettingScreen = ({ navigation }) => {
  const [fingerprintEnabled, setFingerprintEnabled] = useState(true);

  const handleLanguageSetting = () => {
    // Add language selection logic here
  };

  const handleNotificationSetting = () => {
    // Add notification settings navigation here
  };

  const handleFingerprintToggle = (value) => {
    setFingerprintEnabled(value);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={24} color="#FF8800" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Setting */}
        <TouchableOpacity style={styles.settingCard} onPress={handleLanguageSetting}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Language Setting</Text>
            <View style={styles.settingRight}>
              <Text style={styles.languageValue}>English</Text>
              <Icon name="chevron-down" size={20} color="#FF8800" />
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

        {/* Fingerprint Log In */}
        <View style={styles.settingCard}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Fingerprint Log In</Text>
            <Switch
              value={fingerprintEnabled}
              onValueChange={handleFingerprintToggle}
              trackColor={{ false: '#E0E0E0', true: '#FF8800' }}
              thumbColor={fingerprintEnabled ? '#FFFFFF' : '#FFFFFF'}
              ios_backgroundColor="#E0E0E0"
            />
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF8EF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
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