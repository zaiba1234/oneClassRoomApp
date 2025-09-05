import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import BackButton from '../Component/BackButton';
import LinearGradient from 'react-native-linear-gradient';

const PrivacyPolicyScreen = ({ navigation }) => {
  const handleOpenPrivacyPolicy = async () => {
    const url = 'https://www.learningsaint.com/privacy-policy';
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open the privacy policy link');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open privacy policy');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Text style={styles.paragraph}>
            This Privacy Policy describes how we collect, use, and protect your personal information when you use our application.
          </Text>
          <Text style={styles.paragraph}>
            We collect information that you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
          </Text>
          <Text style={styles.paragraph}>
            We use the information we collect to provide, maintain, and improve our services, to communicate with you, and to develop new features.
          </Text>
          
          {/* View Full Privacy Policy Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={handleOpenPrivacyPolicy}
            >
              <LinearGradient
                colors={['#FF8A00', '#FFB300']}
                style={styles.gradientButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.buttonText}>View Full Privacy Policy</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyPolicyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#FF8A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  gradientButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 