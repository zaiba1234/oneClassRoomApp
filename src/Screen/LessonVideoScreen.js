import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Orientation from 'react-native-orientation-locker';
import LinearGradient from 'react-native-linear-gradient';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';

// Import local assets
const ArrowIcon = require('../assests/images/Arrow.png');
const PlayIcon = require('../assests/images/Course.png'); // Using existing course icon as placeholder
const SpeakerIcon = require('../assests/images/Home.png'); // Using home icon as placeholder for speaker
const SettingsIcon = require('../assests/images/Setting.png');
const FullscreenIcon = require('../assests/images/Arrow.png'); // Using arrow as fullscreen icon
const ClockIcon = require('../assests/images/Clock.png');

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Responsive scaling factors
const scale = width / 375; // Base width for iPhone 8
const verticalScale = height / 812; // Base height for iPhone 8

// Responsive font sizes
const getFontSize = (size) => size * scale;
const getVerticalSize = (size) => size * verticalScale;

const LessonVideoScreen = ({ navigation, route }) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const webViewRef = useRef(null);

  // Get lesson ID from route params
  const lessonId = route.params?.lessonId;
  
  // Get user data from Redux
  const { token } = useAppSelector((state) => state.user);

  // State for lesson data from API
  const [lessonData, setLessonData] = useState({
    introVideoUrl: '',
    lessonName: '',
    classLink: '',
    recordedVideoLink: '',
    date: '',
    desc: '',
    duration: '',
    startTime: '',
    endTime: '',
    LiveStatus: false,
  });

  const [isLoadingLesson, setIsLoadingLesson] = useState(true);
  const [lessonError, setLessonError] = useState(null);

  // State for time-based button logic
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showTimer, setShowTimer] = useState(true);

  // Fetch lesson data when component mounts
  useEffect(() => {
    if (lessonId && token) {
      fetchLessonDetails();
    } else {
      console.log('⚠️ LessonVideoScreen: No lessonId or token available');
      setIsLoadingLesson(false);
    }
  }, [lessonId, token]);

  // Function to calculate time remaining and button state
  const calculateTimeAndButtonState = () => {
    if (!lessonData.startTime) return;

    try {
      const now = new Date();
      const lessonDate = new Date(lessonData.date);
      const [startHour, startMinute] = lessonData.startTime.split(':');
      
      // Set the lesson start time for today
      const lessonStartTime = new Date(lessonDate);
      lessonStartTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
      
      // Calculate time difference in milliseconds
      const timeDiff = lessonStartTime.getTime() - now.getTime();
      
      console.log('⏰ LessonVideoScreen: Time calculation:', {
        now: now.toLocaleTimeString(),
        lessonStartTime: lessonStartTime.toLocaleTimeString(),
        timeDiff: timeDiff,
        timeDiffSeconds: Math.floor(timeDiff / 1000)
      });
      
      if (timeDiff > 0) {
        // Lesson hasn't started yet - button disabled
        setIsButtonEnabled(false);
        setShowTimer(true);
        
        // Calculate remaining time
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        setTimeRemaining(timeString);
        
        console.log('⏰ LessonVideoScreen: Button disabled, time remaining:', timeString);
      } else {
        // Lesson has started - button enabled
        setIsButtonEnabled(true);
        setShowTimer(false);
        setTimeRemaining('');
        
        console.log('⏰ LessonVideoScreen: Button enabled, lesson started');
      }
    } catch (error) {
      console.error('💥 LessonVideoScreen: Error calculating time:', error);
      // Default to enabled if there's an error
      setIsButtonEnabled(true);
      setShowTimer(false);
    }
  };

  // Update time and button state every second
  useEffect(() => {
    if (lessonData.startTime) {
      calculateTimeAndButtonState();
      
      const interval = setInterval(() => {
        calculateTimeAndButtonState();
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [lessonData.startTime, lessonData.date]);

  // Log button state changes for debugging
  useEffect(() => {
    console.log('🔘 LessonVideoScreen: Button state changed:', {
      isButtonEnabled,
      showTimer,
      timeRemaining,
      LiveStatus: lessonData.LiveStatus
    });
  }, [isButtonEnabled, showTimer, timeRemaining, lessonData.LiveStatus]);

  // Function to fetch lesson details from API
  const fetchLessonDetails = async () => {
    try {
      setIsLoadingLesson(true);
      setLessonError(null);
      
      console.log('🎬 LessonVideoScreen: Fetching lesson details for ID:', lessonId);
      console.log('🔑 LessonVideoScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
      const result = await courseAPI.getLessonById(token, lessonId);
      
      if (result.success && result.data.success) {
        const apiLesson = result.data.data;
        console.log('🎉 LessonVideoScreen: Lesson details received successfully!');
        console.log('📚 LessonVideoScreen: Lesson data:', apiLesson);
        
        setLessonData(apiLesson);
        
      } else {
        console.log('❌ LessonVideoScreen: Failed to fetch lesson details:', result.data?.message);
        setLessonError(result.data?.message || 'Failed to fetch lesson details');
      }
    } catch (error) {
      console.error('💥 LessonVideoScreen: Error fetching lesson details:', error);
      setLessonError(error.message || 'Network error occurred');
    } finally {
      setIsLoadingLesson(false);
    }
  };

  // Log lesson ID for debugging
  useEffect(() => {
    console.log('🎬 LessonVideoScreen: Received lessonId:', lessonId);
    console.log('🎬 LessonVideoScreen: Route params:', route.params);
    if (lessonId) {
      console.log('✅ LessonVideoScreen: Valid lessonId received, ready to load lesson');
    } else {
      console.log('⚠️ LessonVideoScreen: No lessonId received');
    }
  }, [lessonId, route.params]);

  // Video source from lesson data - fallback to default if not available
  const videoSource = lessonData.introVideoUrl 
    ? { uri: lessonData.introVideoUrl }
    : { uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' };

  // Use lesson data from API, fallback to default if not available
  const courseData = {
    title: lessonData.lessonName || 'Introduction to 3D',
    description: lessonData.desc || 'In this course you will learn how to build a space to a 3-dimensional product. There are 24 premium learning videos for you.',
    duration: lessonData.duration || '20 mins',
    isLive: lessonData.LiveStatus || false,
    liveTime: '02:32:45',
  };

  // Handle orientation and full-screen mode
  useEffect(() => {
    if (isFullScreen) {
      Orientation.lockToLandscape();
      StatusBar.setHidden(true);
    } else {
      Orientation.lockToPortrait();
      StatusBar.setHidden(false);
    }

    return () => {
      Orientation.unlockAllOrientations();
      StatusBar.setHidden(false);
    };
  }, [isFullScreen]);

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  // Handle button press based on LiveStatus
  const handleButtonPress = async () => {
    // Check if button is enabled
    if (!isButtonEnabled) {
      console.log('⚠️ LessonVideoScreen: Button is disabled, cannot proceed');
      return;
    }

    try {
      // First, mark the lesson as completed
      console.log('🎯 LessonVideoScreen: Marking lesson as completed for lessonId:', lessonId);
      const markResult = await courseAPI.markLessonCompleted(token, lessonId);
      
      if (markResult.success && markResult.data.success) {
        console.log('✅ LessonVideoScreen: Lesson marked as completed successfully!');
      } else {
        console.log('⚠️ LessonVideoScreen: Failed to mark lesson as completed:', markResult.data?.message);
        // Continue with the button action even if marking fails
      }
    } catch (error) {
      console.error('💥 LessonVideoScreen: Error marking lesson as completed:', error);
      // Continue with the button action even if marking fails
    }

    // Now handle the button action based on LiveStatus
    if (lessonData.LiveStatus) {
      // Live lesson - open Google Meet link
      if (lessonData.classLink) {
        console.log('🔗 LessonVideoScreen: Opening live class link:', lessonData.classLink);
        Linking.openURL(lessonData.classLink);
      } else {
        console.log('⚠️ LessonVideoScreen: No class link available for live lesson');
      }
    } else {
      // Recorded lesson - open recorded video link
      if (lessonData.recordedVideoLink) {
        console.log('🔗 LessonVideoScreen: Opening recorded video link:', lessonData.recordedVideoLink);
        Linking.openURL(lessonData.recordedVideoLink);
      } else {
        console.log('⚠️ LessonVideoScreen: No recorded video link available');
      }
    }
  };

  // Handle WebView messages for full-screen toggle
  const onMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.event === 'fullscreen') {
      setIsFullScreen(data.value);
    }
  };

  // JavaScript to inject into WebView to handle full-screen button
  const injectedJavaScript = `
    (function() {
      const video = document.querySelector('video');
      if (video) {
        video.addEventListener('webkitfullscreenchange', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            event: 'fullscreen',
            value: document.webkitIsFullScreen
          }));
        });
        video.addEventListener('fullscreenchange', () => {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            event: 'fullscreen',
            value: document.fullscreenElement !== null
          }));
        });
      }
    })();
    true;
  `;

  const renderVideoPlayer = () => (
    <View style={[styles.videoContainer, isFullScreen && styles.fullScreenVideoContainer]}>
      {isVideoPlaying ? (
        <WebView
          ref={webViewRef}
          source={videoSource}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          onMessage={onMessage}
          injectedJavaScript={injectedJavaScript}
          renderLoading={() => <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>Loading Video...</Text>}
        />
      ) : (
        <View style={styles.videoThumbnail}>
          <Image 
            source={require('../assests/images/Course.png')} 
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
          <View style={styles.thumbnailOverlay}>
            <Text style={styles.thumbnailText}>Video Preview</Text>
          </View>
        </View>
      )}
      {!isVideoPlaying && (
        <TouchableOpacity 
          style={styles.playButton}
          onPress={handlePlayVideo}
        >
          <View style={styles.playIconContainer}>
            <View style={styles.playTriangle} />
          </View>
        </TouchableOpacity>
      )}
      {isFullScreen && (
        <TouchableOpacity
          style={styles.exitFullScreenButton}
          onPress={() => {
            setIsFullScreen(false);
            if (webViewRef.current) {
              webViewRef.current.injectJavaScript(`
                document.exitFullscreen();
                true;
              `);
            }
          }}
        >
          <Text style={styles.exitFullScreenText}>Exit Full Screen</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCourseInfo = () => (
    <View style={styles.courseInfoContainer}>
      {/* Live Status and Timer */}
      <View style={styles.liveStatusContainer}>
        {lessonData.LiveStatus && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>Live</Text>
          </View>
        )}
        
        {/* Show timer only when lesson hasn't started */}
        {showTimer && timeRemaining && (
          <Text style={styles.liveTimeText}>Live In {timeRemaining}</Text>
        )}
      </View>

      {/* Course Title */}
      <Text style={styles.courseTitle}>{courseData.title}</Text>

      {/* Course Description */}
      <Text style={styles.courseDescription}>{courseData.description}</Text>

      {/* Course Duration */}
      <View style={styles.durationContainer}>
        <Image source={ClockIcon} style={styles.durationIcon} />
        <Text style={styles.durationText}>{courseData.duration}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" hidden={isFullScreen} />
      
      {/* Header */}
      {!isFullScreen && (
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image source={ArrowIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{courseData.title}</Text>
          <View style={styles.placeholder} />
        </View>
      )}

      <ScrollView 
        style={[styles.scrollView, isFullScreen && { display: 'none' }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingLesson ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading lesson details...</Text>
          </View>
        ) : lessonError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {lessonError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchLessonDetails}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Video Player */}
            {renderVideoPlayer()}

            {/* Course Info */}
            {renderCourseInfo()}
          </>
        )}
      </ScrollView>

      {/* Button - Join Now or Watch Now based on LiveStatus */}
      {!isFullScreen && (
        <View style={styles.joinButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.joinButton,
              !isButtonEnabled && styles.disabledButton
            ]}
            onPress={handleButtonPress}
            disabled={!isButtonEnabled}
          >
            <LinearGradient
              colors={isButtonEnabled ? ['#FF6B35', '#FFD93D'] : ['#CCCCCC', '#999999']}
              style={styles.joinButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[
                styles.joinButtonText,
                !isButtonEnabled && styles.disabledButtonText
              ]}>
                {!isButtonEnabled 
                  ? 'Lesson Not Started' 
                  : lessonData.LiveStatus 
                    ? 'Join Now' 
                    : 'Watch Now'
                }
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullScreenContainer: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getVerticalSize(20),
    paddingTop: Platform.OS === 'ios' ? getVerticalSize(10) : getVerticalSize(20),
    paddingBottom: getVerticalSize(15),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: getVerticalSize(8),
  },
  backIcon: {
    width: getFontSize(24),
    height: getFontSize(24),
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
  },
  placeholder: {
    width: getFontSize(40),
  },
  scrollView: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    height: getVerticalSize(250),
    position: 'relative',
    backgroundColor: '#000000',
  },
  fullScreenVideoContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  webView: {
    width: '100%',
    height: '100%',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailText: {
    color: '#FFFFFF',
    fontSize: getFontSize(18),
    fontWeight: 'bold',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -getFontSize(30) }, { translateY: -getFontSize(30) }],
  },
  playIconContainer: {
    width: getFontSize(60),
    height: getFontSize(60),
    borderRadius: getFontSize(30),
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: getFontSize(12),
    borderRightWidth: 0,
    borderBottomWidth: getFontSize(8),
    borderTopWidth: getFontSize(8),
    borderLeftColor: '#FFFFFF',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderTopColor: 'transparent',
    marginLeft: getFontSize(2),
  },
  exitFullScreenButton: {
    position: 'absolute',
    top: getVerticalSize(20),
    right: getVerticalSize(20),
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: getVerticalSize(10),
    borderRadius: getFontSize(5),
  },
  exitFullScreenText: {
    color: '#FFFFFF',
    fontSize: getFontSize(14),
    fontWeight: '600',
  },
  courseInfoContainer: {
    padding: getVerticalSize(20),
    backgroundColor: '#FFFFFF',
  },
  liveStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getVerticalSize(15),
  },
  liveBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: getVerticalSize(12),
    paddingVertical: getVerticalSize(6),
    borderRadius: getFontSize(16),
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: getFontSize(12),
    fontWeight: 'bold',
  },
  liveTimeText: {
    color: '#FF6B35',
    fontSize: getFontSize(14),
    fontWeight: '600',
  },
  liveIndicator: {
    marginLeft: getVerticalSize(10),
  },
  liveDot: {
    width: getFontSize(8),
    height: getFontSize(8),
    borderRadius: getFontSize(4),
    backgroundColor: '#FFFFFF',
  },
  courseTitle: {
    fontSize: getFontSize(24),
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: getVerticalSize(10),
  },
  courseDescription: {
    fontSize: getFontSize(16),
    color: '#666666',
    lineHeight: getFontSize(24),
    marginBottom: getVerticalSize(15),
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationIcon: {
    width: getFontSize(16),
    height: getFontSize(16),
    marginRight: getVerticalSize(8),
    resizeMode: 'contain',
  },
  durationText: {
    fontSize: getFontSize(14),
    color: '#666666',
  },
  joinButtonContainer: {
    padding: getVerticalSize(20),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  joinButton: {
    borderRadius: getFontSize(12),
    overflow: 'hidden',
  },
  joinButtonGradient: {
    paddingVertical: getVerticalSize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(18),
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getVerticalSize(20),
  },
  loadingText: {
    fontSize: getFontSize(18),
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getVerticalSize(20),
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: getFontSize(16),
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: getVerticalSize(15),
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: getVerticalSize(12),
    paddingHorizontal: getVerticalSize(25),
    borderRadius: getFontSize(10),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
  disabledButtonText: {
    color: '#999999',
  },
});

export default LessonVideoScreen;