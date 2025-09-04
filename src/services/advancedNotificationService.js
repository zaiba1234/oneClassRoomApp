import { Alert, Linking, Platform, ToastAndroid } from 'react-native';
import RNFS from 'react-native-fs';

class AdvancedNotificationService {
  constructor() {
    this.downloadId = 0;
    this.downloads = new Map(); // Track multiple downloads
  }

  // Show download started notification
  showDownloadStarted = (fileName, fileSize = null) => {
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
    
    // Show system toast on Android
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        `📥 Downloading ${fileName}...`,
        ToastAndroid.LONG
      );
    }
    
    // Show alert with download info
    Alert.alert(
      'Download Started',
      `Downloading ${fileName}...\n${fileSize ? `Size: ${this.formatFileSize(fileSize)}` : ''}`,
      [
        { text: 'OK' },
        { 
          text: 'View Downloads', 
          onPress: () => this.showDownloadStatus()
        }
      ]
    );
  };

  // Show download progress notification
  showDownloadProgress = (fileName, progress, downloadedBytes = null, totalBytes = null) => {
    const downloadInfo = this.downloads.get(this.downloadId);
    if (downloadInfo) {
      downloadInfo.progress = progress;
      downloadInfo.downloadedBytes = downloadedBytes;
      downloadInfo.totalBytes = totalBytes;
      this.downloads.set(this.downloadId, downloadInfo);
    }
    
    console.log(`📥 Download progress: ${fileName} - ${progress}% (ID: ${this.downloadId})`);
    
    // Show progress toast on Android
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        `📥 ${fileName}: ${progress}%`,
        ToastAndroid.SHORT
      );
    }
  };

  // Show download completed notification
  showDownloadCompleted = (fileName, filePath) => {
    const downloadInfo = this.downloads.get(this.downloadId);
    if (downloadInfo) {
      downloadInfo.status = 'completed';
      downloadInfo.endTime = Date.now();
      downloadInfo.filePath = filePath;
      this.downloads.set(this.downloadId, downloadInfo);
    }
    
    console.log(`✅ Download completed: ${fileName} (ID: ${this.downloadId})`);
    console.log(`📁 File saved to: ${filePath}`);
    
    // Show completion toast on Android
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        `✅ ${fileName} downloaded successfully!`,
        ToastAndroid.LONG
      );
    }
    
    // Get file info
    RNFS.stat(filePath).then((fileStats) => {
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
    }).catch((error) => {
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
    });
  };

  // Show download failed notification
  showDownloadFailed = (fileName, error) => {
    const downloadInfo = this.downloads.get(this.downloadId);
    if (downloadInfo) {
      downloadInfo.status = 'failed';
      downloadInfo.error = error;
      downloadInfo.endTime = Date.now();
      this.downloads.set(this.downloadId, downloadInfo);
    }
    
    console.log(`❌ Download failed: ${fileName} (ID: ${this.downloadId})`);
    console.log(`❌ Error: ${error}`);
    
    // Show failure toast on Android
    if (Platform.OS === 'android') {
      ToastAndroid.show(
        `❌ Failed to download ${fileName}`,
        ToastAndroid.LONG
      );
    }
    
    Alert.alert(
      'Download Failed',
      `Failed to download ${fileName}.\n\nError: ${error}`,
      [
        { text: 'OK' },
        { 
          text: 'Retry', 
          onPress: () => {
            // This would need to be handled by the calling component
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
      .slice(0, 5); // Show last 5 downloads
    
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

  // Show file in folder
  showInFolder = async (filePath) => {
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
const advancedNotificationService = new AdvancedNotificationService();
export default advancedNotificationService;

