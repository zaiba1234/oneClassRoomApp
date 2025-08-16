import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Linking,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Orientation from 'react-native-orientation-locker';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Import local assets
const ArrowIcon = require('../assests/images/Arrow.png');
const PlayIcon = require('../assests/images/Course.png');
const StudentIcon = require('../assests/images/student.png');
const StarIcon = require('../assests/images/star.png');
const ClockIcon = require('../assests/images/Clock.png');
const CheckIcon = require('../assests/images/TickMark.png');
const WarningIcon = require('../assests/images/Danger.png');
const DownloadIcon = require('../assests/images/download.png');
const LessonsIcon = require('../assests/images/Lessons.png');
const CloseIcon = require('../assests/images/Close.png');

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Responsive scaling factors
const scale = width / 375;
const verticalScale = height / 812;

// Responsive font sizes
const getFontSize = (size) => size * scale;
const getVerticalSize = (size) => size * verticalScale;

const CourseDetailScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const webViewRef = useRef(null);

  // Trail video source
  const videoSource = {
    uri: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  };

  // Zoom meeting source
  const zoomMeetingUrl = 'https://us02web.zoom.us/j/123456789?pwd=abc123';

  // Mock course data
  const courseData = {
    title: '3D Design Basics',
    description: 'In this course you will learn how to build a space to a 3-dimensional product. There are 24 premium learning videos for you.',
    duration: '6h 30min',
    lessons: 24,
    enrollments: '4.569',
    rating: '4.9',
    price: '₹1.00',
    isBestSeller: true,
    isLive: true,
    liveTime: '02:32:45',
  };

  // Mock lessons data
  const lessons = [
    {
      id: 1,
      title: 'Introduction to 3D',
      duration: '20 mins',
      thumbnail: require('../assests/images/SavedImage.png'),
      isCompleted: true,
    },
    {
      id: 2,
      title: 'Basic 3D Modeling',
      duration: '25 mins',
      thumbnail: require('../assests/images/SavedImage.png'),
      isCompleted: false,
    },
    {
      id: 3,
      title: 'Advanced Techniques',
      duration: '30 mins',
      thumbnail: require('../assests/images/SavedImage.png'),
      isCompleted: false,
    },
  ];

  // Mock downloads data
  const downloads = [
    {
      id: 1,
      title: 'Download Course Completed',
      subtitle: 'Certificate',
    },
    {
      id: 2,
      title: 'Download Internship Letter',
      subtitle: 'Certificate',
    },
  ];

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

  const handleLiveClick = () => {
    Linking.openURL(zoomMeetingUrl).catch(err => console.log('Error opening Zoom:', err));
  };

  const handleStudentIconClick = () => {
    navigation.navigate('Student');
  };

  const handleStarIconClick = () => {
    navigation.navigate('Review');
  };

  const handleDownload = (download) => {
    console.log('Download clicked:', download.title);
    setShowDownloadModal(true);
  };

  const handleCloseModal = () => {
    setShowDownloadModal(false);
  };

  const handleContinueModal = () => {
    setShowDownloadModal(false);
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
    <View style={[styles.courseInfoContainer, isFullScreen && { display: 'none' }]}>
      <View style={styles.engagementMetrics}>
        <TouchableOpacity style={styles.metricItem} onPress={handleStudentIconClick}>
          <Image source={StudentIcon} style={styles.metricIcon} />
          <Text style={styles.metricText}>{courseData.enrollments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.metricItem} onPress={handleStarIconClick}>
          <Image source={StarIcon} style={styles.metricIcon} />
          <Text style={styles.metricText}>{courseData.rating}</Text>
        </TouchableOpacity>
        {courseData.isBestSeller && (
          <View style={styles.bestSellerBadge}>
            <Text style={styles.bestSellerText}>Best Seller</Text>
          </View>
        )}
        {courseData.isLive && (
          <TouchableOpacity style={styles.liveBadge} onPress={handleLiveClick}>
            <Text style={styles.liveText}>Live {courseData.liveTime}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.courseTitle}>{courseData.title}</Text>
      <Text style={styles.courseDescription}>{courseData.description}</Text>
      
      <View style={styles.courseStats}>
        <View style={styles.statItem}>
          <Image source={ClockIcon} style={styles.statIcon} />
          <Text style={styles.statText}>{courseData.duration}</Text>
        </View>
        <View style={styles.separator} />
        <Text style={styles.lessonsText}>{courseData.lessons} lessons</Text>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={[styles.tabsContainer, isFullScreen && { display: 'none' }]}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'lessons' && styles.activeTab]}
        onPress={() => setActiveTab('lessons')}
      >
        <Text style={[styles.tabText, activeTab === 'lessons' && styles.activeTabText]}>
          Lessons
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'downloads' && styles.activeTab]}
        onPress={() => setActiveTab('downloads')}
      >
        <Text style={[styles.tabText, activeTab === 'downloads' && styles.activeTabText]}>
          Downloads
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLessons = () => (
    <View style={styles.lessonsContainer}>
      {lessons.map((lesson) => (
        <TouchableOpacity 
          key={lesson.id} 
          style={styles.lessonItem}
          onPress={() => {
            console.log('Lesson clicked:', lesson.title);
            // Navigate to different screens based on lesson title
            if (lesson.title === 'Advanced Techniques') {
              navigation.navigate('Badge');
            } else {
              navigation.navigate('LessonVideo');
            }
          }}
        >
          <Image source={lesson.thumbnail} style={styles.lessonThumbnail} />
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <Text style={styles.lessonDuration}>{lesson.duration}</Text>
          </View>
          {lesson.isCompleted ? (
            <Image source={require('../assests/images/TickMark.png')} style={styles.checkIcon} />
          ) : (
            <MaterialIcons name="lock" size={getFontSize(24)} color="#666666" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDownloads = () => (
    <View style={styles.downloadsContainer}>
      {downloads.map((download) => (
        <View key={download.id} style={styles.downloadItem}>
          <View style={styles.downloadInfo}>
            <Text style={styles.downloadTitle}>{download.title}</Text>
            <Text style={styles.downloadSubtitle}>{download.subtitle}</Text>
          </View>
          <TouchableOpacity 
            style={styles.downloadButton}
            // onPress={() => handleDownload(download)}

            onPress={() => navigation.navigate('DownloadCertificate')}
          >
            <Image source={require('../assests/images/download.png')} style={styles.downloadIcon} />
          </TouchableOpacity>
        </View>
      ))}
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
        {/* Trail Video Player */}
        {renderVideoPlayer()}

        {/* Course Info */}
        {renderCourseInfo()}

        {/* Tabs */}
        {renderTabs()}

        {/* Content based on active tab */}
        {activeTab === 'lessons' ? renderLessons() : renderDownloads()}
      </ScrollView>

            {/* Enroll Button */}
          {/* <View style={styles.enrollButtonContainer}>
          <TouchableOpacity 
            style={styles.enrollButton}
            onPress={() => navigation.navigate('PaymentGateway')}
          >
            <Text style={styles.enrollButtonText}>Enroll - ₹1.00</Text>
          </TouchableOpacity>
        </View> */}


{/*  Modal code is here first complte the video then download in it  */}
      {/* Download Modal */}
      <Modal
        visible={showDownloadModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.warningIconContainer}>
              <Image source={WarningIcon} style={styles.warningIcon} resizeMode="contain" />
            </View>
            <Text style={styles.modalText}>
              First you have to complete Your course to download Cirtificate
            </Text>
            <TouchableOpacity 
              style={styles.modalContinueButton}
              onPress={handleContinueModal}
            >
              <Text style={styles.modalContinueButtonText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={handleCloseModal}
            >
              <Image source={CloseIcon} style={styles.closeIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginTop:30,
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
  engagementMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getVerticalSize(15),
    flexWrap: 'wrap',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: getVerticalSize(15),
  },
  metricIcon: {
    width: getFontSize(16),
    height: getFontSize(16),
    marginRight: getVerticalSize(5),
    resizeMode: 'contain',
  },
  metricText: {
    fontSize: getFontSize(14),
    color: '#666666',
  },
  bestSellerBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: getVerticalSize(8),
    paddingVertical: getVerticalSize(4),
    borderRadius: getFontSize(12),
    marginRight: getVerticalSize(10),
  },
  bestSellerText: {
    color: '#FFFFFF',
    fontSize: getFontSize(12),
    fontWeight: '600',
  },
  liveBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: getVerticalSize(8),
    paddingVertical: getVerticalSize(4),
    borderRadius: getFontSize(12),
    marginRight: getVerticalSize(10),
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: getFontSize(12),
    fontWeight: '600',
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
  courseStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: getVerticalSize(15),
  },
  statIcon: {
    width: getFontSize(16),
    height: getFontSize(16),
    marginRight: getVerticalSize(5),
    resizeMode: 'contain',
  },
  statText: {
    fontSize: getFontSize(14),
    color: '#666666',
  },
  separator: {
    width: 1,
    height: getFontSize(16),
    backgroundColor: '#E0E0E0',
    marginRight: getVerticalSize(15),
  },
  lessonsText: {
    fontSize: getFontSize(14),
    color: '#666666',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: getVerticalSize(20),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: getVerticalSize(15),
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF6B35',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    width: getFontSize(20),
    height: getFontSize(20),
    marginRight: getVerticalSize(8),
    resizeMode: 'contain',
    tintColor: '#666666',
  },
  activeTabIcon: {
    tintColor: '#FF6B35',
  },
  tabText: {
    fontSize: getFontSize(16),
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  lessonsContainer: {
    padding: getVerticalSize(20),
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getVerticalSize(15),
    padding: getVerticalSize(12),
    backgroundColor: '#F8F8F8',
    borderRadius: getFontSize(8),
  },
  lessonThumbnail: {
    width: getFontSize(60),
    height: getFontSize(60),
    borderRadius: getFontSize(6),
    marginRight: getVerticalSize(12),
  },
  tickMarkContainer: {
    width: getFontSize(60),
    height: getFontSize(40),
    borderRadius: getFontSize(6),
    marginRight: getVerticalSize(12),
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tickMarkIcon: {
    width: getFontSize(24),
    height: getFontSize(24),
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: getFontSize(16),
    fontWeight: '600',
    color: '#000000',
    marginBottom: getVerticalSize(4),
  },
  lessonDuration: {
    fontSize: getFontSize(14),
    color: '#666666',
  },
  completedBadge: {
    width: getFontSize(24),
    height: getFontSize(24),
    borderRadius: getFontSize(12),
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    width: getFontSize(24),
    height: getFontSize(24),
    resizeMode: 'contain',
    // tintColor: '#FFFFFF',
  },
  downloadsContainer: {
    padding: getVerticalSize(20),
  },
  downloadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getVerticalSize(15),
    padding: getVerticalSize(16),
    backgroundColor: '#E3F2FD',
    borderRadius: getFontSize(8),
  },
  downloadInfo: {
    flex: 1,
  },
  downloadTitle: {
    fontSize: getFontSize(16),
    fontWeight: '600',
    color: '#000000',
    marginBottom: getVerticalSize(4),
  },
  downloadSubtitle: {
    fontSize: getFontSize(14),
    color: '#666666',
  },
  downloadButton: {
    padding: getVerticalSize(8),
  },
  downloadIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadArrow: {
    fontSize: getFontSize(20),
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  downloadIcon: {
    width: getFontSize(24),
    height: getFontSize(24),
    tintColor: '#FF6B35',
    resizeMode: 'contain',
  },
  enrollButtonContainer: {
    position: 'absolute',
    bottom: getVerticalSize(20),
    left: getVerticalSize(20),
    right: getVerticalSize(20),
    backgroundColor: '#FF8800',
    paddingVertical: getVerticalSize(15),
    borderRadius: getFontSize(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  enrollButton: {
    width: '50%',
    paddingVertical: getVerticalSize(2),
    borderRadius: getFontSize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(18),
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#F6B800',
    borderRadius: getFontSize(20),
    padding: getFontSize(5),
    marginHorizontal: getFontSize(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    minWidth: getFontSize(280),
  },
  warningIconContainer: {
    marginBottom: getFontSize(20),
    alignItems: 'center',
  },
  warningIcon: {
    width: getFontSize(60),
    height: getFontSize(60),
  },
  modalText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    textAlign: 'center',
    lineHeight: getFontSize(24),
    marginBottom: getFontSize(25),
    fontWeight: '500',
  },
  modalContinueButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: getFontSize(10),
    paddingHorizontal: getFontSize(100),
    borderRadius: getFontSize(8),
    marginBottom: getFontSize(15),
    marginHorizontal: getFontSize(20),
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalContinueButtonText: {
    color: '#F6B800',
    fontSize: getFontSize(16),
    fontWeight: '700',
    textAlign: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: getFontSize(-15),
    right: getFontSize(0),
    width: getFontSize(35),
    height: getFontSize(35),
    borderRadius: getFontSize(17.5),
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  closeIcon: {
    width: getFontSize(20),
    height: getFontSize(20),
    resizeMode: 'contain',
  },
});
export default CourseDetailScreen;