// 🔇 Warning Suppression Utility
// This file suppresses Firebase deprecation warnings and other console warnings

import { LogBox } from 'react-native';

// Suppress specific Firebase warnings
const suppressFirebaseWarnings = () => {
  // Suppress Firebase deprecation warnings
  LogBox.ignoreLogs([
    'This method is deprecated',
    'React Native Firebase namespaced API',
    'migrating-to-v22',
    'getToken',
    'getApp',
    'getMessaging',
    'setBackgroundMessageHandler',
    'onMessage',
    'onTokenRefresh',
    'requestPermission'
  ]);

  // Suppress other common warnings
  LogBox.ignoreLogs([
    'VirtualizedLists should never be nested',
    'componentWillReceiveProps has been renamed',
    'componentWillMount has been renamed',
    'componentWillUpdate has been renamed',
    'Setting a timer for a long period of time',
    'Remote debugger is in a background tab',
    'Warning: Failed prop type',
    'Warning: Each child in a list should have a unique "key" prop'
  ]);

};

// Suppress all warnings (use with caution)
const suppressAllWarnings = () => {
  LogBox.ignoreAllLogs(true);
};

// Enable warnings again
const enableWarnings = () => {
  LogBox.ignoreAllLogs(false);
};

// Suppress only Firebase warnings
const suppressOnlyFirebaseWarnings = () => {
  LogBox.ignoreLogs([
    'This method is deprecated (as well as all React Native Firebase namespaced API)',
    'Please see migration guide for more details: https://rnfirebase.io/migrating-to-v22',
    'Please use `getApp()` instead',
    'Method called was `getToken`. Please use `getToken()` instead'
  ]);
};

export {
  suppressFirebaseWarnings,
  suppressAllWarnings,
  enableWarnings,
  suppressOnlyFirebaseWarnings
};

// Auto-suppress Firebase warnings on import
suppressOnlyFirebaseWarnings();
