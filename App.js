import React, { useEffect, useRef } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './src/Redux/store';
import { loadUserFromStorage } from './src/Redux/userSlice';

// Suppress Firebase warnings
import './src/utils/suppressWarnings';
import { 
  initializeFirebaseMessaging, 
  onMessageReceived
} from './src/services/firebaseConfig';
import { getFCMTokenService } from './src/services/fcmTokenService';
import { testFCMTokenGeneration } from './src/services/fcmTest';
import websocketService from './src/services/websocketService';
import notificationService from './src/services/notificationService';
import notificationChannelService from './src/services/notificationChannelService';
import websocketNotificationHandler from './src/services/websocketNotificationHandler';
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
    // Load user data from storage first
    const initializeApp = async () => {
      try {
        await dispatch(loadUserFromStorage());
      } catch (error) {
        // Handle error silently
      }
    };
    
    initializeApp();
    
    // Initialize WebSocket connection
    const initWebSocket = async () => {
      try {
        // Get user ID from Redux store if available
        const state = store.getState();
        const userId = state.user?.user?._id || state.user?.user?.id;
        
        await websocketService.connect(userId);
        
        // Initialize WebSocket notification handler
        await websocketNotificationHandler.initialize();
        
      } catch (error) {
        // Handle error silently
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
        
        // Wait a bit for Firebase to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const fcmToken = await initializeFirebaseMessaging();
        
        // FCM token generated, will be sent when user logs in
        
      } catch (error) {
        // Handle error silently
      }
    };

    // Set up message listener
    let unsubscribe = null;
    try {
      unsubscribe = onMessageReceived((remoteMessage) => {
        // Handle message silently
      });
    } catch (error) {
      // Handle error silently
    }

    // Initialize WebSocket and Notifications
    initWebSocket();
    initNotifications();
    
    // Test FCM after 5 seconds (silent test)
    setTimeout(() => {
      try {
        testFCMTokenGeneration()
          .then((success) => {
            // FCM test completed silently
          })
          .catch((error) => {
            // Handle error silently
          });
      } catch (error) {
        // Handle error silently
      }
    }, 5000);

    // Set global navigation reference for notification handlers
    global.navigationRef = navigationRef;

    // Cleanup
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (error) {
          // Handle error silently
        }
      }
      
      // Disconnect WebSocket and cleanup when app unmounts
      try {
        websocketService.disconnect();
        websocketNotificationHandler.cleanup();
      } catch (error) {
        // Handle error silently
      }
    };
  }, [dispatch, token]);

  // Effect to send FCM token and join WebSocket room when user logs in
  useEffect(() => {
    const handleUserLogin = async () => {
      if (token) {
        try {
          // Send FCM token to backend (only once when user logs in)
          await fcmService.sendStoredTokenToBackend();
          
          // Join WebSocket user room
          const { _id, userId } = store.getState().user;
          const userIdentifier = _id || userId;
          
          if (userIdentifier) {
            websocketService.emit('join', { userId: userIdentifier });
          }
          
        } catch (error) {
          // Handle error silently
        }
      } else {
        // User logged out, cleanup
        websocketService.emit('leave', {});
        await notificationService.cleanup();
        // Reset FCM token tracking
        fcmService.resetTokenTracking();
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