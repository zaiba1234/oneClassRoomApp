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
  console.log('🚀 RazorpayPaymentScreen: Component initialized');
  
  const navigation = useNavigation();
  const route = useRoute();
  const webViewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('processing');

  const options = route.params?.options;
  console.log('🔍 RazorpayPaymentScreen: Received options:', JSON.stringify(options, null, 2));

  useEffect(() => {
    console.log('🔄 RazorpayPaymentScreen: useEffect triggered');
    console.log('🔍 RazorpayPaymentScreen: Options validation:', {
      hasOptions: !!options,
      optionsKeys: options ? Object.keys(options) : [],
      hasKey: options?.key,
      hasAmount: options?.amount,
      hasOrderId: options?.order_id
    });
    
    if (!options) {
      console.log('❌ RazorpayPaymentScreen: No options provided');
      Alert.alert('Error', 'Payment options not found');
      navigation.goBack();
      return;
    }
    
    // Validate required options
    if (!options.key || !options.amount || !options.order_id) {
      console.log('❌ RazorpayPaymentScreen: Missing required options');
      console.log('❌ RazorpayPaymentScreen: key:', !!options.key, 'amount:', !!options.amount, 'order_id:', !!options.order_id);
      Alert.alert('Error', 'Invalid payment options. Missing required fields.');
      navigation.goBack();
      return;
    }
    
    console.log('✅ RazorpayPaymentScreen: Options validated successfully');
  }, [options, navigation]);

  const generateRazorpayHTML = (options) => {
    console.log('🔧 RazorpayPaymentScreen: Generating HTML with options:', JSON.stringify(options, null, 2));
    
    const html = `
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
          .error {
            display: none;
            color: #ff0000;
            margin-top: 20px;
            font-weight: bold;
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
          <div class="error" id="error"></div>
        </div>

        <script>
          console.log('🔧 RazorpayPaymentScreen: HTML loaded, setting up payment...');
          console.log('🔧 RazorpayPaymentScreen: Options in HTML:', ${JSON.stringify(options)});
          
          function initiatePayment() {
            console.log('🔘 RazorpayPaymentScreen: Pay Now button clicked!');
            console.log('🔧 RazorpayPaymentScreen: Starting payment initiation...');
            
            try {
              // Show loading
              document.getElementById('loading').style.display = 'block';
              document.getElementById('error').style.display = 'none';
              
              console.log('🔧 RazorpayPaymentScreen: Creating Razorpay instance...');
              console.log('🔧 RazorpayPaymentScreen: Key:', '${options.key}');
              console.log('🔧 RazorpayPaymentScreen: Amount:', ${options.amount});
              console.log('🔧 RazorpayPaymentScreen: Order ID:', '${options.order_id}');
              
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
                  console.log('✅ RazorpayPaymentScreen: Payment successful in HTML:', response);
                  // Send success to React Native
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'PAYMENT_SUCCESS',
                    data: response
                  }));
                },
                modal: {
                  ondismiss: function() {
                    console.log('🔒 RazorpayPaymentScreen: Modal dismissed in HTML');
                    // Send cancellation to React Native
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'PAYMENT_CANCELLED',
                      data: null
                    }));
                  }
                }
              });
              
              console.log('🔧 RazorpayPaymentScreen: Razorpay instance created, calling rzp.open()...');
              rzp.open();
              
              // Add error handling for Razorpay
              rzp.on('payment.failed', function (response) {
                console.log('❌ RazorpayPaymentScreen: Payment failed in HTML:', response);
                document.getElementById('error').textContent = 'Payment failed: ' + response.error.description;
                document.getElementById('error').style.display = 'block';
                document.getElementById('loading').style.display = 'none';
                
                // Send failure to React Native
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'PAYMENT_FAILED',
                  data: response
                }));
              });
              
              console.log('✅ RazorpayPaymentScreen: Payment initiation completed');
              
            } catch (error) {
              console.error('💥 RazorpayPaymentScreen: Error in initiatePayment:', error);
              document.getElementById('error').textContent = 'Error: ' + error.message;
              document.getElementById('error').style.display = 'block';
              document.getElementById('loading').style.display = 'none';
              
              // Send error to React Native
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'PAYMENT_ERROR',
                data: { error: error.message }
              }));
            }
          }
          
          // Auto-initiate payment when page loads
          window.onload = function() {
            console.log('🔄 RazorpayPaymentScreen: Page loaded, auto-initiating payment...');
            setTimeout(() => {
              console.log('🔧 RazorpayPaymentScreen: Auto-initiating payment after delay...');
              initiatePayment();
            }, 1000); // Wait 1 second for everything to load
          };
        </script>
      </body>
      </html>
    `;
    
    console.log('✅ RazorpayPaymentScreen: HTML generated successfully');
    return html;
  };

  const handleMessage = (event) => {
    try {
      console.log('📨 RazorpayPaymentScreen: Raw message received:', event.nativeEvent.data);
      const data = JSON.parse(event.nativeEvent.data);
      console.log('🔍 RazorpayPaymentScreen: Parsed message:', data);
      
      if (data.type === 'PAYMENT_SUCCESS') {
        console.log('✅ RazorpayPaymentScreen: Payment successful:', data.data);
        setPaymentStatus('success');
        
        // Resolve the payment promise
        if (global.razorpayResolve) {
          console.log('✅ RazorpayPaymentScreen: Resolving payment promise');
          global.razorpayResolve(data.data);
          global.razorpayResolve = null;
          global.razorpayReject = null;
        } else {
          console.log('⚠️ RazorpayPaymentScreen: No global resolve function found');
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
          console.log('❌ RazorpayPaymentScreen: Rejecting payment promise');
          global.razorpayReject(new Error('PAYMENT_CANCELLED'));
          global.razorpayResolve = null;
          global.razorpayReject = null;
        } else {
          console.log('⚠️ RazorpayPaymentScreen: No global reject function found');
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
      } else if (data.type === 'PAYMENT_FAILED') {
        console.log('❌ RazorpayPaymentScreen: Payment failed:', data.data);
        setPaymentStatus('failed');
        
        // Reject the payment promise
        if (global.razorpayReject) {
          console.log('❌ RazorpayPaymentScreen: Rejecting payment promise due to failure');
          global.razorpayReject(new Error('PAYMENT_FAILED'));
          global.razorpayResolve = null;
          global.razorpayReject = null;
        } else {
          console.log('⚠️ RazorpayPaymentScreen: No global reject function found');
        }
        
        Alert.alert(
          'Payment Failed',
          'Payment was not successful. Please try again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else if (data.type === 'PAYMENT_ERROR') {
        console.log('💥 RazorpayPaymentScreen: Payment error:', data.data);
        setPaymentStatus('error');
        
        // Reject the payment promise
        if (global.razorpayReject) {
          console.log('💥 RazorpayPaymentScreen: Rejecting payment promise due to error');
          global.razorpayReject(new Error(data.data.error || 'PAYMENT_ERROR'));
          global.razorpayResolve = null;
          global.razorpayReject = null;
        } else {
          console.log('⚠️ RazorpayPaymentScreen: No global reject function found');
        }
        
        Alert.alert(
          'Payment Error',
          'An error occurred during payment: ' + (data.data.error || 'Unknown error'),
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
      console.error('❌ RazorpayPaymentScreen: Raw message was:', event.nativeEvent.data);
    }
  };

  const handleError = (error) => {
    console.error('❌ RazorpayPaymentScreen: WebView error:', error);
    console.error('❌ RazorpayPaymentScreen: Error details:', {
      description: error.description,
      code: error.code,
      url: error.url
    });
    setPaymentStatus('error');
    
    Alert.alert(
      'Payment Error',
      'There was an error loading the payment page. Please try again.',
      [
        {
          text: 'Retry',
          onPress: () => {
            console.log('🔄 RazorpayPaymentScreen: Retrying payment page...');
            setIsLoading(true);
            webViewRef.current?.reload();
          }
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            console.log('❌ RazorpayPaymentScreen: User cancelled due to error');
            navigation.goBack();
          }
        }
      ]
    );
  };

  const handleLoadEnd = () => {
    console.log('✅ RazorpayPaymentScreen: WebView load completed');
    setIsLoading(false);
  };

  const handleLoadStart = () => {
    console.log('🔄 RazorpayPaymentScreen: WebView starting to load...');
    setIsLoading(true);
  };

  console.log('🎨 RazorpayPaymentScreen: Rendering component with status:', paymentStatus);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            console.log('⬅️ RazorpayPaymentScreen: Back button pressed');
            navigation.goBack();
          }}
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
        onLoadStart={handleLoadStart}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onNavigationStateChange={(navState) => {
          console.log('🔍 RazorpayPaymentScreen: Navigation state changed:', navState.url);
        }}
        onContentProcessDidTerminate={() => {
          console.log('⚠️ RazorpayPaymentScreen: Content process terminated');
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log('❌ RazorpayPaymentScreen: HTTP error:', nativeEvent);
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
