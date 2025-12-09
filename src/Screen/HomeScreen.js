import { useNavigation } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  SafeAreaView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  BackHandler, // यह add करें
  Alert, 
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';
import { profileAPI } from '../API/profileAPI';
import { setProfileData } from '../Redux/userSlice';
import { getApiUrl, ENDPOINTS } from '../API/config';
import { useFocusEffect } from '@react-navigation/native';
import NotificationBadge from '../Component/NotificationBadge';
import { checkApiResponseForTokenError, handleTokenError } from '../utils/tokenErrorHandler';
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import notificationService from '../services/notificationService';

const { width, height } = Dimensions.get('window');


// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const HomeScreen = () => {
  console.log('🏠 [HomeScreen] ============================================');
  console.log('🏠 [HomeScreen] Component initialized');
  console.log('🏠 [HomeScreen] ============================================');
  
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('All Course');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Get user data from Redux
  const { fullName, mobileNumber, token, isAuthenticated, _id, userId, profileImageUrl, address, email } = useAppSelector((state) => state.user);
  
  console.log('🏠 [HomeScreen] Redux State:', {
    hasToken: !!token,
    isAuthenticated,
    fullName,
    userId,
    hasProfileImage: !!profileImageUrl
  });
  // State for course data
  const [courseCards, setCourseCards] = useState([]); // Start with empty array instead of hardcoded data
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState(null);

  // State for featured courses (banner)
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [featuredError, setFeaturedError] = useState(null);

  // State for banner data from homePage-banner API
  const [bannerData, setBannerData] = useState({
    recentSubcourse: null,
    recentPurchasedSubcourse: null,
    promos: []
  });

  // Debug: Log banner data changes
  useEffect(() => {
    console.log('🏠 [HomeScreen] Banner data state changed');
    console.log('🏠 [HomeScreen] Banner data - promos length:', bannerData.promos?.length || 0);
    console.log('🏠 [HomeScreen] Banner data details:', {
      hasRecentSubcourse: !!bannerData.recentSubcourse,
      hasRecentPurchasedSubcourse: !!bannerData.recentPurchasedSubcourse,
      promosCount: bannerData.promos?.length || 0,
      timestamp: new Date().toISOString()
    });
  }, [bannerData]);


  const [isLoadingBanner, setIsLoadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState(null);

  // State for activities
  const [activities, setActivities] = useState([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState(null);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);

  // State for favorite toggling
  const [togglingFavorites, setTogglingFavorites] = useState(new Set());

  // State for search functionality
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // State for user's favorite courses
  const [userFavoriteCourses, setUserFavoriteCourses] = useState(new Set());

  // State for refreshing
  const [refreshing, setRefreshing] = useState(false);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // State for unread notification count
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);


  // Ref to track last fetch time to prevent too frequent API calls
  const lastFetchTimeRef = useRef(0);

  // Ref to track loading timeout
  const loadingTimeoutRef = useRef(null);

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
  
  // Store courseId for navigation after ad closes
  const pendingNavigationRef = useRef(null);
  
  // Store activityId for navigation after ad closes
  const pendingActivityNavigationRef = useRef(null);

  // Debug: Log component mount and initial state
  useEffect(() => {
   
    console.log('🏠 [HomeScreen] Initial State:', {
      selectedFilter,
      currentCarouselIndex,
      courseCardsCount: courseCards.length,
      featuredCoursesCount: featuredCourses.length,
      hasToken: !!token,
      searchKeyword,
      currentPage,
      totalPages,
      unreadNotificationCount
    });
  }, []);

  // Debug: Log unread notification count changes
  useEffect(() => {
    console.log('🔔 [HomeScreen] Unread notification count changed:', {
      count: unreadNotificationCount,
      showBadge: unreadNotificationCount > 0,
      icon: unreadNotificationCount > 0 ? 'Notification1.png' : 'Bell.png',
      timestamp: new Date().toISOString()
    });
  }, [unreadNotificationCount]);

  // Load Interstitial Ad on mount (Android only)
  useEffect(() => {
    if (Platform.OS === 'android' && interstitialAdRef.current) {
      const unsubscribeLoaded = interstitialAdRef.current.addAdEventListener(AdEventType.LOADED, () => {
        console.log('✅ [HomeScreen] Interstitial Ad loaded successfully');
      });

      const unsubscribeClosed = interstitialAdRef.current.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('✅ [HomeScreen] Interstitial Ad closed');
        // Navigate after ad closes if there's a pending navigation
        if (pendingNavigationRef.current) {
          const courseId = pendingNavigationRef.current;
          pendingNavigationRef.current = null;
          console.log('🧭 [Navigation] Ad closed, navigating to Enroll screen with courseId:', courseId);
          navigation.navigate('Enroll', { courseId: courseId });
        } else if (pendingActivityNavigationRef.current) {
          const activityId = pendingActivityNavigationRef.current;
          pendingActivityNavigationRef.current = null;
          console.log('🧭 [Navigation] Ad closed, navigating to ActivityDetail screen with activityId:', activityId);
          navigation.navigate('ActivityDetail', { activityId: activityId });
        }
        // Reload ad for next time
        interstitialAdRef.current.load();
      });

      const unsubscribeError = interstitialAdRef.current.addAdEventListener(AdEventType.ERROR, (error) => {
        console.log('❌ [HomeScreen] Interstitial Ad error:', error);
      });

      // Load the ad
      interstitialAdRef.current.load();
      console.log('📱 [HomeScreen] Interstitial Ad loading started');

      return () => {
        unsubscribeLoaded();
        unsubscribeClosed();
        unsubscribeError();
      };
    }
  }, [navigation]);

  // Back button handling is now done in BottomTabNavigator to handle all tabs

  // Fetch course data when component mounts or token changes
  useEffect(() => {
    console.log('🏠 [HomeScreen] useEffect triggered - token changed:', {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 15)}...` : 'No token',
      timestamp: new Date().toISOString()
    });
    
    // Initialize data regardless of token status for better UX
    const initializeData = async () => {
      try {
        console.log('🏠 [HomeScreen] Initializing data...');
        
        if (token) {
          console.log('🏠 [HomeScreen] User is logged in, fetching user-specific data');
          // For logged-in users: fetch user-specific data first
          console.log('📡 [API] Calling fetchUserFavoriteCourses...');
          console.log('📡 [API] Calling fetchUserProfile...');
          console.log('📡 [API] Calling fetchUnreadNotificationCount...');
          await Promise.all([
            fetchUserFavoriteCourses(),
            fetchUserProfile(),
            fetchUnreadNotificationCount()
          ]);
        } else {
          console.log('🏠 [HomeScreen] User is not logged in, skipping user-specific data');
          setUnreadNotificationCount(0);
        }

        // Always fetch course data and banner data (these should work for all users)
       
        
        await Promise.all([
          fetchCourseData(1, 5), // Explicitly set page=1, limit=5
          fetchFeaturedCourses(),
          fetchBannerData(),
          fetchActivities()
        ]);
        
        console.log('✅ [HomeScreen] All parallel API calls completed successfully');
      } catch (error) {
        console.error('❌ [HomeScreen] Error during initialization:', {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
        // Continue with fallback data even if some APIs fail
      }
    };

    initializeData();
  }, [token]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 [HomeScreen] Screen focused - auto-refresh triggered');
      
      // Auto-refresh all data when screen comes into focus
      const autoRefresh = async () => {
        try {
          console.log('🔄 [HomeScreen] Starting auto-refresh...');
          console.log('🔄 [HomeScreen] Current state:', {
            selectedFilter,
            courseCardsCount: courseCards.length,
            hasToken: !!token,
            unreadCount: unreadNotificationCount,
            timestamp: new Date().toISOString()
          });
          
          // Show refreshing state
          setRefreshing(true);
          console.log('🔄 [HomeScreen] Refreshing state set to true');
          
          if (token) {
            console.log('🔄 [HomeScreen] User logged in, refreshing user-specific data');
            // For logged-in users: refresh user-specific data first
            console.log('📡 [API] Auto-refresh: Calling fetchUserFavoriteCourses...');
            console.log('📡 [API] Auto-refresh: Calling fetchUserProfile...');
            console.log('📡 [API] Auto-refresh: Calling fetchUnreadNotificationCount...');
            await Promise.all([
              fetchUserFavoriteCourses(),
              fetchUserProfile(),
              fetchUnreadNotificationCount()
            ]);
            console.log('✅ [HomeScreen] User-specific data refreshed');
          } else {
            console.log('🔄 [HomeScreen] User not logged in, skipping user-specific data');
            setUnreadNotificationCount(0);
          }

          // Always refresh course and banner data
        
          
          await Promise.all([
            fetchCourseData(1, 5), // Explicitly set page=1, limit=5
            fetchFeaturedCourses(),
            fetchBannerData(),
            fetchActivities()
          ]);
          
          console.log('✅ [HomeScreen] Auto-refresh completed successfully');
        } catch (error) {
          console.error('❌ [HomeScreen] Error during auto-refresh:', {
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          });
          // Continue even if some refreshes fail
        } finally {
          setRefreshing(false);
          console.log('🔄 [HomeScreen] Refreshing state set to false');
        }
      };

      // Trigger auto-refresh when screen comes into focus
      autoRefresh();
    }, [token]) // Only depend on token to prevent unnecessary refreshes
  );

  // Function to fetch featured courses from API
  const fetchFeaturedCourses = async () => {
    try {
      console.log('🚀 [HomeScreen] fetchFeaturedCourses called - getPurchasedCourse API');
      console.log('🚀 [HomeScreen] API Request Details:', {
        api: 'courseAPI.getPurchasedCourse',
        endpoint: '/api/course/get-purchased-course',
        token: token ? `${token.substring(0, 10)}...` : 'Missing',
        timestamp: new Date().toISOString()
      });

      setIsLoadingFeatured(true);
      setFeaturedError(null);

      console.log('📡 [API] getPurchasedCourse - Making API call...');
      const startTime = Date.now();
      const result = await courseAPI.getPurchasedCourse(token);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('📱 [API] getPurchasedCourse - API call completed', {
        duration: `${duration}ms`,
        success: result.success,
        status: result.status,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : 'No data',
        timestamp: new Date().toISOString()
      });
      
      console.log('📱 [HomeScreen] getPurchasedCourse API Response:', {
        success: result.success,
        status: result.status,
        dataKeys: result.data ? Object.keys(result.data) : 'No data',
        fullResponse: JSON.stringify(result, null, 2)
      });

      if (result.success && result.data.success) {
        const responseData = result.data.data;
        console.log('📱 [HomeScreen] Featured Courses Data Details:', {
          responseData: responseData,
          subcourses: responseData.subcourses,
          subcoursesLength: responseData.subcourses?.length || 0,
          paginationInfo: result.data.pagination || 'No pagination data',
          hasPagination: !!result.data.pagination
        });
        
        // Extract courses array from the response
        const apiCourses = responseData.subcourses || responseData;
        console.log('📱 [HomeScreen] Featured courses extracted:', {
          apiCourses: apiCourses,
          type: typeof apiCourses,
          isArray: Array.isArray(apiCourses),
          length: apiCourses?.length || 0
        });

        // Transform API data to match existing UI structure
        const transformedFeaturedCourses = (apiCourses || []).slice(0, 3).map((course, index) => {
          const courseImage = course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/Circular.png');
          const progress = parseInt((course.progress || '').replace('%', '') || '0');

          return {
            id: course.subcourseId || index + 1,
            title: course.subcourseName || 'Course Title',
            lessons: `${course.totalLessons || 0} lessons`,
            progress: progress,
            image: courseImage,
            buttonText: progress > 0 ? 'Continue Learning' : 'Explore',
            isFavorite: userFavoriteCourses.has(String(course.subcourseId)), // Mark as favorite if in user's favorites
          };
        });

        console.log('✅ HomeScreen: Featured courses loaded successfully - Total courses:', transformedFeaturedCourses.length);
        setFeaturedCourses(transformedFeaturedCourses);

      } else {
        const errorMessage = result.data?.message || 'Failed to fetch featured courses';
        console.log('❌ HomeScreen: Featured courses API failed:', {
          resultSuccess: result.success,
          dataSuccess: result.data?.success,
          errorMessage: errorMessage,
          status: result.status,
          fullResult: JSON.stringify(result, null, 2)
        });
        setFeaturedError(errorMessage);
        // Keep existing featured courses if API fails
      }
    } catch (error) {
      const errorMessage = error.message || 'Network error occurred';
      console.error('💥 HomeScreen: Featured courses error:', {
        message: errorMessage,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      setFeaturedError(errorMessage);
      // Keep existing featured courses if error occurs
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  // Function to fetch course data from API
  // Pagination: limit=5 per page, loads 5 courses per page
  const fetchCourseData = async (page = 1, limit = 5) => {
    try {
      console.log('🚀 [HomeScreen] fetchCourseData called - getAllSubcourses API');
      console.log('🚀 [HomeScreen] API Request Details:', {
        api: 'courseAPI.getAllSubcourses',
        endpoint: '/api/course/get-all-subcourses',
        page: page,
        limit: limit,
        token: token ? `${token.substring(0, 10)}...` : 'Missing',
        timestamp: new Date().toISOString()
      });

      // Debug API call parameters
      

      setIsLoadingCourses(true);
      setCourseError(null);

      // Set a timeout to prevent infinite loading
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('⏰ [HomeScreen] Course loading timeout, stopping loader');
        console.log('⏰ [HomeScreen] Timeout after 10 seconds - API might be slow or failed');
        setIsLoadingCourses(false);
      }, 10000); // 10 second timeout

      console.log('📡 [API] getAllSubcourses - Making API call...', {
        page,
        limit,
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });
      const startTime = Date.now();
      const result = await courseAPI.getAllSubcourses(token, { page, limit });
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log('✅ [API] getAllSubcourses - API call completed', {
        duration: `${duration}ms`,
        success: result.success,
        status: result.status,
        timestamp: new Date().toISOString()
      });

      // Clear timeout if API call completes
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      // DETAILED API RESPONSE DEBUG FOR ALL COURSES
      
     
      if (result.data?.pagination) {
       
       
      }
      console.log('🔥🔥🔥 END ALL COURSES DEBUG 🔥🔥🔥');

      // API response logging
      

      // Debug pagination structure for All Courses
     
      
      if (result.data?.pagination) {
        
      
      } else {
        console.log('🔍 [DEBUG] No pagination data found in response');
      }

      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('📱 [HomeScreen] Course Data Details:', {
          coursesCount: apiCourses.length,
          firstCourse: (apiCourses && apiCourses[0]) ? {
            id: apiCourses[0]._id,
            title: apiCourses[0].subcourseName,
            price: apiCourses[0].price,
            lessons: apiCourses[0].totalLessons
          } : 'No courses',
          paginationInfo: result.data.pagination || 'No pagination data',
          hasPagination: !!result.data.pagination
        });

        // Update pagination state
        if (result.data.pagination) {
          // Use API pagination data
          setCurrentPage(result.data.pagination.currentPage || page);
          setTotalPages(result.data.pagination.totalPages || 1);
          setTotalCourses(result.data.pagination.totalCourses || apiCourses.length);
          setHasNextPage(result.data.pagination.hasNextPage || false);
          setHasPrevPage(result.data.pagination.hasPrevPage || false);
          
          console.log('📄 [Pagination] API Pagination Data:', {
            currentPage: result.data.pagination.currentPage || page,
            totalPages: result.data.pagination.totalPages || 1,
            totalCourses: result.data.pagination.totalCourses || apiCourses.length,
            hasNextPage: result.data.pagination.hasNextPage || false,
            hasPrevPage: result.data.pagination.hasPrevPage || false
          });
        } else {
          // Fallback: Calculate pagination based on returned data
          // If we got exactly 'limit' items, assume there might be more pages
          const receivedCount = apiCourses.length;
          const hasMore = receivedCount >= limit; // If we got full limit (5), there might be more
          
          setCurrentPage(page);
          // Estimate total pages (we don't know total, so we'll keep loading until we get less than limit)
          setTotalPages(hasMore ? page + 1 : page); // Estimate: at least one more page if we got full limit
          setTotalCourses(page === 1 ? receivedCount : (page - 1) * limit + receivedCount);
          setHasNextPage(hasMore); // Show "Load More" if we got full limit (5)
          setHasPrevPage(page > 1);
          
          console.log('📄 [Pagination] Fallback Pagination Calculated:', {
            currentPage: page,
            receivedCount,
            limit,
            hasMore,
            hasNextPage: hasMore,
            estimatedTotal: page === 1 ? receivedCount : (page - 1) * limit + receivedCount
          });
        }

        // Transform API data to match existing UI structure
        const transformedCourses = (apiCourses || []).map((course, index) => {
          const courseImage = course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/HomeImage.png');

          return {
            id: course._id || index + 1,
            title: course.subcourseName || 'Course Title',
            lessons: `${course.totalLessons || 0} lessons`,
            rating: course.avgRating ? course.avgRating.toString() : '4.5',
            price: `₹${course.price || 0}.00`,
            image: courseImage,
            isFavorite: userFavoriteCourses.has(String(course._id)), // Mark as favorite if in user's favorites
            isUpComingCourse: course.isUpComingCourse || false, // Add the upcoming course flag
          };
        });

        // If it's the first page, replace courses; otherwise append
        if (page === 1) {
          setCourseCards(transformedCourses);
          console.log('📄 [Pagination] First page loaded - Replaced course cards:', {
            page: 1,
            coursesLoaded: transformedCourses.length,
            limit: limit
          });
        } else {
          setCourseCards(prevCourses => {
            const updated = [...prevCourses, ...transformedCourses];
            console.log('📄 [Pagination] Page loaded - Appended courses:', {
              page,
              newCourses: transformedCourses.length,
              totalCourses: updated.length,
              limit: limit
            });
            return updated;
          });
        }
        console.log('✅ HomeScreen: Course data loaded successfully - Total courses:', transformedCourses.length);

      } else {
        setCourseError(result.data?.message || 'Failed to fetch courses');
        console.log('❌ HomeScreen: Failed to fetch courses:', {
          resultSuccess: result.success,
          dataSuccess: result.data?.success,
          errorMessage: result.data?.message,
          status: result.status,
          fullResult: JSON.stringify(result, null, 2)
        });
        // Keep existing course data if API fails
      }
    } catch (error) {
      setCourseError(error.message || 'Network error occurred');
      console.error('💥 HomeScreen: Error fetching courses:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      // Keep existing course data if error occurs
    } finally {
      // Clear timeout if it exists
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setIsLoadingCourses(false);
    }
  };

  // Function to fetch popular courses from API
  const fetchPopularCourses = async (page = 1, limit = 6) => {
    try {
      console.log('🚀 [HomeScreen] fetchPopularCourses called - getPopularSubcourses API');
      console.log('🚀 [HomeScreen] API Request Details:', {
        api: 'courseAPI.getPopularSubcourses',
        endpoint: '/api/course/get-popular-subcourses',
        page: page,
        limit: limit,
        token: token ? `${token.substring(0, 10)}...` : 'Missing',
        timestamp: new Date().toISOString()
      });

      // Debug API call parameters
      console.log('🔍 [DEBUG] Popular Courses API Call Parameters:');
      console.log('🔍 [DEBUG] - Page:', page, 'Limit:', limit);
      console.log('🔍 [DEBUG] - Pagination enabled');

      setIsLoadingCourses(true);
      setCourseError(null);

      console.log('📡 [API] getPopularSubcourses - Making API call...', {
        page,
        limit,
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });
      const startTime = Date.now();
      const result = await courseAPI.getPopularSubcourses(token, { page, limit });
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log('✅ [API] getPopularSubcourses - API call completed', {
        duration: `${duration}ms`,
        success: result.success,
        status: result.status,
        timestamp: new Date().toISOString()
      });

      console.log('📱 [HomeScreen] getPopularSubcourses API Response:', {
        success: result.success,
        status: result.status,
        dataKeys: result.data ? Object.keys(result.data) : 'No data',
        fullResponse: JSON.stringify(result, null, 2)
      });

      // DETAILED API RESPONSE DEBUG FOR POPULAR COURSES
      
      if (result.data?.pagination) {
       
      }
      console.log('🔥🔥🔥 END POPULAR COURSES DEBUG 🔥🔥🔥');

      // Debug pagination structure for Popular Courses
      
      
      if (result.data?.pagination) {
       
      } else {
        console.log('🔍 [DEBUG] No pagination data found in Popular Courses response');
      }

      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('📱 [HomeScreen] Popular Courses Data Details:', {
          coursesCount: apiCourses.length,
          firstCourse: (apiCourses && apiCourses[0]) ? {
            id: apiCourses[0]._id,
            title: apiCourses[0].subcourseName,
            price: apiCourses[0].price,
            lessons: apiCourses[0].totalLessons
          } : 'No courses',
          paginationInfo: result.data.pagination || 'No pagination data',
          hasPagination: !!result.data.pagination
        });

        // Transform API data to match existing UI structure
        const transformedCourses = (apiCourses || []).map((course, index) => {
          const courseImage = course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/HomeImage.png');

          return {
            id: course._id || index + 1,
            title: course.subcourseName || 'Course Title',
            lessons: `${course.totalLessons || 0} lessons`,
            rating: course.avgRating ? course.avgRating.toString() : '4.5',
            price: `₹${course.price || 0}.00`,
            image: courseImage,
            isFavorite: userFavoriteCourses.has(String(course._id)), // Mark as favorite if in user's favorites
            isUpComingCourse: course.isUpComingCourse || false, // Add the upcoming course flag
          };
        });

        // Update pagination state
        if (result.data.pagination) {
          setCurrentPage(result.data.pagination.page || page);
          setTotalPages(result.data.pagination.totalPages || 1);
          setTotalCourses(result.data.pagination.total || apiCourses.length);
          setHasNextPage(result.data.pagination.hasNextPage || false);
          setHasPrevPage(result.data.pagination.hasPrevPage || false);
        }

        // If it's the first page, replace courses; otherwise append
        if (page === 1) {
          setCourseCards(transformedCourses);
        } else {
          setCourseCards(prevCourses => [...prevCourses, ...transformedCourses]);
        }
        console.log('✅ HomeScreen: Popular courses loaded successfully - Total courses:', transformedCourses.length);

      } else {
        setCourseError(result.data?.message || 'Failed to fetch popular courses');
        console.log('❌ HomeScreen: Failed to fetch popular courses:', {
          resultSuccess: result.success,
          dataSuccess: result.data?.success,
          errorMessage: result.data?.message,
          status: result.status,
          fullResult: JSON.stringify(result, null, 2)
        });
        // Keep existing course data if API fails
      }
    } catch (error) {
      setCourseError(error.message || 'Network error occurred');
      console.error('💥 HomeScreen: Error fetching popular courses:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      // Keep existing course data if error occurs
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Function to fetch newest courses from API
  const fetchNewestCourses = async (page = 1, limit = 6) => {
    try {
      console.log('🚀 [HomeScreen] fetchNewestCourses called - getNewestSubcourses API');
      console.log('🚀 [HomeScreen] API Request Details:', {
        api: 'courseAPI.getNewestSubcourses',
        endpoint: '/api/course/get-newest-subcourses',
        page: page,
        limit: limit,
        token: token ? `${token.substring(0, 10)}...` : 'Missing',
        timestamp: new Date().toISOString()
      });

      // Debug API call parameters
      console.log('🔍 [DEBUG] Newest Courses API Call Parameters:');
      console.log('🔍 [DEBUG] - Page:', page, 'Limit:', limit);
      console.log('🔍 [DEBUG] - Pagination enabled');

      setIsLoadingCourses(true);
      setCourseError(null);

      console.log('📡 [API] getNewestSubcourses - Making API call...', {
        page,
        limit,
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });
      const startTime = Date.now();
      const result = await courseAPI.getNewestSubcourses(token, { page, limit });
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log('✅ [API] getNewestSubcourses - API call completed', {
        duration: `${duration}ms`,
        success: result.success,
        status: result.status,
        timestamp: new Date().toISOString()
      });

      console.log('📱 [HomeScreen] getNewestSubcourses API Response:', {
        success: result.success,
        status: result.status,
        dataKeys: result.data ? Object.keys(result.data) : 'No data',
        fullResponse: JSON.stringify(result, null, 2)
      });

      // DETAILED API RESPONSE DEBUG FOR NEWEST COURSES
      
      if (result.data?.pagination) {
        
      }
      console.log('🔥🔥🔥 END NEWEST COURSES DEBUG 🔥🔥🔥');

      // Debug pagination structure for Newest Courses
      
      if (result.data?.pagination) {
       
      } else {
        console.log('🔍 [DEBUG] No pagination data found in Newest Courses response');
      }

      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('📱 [HomeScreen] Newest Courses Data Details:', {
          coursesCount: apiCourses.length,
          firstCourse: (apiCourses && apiCourses[0]) ? {
            id: apiCourses[0]._id,
            title: apiCourses[0].subcourseName,
            price: apiCourses[0].price,
            lessons: apiCourses[0].totalLessons
          } : 'No courses',
          paginationInfo: result.data.pagination || 'No pagination data',
          hasPagination: !!result.data.pagination
        });

        // Transform API data to match existing UI structure
        const transformedCourses = (apiCourses || []).map((course, index) => {
          const courseImage = course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/HomeImage.png');

          return {
            id: course._id || index + 1,
            title: course.subcourseName || 'Course Title',
            lessons: `${course.totalLessons || 0} lessons`,
            rating: course.avgRating ? course.avgRating.toString() : '4.5',
            price: `₹${course.price || 0}.00`,
            image: courseImage,
            isFavorite: userFavoriteCourses.has(String(course._id)), // Mark as favorite if in user's favorites
            isUpComingCourse: course.isUpComingCourse || false, // Add the upcoming course flag
          };
        });

        // Update pagination state
        if (result.data.pagination) {
          setCurrentPage(result.data.pagination.page || page);
          setTotalPages(result.data.pagination.totalPages || 1);
          setTotalCourses(result.data.pagination.total || apiCourses.length);
          setHasNextPage(result.data.pagination.hasNextPage || false);
          setHasPrevPage(result.data.pagination.hasPrevPage || false);
        }

        // If it's the first page, replace courses; otherwise append
        if (page === 1) {
          setCourseCards(transformedCourses);
        } else {
          setCourseCards(prevCourses => [...prevCourses, ...transformedCourses]);
        }
        console.log('✅ HomeScreen: Newest courses loaded successfully - Total courses:', transformedCourses.length);

      } else {
        setCourseError(result.data?.message || 'Failed to fetch newest courses');
        console.log('❌ HomeScreen: Failed to fetch newest courses:', {
          resultSuccess: result.success,
          dataSuccess: result.data?.success,
          errorMessage: result.data?.message,
          status: result.status,
          fullResult: JSON.stringify(result, null, 2)
        });
        // Keep existing course data if API fails
      }
    } catch (error) {
      setCourseError(error.message || 'Network error occurred');
      console.error('💥 HomeScreen: Error fetching newest courses:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      // Keep existing course data if error occurs
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Function to fetch banner data from homePage-banner API
  const fetchBannerData = async () => {
    try {
      console.log('🏠 HomeScreen: fetchBannerData called');
      setIsLoadingBanner(true);
      setBannerError(null);

      const apiUrl = getApiUrl(ENDPOINTS.HOMEPAGE_BANNER);
      console.log('📡 [API] HOMEPAGE_BANNER - Making API call...', {
        endpoint: ENDPOINTS.HOMEPAGE_BANNER,
        fullUrl: apiUrl,
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });
      console.log('🏠 HomeScreen: Fetching banner from URL:', apiUrl);
      console.log('🏠 HomeScreen: ENDPOINTS.HOMEPAGE_BANNER:', ENDPOINTS.HOMEPAGE_BANNER);

      // Prepare headers - include token if available, but don't require it
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🏠 HomeScreen: Using token for banner request');
      } else {
        console.log('🏠 HomeScreen: No token available for banner request');
      }

      console.log('🏠 HomeScreen: Banner request headers:', headers);
      
      const startTime = Date.now();
      console.log('📡 [API] HOMEPAGE_BANNER - Fetch request started');
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log('✅ [API] HOMEPAGE_BANNER - Fetch request completed', {
        duration: `${duration}ms`,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      }); 

      console.log('🏠 HomeScreen: Banner response status:', response.status);

      const result = await response.json();

      // Check for token errors
      if (checkApiResponseForTokenError({ status: response.status, data: result })) {
        console.log('🔐 [HomeScreen] Token error detected in fetchBannerData');
        await handleTokenError(result, true);
        return; // Exit early - navigation handled by tokenErrorHandler
      }

      if (response.ok) {
       

        if (result.success && result.data) {
        
          console.log('🏠 HomeScreen: Banner data details - recentPurchasedSubcourse:', result.data.recentPurchasedSubcourse);
        
          setBannerData(result.data);
        } else {
         
          // Set fallback banner data for new users
          const fallbackData = {
            recentSubcourse: null,
            recentPurchasedSubcourse: null,
            promos: [
              {
                _id: 'default-promo-1',
                promo: 'https://via.placeholder.com/400x200/FF8800/FFFFFF?text=Welcome+to+LearningSaint'
              }
            ]
          };
          console.log('🏠 HomeScreen: Setting fallback banner data:', fallbackData);
          setBannerData(fallbackData);
        }
      } else {
        const errorMessage = `Banner API call failed: ${response.status} ${response.statusText}`;
        console.log('❌ HomeScreen: Banner API call failed:', response.status, response.statusText);
        console.log('❌ HomeScreen: Setting banner error:', errorMessage);
        setBannerError(errorMessage);
        // Set fallback banner data when API fails
        setBannerData({
          recentSubcourse: null,
          recentPurchasedSubcourse: null,
          promos: [
            {
              _id: 'default-promo-1',
              promo: 'https://via.placeholder.com/400x200/FF8800/FFFFFF?text=Welcome+to+LearningSaint'
            }
          ]
        });
      }
    } catch (error) {
      const errorMessage = error.message || 'Network error occurred';
      console.log('❌ HomeScreen: Banner fetch error:', errorMessage);
      console.log('❌ HomeScreen: Banner error details:', error);
      setBannerError(errorMessage);
      // Set fallback banner data when network error occurs
      setBannerData({
        recentSubcourse: null,
        recentPurchasedSubcourse: null,
        promos: [
          {
            _id: 'default-promo-1',
            promo: 'https://via.placeholder.com/400x200/FF8800/FFFFFF?text=Welcome+to+LearningSaint'
          }
        ]
      });
    } finally {
      setIsLoadingBanner(false);
    }
  };

  // Function to fetch activities from API
  const fetchActivities = async () => {
    try {
      console.log('🏠 HomeScreen: fetchActivities called');
      setIsLoadingActivities(true);
      setActivitiesError(null);

      const apiUrl = getApiUrl('/api/user/activites/get-activity-images');
      console.log('📡 [API] ACTIVITIES - Making API call...', {
        endpoint: '/api/user/activites/get-activity-images',
        fullUrl: apiUrl,
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });
      console.log('🏠 HomeScreen: Fetching activities from URL:', apiUrl);

      // Prepare headers - include token if available
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🏠 HomeScreen: Using token for activities request');
      } else {
        console.log('🏠 HomeScreen: No token available for activities request');
      }

      console.log('🏠 HomeScreen: Activities request headers:', headers);
      
      const startTime = Date.now();
      console.log('📡 [API] ACTIVITIES - Fetch request started');
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log('✅ [API] ACTIVITIES - Fetch request completed', {
        duration: `${duration}ms`,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      }); 

      console.log('🏠 HomeScreen: Activities response status:', response.status);

      const result = await response.json();

      // Check for token errors
      if (checkApiResponseForTokenError({ status: response.status, data: result })) {
        console.log('🔐 [HomeScreen] Token error detected in fetchActivities');
        await handleTokenError(result, true);
        return; // Exit early - navigation handled by tokenErrorHandler
      }

      if (response.ok) {
        console.log('🏠 [HomeScreen] Activities API response success:', result.success);
        console.log('🏠 HomeScreen: Response data:', result.data);
        console.log('🏠 HomeScreen: Response message:', result.message);

        if (result.success && result.data) {
          console.log('🏠 HomeScreen: Activities data fetched successfully:', result.data);
          setActivities(result.data || []);
        } else {
          console.log('❌ HomeScreen: Activities API response not successful:', result);
          setActivitiesError(result.message || 'Failed to fetch activities');
          setActivities([]);
        }
      } else {
        const errorMessage = `Activities API call failed: ${response.status} ${response.statusText}`;
        console.log('❌ HomeScreen: Activities API call failed:', response.status, response.statusText);
        console.log('❌ HomeScreen: Setting activities error:', errorMessage);
        setActivitiesError(errorMessage);
        setActivities([]);
      }
    } catch (error) {
      const errorMessage = error.message || 'Network error occurred';
      console.log('❌ HomeScreen: Activities fetch error:', errorMessage);
      console.log('❌ HomeScreen: Activities error details:', error);
      setActivitiesError(errorMessage);
      setActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  // Function to fetch user's favorite courses from API
  const fetchUserFavoriteCourses = async () => {
    try {
      // Debounce: Only fetch if at least 2 seconds have passed since last fetch
      const now = Date.now();
      if (now - lastFetchTimeRef.current < 2000) {
        console.log('⏱️ HomeScreen: Skipping favorite fetch - too soon since last fetch');
        return;
      }

      lastFetchTimeRef.current = now;
      console.log('🚀 [HomeScreen] fetchUserFavoriteCourses called - getFavoriteCourses API');
      console.log('🚀 [HomeScreen] API Request Details:', {
        api: 'courseAPI.getFavoriteCourses',
        endpoint: '/api/course/get-favorite-courses',
        token: token ? `${token.substring(0, 10)}...` : 'Missing',
        timestamp: new Date().toISOString()
      });

      console.log('📡 [API] getFavoriteCourses - Making API call...', {
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });
      const startTime = Date.now();
      const result = await courseAPI.getFavoriteCourses(token);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('✅ [API] getFavoriteCourses - API call completed', {
        duration: `${duration}ms`,
        success: result.success,
        status: result.status,
        timestamp: new Date().toISOString()
      });
      
      console.log('📱 [HomeScreen] getFavoriteCourses API Response:', {
        success: result.success,
        status: result.status,
        dataKeys: result.data ? Object.keys(result.data) : 'No data',
        fullResponse: JSON.stringify(result, null, 2)
      });

      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('📱 [HomeScreen] Favorite Courses Data Details:', {
          coursesCount: apiCourses.length,
          firstCourse: (apiCourses && apiCourses[0]) ? {
            id: apiCourses[0].id?._id || apiCourses[0].subcourseId || apiCourses[0]._id,
            title: apiCourses[0].subcourseName || 'Unknown'
          } : 'No courses',
          paginationInfo: result.data.pagination || 'No pagination data',
          hasPagination: !!result.data.pagination
        });
        
        // Check if apiCourses is an array
        if (Array.isArray(apiCourses)) {
          console.log('✅ HomeScreen: Found', apiCourses.length, 'favorite courses');
          
          const favoriteCourseIds = (apiCourses || []).map(course => {
            // Handle different possible ID structures from API
            const courseId = course.id?._id || course.subcourseId || course._id;
            return String(courseId);
          }).filter(id => id && id !== 'undefined'); // Filter out invalid IDs

          console.log('📱 [HomeScreen] Favorite Course IDs:', favoriteCourseIds);

          const newFavoriteSet = new Set(favoriteCourseIds);
          setUserFavoriteCourses(newFavoriteSet);

        // Update course cards with fresh favorite status
        setCourseCards(prevCourses =>
          (prevCourses || []).map(course => ({
            ...course,
            isFavorite: newFavoriteSet.has(String(course.id))
          }))
        );

        // Update featured courses with fresh favorite status
        setFeaturedCourses(prevFeatured =>
          (prevFeatured || []).map(course => ({
            ...course,
            isFavorite: newFavoriteSet.has(String(course.id))
          }))
        );

          console.log('✅ HomeScreen: Favorite courses updated successfully');
        } else {
          console.log('⚠️ HomeScreen: Favorite courses data is not an array:', typeof apiCourses);
          setUserFavoriteCourses(new Set());
        }
      } else {
        const errorMessage = result.data?.message || result.message || 'Failed to fetch favorite courses';
        console.log('❌ HomeScreen: Failed to fetch favorite courses:', {
          resultSuccess: result.success,
          dataSuccess: result.data?.success,
          errorMessage: errorMessage,
          status: result.status,
          fullResult: JSON.stringify(result, null, 2)
        });
        setUserFavoriteCourses(new Set()); // Set empty set on failure
      }
    } catch (error) {
      setUserFavoriteCourses(new Set()); // Set empty set on error
      console.error('💥 [HomeScreen] Error fetching favorite courses:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Function to fetch unread notification count
  const fetchUnreadNotificationCount = async () => {
    try {
      if (!token) {
        setUnreadNotificationCount(0);
        return;
      }

      console.log('🔔 [HomeScreen] fetchUnreadNotificationCount called');
      const count = await notificationService.getUnreadCount(token);
      console.log('🔔 [HomeScreen] Unread notification count:', count);
      setUnreadNotificationCount(count || 0);
    } catch (error) {
      console.error('💥 [HomeScreen] Error fetching unread notification count:', error);
      setUnreadNotificationCount(0); // Default to 0 on error
    }
  };

  // Function to fetch user's profile data from API
  const fetchUserProfile = async () => {
    try {
      console.log('🚀 [HomeScreen] fetchUserProfile called - getUserProfile API');
      console.log('🚀 [HomeScreen] API Request Details:', {
        api: 'profileAPI.getUserProfile',
        endpoint: '/api/user/profile/get-profile',
        token: token ? `${token.substring(0, 10)}...` : 'Missing',
        timestamp: new Date().toISOString()
      });

      console.log('📡 [API] getUserProfile - Making API call...', {
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });
      const startTime = Date.now();
      const result = await profileAPI.getUserProfile(token);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('✅ [API] getUserProfile - API call completed', {
        duration: `${duration}ms`,
        success: result.success,
        status: result.status,
        timestamp: new Date().toISOString()
      });
      
      console.log('📱 [HomeScreen] getUserProfile API Response:', {
        success: result.success,
        status: result.status,
        dataKeys: result.data ? Object.keys(result.data) : 'No data',
        fullResponse: JSON.stringify(result, null, 2)
      });

      if (result.success && result.data.success) {
        const profileData = result.data.data;
        console.log('📱 [HomeScreen] Profile Data Details:', {
          fullName: profileData.fullName,
          mobileNumber: profileData.mobileNumber,
          email: profileData.email,
          address: profileData.address,
          isEmailVerified: profileData.isEmailVerified,
          hasProfileImage: !!profileData.profileImageUrl,
          profileImageUrl: profileData.profileImageUrl ? 'Present' : 'Not present',
          paginationInfo: result.data.pagination || 'No pagination data',
          hasPagination: !!result.data.pagination
        });

        // Update Redux store with fresh profile data
        dispatch(setProfileData(profileData));
        console.log('✅ HomeScreen: Profile data updated successfully in Redux');
      } else {
        console.log('❌ HomeScreen: Failed to fetch profile:', {
          resultSuccess: result.success,
          dataSuccess: result.data?.success,
          errorMessage: result.data?.message,
          status: result.status,
          fullResult: JSON.stringify(result, null, 2)
        });
      }
    } catch (error) {
      console.error('💥 HomeScreen: Error fetching profile:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
  };

  // Function to load more courses (pagination)
  const loadMoreCourses = async () => {
    console.log('📄 [HomeScreen] loadMoreCourses called', {
      isLoadingMore,
      hasNextPage,
      currentPage,
      selectedFilter,
      timestamp: new Date().toISOString()
    });
    
    if (isLoadingMore || !hasNextPage) {
      console.log('📄 [HomeScreen] Load more cancelled:', {
        isLoadingMore,
        hasNextPage
      });
      return;
    }
    
    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      console.log('📄 [HomeScreen] Loading more courses - Page:', nextPage, 'Filter:', selectedFilter);
      console.log('📡 [API] Load more - fetching next page');
      
      // Load more based on selected filter
      if (selectedFilter === 'Popular') {
        await fetchPopularCourses(nextPage, 6);
      } else if (selectedFilter === 'Newest') {
        await fetchNewestCourses(nextPage, 6);
      } else {
        await fetchCourseData(nextPage, 5);
      }
    } catch (error) {
      console.error('💥 HomeScreen: Error loading more courses:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Function to search courses based on keyword
  const searchCourses = (keyword) => {
    console.log('🔍 [HomeScreen] searchCourses called', {
      keyword,
      keywordLength: keyword.length,
      timestamp: new Date().toISOString()
    });
    
    if (!keyword.trim()) {
      console.log('🔍 [HomeScreen] Empty keyword, clearing search');
      setFilteredCourses([]);
      setIsSearching(false);
      return;
    }

    console.log('🔍 [HomeScreen] Starting search with keyword:', keyword);
    setIsSearching(true);

    // Add a small delay to show loading state and prevent too many rapid searches
    setTimeout(() => {
      const searchTerm = keyword.toLowerCase().trim();

      // Filter courses based on search keyword
      const filtered = (courseCards || []).filter(course => {
        const title = (course.title || '').toLowerCase();
        return title.includes(searchTerm);
      });

      setFilteredCourses(filtered);
      setIsSearching(false);
    }, 300); // 300ms delay
  };

  // Function to handle search input change
  const handleSearchChange = (text) => {
    console.log('🔍 [HomeScreen] Search input changed', {
      text,
      textLength: text.length,
      timestamp: new Date().toISOString()
    });
    
    setSearchKeyword(text);
    if (text.trim()) {
      console.log('🔍 [HomeScreen] Non-empty search, triggering searchCourses');
      searchCourses(text);
    } else {
      console.log('🔍 [HomeScreen] Empty search, clearing results');
      setFilteredCourses([]);
      setIsSearching(false);
    }
  };

  // Manual refresh function (can be called if needed)
  const refreshCourseData = async () => {
    if (token) {
      try {
        // Refresh in sequence: favorites first, then courses
        await fetchUserFavoriteCourses();
        await fetchCourseData();
      } catch (error) {
        // Handle error silently
      }
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    console.log('🔄 [HomeScreen] Pull-to-refresh triggered', {
      hasToken: !!token,
      selectedFilter,
      timestamp: new Date().toISOString()
    });
    
    setRefreshing(true);
    try {
      if (token) {
        console.log('🔄 [HomeScreen] User logged in, refreshing user-specific data');
        // For logged-in users: refresh user-specific data
        console.log('📡 [API] Refresh: Calling fetchUserFavoriteCourses...');
        console.log('📡 [API] Refresh: Calling fetchUserProfile...');
        console.log('📡 [API] Refresh: Calling fetchUnreadNotificationCount...');
        await Promise.all([
          fetchUserFavoriteCourses(),
          fetchUserProfile(),
          fetchUnreadNotificationCount()
        ]);
      } else {
        console.log('🔄 [HomeScreen] User not logged in, skipping user-specific data');
        setUnreadNotificationCount(0);
      }

      // Always refresh course and banner data
      console.log('📡 [API] Refresh: Calling fetchCourseData...');
      console.log('📡 [API] Refresh: Calling fetchFeaturedCourses...');
      console.log('📡 [API] Refresh: Calling fetchBannerData...');
      console.log('📡 [API] Refresh: Calling fetchActivities...');
      
      await Promise.all([
        fetchCourseData(),
        fetchFeaturedCourses(),
        fetchBannerData(),
        fetchActivities()
      ]);
      
      console.log('✅ [HomeScreen] Pull-to-refresh completed successfully');
    } catch (error) {
      console.error('❌ [HomeScreen] Error during refresh:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      // Continue even if some refreshes fail
    } finally {
      setRefreshing(false);
      console.log('🔄 [HomeScreen] Refreshing state set to false');
    }
  };

  // Function to toggle favorite status
  const toggleFavorite = async (courseId, currentFavoriteStatus) => {
    console.log('❤️ [HomeScreen] toggleFavorite called', {
      courseId,
      currentFavoriteStatus,
      hasToken: !!token,
      timestamp: new Date().toISOString()
    });
    
    try {
      // Check if token exists
      if (!token) {
        console.log('⚠️ [HomeScreen] toggleFavorite - No token available');
        return;
      }

      // Check if courseId exists
      if (!courseId) {
        console.log('⚠️ [HomeScreen] toggleFavorite - No courseId provided');
        return;
      }

      // Check if already toggling this course to prevent double calls
      if (togglingFavorites.has(String(courseId))) {
        console.log('⚠️ [HomeScreen] toggleFavorite - Already toggling this course, skipping');
        return;
      }

      // Set loading state for this specific course
      setTogglingFavorites(prev => new Set(prev).add(String(courseId)));

      console.log('📡 [API] toggleFavorite - Making API call...', {
        courseId,
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });
      const startTime = Date.now();
      const result = await courseAPI.toggleFavorite(token, courseId);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log('✅ [API] toggleFavorite - API call completed', {
        duration: `${duration}ms`,
        success: result.success,
        status: result.status,
        timestamp: new Date().toISOString()
      });

      if (result.success && result.data.success) {
        // Get the new favorite status from the API response
        const newFavoriteStatus = result.data.data.isLike;

        // Update the userFavoriteCourses set
        setUserFavoriteCourses(prevFavorites => {
          const newFavorites = new Set(prevFavorites);
          if (newFavoriteStatus) {
            newFavorites.add(String(courseId));
          } else {
            newFavorites.delete(String(courseId));
          }
          return newFavorites;
        });

        // Update the course in the local state
        setCourseCards(prevCourses => {
          const updatedCourses = (prevCourses || []).map(course => {
            // Convert both IDs to strings for comparison to handle type mismatches
            if (String(course.id) === String(courseId)) {
              return { ...course, isFavorite: newFavoriteStatus };
            }
            return course;
          });
          return updatedCourses;
        });

        // Also update featured courses if this course is in there
        setFeaturedCourses(prevFeatured => {
          const updatedFeatured = (prevFeatured || []).map(course => {
            if (String(course.id) === String(courseId)) {
              return { ...course, isFavorite: newFavoriteStatus };
            }
            return course;
          });
          return updatedFeatured;
        });

        console.log('✅ [HomeScreen] toggleFavorite - Successfully updated favorite status:', {
          courseId,
          newStatus: newFavoriteStatus,
          timestamp: new Date().toISOString()
        });
      } else {
        console.log('❌ [HomeScreen] toggleFavorite - API call failed:', {
          success: result.success,
          status: result.status,
          message: result.data?.message
        });
      }
    } catch (error) {
      console.error('💥 [HomeScreen] toggleFavorite - Error:', {
        message: error.message,
        courseId,
        timestamp: new Date().toISOString()
      });
    } finally {
      // Remove loading state for this course
      setTogglingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(String(courseId));
        return newSet;
      });
    }
  };

  // Removed empty useEffect that was not doing anything useful

  // Removed problematic useEffect hooks that were causing infinite loops
  // Course state updates are now handled directly in fetchUserFavoriteCourses function

  // Filter courses when search keyword changes (removed courseCards dependency to prevent loops)
  useEffect(() => {
    if (searchKeyword.trim()) {
      searchCourses(searchKeyword);
    } else {
      setFilteredCourses([]);
      setIsSearching(false);
    }
  }, [searchKeyword]); // Removed courseCards dependency to prevent infinite loops

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      // Cleanup carousel intervals
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
        carouselIntervalRef.current = null;
      }
      if (activitiesIntervalRef.current) {
        clearInterval(activitiesIntervalRef.current);
        activitiesIntervalRef.current = null;
      }
    };
  }, []);

  // Auto-scroll for Banner Carousel
  useEffect(() => {
    // Calculate total items for banner carousel
    let totalItems = 0;
    if (bannerData.recentSubcourse) totalItems++;
    if (bannerData.recentPurchasedSubcourse) totalItems++;
    if (bannerData.promos && bannerData.promos.length > 0) totalItems += bannerData.promos.length;
    
    // Fallback to featured courses if no banner data
    if (totalItems === 0 && featuredCourses.length > 0) {
      totalItems = featuredCourses.length;
    }
    
    // Final fallback: ensure at least 1 item
    if (totalItems === 0) {
      totalItems = 1;
    }

    // Only auto-scroll if there's more than 1 item
    if (totalItems <= 1 || isCarouselPausedRef.current) {
      return;
    }

    // Clear existing interval
    if (carouselIntervalRef.current) {
      clearInterval(carouselIntervalRef.current);
    }

    // Set up auto-scroll interval (1 second - very fast)
    carouselIntervalRef.current = setInterval(() => {
      if (carouselRef.current && !isCarouselPausedRef.current) {
        const nextIndex = (currentCarouselIndex + 1) % totalItems;
        const itemWidth = width - getResponsiveSize(40);
        carouselRef.current.scrollTo({
          x: nextIndex * itemWidth,
          animated: true,
        });
        setCurrentCarouselIndex(nextIndex);
      }
    }, 1000); // Auto-scroll every 1 second (very fast)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (carouselIntervalRef.current) {
        clearInterval(carouselIntervalRef.current);
        carouselIntervalRef.current = null;
      }
    };
  }, [currentCarouselIndex, bannerData, featuredCourses, width]);

  // Auto-scroll for Activities Carousel
  useEffect(() => {
    // Only auto-scroll if there's more than 1 activity
    if (activities.length <= 1 || isActivitiesPausedRef.current) {
      return;
    }

    // Clear existing interval
    if (activitiesIntervalRef.current) {
      clearInterval(activitiesIntervalRef.current);
    }

    // Set up auto-scroll interval (1 second - very fast)
    activitiesIntervalRef.current = setInterval(() => {
      if (activitiesCarouselRef.current && !isActivitiesPausedRef.current) {
        const nextIndex = (currentActivityIndex + 1) % activities.length;
        const itemWidth = width - getResponsiveSize(40);
        activitiesCarouselRef.current.scrollTo({
          x: nextIndex * itemWidth,
          animated: true,
        });
        setCurrentActivityIndex(nextIndex);
      }
    }, 1000); // Auto-scroll every 1 second (very fast)

    // Cleanup on unmount or when dependencies change
    return () => {
      if (activitiesIntervalRef.current) {
        clearInterval(activitiesIntervalRef.current);
        activitiesIntervalRef.current = null;
      }
    };
  }, [currentActivityIndex, activities.length, width]);

  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);
  const activitiesCarouselRef = useRef(null);

  // Refs for auto-carousel intervals
  const carouselIntervalRef = useRef(null);
  const activitiesIntervalRef = useRef(null);
  const isCarouselPausedRef = useRef(false);
  const isActivitiesPausedRef = useRef(false);

  const filterOptions = ['All Course', 'Popular', 'Newest'];

  const renderProgressCircle = (progress) => {
    const radius = getResponsiveSize(20);
    const strokeWidth = 3;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          <View style={styles.progressBackground} />
          <View
            style={[
              styles.progressFill,
              {
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                transform: [{ rotate: '-90deg' }],
              },
            ]}
          >
            <View
              style={[
                styles.progressArc,
                {
                  width: radius * 2,
                  height: radius * 2,
                  borderRadius: radius,
                  borderWidth: strokeWidth,
                  borderColor: 'transparent',
                  borderTopColor: '#fff',
                  borderRightColor: progress > 25 ? '#fff' : 'transparent',
                  borderBottomColor: progress > 50 ? '#fff' : 'transparent',
                  borderLeftColor: progress > 75 ? '#fff' : 'transparent',
                  transform: [{ rotate: `${(progress / 100) * 360}deg` }],
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>
    );
  };

  const renderCarouselItem = (item, index) => {
    // Check if this is a promo item
    const isPromoItem = item.isPromo || false;

    // Set display properties based on item type
    let displayItem = item;
    let buttonText = item.buttonText || '';
    let progress = item.progress || 0;
    let showProgressCircle = false;
    let showCourseDetails = true;

    if (isPromoItem) {
      // Promo item: complete image banner, no text, no buttons, no course details
      buttonText = ''; // No button for promo image
      progress = 0;
      showProgressCircle = false; // Don't show progress circle for promo
      showCourseDetails = false; // Don't show course details for promo
    } else {
      // Course item: show course details and appropriate button
      showCourseDetails = true; // Show course details (title, lessons)

      // Determine if we should show progress circle
      if (item.buttonText === 'Continue Learning') {
        showProgressCircle = true; // Show progress circle for Continue Learning
      } else {
        showProgressCircle = false; // Don't show progress circle for Explore
      }
    }

    return (
      <View key={displayItem.id || index} style={styles.carouselItem}>
        {isPromoItem ? (
          // Third item: Promo image as complete card
          <View style={[styles.carouselCard, styles.carouselCardPromo]}>
            <Image source={displayItem.image} style={styles.carouselBannerImage} resizeMode="cover" />
          </View>
        ) : (
          // First and second items: Regular course cards with gradient
          <LinearGradient
            colors={index === 0 ? ['#003E54', '#0090B2'] : ['#2285FA', '#0029B9']}
            style={styles.carouselCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.carouselContentRow}>
              <Image source={displayItem.image} style={styles.carouselImage} resizeMode="cover" />
              {showCourseDetails && (
                <View style={styles.carouselTextGroup}>
                  <Text style={styles.carouselTitle} numberOfLines={1}>{displayItem.title}</Text>
                  <Text style={styles.carouselLessons}>{displayItem.lessons}</Text>
                </View>
              )}
              {showProgressCircle && (
                <View style={styles.progressContainerAbsolute}>{renderProgressCircle(progress)}</View>
              )}
            </View>
            {buttonText && ( // Only show button if buttonText exists
              <TouchableOpacity
                style={[
                  buttonText === 'Continue Learning' ? styles.continueButton : styles.exploreButton
                ]}
                onPress={() => {
                  let courseIdToPass = null;

                  // Get the correct course ID based on which item this is
                  if (index === 0 && bannerData.recentSubcourse) {
                    // First item: recentSubcourse
                    courseIdToPass = bannerData.recentSubcourse._id;
                  } else if (index === 1 && bannerData.recentPurchasedSubcourse) {
                    // Second item: recentPurchasedSubcourse
                    courseIdToPass = bannerData.recentPurchasedSubcourse._id;
                  } else {
                    // Fallback to featured course ID
                    courseIdToPass = item.id;
                  }

                  console.log('🎯 [HomeScreen] Carousel button pressed', {
                    buttonText,
                    index,
                    courseIdToPass,
                    timestamp: new Date().toISOString()
                  });
                  
                  if (courseIdToPass) {
                    console.log('🧭 [Navigation] Navigating to Enroll with courseId:', courseIdToPass);
                    navigation.navigate('Enroll', { courseId: courseIdToPass });
                  } else {
                    console.log('🧭 [Navigation] Navigating to Enroll without courseId');
                    navigation.navigate('Enroll');
                  }
                }}
              >
                <Text style={[
                  buttonText === 'Continue Learning' ? styles.continueButtonText : styles.exploreButtonText
                ]}>
                  {buttonText}
                </Text>
              </TouchableOpacity>
            )}
          </LinearGradient>
        )}
      </View>
    );
  };

  const renderCourseCard = (course) => (
    <TouchableOpacity
      key={course.id}
      style={[
        styles.courseCard,
        course.isUpComingCourse && styles.courseCardDisabled
      ]}
      onPress={async () => {
        console.log('📚 [HomeScreen] Course card pressed', {
          courseId: course.id,
          courseTitle: course.title,
          isUpComingCourse: course.isUpComingCourse,
          timestamp: new Date().toISOString()
        });
        
        // Don't navigate if it's a coming soon course
        if (course.isUpComingCourse) {
          console.log('📚 [HomeScreen] Course is upcoming, navigation blocked');
          return;
        }
        
        // Show Interstitial Ad before navigation (Android only)
        if (Platform.OS === 'android' && interstitialAdRef.current) {
          try {
            const isLoaded = interstitialAdRef.current.loaded;
            if (isLoaded) {
              console.log('📱 [HomeScreen] Showing Interstitial Ad before navigation');
              // Store courseId for navigation after ad closes
              pendingNavigationRef.current = course.id;
              await interstitialAdRef.current.show();
            } else {
              console.log('📱 [HomeScreen] Interstitial Ad not loaded yet, navigating directly');
              navigation.navigate('Enroll', { courseId: course.id });
            }
          } catch (error) {
            console.error('❌ [HomeScreen] Error showing Interstitial Ad:', error);
            // Navigate even if ad fails
            navigation.navigate('Enroll', { courseId: course.id });
          }
        } else {
          // iOS or ad not available, navigate directly
          console.log('🧭 [Navigation] Navigating to Enroll screen with courseId:', course.id);
          navigation.navigate('Enroll', { courseId: course.id });
        }
      }}
      disabled={course.isUpComingCourse}
    >
      <Image
        source={course.image}
        style={styles.courseCardImage}
        resizeMode="cover"
      />
      <View style={styles.courseCardContent}>
        <Text style={styles.courseCardTitle}>{course.title}</Text>
        <View style={styles.courseCardDetails}>
          <Text style={styles.courseCardLessons}>{course.lessons}</Text>

        </View>

        <View style={styles.ratingContainer}>
          <Icon name="star" size={getResponsiveSize(14)} color="#FFD700" />
          <Text style={styles.ratingText}>{course.rating}</Text>
        </View>
      </View>

      <View style={styles.courseCardRight}>
        <TouchableOpacity
          style={[
            styles.heartButton,
            togglingFavorites.has(String(course.id)) && styles.heartButtonLoading
          ]}
          onPress={() => toggleFavorite(course.id, course.isFavorite)}
          disabled={togglingFavorites.has(String(course.id))}
        >
          <Icon
            name={course.isFavorite ? "heart" : "heart-outline"}
            size={getResponsiveSize(20)}
            color={course.isFavorite ? "#FF8800" : "#FF8800"} // Both filled and outline use #FF8800
          />
        </TouchableOpacity>
        <Text style={styles.coursePrice}>{course.price}</Text>
      </View>
      
      {/* Coming Soon Label - Centered */}
      {course.isUpComingCourse && (
        <View style={styles.comingSoonLabel}>
          <Image 
            source={require('../assests/images/coming.png')} 
            style={styles.comingSoonImage}
            resizeMode="contain"
          />
        </View>
      )}
      
      {/* Gradient Overlay for Coming Soon Cards */}
      {course.isUpComingCourse && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.3)']}
          style={styles.gradientOverlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      )}
    </TouchableOpacity>


  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.profileSection}>
            <Image
              source={profileImageUrl ? { uri: profileImageUrl } : require('../assests/images/Profile.png')}
              style={styles.profileImage}
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Hello!</Text>
              <Text style={styles.userName}>{fullName || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => {
            console.log('🔔 [HomeScreen] Notification button pressed');
            console.log('🔔 [HomeScreen] Current unread count:', unreadNotificationCount);
            console.log('🧭 [Navigation] Navigating to Notification screen');
            navigation.navigate('Notification');
          }}>
            <NotificationBadge
              size={24}
              color="#000000"
              showBadge={unreadNotificationCount > 0} // true = Notification1.png (when count > 0), false = Bell.png (when count = 0)
            />
          </TouchableOpacity>



        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === 'android' ? Math.max(insets.bottom + 100, 100) : insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FF8800']} // Android
            tintColor="#FF8800" // iOS
            title="Pull to refresh"
            titleColor="#FF8800"
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon
            name="search"
            size={getResponsiveSize(20)}
            color="#FF8800"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Courses"
            placeholderTextColor="#999"
            value={searchKeyword}
            onChangeText={handleSearchChange}
            onSubmitEditing={() => {
              searchCourses(searchKeyword);
            }}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchKeyword.trim() && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => {
                setSearchKeyword('');
                setFilteredCourses([]);
                setIsSearching(false);
              }}
            >
              <Icon name="close" size={18} color="#FF8800" />

            </TouchableOpacity>
          )}
        </View>

        {/* AdMob Banner Ad - HomeScreenBanner */}
        {/* Only show on Android to avoid crashes */}
        {/* Use TestIds in development, production IDs in production */}
        {Platform.OS === 'android' && (
          <View style={styles.bannerAdContainer}>
            <BannerAd
              unitId={__DEV__ ? TestIds.BANNER : "ca-app-pub-7361876223006934/6909446326"}
              size={BannerAdSize.BANNER}
              requestOptions={{
                requestNonPersonalizedAdsOnly: true,
              }}
              onAdLoaded={() => {
                console.log('🏠 [HomeScreen] AdMob Banner Ad loaded successfully', __DEV__ ? '(Test Ad)' : '(Production Ad)');
              }}
              onAdFailedToLoad={(error) => {
                console.log('🏠 [HomeScreen] AdMob Banner Ad failed to load:', error);
              }}
            />
          </View>
        )}

        {/* Featured Course Carousel */}
        <View style={styles.carouselSection}>
          {isLoadingFeatured || isLoadingBanner ? (
            <View style={styles.carouselLoadingContainer}>
              <Text style={styles.carouselLoadingText}>Loading content...</Text>
            </View>
          ) : (featuredError || bannerError) ? (
            <View style={styles.carouselErrorContainer}>
              <Text style={styles.carouselErrorText}>Error loading content</Text>
              <Text style={styles.carouselErrorText}>Featured Error: {featuredError}</Text>
              <Text style={styles.carouselErrorText}>Banner Error: {bannerError}</Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={() => {
                  if (featuredError) {
                    fetchFeaturedCourses();
                  }
                  if (bannerError) {
                    fetchBannerData();
                  }
                }}
              >
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (() => {
            // Check if we have any content to show
            const hasBannerContent = bannerData.recentSubcourse ||
              bannerData.recentPurchasedSubcourse ||
              (bannerData.promos && bannerData.promos.length > 0);
            const hasFeaturedContent = featuredCourses.length > 0;

            

            // Check if banner data is still in initial state (all null/empty)
            const isBannerDataInitial = !bannerData.recentSubcourse && 
              !bannerData.recentPurchasedSubcourse && 
              (!bannerData.promos || bannerData.promos.length === 0);

            console.log('🏠 HomeScreen: Carousel render check - isBannerDataInitial:', isBannerDataInitial);

            if (isBannerDataInitial && !hasFeaturedContent) {
              console.log('🏠 HomeScreen: Banner data is in initial state, showing loading or default banner');
              // Show loading state if banner is still loading, otherwise show default banner
              if (isLoadingBanner) {
                return (
                  <View style={styles.carouselLoadingContainer}>
                    <Text style={styles.carouselLoadingText}>Loading banner...</Text>
                  </View>
                );
              } else {
                // Show default banner when no data is available
                return (
                  <>
                    <ScrollView
                      ref={carouselRef}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: false }
                      )}
                      onScrollBeginDrag={() => {
                        isCarouselPausedRef.current = true;
                      }}
                      onScrollEndDrag={() => {
                        setTimeout(() => {
                          isCarouselPausedRef.current = false;
                        }, 2000); // Resume after 2 seconds (faster)
                      }}
                      onMomentumScrollEnd={(event) => {
                        const index = Math.round(event.nativeEvent.contentOffset.x / (width - getResponsiveSize(40)));
                        setCurrentCarouselIndex(index);
                      }}
                      snapToInterval={width - getResponsiveSize(40)}
                      decelerationRate="fast"
                      style={styles.carousel}
                      contentContainerStyle={styles.carouselContentContainer}
                    >
                      <View style={styles.carouselItem}>
                        <View style={[styles.carouselCard, styles.carouselCardPromo]}>
                          <Image
                            source={require('../assests/images/HomeImage.png')}
                            style={styles.carouselBannerImage}
                            resizeMode="cover"
                          />
                        </View>
                      </View>
                    </ScrollView>

                    <View style={styles.dotsContainer}>
                      <View style={[styles.dot, styles.activeDot]} />
                    </View>
                  </>
                );
              }
            }

            if (!hasBannerContent && !hasFeaturedContent) {
              console.log('🏠 HomeScreen: No content available, showing default banner');
              // Instead of showing empty message, show a default banner
              return (
                <>
                  <ScrollView
                    ref={carouselRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                      { useNativeDriver: false }
                    )}
                    onScrollBeginDrag={() => {
                      isCarouselPausedRef.current = true;
                    }}
                    onScrollEndDrag={() => {
                      setTimeout(() => {
                        isCarouselPausedRef.current = false;
                      }, 3000); // Resume after 3 seconds (faster)
                    }}
                    onMomentumScrollEnd={(event) => {
                      const index = Math.round(event.nativeEvent.contentOffset.x / (width - getResponsiveSize(40)));
                      setCurrentCarouselIndex(index);
                    }}
                    snapToInterval={width - getResponsiveSize(40)}
                    decelerationRate="fast"
                    style={styles.carousel}
                    contentContainerStyle={styles.carouselContentContainer}
                  >
                    <View style={styles.carouselItem}>
                      <View style={[styles.carouselCard, styles.carouselCardPromo]}>
                        <Image
                          source={require('../assests/images/HomeImage.png')}
                          style={styles.carouselBannerImage}
                          resizeMode="cover"
                        />
                      </View>
                    </View>
                  </ScrollView>

                  <View style={styles.dotsContainer}>
                    <View style={[styles.dot, styles.activeDot]} />
                  </View>
                </>
              );
            }

            console.log('🏠 HomeScreen: Content available, rendering carousel');

            return (
              <>
                <ScrollView
                  ref={carouselRef}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                  )}
                  onScrollBeginDrag={() => {
                    // Pause auto-scroll when user starts scrolling
                    isCarouselPausedRef.current = true;
                  }}
                  onScrollEndDrag={() => {
                    // Resume auto-scroll after 2 seconds of user interaction (faster)
                    setTimeout(() => {
                      isCarouselPausedRef.current = false;
                    }, 2000);
                  }}
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / (width - getResponsiveSize(40)));
                    setCurrentCarouselIndex(index);
                  }}
                  snapToInterval={width - getResponsiveSize(40)}
                  decelerationRate="fast"
                  style={styles.carousel}
                  contentContainerStyle={styles.carouselContentContainer}
                >
                  {/* Render all carousel items in sequence */}
                  {(() => {
                    const allItems = [];
                    let itemIndex = 0;

                    // First, add recentSubcourse if available
                    if (bannerData.recentSubcourse) {
                      const recentCourse = {
                        id: bannerData.recentSubcourse._id,
                        title: bannerData.recentSubcourse.subcourseName,
                        lessons: `${bannerData.recentSubcourse.totalLessons} lessons`,
                        image: bannerData.recentSubcourse.thumbnailImageUrl ? { uri: bannerData.recentSubcourse.thumbnailImageUrl } : require('../assests/images/Circular.png'),
                        progress: 0,
                        buttonText: 'Explore'
                      };
                      allItems.push(renderCarouselItem(recentCourse, itemIndex));
                      itemIndex++;
                    }

                    // Second, add recentPurchasedSubcourse if available
                    if (bannerData.recentPurchasedSubcourse) {
                      const purchasedCourse = {
                        id: bannerData.recentPurchasedSubcourse._id,
                        title: bannerData.recentPurchasedSubcourse.subcourseName,
                        lessons: `${bannerData.recentPurchasedSubcourse.totalLessons} lessons`,
                        image: bannerData.recentPurchasedSubcourse.thumbnailImageUrl ? { uri: bannerData.recentPurchasedSubcourse.thumbnailImageUrl } : require('../assests/images/Circular.png'),
                        progress: parseInt((bannerData.recentPurchasedSubcourse.progress || '').replace('%', '') || '0'),
                        buttonText: 'Continue Learning'
                      };
                      allItems.push(renderCarouselItem(purchasedCourse, itemIndex));
                      itemIndex++;
                    }

                    // Third, add first promo if available
                    if (bannerData.promos && bannerData.promos.length > 0) {
                      const promo = bannerData.promos[0];
                      const promoItem = {
                        id: `promo-${promo._id}`,
                        image: { uri: promo.promo },
                        isPromo: true
                      };
                      allItems.push(renderCarouselItem(promoItem, itemIndex));
                      itemIndex++;
                    }

                    // Add featured courses if no banner data or as fallback
                    if (allItems.length === 0 && featuredCourses.length > 0) {
                      featuredCourses.forEach((course, index) => {
                        allItems.push(renderCarouselItem(course, itemIndex));
                        itemIndex++;
                      });
                    }

                    // Final fallback: If still no items, show a default welcome banner
                    if (allItems.length === 0) {
                      const defaultBanner = {
                        id: 'default-welcome',
                        image: require('../assests/images/HomeImage.png'), // Use a local image as fallback
                        isPromo: true
                      };
                      allItems.push(renderCarouselItem(defaultBanner, itemIndex));
                      itemIndex++;
                    }

                    // Add additional promo images if available
                    if (bannerData.promos && bannerData.promos.length > 1) {
                      (bannerData.promos || []).slice(1).forEach((promo, index) => {
                        const promoItem = {
                          id: `promo-${promo._id}`,
                          image: { uri: promo.promo },
                          isPromo: true
                        };
                        allItems.push(renderCarouselItem(promoItem, itemIndex));
                        itemIndex++;
                      });
                    }

                    return allItems;
                  })()}
                </ScrollView>

                {/* Carousel Dots - Show dots for all carousel items */}
                <View style={styles.dotsContainer}>
                  {(() => {
                    // Calculate total items based on actual banner data
                    let totalItems = 0;

                    if (bannerData.recentSubcourse) totalItems++;
                    if (bannerData.recentPurchasedSubcourse) totalItems++;
                    if (bannerData.promos && bannerData.promos.length > 0) totalItems += bannerData.promos.length;

                    // Fallback to featured courses if no banner data
                    if (totalItems === 0 && featuredCourses.length > 0) {
                      totalItems = featuredCourses.length;
                    }

                    // Final fallback: ensure at least 1 item for dots
                    if (totalItems === 0) {
                      totalItems = 1; // For the default welcome banner
                    }

                    return Array.from({ length: totalItems }, (_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.dot,
                          currentCarouselIndex === index && styles.activeDot,
                        ]}
                      />
                    ));
                  })()}
                </View>
              </>
            );
          })()}
        </View>

        {/* Activities Section */}
        <View style={styles.activitiesSection}>
          <Text style={styles.activitiesTitle}>Activities</Text>
          {isLoadingActivities ? (
            <View style={styles.activitiesLoadingContainer}>
              <Text style={styles.activitiesLoadingText}>Loading activities...</Text>
            </View>
          ) : activitiesError ? (
            <View style={styles.activitiesErrorContainer}>
              <LinearGradient
                colors={['#FFF5E6', '#FFE5CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.comingSoonGradient}
              >
                <Icon name="sparkles" size={getResponsiveSize(20)} color="#FF8800" style={styles.comingSoonIcon} />
                <Text style={styles.activitiesErrorText}>Something new coming</Text>
              </LinearGradient>
            </View>
          ) : activities.length > 0 ? (
            <>
              <ScrollView
                ref={activitiesCarouselRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScrollBeginDrag={() => {
                  // Pause auto-scroll when user starts scrolling
                  isActivitiesPausedRef.current = true;
                }}
                onScrollEndDrag={() => {
                  // Resume auto-scroll after 2 seconds of user interaction (faster)
                  setTimeout(() => {
                    isActivitiesPausedRef.current = false;
                  }, 2000);
                }}
                onMomentumScrollEnd={(event) => {
                  const itemWidth = width - getResponsiveSize(40);
                  const index = Math.round(event.nativeEvent.contentOffset.x / itemWidth);
                  setCurrentActivityIndex(index);
                }}
                snapToInterval={width - getResponsiveSize(40)}
                decelerationRate="fast"
                style={styles.activitiesCarousel}
                contentContainerStyle={styles.activitiesCarouselContent}
              >
                {activities.map((activity, index) => (
                  <TouchableOpacity
                    key={activity.id || index}
                    style={styles.activityItem}
                    onPress={async () => {
                      console.log('🎯 [HomeScreen] Activity clicked:', activity.id);
                      if (!activity.id) {
                        console.log('⚠️ [HomeScreen] Activity ID missing');
                        return;
                      }
                      
                      // Show Interstitial Ad before navigation (Android only)
                      if (Platform.OS === 'android' && interstitialAdRef.current) {
                        try {
                          const isLoaded = interstitialAdRef.current.loaded;
                          if (isLoaded) {
                            console.log('📱 [HomeScreen] Showing Interstitial Ad before activity navigation');
                            // Store activityId for navigation after ad closes
                            pendingActivityNavigationRef.current = activity.id;
                            await interstitialAdRef.current.show();
                          } else {
                            console.log('📱 [HomeScreen] Interstitial Ad not loaded yet, navigating directly');
                        navigation.navigate('ActivityDetail', { activityId: activity.id });
                          }
                        } catch (error) {
                          console.error('❌ [HomeScreen] Error showing Interstitial Ad:', error);
                          // Navigate even if ad fails
                          navigation.navigate('ActivityDetail', { activityId: activity.id });
                        }
                      } else {
                        // iOS or ad not available, navigate directly
                        console.log('🧭 [Navigation] Navigating to ActivityDetail screen with activityId:', activity.id);
                        navigation.navigate('ActivityDetail', { activityId: activity.id });
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: activity.imageUrl }}
                      style={styles.activityImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Activities Dots */}
              {activities.length > 1 && (
                <View style={styles.activitiesDotsContainer}>
                  {activities.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.activityDot,
                        currentActivityIndex === index && styles.activityDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : null}
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => {
                console.log('🔘 [HomeScreen] Filter button pressed:', {
                  previousFilter: selectedFilter,
                  newFilter: filter,
                  timestamp: new Date().toISOString()
                });
                
                setSelectedFilter(filter);
                // Reset pagination when switching filters
                setCurrentPage(1);
                setTotalPages(1);
                setTotalCourses(0);
                setHasNextPage(false);
                setHasPrevPage(false);
                
                console.log('🔘 [HomeScreen] Filter changed to:', filter);
                console.log('🔘 [HomeScreen] Pagination reset');
                
                if (filter === 'Popular' && token) {
                  console.log('📡 [API] Filter Popular selected - fetching popular courses');
                  // Refresh favorites first, then fetch popular courses
                  const refreshAndFetchPopular = async () => {
                    await fetchUserFavoriteCourses();
                    await fetchPopularCourses(1, 6);
                  };
                  refreshAndFetchPopular();
                } else if (filter === 'All Course' && token) {
                  console.log('📡 [API] Filter All Course selected - fetching all courses');
                  // Refresh favorites first, then fetch all courses
                  const refreshAndFetchAll = async () => {
                    await fetchUserFavoriteCourses();
                    await fetchCourseData(1, 5);
                  };
                  refreshAndFetchAll();
                } else if (filter === 'Newest' && token) {
                  console.log('📡 [API] Filter Newest selected - fetching newest courses');
                  // Refresh favorites first, then fetch newest courses
                  const refreshAndFetchNewest = async () => {
                    await fetchUserFavoriteCourses();
                    await fetchNewestCourses(1, 6);
                  };
                  refreshAndFetchNewest();
                } else {
                  console.log('🔘 [HomeScreen] Filter selected but no token or filter not handled:', filter);
                }
              }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Course Cards */}
        <View style={styles.courseCardsContainer}>
          {isLoadingCourses ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading courses...</Text>
            </View>
          ) : courseError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {courseError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refreshCourseData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : searchKeyword.trim() ? (
            // Show filtered results when searching
            isSearching ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : filteredCourses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No courses found for "{searchKeyword}"</Text>
                <Text style={styles.emptySubText}>Try a different keyword or check your spelling</Text>
                <TouchableOpacity
                  style={styles.clearSearchButtonLarge}
                  onPress={() => {
                    setSearchKeyword('');
                    setFilteredCourses([]);
                    setIsSearching(false);
                  }}
                >
                  <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.searchResultsHeader}>
                  <Text style={styles.searchResultsText}>Search results for "{searchKeyword}"</Text>
                  <Text style={styles.searchResultsCount}>({filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''})</Text>
                </View>
                {(filteredCourses || []).map((course) => renderCourseCard(course))}
              </>
            )
          ) : (
            // Show all courses when not searching
            courseCards.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No courses available</Text>
              </View>
            ) : (
              <>
                {(courseCards || []).map((course) => renderCourseCard(course))}
                
                {/* Pagination Info */}
                {totalCourses > 0 && (
                  <View style={styles.paginationInfo}>
                    <Text style={styles.paginationText}>
                      Page {currentPage} of {totalPages} • Showing {courseCards.length} of {totalCourses} courses
                    </Text>
                  </View>
                )}
                
                {/* Load More Button */}
                {hasNextPage && (
                  <TouchableOpacity
                    onPress={loadMoreCourses}
                    disabled={isLoadingMore}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#F6B800', '#FF8800']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.loadMoreButton}
                    >
                      {isLoadingMore ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={styles.loadMoreButtonText}>Load More Courses</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </>
            )
          )}
        </View>
      </ScrollView>

      {/* Chatbot Floating Button */}
      <TouchableOpacity
        style={styles.chatbotButton}
        onPress={() => {
          console.log('🤖 [HomeScreen] Chatbot button pressed');
          console.log('🧭 [Navigation] Navigating to Chatbot screen');
          navigation.navigate('Chatbot');
        }}
        activeOpacity={0.8}
      >
        <Image 
          source={require('../assests/images/chatbot.png')} 
          style={styles.chatbotIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: getResponsiveSize(20),
    paddingTop: Platform.OS === 'ios' ? insets.top + getResponsiveSize(20) : StatusBar.currentHeight + getResponsiveSize(20),
    paddingBottom: getResponsiveSize(20),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: getResponsiveSize(50),
  },  
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    marginRight: getResponsiveSize(10),
    borderWidth: 1,
    borderColor: '#F6B800',
  },
  greetingContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  greeting: {
    fontSize: getResponsiveSize(16),
    color: '#FF8800',
    fontWeight: '600',
    lineHeight: getResponsiveSize(20),
  },
  userName: {
    fontSize: getResponsiveSize(18),
    fontWeight: '600',
    color: '#333',
    lineHeight: getResponsiveSize(22),
  },
  notificationButton: {
    width: getResponsiveSize(50),
    height: getResponsiveSize(50),
    borderRadius: getResponsiveSize(10),
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: getResponsiveSize(10),
  },
  notificationIcon: {
    width: getResponsiveSize(30),
    height: getResponsiveSize(30),
  },

  refreshButton: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: getResponsiveSize(10),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: getResponsiveSize(20),
    marginBottom: getResponsiveSize(20),
    paddingHorizontal: getResponsiveSize(16),
    paddingVertical: getResponsiveSize(8),
    borderRadius: getResponsiveSize(16),
    borderWidth: 1.5,
    borderColor: '#FCDEBD', // Changed to #FCDEBD
    // Removed all shadow properties
  },
  searchIcon: {
    marginRight: getResponsiveSize(12),
  },
  searchInput: {
    flex: 1,
    fontSize: getResponsiveSize(16),
    color: '#333',
    fontWeight: '400',
    paddingVertical: getResponsiveSize(4),
  },
  clearSearchButton: {
    padding: getResponsiveSize(4),
    marginLeft: getResponsiveSize(8),
    borderRadius: getResponsiveSize(12),
    backgroundColor: 'rgba(255, 136, 0, 0.1)',
  },
  clearSearchButtonText: {
    color: '#FF8800',
    fontSize: getResponsiveSize(14),
    fontWeight: '600',
  },
  clearSearchButtonLarge: {
    paddingVertical: getResponsiveSize(12),
    paddingHorizontal: getResponsiveSize(24),
    borderRadius: getResponsiveSize(25),
    backgroundColor: 'rgba(255, 136, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 136, 0, 0.3)',
    marginTop: getResponsiveSize(15),
    shadowColor: '#FF8800',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerAdContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: getResponsiveSize(10),
    marginBottom: getResponsiveSize(10),
    width: '100%',
  },
  carouselSection: {
    marginBottom: getResponsiveSize(10),
  },
  activitiesSection: {
    marginBottom: getResponsiveSize(20),
  },
  activitiesTitle: {
    fontSize: getResponsiveSize(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: getResponsiveSize(15),
    paddingHorizontal: getResponsiveSize(20),
  },
  activitiesCarousel: {
    height: getResponsiveSize(100),
  },
  activitiesCarouselContent: {
    paddingHorizontal: getResponsiveSize(20),
  },
  activityItem: {
    width: width - getResponsiveSize(40),
    height: getResponsiveSize(100),
    marginRight: getResponsiveSize(10),
    borderRadius: getResponsiveSize(12),
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  activityImage: {
    width: width - getResponsiveSize(40),
    height: getResponsiveSize(100),
    borderRadius: getResponsiveSize(12),
  },
  activitiesDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: getResponsiveSize(15),
  },
  activityDot: {
    width: getResponsiveSize(8),
    height: getResponsiveSize(8),
    borderRadius: getResponsiveSize(4),
    backgroundColor: '#D0D0D0',
    marginHorizontal: getResponsiveSize(4),
  },
  activityDotActive: {
    backgroundColor: '#FF8800',
    width: getResponsiveSize(12),
  },
  activitiesLoadingContainer: {
    height: getResponsiveSize(100),
    justifyContent: 'center',
    alignItems: 'center',
  },
  activitiesLoadingText: {
    fontSize: getResponsiveSize(16),
    color: '#666',
    fontStyle: 'italic',
  },
  activitiesErrorContainer: {
    height: getResponsiveSize(100),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(20),
  },
  comingSoonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSize(12),
    paddingHorizontal: getResponsiveSize(20),
    borderRadius: getResponsiveSize(12),
    borderWidth: 1,
    borderColor: '#FFE5CC',
    width: '100%',
  },
  comingSoonIcon: {
    marginRight: getResponsiveSize(8),
  },
  activitiesErrorText: {
    fontSize: getResponsiveSize(16),
    color: '#FF8800',
    textAlign: 'center',
    fontWeight: '600',
  },
  carousel: {
    height: getResponsiveSize(180),
  },
  carouselContentContainer: {
    paddingHorizontal: getResponsiveSize(20),
  },
  carouselItem: {
    width: width - getResponsiveSize(40),
    height: getResponsiveSize(180),
    marginRight: getResponsiveSize(10),
  },
  carouselCard: {
    width: '100%',
    height: '100%',
    borderRadius: getResponsiveSize(20),
    padding: getResponsiveSize(20),
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: '#FF88001A',
  },
  carouselCardPromo: {
    padding: 0,
    overflow: 'hidden',
    borderWidth: 0,
  },
  carouselContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  carouselLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: getResponsiveSize(90),
    height: getResponsiveSize(90),
    borderRadius: getResponsiveSize(12), // Make it square with rounded corners
    overflow: 'hidden', // Ensure shape is complete
  },
  carouselBannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: getResponsiveSize(20),
    resizeMode: 'cover',
  },
  carouselRight: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: getResponsiveSize(15),
    position: 'relative',
  },
  carouselTitle: {
    marginLeft:30,
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
    color: '#fff',
    marginBottom: getResponsiveSize(4),
    flexWrap: 'wrap', // Allow text to wrap
    maxWidth: '100%', // Ensure text doesn't overflow
  },
  carouselLessons: {
    marginLeft:30,
    fontSize: getResponsiveSize(14),
    color: '#E0E0E0',
    marginTop: getResponsiveSize(2),
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  progressCircle: {
    width: getResponsiveSize(45),
    height: getResponsiveSize(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressArc: {
    position: 'absolute',
  },
  progressText: {
    fontSize: getResponsiveSize(10),
    fontWeight: '600',
    color: '#fff',
  },
  continueButton: {
    backgroundColor: '#fff',
    paddingVertical: getResponsiveSize(10),
    paddingHorizontal: getResponsiveSize(10),
    borderRadius: getResponsiveSize(12),
    alignItems: 'center',
    marginTop: getResponsiveSize(15),
    borderWidth: 1,
    borderColor: '#2285FA',
  },
  continueButtonText: {
    fontSize: getResponsiveSize(14),
    fontWeight: '600',
    color: '#2285FA',
  },
  exploreButton: {
    marginLeft:120,
    backgroundColor: '#fff',
    paddingVertical: getResponsiveSize(8),
    paddingHorizontal: getResponsiveSize(20),
    borderRadius: getResponsiveSize(9),
    alignItems: 'center',
    marginTop: getResponsiveSize(-4),
    borderWidth: 1,
    borderColor: '#fff',
  },
  exploreButtonText: {
    fontSize: getResponsiveSize(14),
    fontWeight: '600',
    color: '#2285FA',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: getResponsiveSize(15),
  },
  dot: {
    width: getResponsiveSize(8),
    height: getResponsiveSize(8),
    borderRadius: getResponsiveSize(4),
    backgroundColor: '#D0D0D0',
    marginHorizontal: getResponsiveSize(4),
  },
  activeDot: {
    backgroundColor: '#2285FA',
    width: getResponsiveSize(12),
  },
  promoDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: getResponsiveSize(10),
  },
  promoDot: {
    width: getResponsiveSize(6),
    height: getResponsiveSize(6),
    borderRadius: getResponsiveSize(3),
    backgroundColor: '#D0D0D0',
    marginHorizontal: getResponsiveSize(3),
  },
  activePromoDot: {
    backgroundColor: '#FF8800',
    width: getResponsiveSize(8),
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSize(20),
    marginBottom: getResponsiveSize(20),
  },
  filterButton: {
    flex: 1,
    paddingVertical: getResponsiveSize(10),
    paddingHorizontal: getResponsiveSize(15),
    borderRadius: getResponsiveSize(25),
    borderWidth: 1,
    borderColor: '#006C99',
    marginHorizontal: getResponsiveSize(5),
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#006C99',
    borderColor: '#006C99',
  },
  filterButtonText: {
    fontSize: getResponsiveSize(14),
    fontWeight: '500',
    color: '#006C99',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  courseCardsContainer: {
    paddingHorizontal: getResponsiveSize(20),
    paddingBottom: getResponsiveSize(100),
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: getResponsiveSize(20),
    padding: getResponsiveSize(16),
    marginBottom: getResponsiveSize(15),
    borderWidth: 0.5,
    borderColor: '#FCDEBD',
    shadowColor: '#000000',
    position: 'relative',
    overflow: 'visible',
  },
  courseCardDisabled: {
    backgroundColor: '#f5f5f5',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: getResponsiveSize(20),
    pointerEvents: 'none',
  },
  courseCardImage: {
    width: getResponsiveSize(70),
    height: getResponsiveSize(70),
    borderRadius: getResponsiveSize(20),
    marginRight: getResponsiveSize(16),
    overflow: 'hidden',
  },
  courseCardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: getResponsiveSize(2),
  },
  courseCardTitle: {
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: getResponsiveSize(4),
  },
  courseCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: getResponsiveSize(4),
    gap: getResponsiveSize(8),
  },
  courseCardLessons: {
    fontSize: getResponsiveSize(14),
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: getResponsiveSize(14),
    color: '#666',
    marginLeft: getResponsiveSize(4),
  },
  courseCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  heartButton: {
    width: getResponsiveSize(30),
    height: getResponsiveSize(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSize(8),
  },
  heartButtonLoading: {
    opacity: 0.7, // Make it look disabled
  },
  heartIcon: {
    width: getResponsiveSize(20),
    height: getResponsiveSize(20),
  },
  coursePrice: {
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
    color: '#FF8800', // Keep #FF8800 for price
    textAlign: 'right',
  },
  comingSoonLabel: {
    position: 'absolute',
    bottom: getResponsiveSize(-5),
    left: '60%',
    transform: [{ translateX: -getResponsiveSize(50) }],
    alignItems: 'center',
    justifyContent: 'center',
    width: getResponsiveSize(100),
  },
  comingSoonImage: {
    width: getResponsiveSize(100),
    height: getResponsiveSize(30),
  },
  carouselContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  carouselTextGroup: {
    marginLeft: getResponsiveSize(15),
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginRight: getResponsiveSize(60), // Add right margin to prevent overlap with progress
  },
  progressContainerAbsolute: {
    position: 'absolute',
    right: getResponsiveSize(10),
    top: getResponsiveSize(10),
    zIndex: 1, // Ensure progress is above other elements
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(50),
  },
  loadingText: {
    fontSize: getResponsiveSize(18),
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(50),
  },
  errorText: {
    fontSize: getResponsiveSize(18),
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: getResponsiveSize(20),
  },
  retryButton: {
    backgroundColor: '#2285FA',
    paddingVertical: getResponsiveSize(12),
    paddingHorizontal: getResponsiveSize(30),
    borderRadius: getResponsiveSize(12),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(50),
  },
  emptyText: {
    fontSize: getResponsiveSize(18),
    color: '#666',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: getResponsiveSize(14),
    color: '#999',
    marginTop: getResponsiveSize(10),
    textAlign: 'center',
  },
  searchResultsText: {
    fontSize: getResponsiveSize(16),
    color: '#333',
    fontWeight: '600',
    marginBottom: getResponsiveSize(15),
    textAlign: 'left',
  },
  searchResultsCount: {
    fontSize: getResponsiveSize(14),
    color: '#666',
    fontWeight: '400',
  },
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSize(15),
    paddingHorizontal: getResponsiveSize(20),
  },
  carouselLoadingContainer: {
    height: getResponsiveSize(200),
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselLoadingText: {
    fontSize: getResponsiveSize(18),
    color: '#666',
    fontStyle: 'italic',
  },
  carouselErrorContainer: {
    height: getResponsiveSize(200),
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselErrorText: {
    fontSize: getResponsiveSize(18),
    color: '#FF0000',
    textAlign: 'center',
  },
  carouselEmptyContainer: {
    height: getResponsiveSize(200),
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselEmptyText: {
    fontSize: getResponsiveSize(18),
    color: '#666',
    textAlign: 'center',
  },
  paginationInfo: {
    paddingVertical: getResponsiveSize(15),
    paddingHorizontal: getResponsiveSize(20),
    backgroundColor: '#f8f9fa',
    borderRadius: getResponsiveSize(10),
    marginVertical: getResponsiveSize(10),
    alignItems: 'center',
  },
  paginationText: {
    fontSize: getResponsiveSize(14),
    color: '#666',
    fontWeight: '500',
  },
  loadMoreButton: {
    paddingVertical: getResponsiveSize(14),
    paddingHorizontal: getResponsiveSize(18),
    borderRadius: getResponsiveSize(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: getResponsiveSize(15),
    minHeight: getResponsiveSize(55),
  },
  loadMoreButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
  },
  chatbotButton: {
    position: 'absolute',
    bottom: getResponsiveSize(100),
    right: getResponsiveSize(20),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  chatbotIcon: {
    width: getResponsiveSize(90),
    height: getResponsiveSize(90),
  },
});