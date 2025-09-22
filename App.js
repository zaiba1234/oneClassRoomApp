import React, { useEffect, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './src/Redux/store';

// Suppress Firebase warnings
import './src/utils/suppressWarnings';
import { 
  initializeFirebaseMessaging, 
  sendFCMTokenToBackend,
  onMessageReceived,
  checkFirebaseStatus,
  getFirebaseApp
} from './src/services/firebaseConfig';
import { getFCMTokenService } from './src/services/fcmTokenService';
import { testFCMTokenGeneration, getFCMTokenInfo, testFirebaseConfig } from './src/services/fcmTest';
import notificationService from './src/services/notificationService';
import notificationTester from './src/services/notificationTester';
import globalNotificationService from './src/services/globalNotificationService';
import CustomAlertManager from './src/Component/CustomAlertManager';
import notificationAlertService from './src/services/notificationAlertService';
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
import GlobalNotificationTester from './src/Component/GlobalNotificationTester';

import CourseCertificateDownload from './src/Screen/CourseCertificateDownload';
import InternshipLetterScreen from './src/Screen/InternshipLetterScreen';

const Stack = createStackNavigator();

// Main App Component
const AppContent = ({ alertManagerRef }) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const fcmService = getFCMTokenService(store);
  const navigationRef = useRef(null);

  useEffect(() => {
    console.log('🚀 App started!');
    
    // Note: WebSocket removed - using Firebase push notifications only
    console.log('📱 App: Using Firebase push notifications only (WebSocket removed)');
    
    // Initialize notification system
    const initNotifications = async () => {
      try {
        console.log('🔔 App: Initializing notification system...');
        
        // Note: Using Firebase messaging only - no additional notification channel service needed
        console.log('✅ App: Firebase messaging initialized!');
        
        // Initialize notification service
        await notificationService.initialize();
        console.log('✅ App: Notification service initialized!');
        
        // Initialize global notification service
        await globalNotificationService.initialize();
        console.log('✅ App: Global notification service initialized!');
        
        // Set up custom alert service
        // Note: We'll set this up after the component mounts
        console.log('ℹ️ App: Custom alert service will be initialized after component mount');
        
        // Wait a bit for Firebase to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const fcmToken = await initializeFirebaseMessaging();
        
        if (fcmToken) {
          console.log('✅ App: FCM token generated successfully');
          console.log('🔑 App: FCM Token Value:', fcmToken);
          console.log('📏 App: Token Length:', fcmToken.length);
          console.log('👀 App: Token Preview:', fcmToken.substring(0, 50) + '...');
          
          // Just initialize FCM token, don't send to backend yet
          // Token will be sent when user logs in
          console.log('ℹ️ App: FCM token generated, will be sent after user login');
        } else {
          console.log('❌ App: Failed to generate FCM token');
        }
      } catch (error) {
        console.error('💥 App: Error initializing notifications:', error);
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

    // Initialize Notifications (Firebase only)
    initNotifications();
    
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
    
    // Set global navigation reference for notification handlers
    global.navigationRef = navigationRef;
    
    // Add notification testing functions
    global.testNotifications = () => notificationTester.runCompleteTest();
    global.quickStatus = () => notificationTester.quickStatusCheck();
    
    // Note: WebSocket functions removed - using Firebase push notifications only
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
      
      // Cleanup when app unmounts (Firebase only)
      try {
        console.log('📱 App: App unmounting - Firebase notifications will continue to work');
      } catch (error) {
        console.error('💥 App: Error during app unmount cleanup:', error);
      }
    };
  }, [dispatch, token]);

  // Effect to send FCM token and join WebSocket room when user logs in
  useEffect(() => {
    const handleUserLogin = async () => {
      if (token) {
        try {
          console.log('🔔 App: User logged in, handling post-login tasks...');
          
          // Note: FCM token is now sent in VerificationScreen after successful verification
          // No need to send it again here to avoid duplicate requests
          console.log('ℹ️ App: FCM token will be sent during verification process');
          
          // Note: WebSocket removed - using Firebase push notifications only
          console.log('📱 App: Firebase push notifications will be sent directly from backend');
          
        } catch (error) {
          console.error('💥 App: Error handling user login tasks:', error);
        }
      } else {
        // User logged out, cleanup
        console.log('👋 App: User logged out, cleaning up...');
        
        // Note: FCM token removal is now handled in ProfileScreen.js before logout
        // This ensures the user token is still available when removing FCM token
        console.log('ℹ️ App: FCM token removal handled in ProfileScreen before logout');
        
        // Clean up notification service (local cleanup only)
        await notificationService.cleanup();
      }
    };

    handleUserLogin();
  }, [token, fcmService]);

  return (
    <NavigationContainer ref={navigationRef}>
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
        <Stack.Screen name="GlobalNotificationTester" component={GlobalNotificationTester} />
      
        <Stack.Screen name="CourseCertificate" component={CourseCertificateDownload} />
        <Stack.Screen name="Internship" component={InternshipLetterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  const alertManagerRef = useRef(null);
  
  // Set up alert service when component mounts
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (alertManagerRef.current) {
        notificationAlertService.setAlertRef(alertManagerRef.current);
        console.log('✅ App: Custom alert service initialized!');
      }
    }, 1000); // Wait for component to mount
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent alertManagerRef={alertManagerRef} />
        <CustomAlertManager ref={alertManagerRef} />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;