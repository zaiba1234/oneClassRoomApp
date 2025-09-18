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
import websocketService from './src/services/websocketService';
import notificationService from './src/services/notificationService';
import notificationChannelService from './src/services/notificationChannelService';
import websocketNotificationHandler from './src/services/websocketNotificationHandler';
import notificationTester from './src/services/notificationTester';
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

import CourseCertificateDownload from './src/Screen/CourseCertificateDownload';
import InternshipLetterScreen from './src/Screen/InternshipLetterScreen';

const Stack = createStackNavigator();

// Main App Component
const AppContent = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const fcmService = getFCMTokenService(store);
  const navigationRef = useRef(null);

  useEffect(() => {
    console.log('🚀 App started!');
    
    // Initialize WebSocket connection
    const initWebSocket = async () => {
      try {
        console.log('🔌 App: Initializing WebSocket connection...');
        
        // Get user ID from Redux store if available
        const state = store.getState();
        const userId = state.user?.user?._id || state.user?.user?.id;
        console.log('👤 App: User ID for WebSocket:', userId);
        
        // Set a timeout for WebSocket initialization
        const websocketTimeout = setTimeout(() => {
          console.warn('⏰ App: WebSocket initialization timeout - continuing without real-time features');
        }, 25000); // 25 seconds timeout
        
        await websocketService.connect(userId);
        clearTimeout(websocketTimeout);
        console.log('✅ App: WebSocket connection established successfully!');
        
        // Initialize WebSocket notification handler
        await websocketNotificationHandler.initialize();
        console.log('✅ App: WebSocket notification handler initialized!');
        
      } catch (error) {
        console.error('❌ App: WebSocket connection failed:', error);
        console.log('🛡️ App: App will continue without real-time features');
        
        // Set up periodic retry for WebSocket connection
        setTimeout(() => {
          console.log('🔄 App: Retrying WebSocket connection...');
          initWebSocket();
        }, 30000); // Retry after 30 seconds
      }
    };
    
    // Initialize notification system
    const initNotifications = async () => {
      try {
        console.log('🔔 App: Initializing notification system...');
        
        // Initialize notification channel service first (for Android)
        await notificationChannelService.initialize();
        console.log('✅ App: Notification channel service initialized!');
        
        // Initialize notification service
        await notificationService.initialize();
        console.log('✅ App: Notification service initialized!');
        
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

    // Initialize WebSocket and Notifications
    initWebSocket();
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
    
    // Add global WebSocket functions for debugging
    global.websocketStatus = () => {
      const status = websocketService.getConnectionStatus();
      console.log('🔌 WebSocket Status:', status);
      return status;
    };
    global.reconnectWebSocket = () => {
      const { _id, userId } = store.getState().user;
      const userIdentifier = _id || userId;
      console.log('🔄 Reconnecting WebSocket...');
      return websocketService.reconnect(userIdentifier);
    };
    global.disconnectWebSocket = () => {
      console.log('🔌 Disconnecting WebSocket...');
      websocketService.disconnect();
    };
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
      
      // Disconnect WebSocket and cleanup when app unmounts
      try {
        websocketService.disconnect();
        websocketNotificationHandler.cleanup();
        console.log('🔌 App: WebSocket disconnected and notification handler cleaned up on app unmount');
      } catch (error) {
        console.error('💥 App: Error disconnecting WebSocket:', error);
      }
    };
  }, [dispatch, token]);

  // Effect to send FCM token and join WebSocket room when user logs in
  useEffect(() => {
    const handleUserLogin = async () => {
      if (token) {
        try {
          console.log('🔔 App: User logged in, handling post-login tasks...');
          
          // Send FCM token to backend (only once when user logs in)
          console.log('🔔 App: Sending FCM token to backend...');
          const sent = await fcmService.sendStoredTokenToBackend();
          if (sent) {
            console.log('✅ App: FCM token sent to backend on login successfully');
          } else {
            console.log('ℹ️ App: No FCM token to send or failed to send');
          }
          
          // Join WebSocket user room
          console.log('🔌 App: Joining WebSocket user room...');
          const { _id, userId } = store.getState().user;
          const userIdentifier = _id || userId;
          
          if (userIdentifier) {
            websocketService.emit('join', { userId: userIdentifier });
            console.log('✅ App: Joined WebSocket user room:', userIdentifier);
          } else {
            console.log('⚠️ App: No user ID available for WebSocket room join');
          }
          
        } catch (error) {
          console.error('💥 App: Error handling user login tasks:', error);
        }
      } else {
        // User logged out, cleanup
        console.log('👋 App: User logged out, cleaning up...');
        websocketService.emit('leave', {});
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
      
        <Stack.Screen name="CourseCertificate" component={CourseCertificateDownload} />
        <Stack.Screen name="Internship" component={InternshipLetterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;