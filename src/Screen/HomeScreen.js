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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector, useAppDispatch } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';
import { profileAPI } from '../API/profileAPI';
import { setProfileData } from '../Redux/userSlice';
import { getApiUrl, ENDPOINTS } from '../API/config';
import { useFocusEffect } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const HomeScreen = () => {
  const navigation=useNavigation();
  const dispatch = useAppDispatch();
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

  // Fetch course data when component mounts or token changes
  useEffect(() => {
    if (token) {
      // First fetch user's favorite courses, then fetch other data
      const initializeData = async () => {
        try {
          // Step 1: Fetch user's favorite courses first
          await fetchUserFavoriteCourses();
          
          // Step 2: Fetch fresh profile data to ensure profile image is up to date
          await fetchUserProfile();
          
          // Step 3: After favorites and profile are loaded, fetch course data
          await fetchCourseData();
          await fetchFeaturedCourses();
          await fetchBannerData();
        } catch (error) {
          // Handle error silently
        }
      };
      
      initializeData();
    }
  }, [token]);

  // Auto-refresh favorites when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        fetchUserFavoriteCourses();
      }
    }, [token])
  );

  // Auto-rotate promo images in carousel
  useEffect(() => {
    if (bannerData.promos && bannerData.promos.length > 1) {
      const interval = setInterval(() => {
        setCurrentCarouselIndex(prevIndex => {
          const newIndex = (prevIndex + 1) % bannerData.promos.length;
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
      
      const result = await courseAPI.getPurchasedCourse(token);
      
      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        
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
      
      const result = await courseAPI.getAllSubcourses(token);
      
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
          };
        });
        
        setCourseCards(transformedCourses);
        
      } else {
        setCourseError(result.data?.message || 'Failed to fetch courses');
        // Keep existing course data if API fails
      }
    } catch (error) {
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
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          setBannerData(result.data);
        } else {
          setBannerError(result.message || 'Failed to fetch banner data');
        }
      } else {
        setBannerError(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setBannerError(error.message || 'Network error occurred');
    } finally {
      setIsLoadingBanner(false);
    }
  };

  // Function to fetch user's favorite courses from API
  const fetchUserFavoriteCourses = async () => {
    try {
      const result = await courseAPI.getFavoriteCourses(token);

      if (result.success && result.data.success) {
        const favoriteCourseIds = result.data.data.map(course => {
          // Handle different possible ID structures from API
          const courseId = course.id?._id || course.subcourseId || course._id;
          return String(courseId);
        }).filter(id => id && id !== 'undefined'); // Filter out invalid IDs
        
        setUserFavoriteCourses(new Set(favoriteCourseIds));
      } else {
        setUserFavoriteCourses(new Set()); // Set empty set on failure
      }
    } catch (error) {
      setUserFavoriteCourses(new Set()); // Set empty set on error
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
    if (token) {
      setRefreshing(true);
      try {
        // Refresh all data in sequence
        await fetchUserFavoriteCourses();
        await fetchUserProfile(); // Add profile refresh
        await fetchCourseData();
        await fetchFeaturedCourses();
        await fetchBannerData();
      } catch (error) {
        // Handle error silently
      } finally {
        setRefreshing(false);
      }
    } else {
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

  // Track Redux state changes
  useEffect(() => {
    // Redux state changed
  }, [fullName, mobileNumber, token, isAuthenticated]);

  // Track courseCards state changes
  useEffect(() => {
    // Course cards state changed
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
        navigation.navigate('Enroll', { courseId: course.id });
      }}
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
            <Image 
              source={require('../assests/images/not.png')} 
              style={styles.notificationIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
         
        </View>
        {refreshing && (
          <View style={styles.refreshIndicator}>
            <ActivityIndicator size="small" color="#FF8800" />
            <Text style={styles.refreshText}>Refreshing...</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
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
            placeholder="Search now..."
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
                  style={styles.clearSearchButton}
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
    width: getResponsiveSize(50),
    height: getResponsiveSize(50),
    borderRadius: getResponsiveSize(10),
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderRadius: getResponsiveSize(25),
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
    borderRadius: getResponsiveSize(20),
    padding: getResponsiveSize(16),
    marginBottom: getResponsiveSize(15),
    borderWidth: 0.5,
    borderColor: '#FF88001A',
    shadowColor: '#000000',
  
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
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSize(10),
    backgroundColor: '#F0F8FF',
    borderRadius: getResponsiveSize(10),
    marginTop: getResponsiveSize(10),
    marginHorizontal: getResponsiveSize(20),
  },
  refreshText: {
    marginLeft: getResponsiveSize(5),
    fontSize: getResponsiveSize(14),
    color: '#FF8800',
    fontWeight: '600',
  },
});