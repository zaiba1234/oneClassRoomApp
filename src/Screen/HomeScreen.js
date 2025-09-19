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

const { width, height } = Dimensions.get('window');


// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('All Course');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Get user data from Redux
  const { fullName, mobileNumber, token, isAuthenticated, _id, userId, profileImageUrl, address, email } = useAppSelector((state) => state.user);
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


  const [isLoadingBanner, setIsLoadingBanner] = useState(false);
  const [bannerError, setBannerError] = useState(null);

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

  // Ref to track last fetch time to prevent too frequent API calls
  const lastFetchTimeRef = useRef(0);

  // Ref to track loading timeout
  const loadingTimeoutRef = useRef(null);

  // Fetch course data when component mounts or token changes
  useEffect(() => {
    // Initialize data regardless of token status for better UX
    const initializeData = async () => {
      try {
        if (token) {
          // For logged-in users: fetch user-specific data first
          await fetchUserFavoriteCourses();
          await fetchUserProfile();
        }

        // Always fetch course data and banner data (these should work for all users)
        await Promise.all([
          fetchCourseData(),
          fetchFeaturedCourses(),
          fetchBannerData()
        ]);
      } catch (error) {
        console.log('HomeScreen: Error during initialization:', error);
        // Continue with fallback data even if some APIs fail
      }
    };

    initializeData();
  }, [token]);

  // Auto-refresh favorites when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        // Refresh favorites and update course states when screen comes into focus
        const refreshFavoritesAndUpdateCourses = async () => {
          try {
            await fetchUserFavoriteCourses();
            // Note: Course states will be updated by the fetchUserFavoriteCourses function
            // No need to manually update here as it causes infinite loop
          } catch (error) {
            console.error('Error refreshing favorites:', error);
          }
        };

        refreshFavoritesAndUpdateCourses();
      }
    }, [token]) // Removed userFavoriteCourses from dependencies to prevent infinite loop
  );
  // Auto-rotate carousel items
  useEffect(() => {
    // Calculate total items based on actual banner data
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
      totalItems = 1; // For the default welcome banner
    }

    if (totalItems > 1) {
      const interval = setInterval(() => {
        setCurrentCarouselIndex(prevIndex => {
          const newIndex = (prevIndex + 1) % totalItems;

          // Auto-scroll the carousel to the new index
          if (carouselRef.current) {
            carouselRef.current.scrollTo({
              x: newIndex * (width - getResponsiveSize(40)),
              animated: true
            });
          }

          return newIndex;
        });
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(interval);
    }
  }, [featuredCourses.length, bannerData.recentSubcourse, bannerData.recentPurchasedSubcourse, bannerData.promos]);

  // Function to fetch featured courses from API
  const fetchFeaturedCourses = async () => {
    try {
      setIsLoadingFeatured(true);
      setFeaturedError(null);

      const result = await courseAPI.getPurchasedCourse(token);

      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('🏠 HomeScreen: Featured courses API data:', apiCourses);

        // Transform API data to match existing UI structure
        const transformedFeaturedCourses = apiCourses.slice(0, 3).map((course, index) => {
          const courseImage = course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/Circular.png');
          const progress = parseInt(course.progress?.replace('%', '') || '0');

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

        console.log('🏠 HomeScreen: Transformed featured courses:', transformedFeaturedCourses);
        setFeaturedCourses(transformedFeaturedCourses);

      } else {
        setFeaturedError(result.data?.message || 'Failed to fetch featured courses');
        // Keep existing featured courses if API fails
      }
    } catch (error) {
      setFeaturedError(error.message || 'Network error occurred');
      // Keep existing featured courses if error occurs
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  // Function to fetch course data from API
  const fetchCourseData = async () => {
    try {
      setIsLoadingCourses(true);
      setCourseError(null);

      // Set a timeout to prevent infinite loading
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('⏰ HomeScreen: Course loading timeout, stopping loader');
        setIsLoadingCourses(false);
      }, 10000); // 10 second timeout

      const result = await courseAPI.getAllSubcourses(token);

      // Clear timeout if API call completes
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      if (result.success && result.data.success) {
        const apiCourses = result.data.data;

        // Transform API data to match existing UI structure
        const transformedCourses = apiCourses.map((course, index) => {
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

        setCourseCards(transformedCourses);
        console.log('✅ HomeScreen: Course data loaded successfully');

      } else {
        setCourseError(result.data?.message || 'Failed to fetch courses');
        console.log('❌ HomeScreen: Failed to fetch courses:', result.data?.message);
        // Keep existing course data if API fails
      }
    } catch (error) {
      setCourseError(error.message || 'Network error occurred');
      console.error('💥 HomeScreen: Error fetching courses:', error);
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
  const fetchPopularCourses = async () => {
    try {
      setIsLoadingCourses(true);
      setCourseError(null);

      const result = await courseAPI.getPopularSubcourses(token);

      if (result.success && result.data.success) {
        const apiCourses = result.data.data;

        // Transform API data to match existing UI structure
        const transformedCourses = apiCourses.map((course, index) => {
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

        setCourseCards(transformedCourses);

      } else {
        setCourseError(result.data?.message || 'Failed to fetch popular courses');
        // Keep existing course data if API fails
      }
    } catch (error) {
      setCourseError(error.message || 'Network error occurred');
      // Keep existing course data if error occurs
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Function to fetch newest courses from API
  const fetchNewestCourses = async () => {
    try {
      setIsLoadingCourses(true);
      setCourseError(null);

      const result = await courseAPI.getNewestSubcourses(token);

      if (result.success && result.data.success) {
        const apiCourses = result.data.data;

        // Transform API data to match existing UI structure
        const transformedCourses = apiCourses.map((course, index) => {
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

        setCourseCards(transformedCourses);

      } else {
        setCourseError(result.data?.message || 'Failed to fetch newest courses');
        // Keep existing course data if API fails
      }
    } catch (error) {
      setCourseError(error.message || 'Network error occurred');
      // Keep existing course data if error occurs
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Function to fetch banner data from homePage-banner API
  const fetchBannerData = async () => {
    try {
      setIsLoadingBanner(true);
      setBannerError(null);

      const apiUrl = getApiUrl(ENDPOINTS.HOMEPAGE_BANNER);
      console.log('🏠 HomeScreen: Fetching banner from URL:', apiUrl);

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

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
      });

      console.log('🏠 HomeScreen: Banner response status:', response.status);

      if (response.ok) {
        const result = await response.json();

        if (result.success && result.data) {
          console.log('🏠 HomeScreen: Banner data fetched successfully:', result.data);
          console.log('🏠 HomeScreen: Banner data details - recentSubcourse:', result.data.recentSubcourse);
          console.log('🏠 HomeScreen: Banner data details - recentPurchasedSubcourse:', result.data.recentPurchasedSubcourse);
          console.log('🏠 HomeScreen: Banner data details - promos:', result.data.promos);
          setBannerData(result.data);
        } else {
          console.log('❌ HomeScreen: Banner API response not successful:', result);
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
        console.log('❌ HomeScreen: Banner API call failed:', response.status, response.statusText);
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
      console.log('❌ HomeScreen: Banner fetch error:', error);
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
      console.log('❤️ HomeScreen: Fetching favorite courses...');

      const result = await courseAPI.getFavoriteCourses(token);

      if (result.success && result.data.success) {
        const favoriteCourseIds = result.data.data.map(course => {
          // Handle different possible ID structures from API
          const courseId = course.id?._id || course.subcourseId || course._id;
          return String(courseId);
        }).filter(id => id && id !== 'undefined'); // Filter out invalid IDs

        const newFavoriteSet = new Set(favoriteCourseIds);
        setUserFavoriteCourses(newFavoriteSet);

        // Update course cards with fresh favorite status
        setCourseCards(prevCourses =>
          prevCourses.map(course => ({
            ...course,
            isFavorite: newFavoriteSet.has(String(course.id))
          }))
        );

        // Update featured courses with fresh favorite status
        setFeaturedCourses(prevFeatured =>
          prevFeatured.map(course => ({
            ...course,
            isFavorite: newFavoriteSet.has(String(course.id))
          }))
        );

        console.log('✅ HomeScreen: Favorite courses updated successfully');
      } else {
        setUserFavoriteCourses(new Set()); // Set empty set on failure
        console.log('❌ HomeScreen: Failed to fetch favorite courses');
      }
    } catch (error) {
      setUserFavoriteCourses(new Set()); // Set empty set on error
      console.error('💥 HomeScreen: Error fetching favorite courses:', error);
    }
  };

  // Function to fetch user's profile data from API
  const fetchUserProfile = async () => {
    try {
      const result = await profileAPI.getUserProfile(token);

      if (result.success && result.data.success) {
        const profileData = result.data.data;
        console.log('HomeScreen: Profile data fetched:', profileData);

        // Update Redux store with fresh profile data
        dispatch(setProfileData(profileData));
      } else {
        console.log('HomeScreen: Failed to fetch profile:', result.data?.message);
      }
    } catch (error) {
      console.error('HomeScreen: Error fetching profile:', error);
    }
  };

  // Function to search courses based on keyword
  const searchCourses = (keyword) => {
    if (!keyword.trim()) {
      setFilteredCourses([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Add a small delay to show loading state and prevent too many rapid searches
    setTimeout(() => {
      const searchTerm = keyword.toLowerCase().trim();

      // Filter courses based on search keyword
      const filtered = courseCards.filter(course => {
        const title = course.title.toLowerCase();
        return title.includes(searchTerm);
      });

      setFilteredCourses(filtered);
      setIsSearching(false);
    }, 300); // 300ms delay
  };

  // Function to handle search input change
  const handleSearchChange = (text) => {
    setSearchKeyword(text);
    if (text.trim()) {
      searchCourses(text);
    } else {
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
    setRefreshing(true);
    try {
      if (token) {
        // For logged-in users: refresh user-specific data
        await fetchUserFavoriteCourses();
        await fetchUserProfile();
      }

      // Always refresh course and banner data
      await Promise.all([
        fetchCourseData(),
        fetchFeaturedCourses(),
        fetchBannerData()
      ]);
    } catch (error) {
      console.log('HomeScreen: Error during refresh:', error);
      // Continue even if some refreshes fail
    } finally {
      setRefreshing(false);
    }
  };

  // Function to toggle favorite status
  const toggleFavorite = async (courseId, currentFavoriteStatus) => {
    try {
      // Check if token exists
      if (!token) {
        return;
      }

      // Check if courseId exists
      if (!courseId) {
        return;
      }

      // Check if already toggling this course to prevent double calls
      if (togglingFavorites.has(String(courseId))) {
        return;
      }

      // Set loading state for this specific course
      setTogglingFavorites(prev => new Set(prev).add(String(courseId)));

      const result = await courseAPI.toggleFavorite(token, courseId);

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
          const updatedCourses = prevCourses.map(course => {
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
          const updatedFeatured = prevFeatured.map(course => {
            if (String(course.id) === String(courseId)) {
              return { ...course, isFavorite: newFavoriteStatus };
            }
            return course;
          });
          return updatedFeatured;
        });

      }
    } catch (error) {
      // Handle error silently
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
    };
  }, []);

  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);

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
          <View style={[styles.carouselCard, { padding: 0, overflow: 'hidden' }]}>
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

                  if (courseIdToPass) {
                    navigation.navigate('Enroll', { courseId: courseIdToPass });
                  } else {
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
      onPress={() => {
        // Don't navigate if it's a coming soon course
        if (course.isUpComingCourse) {
          return;
        }
        navigation.navigate('Enroll', { courseId: course.id });
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
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notification')}>
            <NotificationBadge
              size={24}
              color="#000000"
              showBadge={true} // true = Notification1.png, false = Bell.png
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


        {/* Featured Course Carousel */}
        <View style={styles.carouselSection}>
          {isLoadingFeatured || isLoadingBanner ? (
            <View style={styles.carouselLoadingContainer}>
              <Text style={styles.carouselLoadingText}>Loading content...</Text>
            </View>
          ) : (featuredError || bannerError) ? (
            <View style={styles.carouselErrorContainer}>
              <Text style={styles.carouselErrorText}>Error loading content</Text>
            </View>
          ) : (() => {
            // Check if we have any content to show
            const hasBannerContent = bannerData.recentSubcourse ||
              bannerData.recentPurchasedSubcourse ||
              (bannerData.promos && bannerData.promos.length > 0);
            const hasFeaturedContent = featuredCourses.length > 0;

            console.log('🏠 HomeScreen: Carousel render check - bannerData:', bannerData);
            console.log('🏠 HomeScreen: Carousel render check - hasBannerContent:', hasBannerContent);
            console.log('🏠 HomeScreen: Carousel render check - hasFeaturedContent:', hasFeaturedContent);
            console.log('🏠 HomeScreen: Carousel render check - featuredCourses:', featuredCourses);

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
                      <View style={[styles.carouselCard, { padding: 0, overflow: 'hidden' }]}>
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
                        progress: parseInt(bannerData.recentPurchasedSubcourse.progress?.replace('%', '') || '0'),
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
                      bannerData.promos.slice(1).forEach((promo, index) => {
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
                setSelectedFilter(filter);
                if (filter === 'Popular' && token) {
                  // Refresh favorites first, then fetch popular courses
                  const refreshAndFetchPopular = async () => {
                    await fetchUserFavoriteCourses();
                    await fetchPopularCourses();
                  };
                  refreshAndFetchPopular();
                } else if (filter === 'All Course' && token) {
                  // Refresh favorites first, then fetch all courses
                  const refreshAndFetchAll = async () => {
                    await fetchUserFavoriteCourses();
                    await fetchCourseData();
                  };
                  refreshAndFetchAll();
                } else if (filter === 'Newest' && token) {
                  // Refresh favorites first, then fetch newest courses
                  const refreshAndFetchNewest = async () => {
                    await fetchUserFavoriteCourses();
                    await fetchNewestCourses();
                  };
                  refreshAndFetchNewest();
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
                {filteredCourses.map((course) => renderCourseCard(course))}
              </>
            )
          ) : (
            // Show all courses when not searching
            courseCards.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No courses available</Text>
              </View>
            ) : (
              courseCards.map((course) => renderCourseCard(course))
            )
          )}
        </View>
      </ScrollView>

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
    paddingTop: Platform.OS === 'ios' ? insets.top + getResponsiveSize(10) : StatusBar.currentHeight + getResponsiveSize(10),
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
  carouselSection: {
    marginBottom: getResponsiveSize(10),
  },
  carousel: {
    height: getResponsiveSize(180),
  },
  carouselContentContainer: {
    paddingHorizontal: getResponsiveSize(20),
  },
  carouselItem: {
    width: width - getResponsiveSize(40),
    marginRight: getResponsiveSize(10),
  },
  carouselCard: {
    flex: 1,
    borderRadius: getResponsiveSize(20),
    padding: getResponsiveSize(20),
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: '#FF88001A',
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
    borderRadius: getResponsiveSize(45), // Make it perfectly circular
    overflow: 'hidden', // Ensure circular shape is complete
  },
  carouselBannerImage: {
    width: '130%',
    height: '130%',
    borderRadius: getResponsiveSize(16),
    resizeMode: 'cover',
    marginLeft: -getResponsiveSize(20),
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
  // Removed unused refresh indicator styles
});