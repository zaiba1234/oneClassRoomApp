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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';
import { getApiUrl } from '../API/config';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const HomeScreen = () => {
  const navigation=useNavigation();
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

  // Fetch course data when component mounts or token changes
  useEffect(() => {
    if (token) {
      fetchCourseData();
      fetchFeaturedCourses();
      fetchBannerData();
    }
  }, [token]);

  // Auto-rotate promo images in carousel
  useEffect(() => {
    if (bannerData.promos && bannerData.promos.length > 1) {
      console.log(`🔄 HomeScreen: Setting up auto-rotation for ${bannerData.promos.length} promo images`);
      const interval = setInterval(() => {
        setCurrentCarouselIndex(prevIndex => {
          const newIndex = (prevIndex + 1) % bannerData.promos.length;
          console.log(`🔄 HomeScreen: Auto-rotating promo from index ${prevIndex} to ${newIndex}`);
          return newIndex;
        });
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(interval);
    }
  }, [bannerData.promos]);

  // Function to fetch featured courses from API
  const fetchFeaturedCourses = async () => {
    try {
      setIsLoadingFeatured(true);
      setFeaturedError(null);
      
      console.log('🏠 HomeScreen: Fetching featured courses (banner) with token...');
      console.log('🔑 HomeScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
      const result = await courseAPI.getPurchasedCourse(token);
      
      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('🎉 HomeScreen: Featured courses received successfully!');
        
        
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
          };
        });
        
        console.log('🔄 HomeScreen: Transformed featured courses:', transformedFeaturedCourses);
        setFeaturedCourses(transformedFeaturedCourses);
        
      } else {
        console.log(' HomeScreen: Failed to fetch featured courses:', result.data?.message);
        console.log(' HomeScreen: API response:', result);
        setFeaturedError(result.data?.message || 'Failed to fetch featured courses');
        // Keep existing featured courses if API fails
      }
    } catch (error) {
      console.error('💥 HomeScreen: Error fetching featured courses:', error);
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
      
      console.log('🏠 HomeScreen: Fetching course data with token...');
      console.log('🔑 HomeScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
      const result = await courseAPI.getAllSubcourses(token);
      
      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('🎉 HomeScreen: Course data received successfully!');
        console.log('📚 HomeScreen: Number of courses:', apiCourses.length);
        console.log('📚 HomeScreen: First course:', apiCourses[0]);
        
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
            isFavorite: false, // Start as not favorited
          };
        });
        
        console.log('🔄 HomeScreen: Transformed courses:', transformedCourses);
        setCourseCards(transformedCourses);
        
      } else {
        
        setCourseError(result.data?.message || 'Failed to fetch courses');
        // Keep existing course data if API fails
      }
    } catch (error) {
      console.error('💥 HomeScreen: Error fetching course data:', error);
      setCourseError(error.message || 'Network error occurred');
      // Keep existing course data if error occurs
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Function to fetch popular courses from API
  const fetchPopularCourses = async () => {
    try {
      setIsLoadingCourses(true);
      setCourseError(null);
      
      console.log('🏠 HomeScreen: Fetching popular courses with token...');
      console.log('🔑 HomeScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
      const result = await courseAPI.getPopularSubcourses(token);
      
      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('🎉 HomeScreen: Popular courses received successfully!');
        console.log('📚 HomeScreen: Number of popular courses:', apiCourses.length);
        console.log('📚 HomeScreen: First popular course:', apiCourses[0]);
        
        // Transform API data to match existing UI structure
        const transformedCourses = apiCourses.map((course, index) => {
          const courseImage = course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/HomeImage.png');
          
          console.log(`📚 HomeScreen: Popular Course ${index + 1} - ${course.subcourseName}`);
          console.log(`🖼️ HomeScreen: Thumbnail URL: ${course.thumbnailImageUrl || 'Using fallback image'}`);
          console.log(`🖼️ HomeScreen: Final image object:`, courseImage);
          console.log(`🖼️ HomeScreen: Image type: ${course.thumbnailImageUrl ? 'URI' : 'require'}`);
          
          return {
            id: course._id || index + 1,
            title: course.subcourseName || 'Course Title',
            lessons: `${course.totalLessons || 0} lessons`,
            rating: course.avgRating ? course.avgRating.toString() : '4.5',
            price: `₹${course.price || 0}.00`,
            image: courseImage,
            isFavorite: false, // Start as not favorited
          };
        });
        
        console.log('🔄 HomeScreen: Transformed popular courses:', transformedCourses);
        setCourseCards(transformedCourses);
        
      } else {
        console.log('❌ HomeScreen: Failed to fetch popular courses:', result.data?.message);
        console.log('❌ HomeScreen: API response:', result);
        setCourseError(result.data?.message || 'Failed to fetch popular courses');
        // Keep existing course data if API fails
      }
    } catch (error) {
      console.error('💥 HomeScreen: Error fetching popular courses:', error);
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
      
      console.log('🏠 HomeScreen: Fetching newest courses with token...');
      console.log('🔑 HomeScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
      const result = await courseAPI.getNewestSubcourses(token);
      
      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('🎉 HomeScreen: Newest courses received successfully!');
       
        console.log('📚 HomeScreen: First newest course:', apiCourses[0]);
        
        // Transform API data to match existing UI structure
        const transformedCourses = apiCourses.map((course, index) => {
          const courseImage = course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/HomeImage.png');
          
          
          console.log(`🖼️ HomeScreen: Image type: ${course.thumbnailImageUrl ? 'URI' : 'require'}`);
          
          return {
            id: course._id || index + 1,
            title: course.subcourseName || 'Course Title',
            lessons: `${course.totalLessons || 0} lessons`,
            rating: course.avgRating ? course.avgRating.toString() : '4.5',
            price: `₹${course.price || 0}.00`,
            image: courseImage,
            isFavorite: false, // Start as not favorited
          };
        });
        
        console.log('🔄 HomeScreen: Transformed newest courses:', transformedCourses);
        setCourseCards(transformedCourses);
        
      } else {
        console.log('❌ HomeScreen: Failed to fetch newest courses:', result.data?.message);
        console.log('❌ HomeScreen: API response:', result);
        setCourseError(result.data?.message || 'Failed to fetch newest courses');
        // Keep existing course data if API fails
      }
    } catch (error) {
      console.error('💥 HomeScreen: Error fetching newest courses:', error);
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
      
      console.log('🏠 HomeScreen: Fetching banner data from homePage-banner API...');
      console.log('🔑 HomeScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
      const apiUrl = getApiUrl('/api/user/course/homePage-banner');
      console.log('🌐 HomeScreen: Banner API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('🎉 HomeScreen: Banner data received successfully!');
        console.log('📚 HomeScreen: Banner API response:', result);
        
        if (result.success) {
          setBannerData(result.data);
          console.log('✅ HomeScreen: Banner data set successfully:', result.data);
          console.log('🖼️ HomeScreen: Number of promo images:', result.data.promos?.length || 0);
          if (result.data.promos && result.data.promos.length > 0) {
            console.log('🖼️ HomeScreen: First promo image URL:', result.data.promos[0].promo);
            console.log('🖼️ HomeScreen: All promo URLs:', result.data.promos.map(p => p.promo));
          }
        } else {
          console.log('❌ HomeScreen: Banner API returned success: false');
          setBannerError(result.message || 'Failed to fetch banner data');
        }
      } else {
        console.log('❌ HomeScreen: Banner API request failed:', response.status, response.statusText);
        setBannerError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('💥 HomeScreen: Error fetching banner data:', error);
      setBannerError(error.message || 'Network error occurred');
    } finally {
      setIsLoadingBanner(false);
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
      console.log(`🔍 HomeScreen: Search for "${keyword}" returned ${filtered.length} results`);
    }, 300); // 300ms delay
  };

  // Function to handle search input change
  const handleSearchChange = (text) => {
    console.log(`🔍 HomeScreen: Search input changed to: "${text}"`);
    setSearchKeyword(text);
    if (text.trim()) {
      searchCourses(text);
    } else {
      setFilteredCourses([]);
      setIsSearching(false);
      console.log('🔍 HomeScreen: Search cleared, showing all courses');
    }
  };

  // Manual refresh function (can be called if needed)
  const refreshCourseData = () => {
    if (token) {
      console.log('🔄 HomeScreen: Manual refresh triggered');
      fetchCourseData();
    } else {
      console.log('⚠️ HomeScreen: No token available for refresh');
    }
  };

  // Function to toggle favorite status
  const toggleFavorite = async (courseId, currentFavoriteStatus) => {
    try {
     
      console.log(' HomeScreen: Token available:', !!token);
      
      // Check if token exists
      if (!token) {
        console.error(' HomeScreen: No token available for API call');
        return;
      }
      
      // Check if courseId exists
      if (!courseId) {
        console.error('HomeScreen: No courseId available for API call');
        return;
      }
      
      // Check if already toggling this course to prevent double calls
      if (togglingFavorites.has(String(courseId))) {
        console.log('⚠️ HomeScreen: Already toggling this course, skipping...');
        return;
      }
      
      // Set loading state for this specific course
      setTogglingFavorites(prev => new Set(prev).add(String(courseId)));
      
      console.log('🚀 HomeScreen: About to call courseAPI.toggleFavorite...');
      console.log('🚀 HomeScreen: With token:', token.substring(0, 50) + '...');
      console.log('🚀 HomeScreen: With courseId:', courseId);
      
      const result = await courseAPI.toggleFavorite(token, courseId);
      
     
      
      if (result.success && result.data.success) {
        // Get the new favorite status from the API response
        const newFavoriteStatus = result.data.data.isLike;
        console.log('✅ HomeScreen: Favorite toggled successfully! New status:', newFavoriteStatus);
        console.log('✅ HomeScreen: API response:', result.data);
        
        // Update the course in the local state
        setCourseCards(prevCourses => {
          console.log('🔄 HomeScreen: Previous courses:', prevCourses.length);
          const updatedCourses = prevCourses.map(course => {
            console.log(`🔄 HomeScreen: Checking course ID: ${course.id} (${typeof course.id}) vs ${courseId} (${typeof courseId})`);
            // Convert both IDs to strings for comparison to handle type mismatches
            if (String(course.id) === String(courseId)) {
              console.log(`✅ HomeScreen: Found course to update: ${course.title}`);
              console.log(`✅ HomeScreen: Updating isFavorite from ${course.isFavorite} to ${newFavoriteStatus}`);
              return { ...course, isFavorite: newFavoriteStatus };
            }
            return course;
          });
          console.log('🔄 HomeScreen: Updated courses:', updatedCourses.length);
          return updatedCourses;
        });
        
        // Also update featured courses if this course is in there
        setFeaturedCourses(prevFeatured => {
          console.log('🔄 HomeScreen: Previous featured courses:', prevFeatured.length);
          const updatedFeatured = prevFeatured.map(course => {
            if (String(course.id) === String(courseId)) {
              console.log(`✅ HomeScreen: Found featured course to update: ${course.title}`);
              console.log(`✅ HomeScreen: Updating isFavorite from ${course.isFavorite} to ${newFavoriteStatus}`);
              return { ...course, isFavorite: newFavoriteStatus };
            }
            return course;
          });
          console.log('🔄 HomeScreen: Updated featured courses:', updatedFeatured.length);
          return updatedFeatured;
        });
        
      } else {
        console.log('❌ HomeScreen: Failed to toggle favorite:', result.data?.message);
        console.log('❌ HomeScreen: Full result:', result);
        // You could show a toast/alert here if needed
      }
    } catch (error) {
      console.error('💥 HomeScreen: Error toggling favorite:', error);
      console.error('💥 HomeScreen: Error stack:', error.stack);
      console.error('💥 HomeScreen: Error message:', error.message);
      // You could show a toast/alert here if needed
    } finally {
      // Remove loading state for this course
      setTogglingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(String(courseId));
        return newSet;
      });
    }
  };

  // Track Redux state changes
  useEffect(() => {
    console.log('🔄 HomeScreen: Redux state changed!');
    console.log('🔄 HomeScreen: New fullName:', fullName);
 
  }, [fullName, mobileNumber, token, isAuthenticated]);

  // Track courseCards state changes
  useEffect(() => {
    
   
    courseCards.forEach((course, index) => {
      console.log(`🔄 HomeScreen: Course ${index + 1} in state:`, {
        title: course.title,
        imageType: typeof course.image,
        imageSource: course.image
      });
    });
  }, [courseCards]);

  // Filter courses when search keyword or courseCards change
  useEffect(() => {
    if (searchKeyword.trim()) {
      searchCourses(searchKeyword);
    } else {
      setFilteredCourses([]);
      setIsSearching(false);
    }
  }, [searchKeyword, courseCards]);

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
    // Use banner data if available, otherwise fall back to featured courses
    let displayItem = item;
    let buttonText = item.buttonText;
    let progress = item.progress;
    let showProgressCircle = false;
    let showCourseDetails = true;
    let isPromoItem = false;
    
    // Check if we have banner data and use it for the first two items
    if (index === 0 && bannerData.recentSubcourse) {
      // First item: recentSubcourse (no progress key, always show Explore)
      displayItem = {
        ...item,
        title: bannerData.recentSubcourse.subcourseName,
        lessons: `${bannerData.recentSubcourse.totalLessons} lessons`,
        image: bannerData.recentSubcourse.thumbnailImageUrl ? { uri: bannerData.recentSubcourse.thumbnailImageUrl } : item.image,
        progress: 0, // No progress for recent subcourse
      };
      buttonText = 'Explore'; // Always show Explore button for recent subcourse
      progress = 0;
      showProgressCircle = false; // Don't show progress circle for recent subcourse
      showCourseDetails = true; // Show course details (title, lessons)
      isPromoItem = false;
    } else if (index === 1 && bannerData.recentPurchasedSubcourse) {
      // Second item: recentPurchasedSubcourse (has progress key, always show Continue Learning)
      const hasProgress = bannerData.recentPurchasedSubcourse.hasOwnProperty('progress');
      const progressValue = hasProgress ? parseInt(bannerData.recentPurchasedSubcourse.progress?.replace('%', '') || '0') : 0;
      
      displayItem = {
        ...item,
        title: bannerData.recentPurchasedSubcourse.subcourseName,
        lessons: `${bannerData.recentPurchasedSubcourse.totalLessons} lessons`,
        image: bannerData.recentPurchasedSubcourse.thumbnailImageUrl ? { uri: bannerData.recentPurchasedSubcourse.thumbnailImageUrl } : item.image,
        progress: progressValue,
      };
      
      // Always show Continue Learning button if progress key exists (even if 0%)
      if (hasProgress) {
        buttonText = 'Continue Learning';
        showProgressCircle = true; // Always show progress circle for Continue Learning
      } else {
        buttonText = 'Explore';
        showProgressCircle = false; // Don't show progress circle for Explore
      }
      progress = progressValue;
      showCourseDetails = true; // Show course details (title, lessons)
      isPromoItem = false;
    } else if (index === 2 && bannerData.promos && bannerData.promos.length > 0) {
      // Third item: promos (complete image banner, no text, no buttons, no course details)
      // Use currentCarouselIndex to cycle through all promo images
      const promoIndex = currentCarouselIndex % bannerData.promos.length;
      const promo = bannerData.promos[promoIndex];
      
      console.log(`🖼️ HomeScreen: Rendering promo ${promoIndex + 1}/${bannerData.promos.length}:`, promo.promo);
      
      displayItem = {
        ...item,
        image: promo.promo ? { uri: promo.promo } : item.image,
      };
      buttonText = ''; // No button for promo image
      progress = 0;
      showProgressCircle = false; // Don't show progress circle for promo
      showCourseDetails = false; // Don't show course details for promo
      isPromoItem = true; // Mark as promo item
    } else if (index >= 3 && bannerData.promos && bannerData.promos.length > 0) {
      // Additional items: More promo images
      const promoIndex = (index - 3 + currentCarouselIndex) % bannerData.promos.length;
      const promo = bannerData.promos[promoIndex];
      
      console.log(`🖼️ HomeScreen: Rendering additional promo ${promoIndex + 1}/${bannerData.promos.length} at index ${index}:`, promo.promo);
      
      displayItem = {
        ...item,
        image: promo.promo ? { uri: promo.promo } : item.image,
      };
      buttonText = ''; // No button for promo image
      progress = 0;
      showProgressCircle = false; // Don't show progress circle for promo
      showCourseDetails = false; // Don't show course details for promo
      isPromoItem = true; // Mark as promo item
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
            colors={['#2285FA', '#0029B9']}
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
                style={styles.continueButton}
                onPress={() => {
                  console.log('Button pressed:', buttonText);
                  let courseIdToPass = null;
                  
                  // Get the correct course ID based on which item this is
                  if (index === 0 && bannerData.recentSubcourse) {
                    // First item: recentSubcourse
                    courseIdToPass = bannerData.recentSubcourse._id;
                    console.log('🎯 HomeScreen: Navigating with recentSubcourse ID:', courseIdToPass);
                  } else if (index === 1 && bannerData.recentPurchasedSubcourse) {
                    // Second item: recentPurchasedSubcourse
                    courseIdToPass = bannerData.recentPurchasedSubcourse._id;
                    console.log('🎯 HomeScreen: Navigating with recentPurchasedSubcourse ID:', courseIdToPass);
                  } else {
                    // Fallback to featured course ID
                    courseIdToPass = item.id;
                    console.log('🎯 HomeScreen: Navigating with featured course ID:', courseIdToPass);
                  }
                  
                  if (courseIdToPass) {
                    navigation.navigate('Enroll', { courseId: courseIdToPass });
                  } else {
                    navigation.navigate('Enroll');
                  }
                }}
              >
                <Text style={styles.continueButtonText}>{buttonText}</Text>
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
      style={styles.courseCard}
      onPress={() => {
        console.log('Course card pressed:', course.title, 'ID:', course.id);
        navigation.navigate('Enroll', { courseId: course.id });
      }}
    >
      <Image 
        source={course.image} 
        style={styles.courseCardImage} 
        resizeMode="cover"
        onLoad={() => console.log(`✅ Image loaded successfully for course: ${course.title}`)}
        onError={(error) => console.log(`❌ Image failed to load for course: ${course.title}`, error.nativeEvent)}
        onLoadStart={() => console.log(`🔄 Starting to load image for course: ${course.title}`)}
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
        {console.log(`🖤 Rendering heart for course: ${course.title}, isFavorite: ${course.isFavorite}, ID: ${course.id}`)}
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
            color={course.isFavorite ? "#FF0000" : "#FF8800"}
          />
        </TouchableOpacity>
        <Text style={styles.coursePrice}>{course.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.profileSection}>
            <Image source={require('../assests/images/Profile.png')} style={styles.profileImage} />
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Hello!</Text>
              <Text style={styles.userName}>{fullName || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notification')}>
            <Image 
              source={require('../assests/images/Notification.png')} 
              style={styles.notificationIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
         
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Image 
            source={require('../assests/images/Search.png')} 
            style={[
              styles.searchIcon,
              searchKeyword.trim() && styles.searchIconActive
            ]}
            resizeMode="contain"
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search now..."
            placeholderTextColor="#999"
            value={searchKeyword}
            onChangeText={handleSearchChange}
            onSubmitEditing={() => {
              console.log(`🔍 HomeScreen: Search submitted for: "${searchKeyword}"`);
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
                console.log('🔍 HomeScreen: Clear search button pressed');
                setSearchKeyword('');
                setFilteredCourses([]);
                setIsSearching(false);
              }}
            >
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>


        {/* Featured Course Carousel */}
        <View style={styles.carouselSection}>
          {isLoadingFeatured ? (
            <View style={styles.carouselLoadingContainer}>
              <Text style={styles.carouselLoadingText}>Loading featured courses...</Text>
            </View>
          ) : featuredError ? (
            <View style={styles.carouselErrorContainer}>
              <Text style={styles.carouselErrorText}>Error loading featured courses</Text>
            </View>
          ) : featuredCourses.length === 0 ? (
            <View style={styles.carouselEmptyContainer}>
              <Text style={styles.carouselEmptyText}>No featured courses available</Text>
            </View>
          ) : (
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
                {/* Render featured courses first */}
                {featuredCourses.map((course, index) => renderCarouselItem(course, index))}
                
                {/* Render additional promo images if available */}
                {bannerData.promos && bannerData.promos.length > 0 && 
                  bannerData.promos.slice(1).map((promo, index) => {
                    const promoIndex = index + 1; // Start from second promo (first is already shown in index 2)
                    console.log(`🖼️ HomeScreen: Rendering additional promo ${promoIndex + 1}/${bannerData.promos.length} at carousel index ${featuredCourses.length + index}:`, promo.promo);
                    return (
                      <View key={`promo-${promoIndex}`} style={styles.carouselItem}>
                        <View style={[styles.carouselCard, { padding: 0, overflow: 'hidden' }]}>
                          <Image 
                            source={{ uri: promo.promo }} 
                            style={styles.carouselBannerImage} 
                            resizeMode="cover" 
                          />
                        </View>
                      </View>
                    );
                  })
                }
              </ScrollView>
              
              {/* Carousel Dots - Show dots for all carousel items */}
              <View style={styles.dotsContainer}>
                {(() => {
                  const totalItems = featuredCourses.length + (bannerData.promos && bannerData.promos.length > 1 ? bannerData.promos.length - 1 : 0);
                  console.log(`🖼️ HomeScreen: Total carousel items: ${totalItems} (${featuredCourses.length} featured + ${bannerData.promos && bannerData.promos.length > 1 ? bannerData.promos.length - 1 : 0} additional promos)`);
                  
                  return (
                    <>
                      {/* Dots for featured courses */}
                      {featuredCourses.map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.dot,
                            currentCarouselIndex === index && styles.activeDot,
                          ]}
                        />
                      ))}
                      
                      {/* Dots for additional promo images */}
                      {bannerData.promos && bannerData.promos.length > 1 && 
                        bannerData.promos.slice(1).map((_, index) => (
                          <View
                            key={`promo-dot-${index + 1}`}
                            style={[
                              styles.dot,
                              currentCarouselIndex === (featuredCourses.length + index) && styles.activeDot,
                            ]}
                          />
                        ))
                      }
                    </>
                  );
                })()}
              </View>
            </>
          )}
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
                  fetchPopularCourses();
                } else if (filter === 'All Course' && token) {
                  fetchCourseData();
                } else if (filter === 'Newest' && token) {
                  fetchNewestCourses(); // For now, use same as All Course, can be changed later
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
                  style={styles.clearSearchButton}
                  onPress={() => {
                    console.log('🔍 HomeScreen: Clear search button pressed from no results');
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
    // backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: getResponsiveSize(20),
    paddingTop: getResponsiveSize(50),
    paddingBottom: getResponsiveSize(20),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    marginRight: getResponsiveSize(10),
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: getResponsiveSize(16),
    color: '#FF8800',
    fontWeight: '600',
  },
  userName: {
    fontSize: getResponsiveSize(18),
    fontWeight: '600',
    color: '#333',
  },
  notificationButton: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    width: getResponsiveSize(20),
    height: getResponsiveSize(20),
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
    borderColor: '#FFF3E0',
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    width: getResponsiveSize(20),
    height: getResponsiveSize(20),
    marginRight: getResponsiveSize(12),
  },
  searchIconActive: {
    tintColor: '#2285FA', // Change color when active
  },
  searchInput: {
    flex: 1,
    fontSize: getResponsiveSize(16),
    color: '#333',
    fontWeight: '400',
    paddingVertical: getResponsiveSize(4),
  },
  clearSearchButton: {
    backgroundColor: '#2285FA',
    paddingVertical: getResponsiveSize(10),
    paddingHorizontal: getResponsiveSize(20),
    borderRadius: getResponsiveSize(12),
    marginTop: getResponsiveSize(15),
  },
  clearSearchButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(14),
    fontWeight: '600',
  },
  carouselSection: {
    marginBottom: getResponsiveSize(20),
  },
  carousel: {
    height: getResponsiveSize(200),
  },
  carouselContentContainer: {
    paddingHorizontal: getResponsiveSize(10),
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
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.15,
    // shadowRadius: 8,
    // elevation: 8,
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
    width: getResponsiveSize(70),
    height: getResponsiveSize(70),
    borderRadius: getResponsiveSize(35), // Make it perfectly circular
    overflow: 'hidden', // Ensure circular shape is complete
  },
  carouselBannerImage: {
    width: '120%',
    height: '100%',
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
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
    color: '#fff',
    marginBottom: getResponsiveSize(4),
    flexWrap: 'wrap', // Allow text to wrap
    maxWidth: '100%', // Ensure text doesn't overflow
  },
  carouselLessons: {
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
    paddingHorizontal: getResponsiveSize(20),
    borderRadius: getResponsiveSize(12),
    alignItems: 'center',
    marginTop: getResponsiveSize(15),
  },
  continueButtonText: {
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
    borderRadius: getResponsiveSize(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: getResponsiveSize(5),
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#2285FA',
    borderColor: '#2285FA',
  },
  filterButtonText: {
    fontSize: getResponsiveSize(14),
    fontWeight: '500',
    color: '#666',
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
    borderRadius: getResponsiveSize(16),
    padding: getResponsiveSize(16),
    marginBottom: getResponsiveSize(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseCardImage: {
    width: getResponsiveSize(70),
    height: getResponsiveSize(70),
    borderRadius: getResponsiveSize(35), // Make it perfectly circular
    marginRight: getResponsiveSize(16),
    overflow: 'hidden', // Ensure circular shape is complete
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
    color: '#FF8800',
    textAlign: 'right',
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
});