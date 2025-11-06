import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Dimensions,
  BackHandler,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';
import { useFocusEffect } from '@react-navigation/native';
import BackButton from '../Component/BackButton';
import { checkApiResponseForTokenError } from '../utils/tokenErrorHandler';

const { width, height } = Dimensions.get('window');

// Responsive scaling factors
const scale = width / 375; // Base width for iPhone 8
const verticalScale = height / 812; // Base height for iPhone 8

// Responsive font sizes
const getFontSize = (size) => size * scale;
const getVerticalSize = (size) => size * verticalScale;

const FavouritesScreen = ({ navigation }) => {
  const { token } = useAppSelector((state) => state.user);
  const [favouriteCourses, setFavouriteCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingFavorites, setTogglingFavorites] = useState(new Set());
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch favorite courses when component mounts
  useEffect(() => {
    if (token) {
      // Reset pagination when component mounts
      setCurrentPage(1);
      setTotalPages(1);
      setTotalCourses(0);
      setHasMoreData(false);
      setFavouriteCourses([]);
      fetchFavoriteCourses(1, false);
    } else {
      setIsLoading(false);
      setError('No token available');
    }
  }, [token]);

  // Auto-refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        // Reset pagination when screen comes into focus
        setCurrentPage(1);
        setTotalPages(1);
        setTotalCourses(0);
        setHasMoreData(false);
        fetchFavoriteCourses(1, false);
      }
    }, [token])
  );

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

  const fetchFavoriteCourses = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      console.log('🚀 CALLING getFavoriteCourses API NOW...');
      console.log('🚀 API Parameters:', { page, limit: 10, token: token ? `${(token || '').substring(0, 10)}...` : 'Missing' });
      
      const result = await courseAPI.getFavoriteCourses(token, page, 10);
      console.log('✅ getFavoriteCourses API CALL COMPLETED');
      
      // Check for token errors - exit early if token error detected (auto-logout will happen)
      if (result.isTokenError || checkApiResponseForTokenError({ status: result.status, data: result.data })) {
        console.log('🔐 [FavouritesScreen] Token error detected, exiting early');
        setIsLoading(false);
        setLoadingMore(false);
        return; // Exit early - navigation handled by tokenErrorHandler
      }
      
      // DETAILED API RESPONSE DEBUG FOR FAVORITE COURSES
      console.log('🔥🔥🔥 FAVORITE COURSES API RESPONSE DEBUG 🔥🔥🔥');
      console.log('🔥 API Name: getFavoriteCourses');
      console.log('🔥 Endpoint: /api/course/get-favorite-courses');
      console.log('🔥 Full API Response:', JSON.stringify(result, null, 2));
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
      console.log('🔥🔥🔥 END FAVORITE COURSES DEBUG 🔥🔥🔥');
      
      if (result.success && result.data.success) {
        // Handle new API response structure with pagination
        const coursesData = result.data.data;
        const courses = coursesData.courses || coursesData; // Handle both old and new structure
        const pagination = coursesData.pagination || {};
        
        // Check if courses is an array
        if (!Array.isArray(courses)) {
          setError('Invalid data format received from API');
          if (!append) {
            setFavouriteCourses([]);
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
          const transformedCourse = {
            id: course.id?._id || course.subcourseId || index + 1,
            title: course.subcourseName || 'Course Title',
            lessons: `${course.totalLessons || 0} lessons`,
            rating: course.avgRating ? course.avgRating.toString() : '4.8',
            price: `₹${course.price || 0}.00`,
            thumbnail: course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/Frame1.png'),
            _id: course.id?._id, // Store the actual _id for navigation
            isFavorite: true, // All courses in favorites are favorited
          };
          
          return transformedCourse;
        });
        
        // Update courses list
        if (append && page > 1) {
          setFavouriteCourses(prev => [...prev, ...transformedCourses]);
        } else {
          setFavouriteCourses(transformedCourses);
        }
      } else {
        setError(result.data?.message || 'Failed to fetch favorite courses');
        if (!append) {
          setFavouriteCourses([]);
        }
      }
    } catch (error) {
      setError('Failed to load favorite courses');
      if (!append) {
        setFavouriteCourses([]);
      }
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more courses (next page)
  const loadMoreCourses = async () => {
    if (hasMoreData && !loadingMore && !isLoading) {
      await fetchFavoriteCourses(currentPage + 1, true);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Reset pagination on refresh
      setCurrentPage(1);
      setTotalPages(1);
      setTotalCourses(0);
      setHasMoreData(false);
      await fetchFavoriteCourses(1, false);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  // Function to toggle favorite status (remove from favorites)
  const toggleFavorite = async (courseId) => {
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
      
      // Check for token errors - exit early if token error detected (auto-logout will happen)
      if (result.isTokenError || checkApiResponseForTokenError({ status: result.status, data: result.data })) {
        console.log('🔐 [FavouritesScreen] Token error detected in toggleFavorite, exiting early');
        return; // Exit early - navigation handled by tokenErrorHandler
      }
      
      if (result.success && result.data.success) {
        // Get the new favorite status from the API response
        const newFavoriteStatus = result.data.data.isLike;
        
        if (!newFavoriteStatus) {
          // Course was removed from favorites, remove it from the list
          setFavouriteCourses(prevCourses => 
            prevCourses.filter(course => String(course._id) !== String(courseId))
          );
        }
      }
    } catch (error) {
    } finally {
      // Remove loading state for this course
      setTogglingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(String(courseId));
        return newSet;
      });
    }
  };

  const renderCourseCard = (course) => (
    <TouchableOpacity 
      key={course.id} 
      style={styles.courseCard}
      onPress={() => {
        navigation.navigate('Enroll', { courseId: course._id });
      }}
    >
      <Image source={course.thumbnail} style={styles.courseThumbnail} resizeMode="cover" />
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseLessons}>{course.lessons}</Text>
        <Text style={styles.courseRating}>⭐ {course.rating}</Text>
      </View>
      <View style={styles.courseActions}>
        <TouchableOpacity 
          style={[
            styles.heartButton,
            togglingFavorites.has(String(course._id)) && styles.heartButtonLoading
          ]} 
          onPress={() => toggleFavorite(course._id)}
          disabled={togglingFavorites.has(String(course._id))}
        >
          <Icon 
            name={togglingFavorites.has(String(course._id)) ? "heart-half" : "heart"} 
            size={20} 
            color={togglingFavorites.has(String(course._id)) ? "#F6B800" : "#FF8800"}
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
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Favourites</Text>
        {/* <View style={styles.placeholder} /> */}
      </View>
      {refreshing && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator size="small" color="#FF8800" />
          <Text style={styles.refreshText}>Refreshing...</Text>
        </View>
      )}

      {/* Course List */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.courseList}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF8800" />
              <Text style={styles.loadingText}>Loading favorite courses...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchFavoriteCourses(1, false)}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : favouriteCourses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No favorite courses found</Text>
            </View>
          ) : (
            <>
              {(favouriteCourses || []).map((course) => renderCourseCard(course))}
              
              {/* Pagination Info */}
              <View style={styles.paginationInfo}>
                <Text style={styles.paginationText}>
                  Page {currentPage} of {totalPages}
                </Text>
                <Text style={styles.paginationText}>
                  Showing {favouriteCourses.length} of {totalCourses} courses
                </Text>
              </View>
              
              {/* Load More Button */}
              {hasMoreData && (
                <TouchableOpacity 
                  style={[styles.loadMoreButton, loadingMore && styles.loadMoreButtonDisabled]} 
                  onPress={loadMoreCourses}
                  disabled={loadingMore || isLoading}
                >
                  <Text style={styles.loadMoreButtonText}>
                    {loadingMore ? 'Loading...' : 'Load More Favorites'}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FavouritesScreen;

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
  scrollView: {
    flex: 1,
  },
  courseList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  courseLessons: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  courseRating: {
    fontSize: 14,
    color: '#666',
  },
  courseActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
  },
  likeIcon: {
    width: 20,
    height: 20,
    tintColor: '#666',
    marginBottom: 4,
  },
  heartIcon: {
    width: 20,
    height: 20,
    tintColor: '#FF8800',
    marginBottom: 8,
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF8800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF8800',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  heartButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  heartButtonLoading: {
    opacity: 0.7,
  },
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#FF8800',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  refreshText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
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
    backgroundColor: '#FF8800',
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