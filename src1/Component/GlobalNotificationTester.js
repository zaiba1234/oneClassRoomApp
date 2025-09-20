import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useAppSelector } from '../Redux/hooks';
import globalNotificationService from '../services/globalNotificationService';
import { getApiUrl } from '../API/config';

const GlobalNotificationTester = () => {
  const { token } = useAppSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [testTitle, setTestTitle] = useState('Test Global Notification');
  const [testBody, setTestBody] = useState('This is a test notification from the app');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadStoredNotifications();
    
    // Listen for new global notifications
    const handleGlobalNotification = (notification) => {
      console.log('📱 GlobalNotificationTester: New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
    };

    globalNotificationService.addListener(handleGlobalNotification);

    return () => {
      globalNotificationService.removeListener(handleGlobalNotification);
    };
  }, []);

  const loadStoredNotifications = async () => {
    try {
      const stored = await globalNotificationService.getStoredGlobalNotifications();
      setNotifications(stored);
    } catch (error) {
      console.error('❌ GlobalNotificationTester: Error loading notifications:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!token) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setIsLoading(true);
    try {
      const testNotification = {
        title: testTitle,
        body: testBody,
        data: {
          customData: {
            feature: 'Global Notification Test',
            version: '1.0.0',
            timestamp: new Date().toISOString()
          }
        }
      };

      const success = await globalNotificationService.sendGlobalNotification(token, testNotification);
      
      if (success) {
        Alert.alert('Success', 'Test notification sent successfully!');
      } else {
        Alert.alert('Error', 'Failed to send test notification');
      }
    } catch (error) {
      console.error('❌ GlobalNotificationTester: Error sending test notification:', error);
      Alert.alert('Error', 'Failed to send test notification');
    } finally {
      setIsLoading(false);
    }
  };

  const sendQuickTest = async () => {
    if (!token) {
      Alert.alert('Error', 'Please login first');
      return;
    }

    setIsLoading(true);
    try {
      const success = await globalNotificationService.testGlobalNotification(token);
      
      if (success) {
        Alert.alert('Success', 'Quick test notification sent successfully!');
      } else {
        Alert.alert('Error', 'Failed to send quick test notification');
      }
    } catch (error) {
      console.error('❌ GlobalNotificationTester: Error sending quick test:', error);
      Alert.alert('Error', 'Failed to send quick test notification');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateNotification = () => {
    try {
      const success = globalNotificationService.simulateGlobalNotification();
      if (success) {
        Alert.alert('Success', 'Simulated notification sent! Check if it appears.');
      } else {
        Alert.alert('Error', 'Failed to simulate notification');
      }
    } catch (error) {
      console.error('❌ GlobalNotificationTester: Error simulating notification:', error);
      Alert.alert('Error', 'Failed to simulate notification');
    }
  };

  const clearNotifications = () => {
    Alert.alert(
      'Clear Notifications',
      'Are you sure you want to clear all stored notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await globalNotificationService.cleanup();
              setNotifications([]);
              Alert.alert('Success', 'Notifications cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications');
            }
          }
        }
      ]
    );
  };

  const renderNotification = (notification, index) => (
    <View key={notification.id || index} style={styles.notificationItem}>
      <Text style={styles.notificationTitle}>{notification.title}</Text>
      <Text style={styles.notificationBody}>{notification.body}</Text>
      <Text style={styles.notificationTime}>
        {new Date(notification.timestamp).toLocaleString()}
      </Text>
      <Text style={styles.notificationType}>Type: {notification.type}</Text>
      {notification.data?.customData && (
        <Text style={styles.notificationData}>
          Data: {JSON.stringify(notification.data.customData, null, 2)}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Global Notification Tester</Text>
      
      {/* Test Controls */}
      <View style={styles.testSection}>
        <Text style={styles.sectionTitle}>Send Test Notification</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Notification Title"
          value={testTitle}
          onChangeText={setTestTitle}
        />
        
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notification Body"
          value={testBody}
          onChangeText={setTestBody}
          multiline
          numberOfLines={3}
        />
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={sendTestNotification}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending...' : 'Send Custom Test'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={sendQuickTest}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sending...' : 'Send Quick Test'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.tertiaryButton]}
          onPress={simulateNotification}
        >
          <Text style={styles.buttonText}>Simulate Local Notification</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <View style={styles.notificationsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Stored Notifications ({notifications.length})
          </Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearNotifications}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>No notifications stored</Text>
        ) : (
          notifications.map(renderNotification)
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  testSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#FF8800',
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
  },
  tertiaryButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationsSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  clearButton: {
    padding: 8,
    backgroundColor: '#dc3545',
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8800',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  notificationType: {
    fontSize: 12,
    color: '#FF8800',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationData: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    padding: 20,
  },
});

export default GlobalNotificationTester;
