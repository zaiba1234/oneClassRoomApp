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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BackButton from '../Component/BackButton';

const ContactUsScreen = ({ navigation }) => {

  const handleCall = () => {
    Linking.openURL('tel:+12092682813');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:info@learningsaint.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Decorative Background Pattern */}
        <View style={styles.decorativePattern} />
        
                {/* Simple Contact Cards */}
        <View style={styles.simpleCardsContainer}>
          {/* Company Card */}
          <View style={styles.simpleCard}>
            <View style={styles.simpleIconContainer}>
              <Icon name="business" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.simpleCardContent}>
              <Text style={styles.simpleCardTitle}>Company Name</Text>
              <Text style={styles.simpleCardSubtitle}>Learning Saint Pvt. Ltd.</Text>
            </View>
          </View>

          {/* Email Card */}
          <TouchableOpacity style={styles.simpleCard} onPress={handleEmail}>
            <View style={styles.simpleIconContainer}>
              <Icon name="mail" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.simpleCardContent}>
              <Text style={styles.simpleCardTitle}>Email Us</Text>
              <Text style={styles.simpleCardSubtitle}>info@learningsaint.com</Text>
              <Text style={styles.simpleCardSubtitle}>contact@learningsaint.com</Text>
            </View>
          </TouchableOpacity>

          {/* Call Card */}
          <TouchableOpacity style={styles.simpleCard} onPress={handleCall}>
            <View style={styles.simpleIconContainer}>
              <Icon name="call" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.simpleCardContent}>
              <Text style={styles.simpleCardTitle}>Call Us</Text>
              <Text style={styles.simpleCardSubtitle}>9695913043</Text>
            </View>
          </TouchableOpacity>

          {/* Location Card */}
          <View style={styles.simpleCard}>
            <View style={styles.simpleIconContainer}>
              <Icon name="location" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.simpleCardContent}>
              <Text style={styles.simpleCardTitle}>Head Office</Text>
              <Text style={styles.simpleCardSubtitle}>Noida,H-70,sector 63</Text>
            </View>
          </View>
        </View>

        {/* Additional Office Locations */}
        <View style={styles.officeLocationsContainer}>
          <Text style={styles.sectionTitle}>Our Offices</Text>
          
          <View style={[styles.officeCard, styles.officeCardElevated]}>
            <View style={styles.officeIconContainer}>
              <Icon name="location" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.officeInfo}>
              <Text style={styles.officeTitle}>UK Office</Text>
              <Text style={styles.officeAddress}>13491, 182-184 High Street North, East Ham, London, E6 2JA, United Kingdom</Text>
            </View>
          </View>

          <View style={[styles.officeCard, styles.officeCardElevated]}>
            <View style={styles.officeIconContainer}>
              <Icon name="location" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.officeInfo}>
              <Text style={styles.officeTitle}>Registered Address</Text>
              <Text style={styles.officeAddress}>124 City Road, London, ECIV 2NX</Text>
            </View>
          </View>
        </View>

        {/* Office Hours */}
        <View style={styles.officeHoursContainer}>
          <Text style={styles.sectionTitle}>Office Hours</Text>
          <View style={[styles.officeHoursContent, styles.officeHoursElevated]}>
            <View style={styles.officeHoursRow}>
              <Text style={styles.officeHoursDay}>Monday - Sunday</Text>
              <Text style={styles.officeHoursTime}>24 / 7 Service</Text>
            </View>
            
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ContactUsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2C3E50',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  decorativePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
    opacity: 0.1,
  },
  // Simple Cards Container
  simpleCardsContainer: {
    padding: 20,
    paddingTop: 30,
  },

  // Simple Card
  simpleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#FF8800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  simpleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF8800',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  simpleCardContent: {
    flex: 1,
  },
  simpleCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  simpleCardSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 18,
  },

  officeLocationsContainer: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  officeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  officeCardElevated: {
    shadowColor: '#FF8800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  officeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF8800',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#FF8800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  officeInfo: {
    flex: 1,
  },
  officeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  officeAddress: {
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 20,
    fontWeight: '500',
  },
  officeHoursContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  officeHoursContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  officeHoursElevated: {
    shadowColor: '#FF8800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  officeHoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  officeHoursDay: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    letterSpacing: 0.2,
  },
  officeHoursTime: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
});