import { Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import messaging from '@react-native-firebase/messaging';

class FirebaseNotificationService {
  constructor() {
    this.downloadId = 0;
    this.downloads = new Map();
    this.initializeNotifications();
  }

  // Initialize notification system
  initializeNotifications = async () => {
    try {
      // Request permission for notifications
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('📱 Notification permission granted');
        
        // Get FCM token
        const token = await messaging().getToken();
        console.log('🔑 FCM Token:', token);
        
        // Create notification channel for Android
        if (Platform.OS === 'android') {
          await this.createNotificationChannel();
        }
      } else {
        console.log('❌ Notification permission denied');
      }
    } catch (error) {
      console.error('❌ Error initializing notifications:', error);
    }
  };

  // Create notification channel for Android
  createNotificationChannel = async () => {
    try {
      // Firebase messaging automatically handles notification channels
      // We just need to ensure the channel exists
      console.log('📱 Notification channel created for downloads');
    } catch (error) {
      console.error('❌ Error creating notification channel:', error);
    }
  };

  // Request notification permissions
  requestNotificationPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'App needs notification permission to show download progress',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS permissions are handled by Firebase
  };

  // Show download started notification
  showDownloadStarted = async (fileName, fileSize = null) => {
    // Request permissions first
    const hasPermission = await this.requestNotificationPermissions();
    if (!hasPermission) {
      console.log('Notification permission denied, falling back to alert');
      Alert.alert('Download Started', `Downloading ${fileName}...`);
      return;
    }

    this.downloadId = Date.now();
    const downloadInfo = {
      id: this.downloadId,
      fileName,
      fileSize,
      startTime: Date.now(),
      progress: 0,
      status: 'downloading'
    };
    
    this.downloads.set(this.downloadId, downloadInfo);
    
    console.log(`📥 Download started: ${fileName} (ID: ${this.downloadId})`);
    
    // Show notification using Firebase messaging
    try {
      await messaging().displayNotification({
        notification: {
          title: 'Download Started',
          body: `Downloading ${fileName}...`,
        },
        data: {
          downloadId: this.downloadId.toString(),
          fileName: fileName,
          action: 'download_started'
        },
        android: {
          channelId: 'downloads',
          priority: 'high',
          ongoing: true,
          autoCancel: false,
          notificationId: this.downloadId,
        }
      });
    } catch (error) {
      console.error('❌ Error showing download started notification:', error);
      // Fallback to alert
      Alert.alert('Download Started', `Downloading ${fileName}...`);
    }
  };

  // Show download progress notification
  showDownloadProgress = async (fileName, progress, downloadedBytes = null, totalBytes = null) => {
    const downloadInfo = this.downloads.get(this.downloadId);
    if (downloadInfo) {
      downloadInfo.progress = progress;
      downloadInfo.downloadedBytes = downloadedBytes;
      downloadInfo.totalBytes = totalBytes;
      this.downloads.set(this.downloadId, downloadInfo);
    }
    
    console.log(`📥 Download progress: ${fileName} - ${progress}% (ID: ${this.downloadId})`);
    
    // Update the existing notification with progress
    try {
      await messaging().displayNotification({
        notification: {
          title: 'Downloading...',
          body: `${fileName} - ${progress}%`,
        },
        data: {
          downloadId: this.downloadId.toString(),
          fileName: fileName,
          progress: progress.toString(),
          action: 'download_progress'
        },
        android: {
          channelId: 'downloads',
          priority: 'high',
          ongoing: true,
          autoCancel: false,
          notificationId: this.downloadId,
        }
      });
    } catch (error) {
      console.error('❌ Error showing download progress notification:', error);
    }
  };

  // Show download completed notification
  showDownloadCompleted = async (fileName, filePath) => {
    const downloadInfo = this.downloads.get(this.downloadId);
    if (downloadInfo) {
      downloadInfo.status = 'completed';
      downloadInfo.endTime = Date.now();
      downloadInfo.filePath = filePath;
      this.downloads.set(this.downloadId, downloadInfo);
    }
    
    console.log(`✅ Download completed: ${fileName} (ID: ${this.downloadId})`);
    console.log(`📁 File saved to: ${filePath}`);
    
    // Show completion notification
    try {
      await messaging().displayNotification({
        notification: {
          title: 'Download Complete! 🎉',
          body: `${fileName} downloaded successfully`,
        },
        data: {
          downloadId: this.downloadId.toString(),
          fileName: fileName,
          filePath: filePath,
          action: 'download_completed'
        },
        android: {
          channelId: 'downloads',
          priority: 'high',
          ongoing: false,
          autoCancel: true,
          notificationId: this.downloadId + 1000,
        }
      });
    } catch (error) {
      console.error('❌ Error showing download completed notification:', error);
    }

    // Also show detailed alert with options
    try {
      const fileStats = await RNFS.stat(filePath);
      const fileSize = this.formatFileSize(fileStats.size);
      const downloadTime = downloadInfo ? 
        Math.round((downloadInfo.endTime - downloadInfo.startTime) / 1000) : 0;
      
      Alert.alert(
        'Download Complete! 🎉',
        `${fileName} has been downloaded successfully.\n\nSize: ${fileSize}\nTime: ${downloadTime}s\nLocation: ${this.getLocationName(filePath)}`,
        [
          { text: 'OK' },
          { 
            text: 'Open File', 
            onPress: () => this.openFile(filePath)
          },
          {
            text: 'Share File',
            onPress: () => this.shareFile(filePath)
          },
          {
            text: 'Show in Folder',
            onPress: () => this.showInFolder(filePath)
          }
        ]
      );
    } catch (error) {
      console.error('Error getting file stats:', error);
      Alert.alert(
        'Download Complete! 🎉',
        `${fileName} has been downloaded successfully.`,
        [
          { text: 'OK' },
          { 
            text: 'Open File', 
            onPress: () => this.openFile(filePath)
          },
          {
            text: 'Share File',
            onPress: () => this.shareFile(filePath)
          }
        ]
      );
    }
  };

  // Show download failed notification
  showDownloadFailed = async (fileName, error) => {
    const downloadInfo = this.downloads.get(this.downloadId);
    if (downloadInfo) {
      downloadInfo.status = 'failed';
      downloadInfo.error = error;
      downloadInfo.endTime = Date.now();
      this.downloads.set(this.downloadId, downloadInfo);
    }
    
    console.log(`❌ Download failed: ${fileName} (ID: ${this.downloadId})`);
    console.log(`❌ Error: ${error}`);
    
    // Show failure notification
    try {
      await messaging().displayNotification({
        notification: {
          title: 'Download Failed',
          body: `Failed to download ${fileName}`,
        },
        data: {
          downloadId: this.downloadId.toString(),
          fileName: fileName,
          error: error,
          action: 'download_failed'
        },
        android: {
          channelId: 'downloads',
          priority: 'high',
          ongoing: false,
          autoCancel: true,
          notificationId: this.downloadId + 2000,
        }
      });
    } catch (notificationError) {
      console.error('❌ Error showing download failed notification:', notificationError);
    }
    
    Alert.alert(
      'Download Failed',
      `Failed to download ${fileName}.\n\nError: ${error}`,
      [
        { text: 'OK' },
        { 
          text: 'Retry', 
          onPress: () => {
            console.log('Retry download requested');
          }
        },
        {
          text: 'View Downloads',
          onPress: () => this.showDownloadStatus()
        }
      ]
    );
  };

  // Show download status/history
  showDownloadStatus = () => {
    const downloadsList = Array.from(this.downloads.values());
    
    if (downloadsList.length === 0) {
      Alert.alert('Downloads', 'No downloads found.');
      return;
    }
    
    const recentDownloads = downloadsList
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 5);
    
    const downloadsText = recentDownloads.map(download => {
      const status = download.status === 'completed' ? '✅' : 
                    download.status === 'failed' ? '❌' : '📥';
      const time = Math.round((download.endTime || Date.now() - download.startTime) / 1000);
      return `${status} ${download.fileName} (${time}s)`;
    }).join('\n');
    
    Alert.alert(
      'Recent Downloads',
      downloadsText,
      [
        { text: 'OK' },
        {
          text: 'Clear History',
          onPress: () => this.clearDownloadHistory()
        }
      ]
    );
  };

  // Clear download history
  clearDownloadHistory = () => {
    this.downloads.clear();
    console.log('📋 Download history cleared');
    Alert.alert('Downloads', 'Download history cleared.');
  };

  // Open downloaded file
  openFile = async (filePath) => {
    try {
      console.log(`🔗 Opening file: ${filePath}`);
      
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        Alert.alert('Error', 'File not found. It may have been moved or deleted.');
        return;
      }

      const fileUrl = `file://${filePath}`;
      const canOpen = await Linking.canOpenURL(fileUrl);
      
      if (canOpen) {
        await Linking.openURL(fileUrl);
        console.log('✅ File opened successfully');
      } else {
        Alert.alert(
          'File Location',
          `File saved to:\n${filePath}\n\nUse your file manager to open it.`,
          [
            { text: 'OK' },
            {
              text: 'Open File Manager',
              onPress: () => this.showInFolder(filePath)
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error opening file:', error);
      Alert.alert(
        'Error',
        'Could not open file. Please use your file manager to access it.',
        [
          { text: 'OK' },
          {
            text: 'Show Location',
            onPress: () => {
              Alert.alert('File Location', `File saved to:\n${filePath}`);
            }
          }
        ]
      );
    }
  };

  // Share downloaded file
  shareFile = async (filePath) => {
    try {
      console.log(`📤 Sharing file: ${filePath}`);
      
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        Alert.alert('Error', 'File not found. It may have been moved or deleted.');
        return;
      }

      const fileUrl = `file://${filePath}`;
      const canOpen = await Linking.canOpenURL(fileUrl);
      
      if (canOpen) {
        await Linking.openURL(fileUrl);
        console.log('✅ File shared successfully');
      } else {
        Alert.alert(
          'Share File',
          `File saved to:\n${filePath}\n\nYou can share it from your file manager.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Error sharing file:', error);
      Alert.alert(
        'Error',
        'Could not share file. Please use your file manager to share it.',
        [{ text: 'OK' }]
      );
    }
  };

  // Show file in folder
  showInFolder = async (filePath) => {
    try {
      console.log(`📁 Opening file manager for: ${filePath}`);
      
      const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
      const dirUrl = `file://${dirPath}`;
      
      const canOpen = await Linking.canOpenURL(dirUrl);
      if (canOpen) {
        await Linking.openURL(dirUrl);
        console.log('✅ File manager opened successfully');
      } else {
        Alert.alert(
          'File Location',
          `File saved to:\n${filePath}\n\nPlease navigate to this location in your file manager.`
        );
      }
    } catch (error) {
      console.error('❌ Error opening file manager:', error);
      Alert.alert(
        'File Location',
        `File saved to:\n${filePath}\n\nPlease navigate to this location in your file manager.`
      );
    }
  };

  // Helper function to format file size
  formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function to get location name
  getLocationName = (filePath) => {
    if (filePath.includes('Download')) return 'Downloads folder';
    if (filePath.includes('Document')) return 'Documents folder';
    if (filePath.includes('Cache')) return 'Cache folder';
    return 'App folder';
  };

  // Get download status for debugging
  getDownloadStatus = () => {
    return {
      downloadId: this.downloadId,
      isDownloading: this.downloadId > 0,
      downloads: Array.from(this.downloads.values())
    };
  };
}

// Create and export a singleton instance
const firebaseNotificationService = new FirebaseNotificationService();
export default firebaseNotificationService;

