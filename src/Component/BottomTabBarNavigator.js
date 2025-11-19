import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, BackHandler, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import HomeScreen from '../Screen/HomeScreen.js';
import MyCoursesScreen from '../Screen/MyCoursesScreen.js';
import LibraryScreen from '../Screen/LibraryScreen.js';
import FavouritesScreen from '../Screen/FavouritesScreen.js';
import ProfileScreen from '../Screen/ProfileScreen.js';
import Bottom1Icon from '../assests/icons/Bottom1.js';
import Bottom2Icon from '../assests/icons/Bottom2.js';
import Bottom3Icon from '../assests/icons/Bottom3.js';
import Bottom4Icon from '../assests/icons/Bottom4.js';
import Bottom5Icon from '../assests/icons/Bottom5.js';
import { useAppSelector } from '../Redux/hooks';

const Tab = createBottomTabNavigator();

// Wrapper component - gesture navigation removed, only hardware back button handled
const BottomTabNavigatorWrapper = () => {
  return <BottomTabNavigator />;
};

const BottomTabNavigator = () => {
  const navigation = useNavigation();
  const { isAuthenticated, token } = useAppSelector((state) => state.user);
  
  // Handle hardware back button press - prevent going back to Login/Verify screens when logged in
  // Always navigate to Home page maximum, never go to verify/login pages
  useEffect(() => {
    const backAction = () => {
      // If user is logged in, handle back button
      if (isAuthenticated && token) {
        try {
          // Get root navigation state (from App.js Stack Navigator)
          const rootState = navigation.getRootState();
          const rootRoutes = rootState?.routes || [];
          const rootIndex = rootState?.index || 0;
          const currentRootRoute = rootRoutes[rootIndex];
          const currentRootRouteName = currentRootRoute?.name;
          
          console.log('🔙 [BottomTabNavigator] Back button pressed, current route:', currentRootRouteName);
          
          // Check if we're on Home screen (which contains BottomTabNavigator)
          if (currentRootRouteName === 'Home') {
            // Get the tab navigator state (nested inside Home)
            const tabState = currentRootRoute?.state;
            const tabRoutes = tabState?.routes || [];
            const tabIndex = tabState?.index || 0;
            const currentTabRoute = tabRoutes[tabIndex];
            const currentTabRouteName = currentTabRoute?.name;
            
            console.log('🔙 [BottomTabNavigator] On Home screen, current tab:', currentTabRouteName);
            
            // If on any tab screen other than Home (Courses, Programs, Favorites, Profile)
            // Navigate to Home tab when back button is pressed
            if (currentTabRouteName && currentTabRouteName !== 'Home') {
              console.log('🔙 [BottomTabNavigator] On tab screen:', currentTabRouteName, '- navigating to Home tab');
              // Navigate to Home tab - use the tab navigator's navigate method
              // Since we're inside Tab.Navigator, we need to get the tab navigator reference
              try {
                // Try to navigate using the current navigation object (should be tab navigator)
              navigation.navigate('Home');
                console.log('✅ [BottomTabNavigator] Successfully navigated to Home tab');
              } catch (navError) {
                console.log('⚠️ [BottomTabNavigator] Navigation error, trying alternative method:', navError);
                // Fallback: try to get parent and navigate
                const parentNav = navigation.getParent();
                if (parentNav) {
                  parentNav.navigate('Home');
                }
              }
              return true; // Prevent default back behavior
            }
            
            // If already on Home tab, allow default back behavior (will exit app or go to previous screen)
            if (currentTabRouteName === 'Home') {
              console.log('🔙 [BottomTabNavigator] Already on Home tab, allowing default back behavior');
              return false; // Allow default back behavior
            }
          }
          
          // If on nested screen (like EnrollScreen, LessonVideoScreen, etc.)
          // Check ALL routes in stack to see if any restricted screen exists
          const restrictedScreens = ['Login', 'Verify', 'OnBoard', 'Splash', 'Register', 'RegisterPopup'];
          let hasRestrictedScreen = false;
          
          // Check all routes in the stack
          for (let i = 0; i < rootRoutes.length; i++) {
            const route = rootRoutes[i];
            if (restrictedScreens.includes(route?.name)) {
              hasRestrictedScreen = true;
              console.log('🔙 [BottomTabNavigator] Found restricted screen in stack:', route?.name);
              break;
            }
          }
          
          // If any restricted screen exists in stack, navigate to Home instead of going back
          if (hasRestrictedScreen) {
            console.log('🔙 [BottomTabNavigator] Restricted screen found, navigating to Home instead');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
            return true; // Prevent default back behavior
          }
          
          // If on nested screen and no restricted screens in stack, allow normal back
          if (navigation.canGoBack()) {
            console.log('🔙 [BottomTabNavigator] Safe to go back, allowing normal back navigation');
            navigation.goBack();
            return true; // Prevent default back behavior
          } else {
            // No navigation stack - navigate to Home tab to prevent app exit
            console.log('🔙 [BottomTabNavigator] No navigation stack, navigating to Home');
            navigation.navigate('Home');
            return true; // Prevent default back behavior (don't exit app)
          }
        } catch (error) {
          console.log('⚠️ [BottomTabNavigator] Error in back handler:', error);
          // Fallback: navigate to Home
          navigation.navigate('Home');
          return true;
        }
      }
      // If not logged in, allow default back behavior (go to login/verify)
      return false;
    };

    // Only add back handler on Android
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
      return () => backHandler.remove();
    }
  }, [isAuthenticated, token, navigation]);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          if (route.name === 'Home') {
            IconComponent = Bottom1Icon;
          } else if (route.name === 'Courses') {
            IconComponent = Bottom2Icon;
          } else if (route.name === 'Programs') {
            IconComponent = Bottom3Icon;
          } else if (route.name === 'Favorites') {
            IconComponent = Bottom4Icon;
          } else if (route.name === 'Profile') {
            IconComponent = Bottom5Icon;
          }

          return (
            <IconComponent 
              width={28} 
              height={28} 
              color={focused ? '#FFFFFF' : '#fff'}
              filled={focused}
            />
          );
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#fff',
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarBackground: () => (
          <LinearGradient
            colors={['#FF8800', '#FFB800']}
            style={styles.tabBarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Courses" component={MyCoursesScreen} />
      <Tab.Screen name="Programs" component={LibraryScreen} />
      <Tab.Screen name="Favorites" component={FavouritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigatorWrapper;

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    height: 100,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingTop: 16,
    // Add equal spacing between icons
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // Add horizontal padding for proper spacing
  },
  tabBarGradient: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});