import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/Screen/SplashScreen';
import OnBoardScreen from './src/Screen/OnBoardScreen';
import LoginScreen from './src/Screen/LoginScreen';
import { NavigationContainer } from '@react-navigation/native'; 
import VerificationScreen from './src/Screen/VerificationScreen';
import RegisterScreen from './src/Screen/RegisterScreen';
import RegisteredPopupScreen from './src/Screen/RegisteredPopupScreen';
import CategoryScreen from './src/Screen/CategoryScreen';
import BottomTabNavigator from './src/Component/BottomTabBarNavigator';
import MyCoursesScreen from './src/Screen/MyCoursesScreen';
import PersonalInfoScreen from './src/Screen/PersonalInfoScreen';
import ContinueLearningScreen from './src/Screen/ContinueLearningScreen';
import NotificationScreen from './src/Screen/NotificationScreen';
import CourseDetailScreen from './src/Screen/CourseDetailScreen';
import LessonVideoScreen from './src/Screen/LessonVideoScreen';
import PaymentGatewayScreen from './src/Screen/PaymentGatewayScreen';
import EnrollScreen from './src/Screen/EnrollScreen';
import DownloadCertificateScreen from './src/Screen/DownloadCertificateScreen';
import StudentScreen from './src/Screen/StudentScreen';
import ReviewScreen from './src/Screen/ReviewScreen';
import FeedbackScreen from './src/Screen/FeedbackScreen';
import BadgeCourseScreen from './src/Screen/BadgeCourseScreen';
import PaymentSuccessfulScreen from './src/Screen/PaymentSuccessfulScreen';
import InvoiceHistoryScreen from './src/Screen/InvoiceHistoryScreen';
import SettingScreen from './src/Screen/SettingScreen';
import PrivacyPolicyScreen from './src/Screen/PrivacyPolicyScreen';
import TermsConditionScreen from './src/Screen/TermsConditionScreen';
import ContactUsScreen from './src/Screen/ContactUsScreen';
import SubCourseScreen from './src/Screen/SubCourseScreen';

const Stack = createStackNavigator();

const App = () => {
    
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
        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
        <Stack.Screen name="LessonVideo" component={LessonVideoScreen} />
        <Stack.Screen name="PaymentGateway" component={PaymentGatewayScreen} />
        <Stack.Screen name="Enroll" component={EnrollScreen} />
        <Stack.Screen name="DownloadCertificate" component={DownloadCertificateScreen} />
        <Stack.Screen name="Student" component={StudentScreen} />
        <Stack.Screen name="Review" component={ReviewScreen} />
        <Stack.Screen name="Feedback" component={FeedbackScreen} />
        <Stack.Screen name="PaymentSuccessful" component={PaymentSuccessfulScreen} />
        <Stack.Screen name="Setting" component={SettingScreen} />
        <Stack.Screen name="BadgeCourse" component={BadgeCourseScreen} />
        <Stack.Screen name="InvoiceHistory" component={InvoiceHistoryScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsCondition" component={TermsConditionScreen} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
        <Stack.Screen name="SubCourse" component={SubCourseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;