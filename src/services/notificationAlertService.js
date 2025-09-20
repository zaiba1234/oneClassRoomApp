import React from 'react';
import { Alert } from 'react-native';
import CustomAlert from '../Component/CustomAlert';

class NotificationAlertService {
  constructor() {
    this.alertRef = null;
    this.currentAlert = null;
  }

  // Set the alert reference
  setAlertRef(ref) {
    this.alertRef = ref;
  }

  // Show success notification
  showSuccess(title, message, options = {}) {
    this.showAlert({
      type: 'success',
      title,
      message,
      ...options,
    });
  }

  // Show error notification
  showError(title, message, options = {}) {
    this.showAlert({
      type: 'error',
      title,
      message,
      ...options,
    });
  }

  // Show warning notification
  showWarning(title, message, options = {}) {
    this.showAlert({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }

  // Show info notification
  showInfo(title, message, options = {}) {
    this.showAlert({
      type: 'info',
      title,
      message,
      ...options,
    });
  }

  // Show global notification alert
  showGlobalNotification(title, message, options = {}) {
    this.showAlert({
      type: 'info',
      title: title || 'Global Notification',
      message,
      showIcon: true,
      icon: '🌍',
      confirmText: 'View',
      showCancel: true,
      cancelText: 'Dismiss',
      autoClose: false,
      ...options,
    });
  }

  // Show course notification alert
  showCourseNotification(title, message, options = {}) {
    this.showAlert({
      type: 'success',
      title: title || 'Course Update',
      message,
      showIcon: true,
      icon: '📚',
      confirmText: 'View Course',
      showCancel: true,
      cancelText: 'Later',
      autoClose: false,
      ...options,
    });
  }

  // Show lesson notification alert
  showLessonNotification(title, message, options = {}) {
    this.showAlert({
      type: 'warning',
      title: title || 'New Lesson Available',
      message,
      showIcon: true,
      icon: '🎓',
      confirmText: 'Start Learning',
      showCancel: true,
      cancelText: 'Later',
      autoClose: false,
      ...options,
    });
  }

  // Show internship notification alert
  showInternshipNotification(title, message, options = {}) {
    this.showAlert({
      type: 'error',
      title: title || 'Internship Update',
      message,
      showIcon: true,
      icon: '💼',
      confirmText: 'View Details',
      showCancel: true,
      cancelText: 'Later',
      autoClose: false,
      ...options,
    });
  }

  // Generic alert method
  showAlert(alertConfig) {
    console.log('🔔 NotificationAlertService: Showing alert:', alertConfig);
    if (this.alertRef && typeof this.alertRef.show === 'function') {
      this.currentAlert = alertConfig;
      this.alertRef.show(alertConfig);
    } else {
      console.log('⚠️ NotificationAlertService: Alert ref not available, using fallback');
      // Fallback to native alert
      this.showNativeAlert(alertConfig);
    }
  }

  // Fallback to native alert
  showNativeAlert(alertConfig) {
    const { title, message, type, onConfirm, onCancel } = alertConfig;
    
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          onPress: onCancel,
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: onConfirm,
          style: type === 'error' ? 'destructive' : 'default',
        },
      ],
      { cancelable: true }
    );
  }

  // Hide current alert
  hide() {
    if (this.alertRef) {
      this.alertRef.hide();
    }
  }

  // Check if alert is visible
  isVisible() {
    return this.currentAlert !== null;
  }
}

// Create singleton instance
const notificationAlertService = new NotificationAlertService();

export default notificationAlertService;
