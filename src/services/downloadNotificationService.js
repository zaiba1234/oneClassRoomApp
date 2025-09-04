import { Alert, Linking, Platform } from 'react-native';
import RNFS from 'react-native-fs';

class DownloadNotificationService {
  constructor() {
    this.downloadId = 0;
  }

  // Show download started notification
  showDownloadStarted = (fileName) => {
    this.downloadId = Date.now();
    console.log(`📥 Download started: ${fileName} (ID: ${this.downloadId})`);
    
    // For now, we'll use Alert as a notification
    // In a production app, you'd use a proper notification library
    Alert.alert(
      'Download Started',
      `Downloading ${fileName}...`,
      [
        { text: 'OK' }
      ]
    );
  };

  // Show download progress notification
  showDownloadProgress = (fileName, progress) => {
    console.log(`📥 Download progress: ${fileName} - ${progress}% (ID: ${this.downloadId})`);
    
    // Update progress in console for debugging
    // In production, you'd update the notification with progress
  };

  // Show download completed notification
  showDownloadCompleted = (fileName, filePath) => {
    console.log(`✅ Download completed: ${fileName} (ID: ${this.downloadId})`);
    console.log(`📁 File saved to: ${filePath}`);
    
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
  };

  // Show download failed notification
  showDownloadFailed = (fileName, error) => {
    console.log(`❌ Download failed: ${fileName} (ID: ${this.downloadId})`);
    console.log(`❌ Error: ${error}`);
    
    Alert.alert(
      'Download Failed',
      `Failed to download ${fileName}. Please try again.`,
      [
        { text: 'OK' }
      ]
    );
  };

  // Open downloaded file
  openFile = async (filePath) => {
    try {
      console.log(`🔗 Opening file: ${filePath}`);
      
      // Check if file exists
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        Alert.alert('Error', 'File not found. It may have been moved or deleted.');
        return;
      }

      // Try to open the file with system default app
      const fileUrl = `file://${filePath}`;
      const canOpen = await Linking.canOpenURL(fileUrl);
      
      if (canOpen) {
        await Linking.openURL(fileUrl);
        console.log('✅ File opened successfully');
      } else {
        // Fallback: show file location
        Alert.alert(
          'File Location',
          `File saved to:\n${filePath}\n\nUse your file manager to open it.`,
          [
            { text: 'OK' },
            {
              text: 'Open File Manager',
              onPress: () => this.openFileManager(filePath)
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
      
      // Check if file exists
      const fileExists = await RNFS.exists(filePath);
      if (!fileExists) {
        Alert.alert('Error', 'File not found. It may have been moved or deleted.');
        return;
      }

      // Try to share the file
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

  // Open file manager to the file location
  openFileManager = async (filePath) => {
    try {
      console.log(`📁 Opening file manager for: ${filePath}`);
      
      // Extract directory path
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

  // Get download status for debugging
  getDownloadStatus = () => {
    return {
      downloadId: this.downloadId,
      isDownloading: this.downloadId > 0
    };
  };
}

// Create and export a singleton instance
const downloadNotificationService = new DownloadNotificationService();
export default downloadNotificationService;

