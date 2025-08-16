import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const PaymentSuccessfulScreen = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate the success icon on mount
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleDownload = () => {
    console.log('Download button pressed');
    // Add download logic here
  };

  const handleGetInvoice = () => {
    console.log('Get Invoice pressed');
    // Navigate to invoice screen or open invoice
    navigation.navigate('InvoiceHistory');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Payment Successful Text */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Payment Successful</Text>
      </View>
      

       {/* Success Animation */}
       <View style={styles.animationContainer}>
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Icon 
            name="checkmark-circle" 
            size={width * 0.25} 
            color="#4CAF50" 
          />
        </Animated.View>
      </View>

      {/* Main Content Area - Empty space for visual balance */}
      <View style={styles.contentArea} />

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {/* Download Button */}
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
          <LinearGradient
            colors={['#FFB300', '#FF8A00']}
            style={styles.gradientButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.downloadButtonText}>Download</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Get Invoice Link */}
        <TouchableOpacity style={styles.invoiceLink} onPress={handleGetInvoice}>
          <Text style={styles.invoiceLinkText}>Get Invoice</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentSuccessfulScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  contentArea: {
    flex: 1,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  downloadButton: {
    width: '100%',
    marginBottom: 20,
  },
  gradientButton: {
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  invoiceLink: {
    paddingVertical: 10,
  },
  invoiceLinkText: {
    color: '#FF8800',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});