import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';

const RazorpayPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('processing');

  const options = route.params?.options;

  useEffect(() => {
    if (!options) {
      Alert.alert('Error', 'Payment options not found');
      navigation.goBack();
      return;
    }
  }, [options, navigation]);

  const generateRazorpayHTML = (options) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #FF6B35;
            margin-bottom: 20px;
          }
          .amount {
            font-size: 32px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          .currency {
            font-size: 18px;
            color: #666;
            margin-bottom: 20px;
          }
          .description {
            color: #666;
            margin-bottom: 30px;
          }
          .pay-button {
            background: #FF6B35;
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            margin-bottom: 20px;
          }
          .pay-button:hover {
            background: #e55a2b;
          }
          .loading {
            display: none;
            color: #666;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">Learning Saint</div>
          <div class="amount">₹${(options.amount / 100).toFixed(2)}</div>
          <div class="currency">${options.currency}</div>
          <div class="description">${options.description}</div>
          <button class="pay-button" onclick="initiatePayment()">Pay Now</button>
          <div class="loading" id="loading">Processing payment...</div>
        </div>

        <script>
          function initiatePayment() {
            document.getElementById('loading').style.display = 'block';
            
            const rzp = new Razorpay({
              key: '${options.key}',
              amount: ${options.amount},
              currency: '${options.currency}',
              name: '${options.name}',
              description: '${options.description}',
              order_id: '${options.order_id}',
              prefill: {
                email: '${options.prefill.email}',
                contact: '${options.prefill.contact}',
                name: '${options.prefill.name}'
              },
              theme: {
                color: '${options.theme.color}'
              },
              handler: function(response) {
                // Send success to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PAYMENT_SUCCESS',
                  data: response
                }));
              },
              modal: {
                ondismiss: function() {
                  // Send cancellation to React Native
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PAYMENT_CANCELLED',
                    data: null
                  }));
                }
              }
            });
            
            rzp.open();
          }
        </script>
      </body>
      </html>
    `;
  };

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('🔍 RazorpayPaymentScreen: Received message:', data);
      
      if (data.type === 'PAYMENT_SUCCESS') {
        console.log('✅ RazorpayPaymentScreen: Payment successful:', data.data);
        setPaymentStatus('success');
        
        // Resolve the payment promise
        if (global.razorpayResolve) {
          global.razorpayResolve(data.data);
          global.razorpayResolve = null;
          global.razorpayReject = null;
        }
        
        Alert.alert(
          'Payment Successful! 🎉',
          'Your payment has been completed successfully.',
          [
            {
              text: 'Continue',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else if (data.type === 'PAYMENT_CANCELLED') {
        console.log('❌ RazorpayPaymentScreen: Payment cancelled');
        setPaymentStatus('cancelled');
        
        // Reject the payment promise
        if (global.razorpayReject) {
          global.razorpayReject(new Error('PAYMENT_CANCELLED'));
          global.razorpayResolve = null;
          global.razorpayReject = null;
        }
        
        Alert.alert(
          'Payment Cancelled',
          'You cancelled the payment. You can try again anytime.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ RazorpayPaymentScreen: Error parsing message:', error);
    }
  };

  const handleError = (error) => {
    console.error('❌ RazorpayPaymentScreen: WebView error:', error);
    setPaymentStatus('error');
    
    Alert.alert(
      'Payment Error',
      'There was an error loading the payment page. Please try again.',
      [
        {
          text: 'Retry',
          onPress: () => {
            setIsLoading(true);
            webViewRef.current?.reload();
          }
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Gateway</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Loading payment gateway...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ html: generateRazorpayHTML(options) }}
        style={styles.webView}
        onMessage={handleMessage}
        onError={handleError}
        onLoadEnd={handleLoadEnd}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onNavigationStateChange={(navState) => {
          console.log('🔍 RazorpayPaymentScreen: Navigation state changed:', navState.url);
        }}
      />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  placeholder: {
    width: 60,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666666',
  },
});

export default RazorpayPaymentScreen;
