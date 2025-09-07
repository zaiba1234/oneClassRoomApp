import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import HomeScreen from '../Screen/HomeScreen';
import CategoryScreen from '../Screen/CategoryScreen';
import MyCoursesScreen from '../Screen/MyCoursesScreen';
import LibraryScreen from '../Screen/LibraryScreen';
import FavouritesScreen from '../Screen/FavouritesScreen';
import ProfileScreen from '../Screen/ProfileScreen';


const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;

          if (route.name === 'Home') {
            iconSource = require('../assests/icons/main.png');
          } else if (route.name === 'Courses') {
            iconSource = require('../assests/icons/courses.png');
          } else if (route.name === 'Programs') {
            iconSource = require('../assests/icons/home.png');
          } else if (route.name === 'Favorites') {
            iconSource = require('../assests/icons/heart.png');
          } else if (route.name === 'Profile') {
            iconSource = require('../assests/icons/user.png');
          }

          return (
            <Image 
              source={iconSource} 
              style={[
                styles.tabIcon,
                { tintColor: color }
              ]}
              resizeMode="contain"
            />
          );
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#fff',
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom, 10) : insets.bottom,
            height: 80 + (Platform.OS === 'android' ? Math.max(insets.bottom, 10) : insets.bottom),
          }
        ],
        tabBarShowLabel: false,
        headerShown: false,
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 5,
        },
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

export default BottomTabNavigator;

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 8,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingTop: 10,
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarGradient: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabIcon: {
    width: 24,
    height: 24,
    alignSelf: 'center',
  },
});