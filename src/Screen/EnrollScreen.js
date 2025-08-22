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
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';
import { getApiUrl } from '../API/config';

// Import local assets
const ArrowIcon = require('../assests/images/Arrow.png');
const PlayIcon = require('../assests/images/Course.png');
const StudentIcon = require('../assests/images/student.png');
const StarIcon = require('../assests/images/star.png');
const ClockIcon = require('../assests/images/Clock.png');
const CheckIcon = require('../assests/images/TickMark.png');
const WarningIcon = require('../assests/images/Danger.png');

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Responsive scaling factors
const scale = width / 375;
const verticalScale = height / 812;

// Responsive font sizes
const getFontSize = (size) => size * scale;
const getVerticalSize = (size) => size * verticalScale;

const EnrollScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const webViewRef = useRef(null);

  // Get user data from Redux
  const { token } = useAppSelector((state) => state.user);

  // Get course ID from route params
  const courseId = route.params?.courseId;

  // State for course data from API
  const [courseData, setCourseData] = useState({
    title: 'Loading...',
    description: 'Loading course details...',
    duration: 'Loading...',
    lessons: 0,
    enrollments: '0',
    rating: '0',
    price: '₹1.00',
    isBestSeller: false,
    isLive: false,
    liveTime: '00:00:00',
    introVideoUrl: '',
    totalStudentsEnrolled: 0,
    totalDuration: '',
    subCourseDescription: '',
    totalLessons: 0,
    lessons: [],
    paymentStatus: false, // Add paymentStatus to track enrollment
    isCompleted: false, // Add isCompleted flag initialization
  });

  const [isLoadingCourse, setIsLoadingCourse] = useState(true);
  const [courseError, setCourseError] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false); // Add loading state for enrollment

  // Fetch course data when component mounts
  useEffect(() => {
    if (courseId && token) {
      fetchCourseDetails();
    }
  }, [courseId, token]);

  // Log lessons data for debugging
  useEffect(() => {
    console.log('🔍 EnrollScreen: Raw lessons data:', courseData.lessons);
  }, [courseData.lessons]);

  // Function to fetch course details from API
  const fetchCourseDetails = async () => {
    try {
      setIsLoadingCourse(true);
      setCourseError(null);
      
      console.log('🏠 EnrollScreen: Fetching course details for ID:', courseId);
      console.log('🔑 EnrollScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
      const result = await courseAPI.getSubcourseById(token, courseId);
      
      console.log('📡 EnrollScreen: Raw API response:', result);
      
      if (result.success && result.data.success) {
        const apiCourse = result.data.data;
        console.log('🎉 EnrollScreen: Course details received successfully!');
        console.log('📚 EnrollScreen: Course data:', apiCourse);
        
        const transformedCourse = {
          title: apiCourse.subcourseName || 'Course Title',
          description: apiCourse.subCourseDescription || 'No description available',
          duration: apiCourse.totalDuration || '0h 0min',
          lessons: apiCourse.totalLessons || 0,
          enrollments: apiCourse.totalStudentsEnrolled?.toString() || '0',
          rating: apiCourse.avgRating?.toString() || '0',
          price: '₹1.00',
          isBestSeller: apiCourse.isBestSeller || false,
          isLive: false,
          liveTime: '00:00:00',
          introVideoUrl: apiCourse.introVideoUrl || '',
          totalStudentsEnrolled: apiCourse.totalStudentsEnrolled || 0,
          totalDuration: apiCourse.totalDuration || '',
          subCourseDescription: apiCourse.subCourseDescription || '',
          totalLessons: apiCourse.totalLessons || 0,
          lessons: Array.isArray(apiCourse.lessons) ? apiCourse.lessons : [],
          paymentStatus: apiCourse.paymentStatus || false,
          isCompleted: apiCourse.isCompleted || false,
        };
        
        // Debug: Log the exact values from API
        console.log('🔍 API Response - isCompleted:', apiCourse.isCompleted);
        console.log('🔍 API Response - isBestSeller:', apiCourse.isBestSeller);
        console.log('🔍 API Response - paymentStatus:', apiCourse.paymentStatus);
        console.log('🔍 API Response - Type of isCompleted:', typeof apiCourse.isCompleted);
        console.log('🔍 API Response - Raw isCompleted value:', JSON.stringify(apiCourse.isCompleted));
        
       
        // Force set isCompleted to true for testing
        if (apiCourse.isCompleted === true) {
          console.log('🎯 Force setting isCompleted to true');
          transformedCourse.isCompleted = true;
        }
        
        setCourseData(transformedCourse);
        
      } else {
        console.log(' EnrollScreen: Failed to fetch course details:', result.data?.message);
      
        setCourseError(result.data?.message || 'Failed to fetch course details');
      }
    } catch (error) {
      console.error('💥 EnrollScreen: Error fetching course details:', error);
      setCourseError(error.message || 'Network error occurred');
    } finally {
      setIsLoadingCourse(false);
    }
  };

  // Function to calculate live time from lesson start times
  const calculateLiveTime = () => {
    if (!courseData.lessons || courseData.lessons.length === 0) {
      return null;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute; // Convert to minutes
    
    console.log('🕐 Current time:', currentHour + ':' + currentMinute, '(', currentTime, 'minutes)');
    
    // Find the next lesson based on start time
    let nextLesson = null;
    let minTimeDiff = Infinity;
    
    courseData.lessons.forEach(lesson => {
      if (lesson.startTime) {
        const [startHour, startMinute] = lesson.startTime.split(':').map(Number);
        const lessonStartMinutes = startHour * 60 + startMinute;
        
        console.log('📚 Lesson:', lesson.lessonName, 'Start time:', lesson.startTime, '(', lessonStartMinutes, 'minutes)');
        
        // Calculate time difference
        let timeDiff = lessonStartMinutes - currentTime;
        
        // If lesson already started today, check for next occurrence (tomorrow)
        if (timeDiff <= 0) {
          timeDiff += 24 * 60; // Add 24 hours (1440 minutes)
          console.log('⏰ Lesson already started today, next occurrence in:', timeDiff, 'minutes');
        } else {
          console.log('⏰ Lesson starts today in:', timeDiff, 'minutes');
        }
        
        if (timeDiff < minTimeDiff) {
          minTimeDiff = timeDiff;
          nextLesson = lesson;
        }
      }
    });
    
    if (!nextLesson || minTimeDiff === Infinity) {
      console.log('❌ No next lesson found');
      return null;
    }
    
    console.log('🎯 Next lesson:', nextLesson.lessonName, 'in', minTimeDiff, 'minutes');
    
    // Calculate hours and minutes
    const hours = Math.floor(minTimeDiff / 60);
    const minutes = minTimeDiff % 60;
    
    // Format the time string
    let timeString = '';
    if (hours > 0) {
      timeString = `${hours}h ${minutes}m`;
    } else {
      timeString = `${minutes}m`;
    }
    
    console.log('⏱️ Live timer display:', timeString);
    return timeString;
  };

  // State for live time countdown
  const [liveTime, setLiveTime] = useState('');

  // Update live time every second
  useEffect(() => {
    if (courseData.lessons && courseData.lessons.length > 0) {
      const interval = setInterval(() => {
        const calculatedTime = calculateLiveTime();
        if (calculatedTime) {
          setLiveTime(calculatedTime);
        } else {
          setLiveTime('');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [courseData.lessons]);

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

  const handleEnrollNow = async () => {
    try {
      console.log('🎯 EnrollScreen: Enroll Now clicked for courseId:', courseId);
      setIsEnrolling(true);
      
      const result = await courseAPI.enrollInCourse(token, courseId);
      
      if (result.success && result.data.success) {
        console.log('🎉 EnrollScreen: Successfully enrolled in course!');
        // Update local state to reflect enrollment
        setCourseData(prevData => ({
          ...prevData,
          paymentStatus: true,
        }));
        // Refresh course data to get updated information
        await fetchCourseDetails();
      } else {
        console.log('❌ EnrollScreen: Failed to enroll in course:', result.data?.message);
        // You can show an error message here if needed
      }
    } catch (error) {
      console.error('💥 EnrollScreen: Error during enrollment:', error);
      // You can show an error message here if needed
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleStudentIconClick = () => {
    console.log('🎓 EnrollScreen: Student icon clicked, navigating to Student screen with courseId:', courseId);
    navigation.navigate('Student', { subcourseId: courseId });
  };

  const handleStarIconClick = () => {
    navigation.navigate('Review');
  };

  const handleLiveClick = () => {
    console.log('Live clicked');
  };

  const handleDownloadCertificate = async () => {
    try {
      console.log('📜 Download certificate clicked for courseId:', courseId);
      
      // API endpoint using config file
      const apiUrl = getApiUrl('/api/user/certificate/download-certificate');
      
      // Request body for POST method
      const requestBody = {
        subcourseId: courseId
      };
      
      console.log('🌐 API URL:', apiUrl);
      console.log('📦 Request Body:', requestBody);
      
      // Make the API call with POST method and JSON body
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        console.log('✅ Certificate download successful');
        console.log('🎉 SUCCESS: Certificate downloaded successfully! 🎉');
        
        // For React Native, we'll handle the response based on content type
        const contentType = response.headers.get('content-type');
        console.log('📄 Content Type:', contentType);
        
        if (contentType && contentType.includes('application/pdf')) {
          // Handle PDF download
          const blob = await response.blob();
          console.log('📥 PDF certificate received, size:', blob.size);
          
          // Success message for PDF
          console.log('🎯 PDF Certificate Downloaded Successfully!');
          console.log('📊 File Size:', blob.size, 'bytes');
          console.log('📱 Ready for React Native file handling');
        } else {
          // Handle other content types
          const text = await response.text();
          console.log('📄 Response text:', text.substring(0, 100) + '...');
          console.log('📋 Non-PDF Certificate Downloaded Successfully!');
        }
        
        // Final success message
        console.log('🏆 CERTIFICATE DOWNLOAD COMPLETED SUCCESSFULLY! 🏆');
        console.log('🎓 User can now access their course completion certificate');
        
      } else {
        console.log('❌ Certificate download failed:', response.status, response.statusText);
        console.log('💥 ERROR: Failed to download certificate');
      }
    } catch (error) {
      console.error('💥 Error downloading certificate:', error);
    }
  };

  const onMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.event === 'fullscreen') {
      setIsFullScreen(data.value);
    }
  };

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
          source={{ uri: courseData.introVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }}
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
          <Text style={styles.metricText}>
            {typeof courseData.enrollments === 'string' ? courseData.enrollments : '0'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.metricItem} onPress={handleStarIconClick}>
          <Image source={StarIcon} style={styles.metricIcon} />
          <Text style={styles.metricText}>
            {typeof courseData.rating === 'string' ? courseData.rating : '0'}
          </Text>
        </TouchableOpacity>
        {courseData.isBestSeller && (
          <View style={styles.bestSellerBadge}>
            <Text style={styles.bestSellerText}>Best Seller</Text>
          </View>
        )}

        {liveTime && (
          <TouchableOpacity style={styles.liveBadge} onPress={handleLiveClick}>
            <Text style={styles.liveText}>
              Live In {liveTime}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.courseTitle}>
        {typeof courseData.title === 'string' ? courseData.title : 'Course Title'}
      </Text>
      <Text style={styles.courseDescription}>
        {typeof courseData.description === 'string' ? courseData.description : 'No description available'}
      </Text>
      

      
      <View style={styles.courseStats}>
        <View style={styles.statItem}>
          <Image source={ClockIcon} style={styles.statIcon} />
          <Text style={styles.statText}>
            {typeof courseData.duration === 'string' ? courseData.duration : '0h 0min'}
          </Text>
        </View>
        <View style={styles.separator} />
        <Text style={styles.lessonsText}>
          {typeof courseData.totalLessons === 'number' ? courseData.totalLessons : 0} lessons
        </Text>
      </View>
    </View>
  );

  const renderTabs = () => {
    console.log('🔍 renderTabs: courseData.isCompleted =', courseData.isCompleted);
    console.log('🔍 renderTabs: Downloads tab disabled =', !courseData.isCompleted);
    console.log('🔍 renderTabs: courseData object =', JSON.stringify(courseData, null, 2));
    
    return (
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
          style={[
            styles.tab, 
            activeTab === 'downloads' && styles.activeTab, 
            !courseData.isCompleted && styles.disabledTab
          ]}
          onPress={() => {
            console.log('📥 Downloads tab clicked! isCompleted =', courseData.isCompleted);
            if (courseData.isCompleted) {
              setActiveTab('downloads');
            } else {
              console.log('❌ Downloads tab is disabled, cannot click');
            }
          }}
          disabled={!courseData.isCompleted}
        >
          <Text style={[
            styles.tabText, 
            activeTab === 'downloads' && styles.activeTabText, 
            !courseData.isCompleted && styles.disabledTabText
          ]}>
            Downloads {!courseData.isCompleted ? '(Disabled)' : '(Enabled)'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLessons = () => {
    // Add extra safety check
    if (!courseData.lessons || !Array.isArray(courseData.lessons) || courseData.lessons.length === 0) {
      return (
        <View style={styles.lessonsContainer}>
          <View style={styles.emptyLessonsContainer}>
            <Text style={styles.emptyLessonsText}>No lessons available yet</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.lessonsContainer}>
        {courseData.lessons.map((lesson, index) => {
          // Extra safety checks for each property
          const lessonTitle = lesson && lesson.lessonName && typeof lesson.lessonName === 'string' 
            ? lesson.lessonName 
            : `Lesson ${index + 1}`;
          
          const lessonDuration = lesson && lesson.duration && typeof lesson.duration === 'string' 
            ? lesson.duration 
            : '0 mins';

          // Ensure thumbnail is valid
          const thumbnailSource = lesson && lesson.thumbnailImageUrl && typeof lesson.thumbnailImageUrl === 'string'
            ? { uri: lesson.thumbnailImageUrl }
            : require('../assests/images/Course.png');

          console.log('🔍 Rendering lesson:', {
            index,
            lessonTitle,
            lessonDuration,
            hasThumbnail: !!lesson.thumbnailImageUrl,
            isCompleted: lesson.isCompleted
          });

          return (
            <TouchableOpacity 
              key={`lesson-${index}`}
              style={styles.lessonItem}
              onPress={() => {
                if (courseData.paymentStatus) {
                  console.log('🎬 EnrollScreen: Lesson clicked, navigating to LessonVideo with lessonId:', lesson.lessonId);
                  navigation.navigate('LessonVideo', { lessonId: lesson.lessonId });
                } else {
                  console.log('🚫 EnrollScreen: Lesson clicked but user not enrolled yet');
                  // Do nothing - lesson is not clickable until enrolled
                }
              }}
            >
              <Image 
                source={thumbnailSource}
                style={styles.lessonThumbnail}
              />
              <View style={styles.lessonInfo}>
                <Text style={styles.lessonTitle}>{lessonTitle}</Text>
                <Text style={styles.lessonDuration}>{lessonDuration}</Text>
              </View>
              {lesson.isCompleted && (
                <View style={styles.completedBadge}>
                  <Image source={CheckIcon} style={styles.checkIcon} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderDownloads = () => (
    <View style={styles.downloadsContainer}>
      {courseData.isCompleted ? (
        <View style={styles.enabledDownloadsContainer}>
          <TouchableOpacity 
            style={styles.downloadCertificateCard}
            onPress={() => {
              console.log('🚀 Navigating to DownloadCertificateScreen with courseId:', courseId);
              navigation.navigate('DownloadCertificate', { courseId: courseId });
            }}
          >
            <View style={styles.downloadCertificateLeft}>
              <Text style={styles.downloadCertificateTitle}>Download Module Certificate</Text>
            </View>
            <View style={styles.downloadCertificateRight}>
              <TouchableOpacity 
                style={styles.downloadButton} 
                onPress={handleDownloadCertificate}
                onPressIn={(e) => e.stopPropagation()} // Prevent parent TouchableOpacity from triggering
              >
                <Icon name="download-outline" size={24} color="#FF6B35" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
          <Text style={styles.certificateText}>Certificate</Text>
        </View>
      ) : (
        <View style={styles.disabledMessageContainer}>
          <Text style={styles.disabledMessageText}>
            Downloads will be available after course completion
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isFullScreen && styles.fullScreenContainer]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" hidden={isFullScreen} />
      
      {!isFullScreen && (
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image source={ArrowIcon} style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {typeof courseData.title === 'string' ? courseData.title : 'Course Title'}
          </Text>
          <View style={styles.placeholder} />
        </View>
      )}

      <ScrollView 
        style={[styles.scrollView, isFullScreen && { display: 'none' }]}
        showsVerticalScrollIndicator={false}
      >
        {isLoadingCourse ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading course details...</Text>
          </View>
        ) : courseError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {courseError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCourseDetails}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderVideoPlayer()}
            {renderCourseInfo()}
            {renderTabs()}
            {activeTab === 'lessons' ? renderLessons() : renderDownloads()}
          </>
        )}
      </ScrollView>

      {!isFullScreen && !courseData.paymentStatus && (
        <View style={styles.enrollButtonContainer}>
          <TouchableOpacity 
            style={[styles.enrollButton, isEnrolling && styles.enrollButtonDisabled]}
            onPress={handleEnrollNow}
            disabled={isEnrolling}
          >
            <Text style={styles.enrollButtonText}>
              {isEnrolling ? 'Enrolling...' : `Enroll - ${courseData.price}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// Styles remain the same
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
    marginTop: 30,
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
  debugInfo: {
    backgroundColor: '#F0F0F0',
    padding: getVerticalSize(10),
    borderRadius: getFontSize(5),
    marginBottom: getVerticalSize(15),
  },
  debugText: {
    fontSize: getFontSize(12),
    color: '#666666',
    fontFamily: 'monospace',
  },
  testButton: {
    backgroundColor: '#FF6B35',
    padding: getVerticalSize(8),
    borderRadius: getFontSize(5),
    marginTop: getVerticalSize(10),
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(12),
    fontWeight: '600',
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
  completedCourseBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: getVerticalSize(8),
    paddingVertical: getVerticalSize(4),
    borderRadius: getFontSize(12),
    marginRight: getVerticalSize(10),
  },
  completedCourseText: {
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
  disabledTab: {
    opacity: 0.5,
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
  disabledTabText: {
    color: '#999999',
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
    height: getFontSize(40),
    borderRadius: getFontSize(6),
    marginRight: getVerticalSize(12),
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
    width: getFontSize(12),
    height: getFontSize(12),
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
  },
  downloadsContainer: {
    padding: getVerticalSize(20),
  },
  disabledMessageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getVerticalSize(40),
  },
  disabledMessageText: {
    fontSize: getFontSize(16),
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  enabledDownloadsContainer: {
    paddingVertical: getVerticalSize(20),
  },
  downloadCertificateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: getFontSize(8),
    padding: getVerticalSize(16),
    marginBottom: getVerticalSize(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  downloadCertificateLeft: {
    flex: 1,
  },
  downloadCertificateTitle: {
    fontSize: getFontSize(16),
    fontWeight: '600',
    color: '#000000',
  },
  downloadCertificateRight: {
    marginLeft: getVerticalSize(15),
  },
  downloadButton: {
    padding: getVerticalSize(8),
  },
  certificateText: {
    fontSize: getFontSize(14),
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  enrollButtonContainer: {
    padding: getVerticalSize(20),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  enrollButton: {
    backgroundColor: '#FF8800',
    paddingVertical: getVerticalSize(16),
    borderRadius: getFontSize(25),
    alignItems: 'center',
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(18),
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: getFontSize(18),
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: getVerticalSize(20),
  },
  errorText: {
    fontSize: getFontSize(16),
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: getVerticalSize(20),
  },
  retryButton: {
    backgroundColor: '#FF8800',
    paddingVertical: getVerticalSize(12),
    paddingHorizontal: getVerticalSize(25),
    borderRadius: getFontSize(25),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: 'bold',
  },
  emptyLessonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getVerticalSize(40),
  },
  emptyLessonsText: {
    fontSize: getFontSize(16),
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  enrollButtonDisabled: {
    opacity: 0.7,
  },
});

export default EnrollScreen;