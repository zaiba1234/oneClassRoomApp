import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
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

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
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

export default BottomTabNavigator;

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