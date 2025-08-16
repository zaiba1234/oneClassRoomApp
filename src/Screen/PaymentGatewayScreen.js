import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Import local assets
const ArrowIcon = require('../assests/images/Arrow.png');

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Responsive scaling factors
const scale = width / 375;
const verticalScale = height / 812;

// Responsive font sizes
const getFontSize = (size) => size * scale;
const getVerticalSize = (size) => size * verticalScale;

const PaymentGatewayScreen = ({ navigation }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

  // Payment methods data
  const paymentMethods = [
    {
      id: 'upi',
      type: 'UPI',
      title: 'Pay Using UPI',
      logo: '💳',
      isSelected: selectedPaymentMethod === 'upi',
    },
    {
      id: 'mastercard',
      type: 'Mastercard',
      title: 'Personal',
      subtitle: '*******6193 | Secured',
      logo: '💳',
      isSelected: selectedPaymentMethod === 'mastercard',
    },
    {
      id: 'visa',
      type: 'Visa',
      title: 'Personal',
      subtitle: '*******9819 | Secured',
      logo: '💳',
      isSelected: selectedPaymentMethod === 'visa',
    },
  ];

  // Payment summary data
  const paymentSummary = {
    subtotal: 50.00,
    platformFees: 1.50,
    tax: 2.00,
    total: 53.50,
  };

  const handlePaymentMethodSelect = (methodId) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleAddCard = () => {
    console.log('Add card clicked');
    // Navigate to add card screen
  };

  const handleConfirmPayment = () => {
    console.log('Confirm payment clicked');
    // Navigate to payment processing or success screen
    navigation.navigate('PaymentSuccessful');
  };

  const renderPaymentMethod = (method) => (
    <TouchableOpacity
      key={method.id}
      style={[
        styles.paymentMethodItem,
        method.isSelected && styles.selectedPaymentMethod
      ]}
      onPress={() => handlePaymentMethodSelect(method.id)}
    >
      <View style={styles.paymentMethodLeft}>
        <View style={styles.paymentLogo}>
          <Text style={styles.paymentLogoText}>{method.logo}</Text>
        </View>
        <View style={styles.paymentMethodInfo}>
          <Text style={styles.paymentMethodTitle}>{method.title}</Text>
          {method.subtitle && (
            <Text style={styles.paymentMethodSubtitle}>{method.subtitle}</Text>
          )}
        </View>
      </View>
      {method.isSelected && (
        <View style={styles.selectedIndicator}>
          <Icon name="checkmark-circle" size={getFontSize(24)} color="#FF6B35" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={ArrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Payment Methods Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          
          {paymentMethods.map(renderPaymentMethod)}
          
          {/* Add Card Button */}
          <TouchableOpacity style={styles.addCardButton} onPress={handleAddCard}>
            <Icon name="add-circle-outline" size={getFontSize(24)} color="#2196F3" />
            <Text style={styles.addCardText}>Add credit or debit cards</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Summary Section */}
        <View style={styles.paymentSummaryContainer}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>${paymentSummary.subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Fees</Text>
            <Text style={styles.summaryValue}>${paymentSummary.platformFees.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax (4%)</Text>
            <Text style={styles.summaryValue}>${paymentSummary.tax.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>${paymentSummary.total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Payment Button */}
      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
          <Text style={styles.confirmButtonText}>Confirm Payment</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getVerticalSize(20),
    paddingTop: Platform.OS === 'ios' ? getVerticalSize(10) : getVerticalSize(20),
    paddingBottom: getVerticalSize(15),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: getVerticalSize(8),
  },
  backIcon: {
    width: getFontSize(24),
    height: getFontSize(24),
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  placeholder: {
    width: getFontSize(40),
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: getVerticalSize(20),
  },
  sectionTitle: {
    fontSize: getFontSize(18),
    fontWeight: '600',
    color: '#000000',
    marginBottom: getVerticalSize(20),
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getVerticalSize(16),
    backgroundColor: '#F8F8F8',
    borderRadius: getFontSize(12),
    marginBottom: getVerticalSize(12),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPaymentMethod: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F0',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentLogo: {
    width: getFontSize(40),
    height: getFontSize(40),
    borderRadius: getFontSize(8),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getVerticalSize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentLogoText: {
    fontSize: getFontSize(20),
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: getFontSize(16),
    fontWeight: '600',
    color: '#000000',
    marginBottom: getVerticalSize(4),
  },
  paymentMethodSubtitle: {
    fontSize: getFontSize(14),
    color: '#666666',
  },
  selectedIndicator: {
    marginLeft: getVerticalSize(12),
  },
  addCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: getVerticalSize(16),
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: getFontSize(12),
    backgroundColor: '#FFFFFF',
    marginTop: getVerticalSize(8),
  },
  addCardText: {
    fontSize: getFontSize(16),
    color: '#2196F3',
    fontWeight: '600',
    marginLeft: getVerticalSize(8),
  },
  paymentSummaryContainer: {
    margin: getVerticalSize(20),
    padding: getVerticalSize(20),
    backgroundColor: '#FFF8E1',
    borderRadius: getFontSize(16),
  },
  summaryTitle: {
    fontSize: getFontSize(18),
    fontWeight: '600',
    color: '#000000',
    marginBottom: getVerticalSize(20),
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getVerticalSize(12),
  },
  summaryLabel: {
    fontSize: getFontSize(16),
    color: '#666666',
  },
  summaryValue: {
    fontSize: getFontSize(16),
    color: '#000000',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: getVerticalSize(16),
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryTotalLabel: {
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#000000',
  },
  summaryTotalValue: {
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#000000',
  },
  confirmButtonContainer: {
    padding: getVerticalSize(20),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: getVerticalSize(16),
    borderRadius: getFontSize(12),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(18),
    fontWeight: 'bold',
  },
});

export default PaymentGatewayScreen; 