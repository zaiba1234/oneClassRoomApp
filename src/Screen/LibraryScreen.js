import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Platform,
  BackHandler,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';
import BackButton from '../Component/BackButton';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const { width, height } = Dimensions.get('window');

// Responsive scaling factors
const scale = width / 375; // Base width for iPhone 8
const verticalScale = height / 812; // Base height for iPhone 8

// Responsive font sizes
const getFontSize = (size) => size * scale;
const getVerticalSize = (size) => size * verticalScale;

const LibraryScreen = ({ navigation }) => {
  // Get user data from Redux
  const { token } = useAppSelector((state) => state.user);

  // State for course data from API
  const [libraryCourses, setLibraryCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courseError, setCourseError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Interstitial Ad for course clicks (Android only)
  // Use TestIds in development, production IDs in production
  const interstitialAdRef = useRef(
    Platform.OS === 'android'
      ? InterstitialAd.createForAdRequest(
          __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-7361876223006934/3796924172',
          {
            requestNonPersonalizedAdsOnly: true,
          }
        )
      : null
  );
  
  // Store navigation params for after ad closes
  const pendingNavigationRef = useRef(null);

  // Fetch course data when component mounts
  useEffect(() => {
    if (token) {
      // Reset pagination when component mounts
      setCurrentPage(1);
      setTotalPages(1);
      setTotalCourses(0);
      setHasMoreData(false);
      setLibraryCourses([]);
      fetchCourseData(1, false);
    }
  }, [token]);

  // Load Interstitial Ad on mount (Android only)
  useEffect(() => {
    if (Platform.OS === 'android' && interstitialAdRef.current) {
      const unsubscribeLoaded = interstitialAdRef.current.addAdEventListener(AdEventType.LOADED, () => {
        console.log('✅ [LibraryScreen] Interstitial Ad loaded successfully');
      });

      const unsubscribeClosed = interstitialAdRef.current.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('✅ [LibraryScreen] Interstitial Ad closed');
        // Navigate after ad closes if there's a pending navigation
        if (pendingNavigationRef.current) {
          const { screen, params } = pendingNavigationRef.current;
          pendingNavigationRef.current = null;
          console.log('🧭 [Navigation] Ad closed, navigating to:', screen, params);
          navigation.navigate(screen, params);
        }
        // Reload ad for next time
        interstitialAdRef.current.load();
      });

      const unsubscribeError = interstitialAdRef.current.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('❌ [LibraryScreen] Interstitial Ad error:', error);
      });

      // Load the ad
      interstitialAdRef.current.load();
      console.log('📱 [LibraryScreen] Interstitial Ad loading started');

      return () => {
        unsubscribeLoaded();
        unsubscribeClosed();
        unsubscribeError();
      };
    }
  }, [navigation]);

  // Handle Android back button - navigate to Home tab
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // Navigate to Home tab when back button is pressed
        navigation.navigate('Home');
        return true; // Prevent default back behavior
      });

      return () => backHandler.remove();
    }
  }, [navigation]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Reset pagination on refresh
      setCurrentPage(1);
      setTotalPages(1);
      setTotalCourses(0);
      setHasMoreData(false);
      await fetchCourseData(1, false);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  // Function to fetch course data from API (first page)
  const fetchCourseData = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setIsLoadingCourses(true);
      } else {
        setLoadingMore(true);
      }
      setCourseError(null);

      console.log('🚀 CALLING getAllCourses API NOW...');
      console.log('🚀 API Parameters:', { page, limit: 10, token: token ? `${(token || '').substring(0, 10)}...` : 'Missing' });
      
      const result = await courseAPI.getAllCourses(token, page, 10);
      console.log('✅ getAllCourses API CALL COMPLETED');
      
      // DETAILED API RESPONSE DEBUG FOR LIBRARY COURSES
      console.log('🔥🔥🔥 LIBRARY COURSES API RESPONSE DEBUG 🔥🔥🔥');
      console.log('🔥 API Name: getAllCourses');
      console.log('🔥 Endpoint: /api/course/get-all-courses');
      if (__DEV__) {
        console.log('🔥 API Response Success:', result.success);
      }
      console.log('🔥 Response Success:', result.success);
      console.log('🔥 Response Status:', result.status);
      console.log('🔥 Response Data:', result.data);
      console.log('🔥 Response Data Success:', result.data?.success);
      console.log('🔥 Response Data Keys:', result.data ? Object.keys(result.data) : 'No data');
      console.log('🔥 Courses Array:', result.data?.data);
      console.log('🔥 Courses Count:', result.data?.data?.length);
      console.log('🔥 Pagination Info:', result.data?.pagination);
      console.log('🔥 Has Pagination:', !!result.data?.pagination);
      if (result.data?.pagination) {
        console.log('🔥 Pagination Details:');
        console.log('🔥 - currentPage:', result.data.pagination.currentPage);
        console.log('🔥 - totalPages:', result.data.pagination.totalPages);
        console.log('🔥 - totalCourses:', result.data.pagination.totalCourses);
        console.log('🔥 - hasNextPage:', result.data.pagination.hasNextPage);
        console.log('🔥 - hasPrevPage:', result.data.pagination.hasPrevPage);
        console.log('🔥 - limit:', result.data.pagination.limit);
        console.log('🔥 - offset:', result.data.pagination.offset);
      }
      console.log('🔥🔥🔥 END LIBRARY COURSES DEBUG 🔥🔥🔥');

      if (result.success && result.data.success) {
        // Handle new API response structure with pagination
        const coursesData = result.data.data;
        const courses = coursesData.courses || coursesData; // Handle both old and new structure
        const pagination = coursesData.pagination || {};

        // Check if courses is an array
        if (!Array.isArray(courses)) {
          setCourseError('Invalid data format received from API');
          if (!append) {
            setLibraryCourses([]);
          }
          return;
        }

        // Update pagination state
        setCurrentPage(pagination.currentPage || page);
        setTotalPages(pagination.totalPages || 1);
        setTotalCourses(pagination.totalCourses || courses.length);
        setHasMoreData((pagination.currentPage || page) < (pagination.totalPages || 1));

        // Transform API data to match existing UI structure
        const transformedCourses = courses.map((course, index) => {
          const courseImage = course.CoverImageUrl ? { uri: course.CoverImageUrl } : require('../assests/images/Frame1.png');
          
          const transformedCourse = {
            id: course._id || index + 1,
            title: course.courseName || 'Course Title',
            modules: `${course.totalModules || 0} Modules`,
            image: courseImage,
          };
          
          return transformedCourse;
        });
        
        // Update courses list
        if (append && page > 1) {
          setLibraryCourses(prev => [...prev, ...transformedCourses]);
        } else {
          setLibraryCourses(transformedCourses);
        }

      } else {
        setCourseError(result.data?.message || 'Failed to fetch courses');
        if (!append) {
          setLibraryCourses([]);
        }
      }
    } catch (error) {
      setCourseError(error.message || 'Network error occurred');
      if (!append) {
        setLibraryCourses([]);
      }
    } finally {
      setIsLoadingCourses(false);
      setLoadingMore(false);
    }
  };

  // Load more courses (next page)
  const loadMoreCourses = async () => {
    if (hasMoreData && !loadingMore && !isLoadingCourses) {
      await fetchCourseData(currentPage + 1, true);
    }
  };

  const renderLibraryCard = (course) => (
    <TouchableOpacity 
      key={course.id} 
      style={styles.libraryCard}
      onPress={async () => {
        // Show Interstitial Ad before navigation (Android only)
        if (Platform.OS === 'android' && interstitialAdRef.current) {
          try {
            const isLoaded = interstitialAdRef.current.loaded;
            if (isLoaded) {
              console.log('📱 [LibraryScreen] Showing Interstitial Ad before navigation');
              // Store navigation params for after ad closes
              pendingNavigationRef.current = {
                screen: 'SubCourse',
                params: { courseId: course.id, courseName: course.title }
              };
              await interstitialAdRef.current.show();
            } else {
              console.log('📱 [LibraryScreen] Interstitial Ad not loaded yet, navigating directly');
              navigation.navigate('SubCourse', { courseId: course.id, courseName: course.title });
            }
          } catch (error) {
            console.error('❌ [LibraryScreen] Error showing Interstitial Ad:', error);
            // Navigate even if ad fails
            navigation.navigate('SubCourse', { courseId: course.id, courseName: course.title });
          }
        } else {
          // iOS or ad not available, navigate directly
          navigation.navigate('SubCourse', { courseId: course.id, courseName: course.title });
        }
      }}
    >
      <Image 
        source={course.image} 
        style={styles.libraryCardImage} 
        resizeMode="cover"
      />
      <View style={styles.libraryCardContent}>
        <Text style={styles.libraryCardTitle}>{course.title}</Text>
        <Text style={styles.libraryCardModules}>{course.modules}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#666" style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Library</Text>
        <View style={styles.placeholder} />
      </View>
      {refreshing && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator size="small" color="#007BFF" />
          <Text style={styles.refreshText}>Refreshing...</Text>
        </View>
      )}

      {/* Library Cards */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.libraryCardsContainer}>
          {isLoadingCourses ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading courses...</Text>
            </View>
          ) : courseError ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle-outline" size={48} color="#FF8800" style={styles.errorIcon} />
              <Text style={styles.errorTitle}>Unable to Load Courses</Text>
              <Text style={styles.errorText}>
                {courseError.toLowerCase().includes('no courses') || courseError.toLowerCase().includes('not found')
                  ? 'No courses available at the moment. Please check back later!'
                  : courseError.toLowerCase().includes('network')
                  ? 'Network connection issue. Please check your internet and try again.'
                  : 'Something went wrong. Please try again.'}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchCourseData(1, false)}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : libraryCourses.length > 0 ? (
            <>
              {(libraryCourses || []).map((course) => renderLibraryCard(course))}
              
              {/* Pagination Info */}
              <View style={styles.paginationInfo}>
                <Text style={styles.paginationText}>
                  Page {currentPage} of {totalPages}
                </Text>
                <Text style={styles.paginationText}>
                  Showing {libraryCourses.length} of {totalCourses} courses
                </Text>
              </View>
              
              {/* Load More Button */}
              {hasMoreData && (
                <TouchableOpacity 
                  style={[styles.loadMoreButton, loadingMore && styles.loadMoreButtonDisabled]} 
                  onPress={loadMoreCourses}
                  disabled={loadingMore || isLoadingCourses}
                >
                  <Text style={styles.loadMoreButtonText}>
                    {loadingMore ? 'Loading...' : 'Load More Courses'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="library-outline" size={64} color="#CCCCCC" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No Courses Available</Text>
              <Text style={styles.emptySubText}>
                There are no courses in the library yet.{'\n'}
                Please check back later!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getVerticalSize(20),
    paddingTop: Platform.OS === 'ios' ? getVerticalSize(50) : getVerticalSize(40),
    paddingBottom: getVerticalSize(15),
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 20,
    flex: 1,
    marginTop: getVerticalSize(1),
  },
  placeholder: {
    width: getFontSize(40),
  },
  refreshButton: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  libraryCardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  libraryCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  libraryCardImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  libraryCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  libraryCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  libraryCardModules: {
    fontSize: 14,
    color: '#666',
  },
  arrowIcon: {
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 60,
  },
  errorIcon: {
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 60,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  refreshText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#007BFF',
  },
  paginationInfo: {
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 10,
  },
  paginationText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  loadMoreButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 15,
    alignItems: 'center',
  },
  loadMoreButtonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  loadMoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});