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

// Wrapper component to handle gesture navigation at Stack Navigator level
const BottomTabNavigatorWrapper = () => {
  const navigation = useNavigation();
  const { isAuthenticated, token } = useAppSelector((state) => state.user);

  // Handle gesture navigation and prevent going back to Login/Verify screens
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return; // Don't set up listener if not logged in
    }

    console.log('🔔 [BottomTabNavigatorWrapper] Setting up beforeRemove listener for gestures');

    // Listen for beforeRemove event at Stack Navigator level (handles gestures)
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      console.log('🔔 [BottomTabNavigatorWrapper] beforeRemove event triggered (gesture or back button)');
      // Prevent default behavior of leaving the screen
      e.preventDefault();

      try {
        // Get root navigation state
        const rootState = navigation.getRootState();
        const rootRoutes = rootState?.routes || [];
        const rootIndex = rootState?.index || 0;
        const currentRootRoute = rootRoutes[rootIndex];
        const currentRootRouteName = currentRootRoute?.name;
        
        console.log('🔔 [BottomTabNavigatorWrapper] Current route:', currentRootRouteName);
        
        // Check if we're on Home screen (which contains BottomTabNavigator)
        if (currentRootRouteName === 'Home') {
          // Get the tab navigator state (nested inside Home)
          const tabState = currentRootRoute?.state;
          const tabRoutes = tabState?.routes || [];
          const tabIndex = tabState?.index || 0;
          const currentTabRoute = tabRoutes[tabIndex];
          const currentTabRouteName = currentTabRoute?.name;
          
          console.log('🔔 [BottomTabNavigatorWrapper] Current tab:', currentTabRouteName);
          
          // If on any tab screen, navigate to Home tab
          if (currentTabRouteName) {
            console.log('🔔 [BottomTabNavigatorWrapper] Navigating to Home tab');
            navigation.navigate('Home');
            return;
          }
        }
        
        // If on nested screen, check if going back would take us to Login/Verify
        if (navigation.canGoBack()) {
          const previousRootIndex = rootIndex - 1;
          if (previousRootIndex >= 0 && rootRoutes[previousRootIndex]) {
            const previousRootRoute = rootRoutes[previousRootIndex];
            const previousRootRouteName = previousRootRoute?.name;
            
            console.log('🔔 [BottomTabNavigatorWrapper] Previous route:', previousRootRouteName);
            
            // Prevent going back to Login/Verify screens
            const restrictedScreens = ['Login', 'Verify', 'OnBoard', 'Splash', 'Register', 'RegisterPopup'];
            if (restrictedScreens.includes(previousRootRouteName)) {
              // Navigate to Home instead
              console.log('🔔 [BottomTabNavigatorWrapper] Preventing back to restricted screen, navigating to Home');
              navigation.navigate('Home');
              return;
            }
          }
          
          // Safe to go back - dispatch the original action
          console.log('🔔 [BottomTabNavigatorWrapper] Safe to go back, dispatching action');
          navigation.dispatch(e.data.action);
        } else {
          // No navigation stack - navigate to Home
          console.log('🔔 [BottomTabNavigatorWrapper] No navigation stack, navigating to Home');
          navigation.navigate('Home');
        }
      } catch (error) {
        console.log('⚠️ [BottomTabNavigatorWrapper] Error in beforeRemove handler:', error);
        // Fallback: navigate to Home
        navigation.navigate('Home');
      }
    });

    return unsubscribe;
  }, [isAuthenticated, token, navigation]);

  return <BottomTabNavigator />;
};

const BottomTabNavigator = () => {
  const navigation = useNavigation();
  const { isAuthenticated, token } = useAppSelector((state) => state.user);
  
  // Handle gesture navigation and hardware back button - prevent going back to Login/Verify screens
  useEffect(() => {
    if (!isAuthenticated || !token) {
      return; // Don't set up listener if not logged in
    }

    // Listen for beforeRemove event (handles both gesture navigation and hardware back button)
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior of leaving the screen
      e.preventDefault();

      try {
        // Get root navigation state
        const rootState = navigation.getRootState();
        const rootRoutes = rootState?.routes || [];
        const rootIndex = rootState?.index || 0;
        const currentRootRoute = rootRoutes[rootIndex];
        const currentRootRouteName = currentRootRoute?.name;
        
        // Check if we're on Home screen (which contains BottomTabNavigator)
        if (currentRootRouteName === 'Home') {
          // Get the tab navigator state (nested inside Home)
          const tabState = currentRootRoute?.state;
          const tabRoutes = tabState?.routes || [];
          const tabIndex = tabState?.index || 0;
          const currentTabRoute = tabRoutes[tabIndex];
          const currentTabRouteName = currentTabRoute?.name;
          
          // If on any tab screen, navigate to Home tab
          if (currentTabRouteName) {
            navigation.navigate('Home');
            return;
          }
        }
        
        // If on nested screen, check if going back would take us to Login/Verify
        if (navigation.canGoBack()) {
          const previousRootIndex = rootIndex - 1;
          if (previousRootIndex >= 0 && rootRoutes[previousRootIndex]) {
            const previousRootRoute = rootRoutes[previousRootIndex];
            const previousRootRouteName = previousRootRoute?.name;
            
            // Prevent going back to Login/Verify screens
            const restrictedScreens = ['Login', 'Verify', 'OnBoard', 'Splash', 'Register', 'RegisterPopup'];
            if (restrictedScreens.includes(previousRootRouteName)) {
              // Navigate to Home instead
              navigation.navigate('Home');
              return;
            }
          }
          
          // Safe to go back - dispatch the original action
          navigation.dispatch(e.data.action);
        } else {
          // No navigation stack - navigate to Home
          navigation.navigate('Home');
        }
      } catch (error) {
        console.log('⚠️ [BottomTabNavigator] Error in beforeRemove handler:', error);
        // Fallback: navigate to Home
        navigation.navigate('Home');
      }
    });

    return unsubscribe;
  }, [isAuthenticated, token, navigation]);

  // Handle hardware back button press - prevent going back to Login/Verify screens when logged in
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
          
          // Check if we're on Home screen (which contains BottomTabNavigator)
          if (currentRootRouteName === 'Home') {
            // Get the tab navigator state (nested inside Home)
            const tabState = currentRootRoute?.state;
            const tabRoutes = tabState?.routes || [];
            const tabIndex = tabState?.index || 0;
            const currentTabRoute = tabRoutes[tabIndex];
            const currentTabRouteName = currentTabRoute?.name;
            
            // If on any tab screen (Home, Courses, Programs, Favorites, Profile)
            // Always navigate to Home tab (don't go back to Login/Verify)
            if (currentTabRouteName) {
              navigation.navigate('Home');
              return true; // Prevent default back behavior
            }
          }
          
          // If on nested screen (like EnrollScreen, LessonVideoScreen, etc.)
          // Check if going back would take us to Login/Verify screens
          if (navigation.canGoBack()) {
            // Get the previous route in root stack
            const previousRootIndex = rootIndex - 1;
            if (previousRootIndex >= 0 && rootRoutes[previousRootIndex]) {
              const previousRootRoute = rootRoutes[previousRootIndex];
              const previousRootRouteName = previousRootRoute?.name;
              
              // Prevent going back to Login/Verify screens
              const restrictedScreens = ['Login', 'Verify', 'OnBoard', 'Splash', 'Register', 'RegisterPopup'];
              if (restrictedScreens.includes(previousRootRouteName)) {
                // Navigate to Home instead of going back to Login/Verify
                navigation.navigate('Home');
                return true; // Prevent default back behavior
              }
            }
            
            // Safe to go back (won't go to Login/Verify)
            navigation.goBack();
            return true; // Prevent default back behavior
          } else {
            // No navigation stack - navigate to Home tab to prevent app exit
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

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
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