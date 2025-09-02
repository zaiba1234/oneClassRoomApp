import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import store from './src/Redux/store';
import { 
  initializeFirebaseMessaging, 
  sendFCMTokenToBackend,
  onMessageReceived,
  checkFirebaseStatus,
  getFirebaseApp
} from './src/services/firebaseConfig';
import { getFCMTokenService } from './src/services/fcmTokenService';
import { testFCMTokenGeneration, getFCMTokenInfo, testFirebaseConfig } from './src/services/fcmTest';
import SplashScreen from './src/Screen/SplashScreen';
import OnBoardScreen from './src/Screen/OnBoardScreen';
import LoginScreen from './src/Screen/LoginScreen';
import VerificationScreen from './src/Screen/VerificationScreen';
import RegisterScreen from './src/Screen/RegisterScreen';
import RegisteredPopupScreen from './src/Screen/RegisteredPopupScreen';
import CategoryScreen from './src/Screen/CategoryScreen';
import BottomTabNavigator from './src/Component/BottomTabBarNavigator';
import MyCoursesScreen from './src/Screen/MyCoursesScreen';
import PersonalInfoScreen from './src/Screen/PersonalInfoScreen';
import ContinueLearningScreen from './src/Screen/ContinueLearningScreen';
import NotificationScreen from './src/Screen/NotificationScreen';
import LessonVideoScreen from './src/Screen/LessonVideoScreen';
import PaymentGatewayScreen from './src/Screen/PaymentGatewayScreen';
import EnrollScreen from './src/Screen/EnrollScreen';
import DownloadCertificateScreen from './src/Screen/DownloadCertificateScreen';
import StudentScreen from './src/Screen/StudentScreen';
import ReviewScreen from './src/Screen/ReviewScreen';
import FeedbackScreen from './src/Screen/FeedbackScreen';
import BadgeCourseScreen from './src/Screen/BadgeCourseScreen';
import InvoiceHistoryScreen from './src/Screen/InvoiceHistoryScreen';
import SettingScreen from './src/Screen/SettingScreen';
import PrivacyPolicyScreen from './src/Screen/PrivacyPolicyScreen';
import TermsConditionScreen from './src/Screen/TermsConditionScreen';
import ContactUsScreen from './src/Screen/ContactUsScreen';
import SubCourseScreen from './src/Screen/SubCourseScreen';
import RazorpayPaymentScreen from './src/Screen/RazorpayPaymentScreen';
import CourseCertificateDownload from './src/Screen/CourseCertificateDownload';
import InternshipLetterScreen from './src/Screen/InternshipLetterScreen';

const Stack = createStackNavigator();

// Main App Component
const AppContent = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const fcmService = getFCMTokenService(store);

  useEffect(() => {
    console.log('🚀 App started!');
    
    // Simple Firebase initialization
    const initFirebase = async () => {
      try {
        console.log('🔥 App: Initializing Firebase messaging...');
        
        // Wait a bit for Firebase to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const fcmToken = await initializeFirebaseMessaging();
        
        if (fcmToken) {
          console.log('✅ App: FCM token generated successfully');
          console.log('🔑 App: FCM Token Value:', fcmToken);
          console.log('📏 App: Token Length:', fcmToken.length);
          console.log('👀 App: Token Preview:', fcmToken.substring(0, 50) + '...');
          
          // Send token to backend
          const sent = await fcmService.initializeAndSendToken();
          if (sent) {
            console.log('✅ App: FCM token sent to backend successfully');
          } else {
            console.log('ℹ️ App: FCM token will be sent after user login');
          }
        } else {
          console.log('❌ App: Failed to generate FCM token');
        }
      } catch (error) {
        console.error('💥 App: Error initializing Firebase:', error);
      }
    };

    // Set up message listener
    let unsubscribe = null;
    try {
      unsubscribe = onMessageReceived((remoteMessage) => {
        console.log('📨 App: Message received:', remoteMessage);
      });
    } catch (error) {
      console.error('💥 App: Error setting up message listener:', error);
    }

    // Initialize Firebase
    initFirebase();
    
    // Test FCM after 5 seconds
    setTimeout(() => {
      try {
        console.log('🧪 App: Testing FCM...');
        testFCMTokenGeneration()
          .then((success) => {
            console.log('🧪 App: FCM test result:', success ? 'SUCCESS' : 'FAILED');
          })
          .catch((error) => {
            console.error('💥 App: FCM test error:', error);
          });
      } catch (error) {
        console.error('💥 App: Error calling FCM test:', error);
      }
    }, 5000);

    // Add global test functions for debugging
    global.testFCM = () => testFCMTokenGeneration();
    global.checkFirebase = () => checkFirebaseStatus();
    global.testConfig = () => testFirebaseConfig();
    global.showFCMToken = async () => {
      try {
        const { getStoredFCMToken } = require('./src/services/firebaseConfig');
        const token = await getStoredFCMToken();
        if (token) {
          console.log('🔑 FCM Token:', token);
          console.log('🔑 Token Length:', token.length);
          console.log('🔑 Token Preview:', token.substring(0, 50) + '...');
          return token;
        } else {
          console.log('❌ No FCM token stored');
          return null;
        }
      } catch (error) {
        console.log('❌ Error getting FCM token:', error.message);
        return null;
      }
    };

    // Cleanup
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (error) {
          console.error('💥 App: Error cleaning up message listener:', error);
        }
      }
    };
  }, [dispatch, token]);

  // Effect to send FCM token when user logs in
  useEffect(() => {
    const sendTokenOnLogin = async () => {
      if (token) {
        try {
          console.log('🔔 App: User logged in, sending FCM token to backend...');
          const sent = await fcmService.sendStoredTokenToBackend();
          if (sent) {
            console.log('✅ App: FCM token sent to backend on login successfully');
          } else {
            console.log('ℹ️ App: No FCM token to send or failed to send');
          }
        } catch (error) {
          console.error('💥 App: Error sending FCM token on login:', error);
        }
      }
    };

    sendTokenOnLogin();
  }, [token, fcmService]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="OnBoard" component={OnBoardScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Verify" component={VerificationScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="RegisterPopup" component={RegisteredPopupScreen} />
        <Stack.Screen name="Category" component={CategoryScreen} />
        <Stack.Screen name="MyCourses" component={MyCoursesScreen} />
        <Stack.Screen name="Home" component={BottomTabNavigator} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="ContinueLearning" component={ContinueLearningScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="LessonVideo" component={LessonVideoScreen} />
        <Stack.Screen name="PaymentGateway" component={PaymentGatewayScreen} />
        <Stack.Screen name="Enroll" component={EnrollScreen} />
        <Stack.Screen name="DownloadCertificate" component={DownloadCertificateScreen} />
        <Stack.Screen name="Student" component={StudentScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        <Stack.Screen name="Setting" component={SettingScreen} />
        <Stack.Screen name="BadgeCourse" component={BadgeCourseScreen} />
        <Stack.Screen name="InvoiceHistory" component={InvoiceHistoryScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsCondition" component={TermsConditionScreen} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
        <Stack.Screen name="SubCourse" component={SubCourseScreen} />
        <Stack.Screen name="RazorpayPayment" component={RazorpayPaymentScreen} />
        <Stack.Screen name="CourseCertificate" component={CourseCertificateDownload} />
        <Stack.Screen name="Internship" component={InternshipLetterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

export default App;