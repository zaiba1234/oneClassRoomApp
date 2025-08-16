import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import HomeScreen from '../Screen/HomeScreen';
import CategoryScreen from '../Screen/CategoryScreen';
import MyCoursesScreen from '../Screen/MyCoursesScreen';
import LibraryScreen from '../Screen/LibraryScreen';
import FavouritesScreen from '../Screen/FavouritesScreen';
import ProfileScreen from '../Screen/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconSource;

          if (route.name === 'Home') {
            iconSource = require('../assests/images/Home.png');
          } else if (route.name === 'Courses') {
            iconSource = require('../assests/images/Courses.png');
          } else if (route.name === 'Programs') {
            iconSource = require('../assests/images/Programs.png');
          } else if (route.name === 'Favorites') {
            iconSource = require('../assests/images/like.png');
          } else if (route.name === 'Profile') {
            iconSource = require('../assests/images/TabbarProfile.png');
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

export default BottomTabNavigator;

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    height: 80,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  tabBarGradient: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabIcon: {
    top:10,
    width: 24,
    height: 24,
  },
});