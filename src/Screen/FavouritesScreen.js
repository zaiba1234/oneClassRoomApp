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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';
import { useFocusEffect } from '@react-navigation/native';

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

  const fetchFavoriteCourses = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      console.log('🔥 FavouritesScreen: Starting API call to getFavoriteCourses...');
      console.log('🔥 FavouritesScreen: Page:', page, 'Append:', append);
      console.log('🔥 FavouritesScreen: Token provided:', !!token);
      console.log('🔥 FavouritesScreen: Token value:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const result = await courseAPI.getFavoriteCourses(token, page, 10);
      
      console.log('🔥 FavouritesScreen: API call completed');
      console.log('🔥 FavouritesScreen: Result success:', result.success);
      console.log('🔥 FavouritesScreen: Result status:', result.status);
      console.log('🔥 FavouritesScreen: Full result object:', JSON.stringify(result, null, 2));
      console.log('🔥 FavouritesScreen: Result data:', result.data);
      console.log('🔥 FavouritesScreen: Result data type:', typeof result.data);
      console.log('🔥 FavouritesScreen: Result data.success:', result.data?.success);
      console.log('🔥 FavouritesScreen: Result data.data:', result.data?.data);
      console.log('🔥 FavouritesScreen: Result data.data type:', typeof result.data?.data);
      
      if (result.success && result.data.success) {
        // Handle new API response structure with pagination
        const coursesData = result.data.data;
        const courses = coursesData.courses || coursesData; // Handle both old and new structure
        const pagination = coursesData.pagination || {};
        
        console.log('🔥 FavouritesScreen: API courses array:', courses);
        console.log('🔥 FavouritesScreen: API courses length:', courses?.length);
        console.log('🔥 FavouritesScreen: First course object:', courses?.[0]);
        console.log('🔥 FavouritesScreen: Pagination data:', pagination);
        
        // Check if courses is an array
        if (!Array.isArray(courses)) {
          console.log('❌ FavouritesScreen: API courses is not an array:', courses);
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
          console.log(`🔥 FavouritesScreen: Processing course ${index + 1}:`, course);
          console.log(`🔥 FavouritesScreen: Course id:`, course.id);
          console.log(`🔥 FavouritesScreen: Course id._id:`, course.id?._id);
          console.log(`🔥 FavouritesScreen: Course subcourseId:`, course.subcourseId);
          console.log(`🔥 FavouritesScreen: Course subcourseName:`, course.subcourseName);
          console.log(`🔥 FavouritesScreen: Course totalLessons:`, course.totalLessons);
          console.log(`🔥 FavouritesScreen: Course avgRating:`, course.avgRating);
          console.log(`🔥 FavouritesScreen: Course price:`, course.price);
          console.log(`🔥 FavouritesScreen: Course thumbnailImageUrl:`, course.thumbnailImageUrl);
          
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
          
          console.log(`🔥 FavouritesScreen: Transformed course ${index + 1}:`, transformedCourse);
          return transformedCourse;
        });
        
        console.log('🔥 FavouritesScreen: All transformed courses:', transformedCourses);
        
        // Update courses list
        if (append && page > 1) {
          setFavouriteCourses(prev => [...prev, ...transformedCourses]);
        } else {
          setFavouriteCourses(transformedCourses);
        }
      } else {
        console.log('❌ FavouritesScreen: API call failed');
        console.log('❌ FavouritesScreen: Result success:', result.success);
        console.log('❌ FavouritesScreen: Result data success:', result.data?.success);
        console.log('❌ FavouritesScreen: Error message:', result.data?.message);
        setError(result.data?.message || 'Failed to fetch favorite courses');
        if (!append) {
          setFavouriteCourses([]);
        }
      }
    } catch (error) {
      console.error('💥 FavouritesScreen: Exception caught while fetching favorite courses');
      console.error('💥 FavouritesScreen: Error type:', typeof error);
      console.error('💥 FavouritesScreen: Error message:', error.message);
      console.error('💥 FavouritesScreen: Error stack:', error.stack);
      console.error('💥 FavouritesScreen: Full error object:', error);
      setError('Failed to load favorite courses');
      if (!append) {
        setFavouriteCourses([]);
      }
    } finally {
      console.log('🔥 FavouritesScreen: Setting loading to false');
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more courses (next page)
  const loadMoreCourses = async () => {
    if (hasMoreData && !loadingMore && !isLoading) {
      console.log('📚 FavouritesScreen: Loading more courses, page:', currentPage + 1);
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
      console.error('💥 FavouritesScreen: Error during pull-to-refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Function to toggle favorite status (remove from favorites)
  const toggleFavorite = async (courseId) => {
    try {
      console.log('🔥 FavouritesScreen: Starting toggle favorite for courseId:', courseId);
      
      // Check if token exists
      if (!token) {
        console.error('❌ FavouritesScreen: No token available for API call');
        return;
      }
      
      // Check if courseId exists
      if (!courseId) {
        console.error('❌ FavouritesScreen: No courseId available for API call');
        return;
      }
      
      // Check if already toggling this course to prevent double calls
      if (togglingFavorites.has(String(courseId))) {
        console.log('⚠️ FavouritesScreen: Already toggling this course, skipping...');
        return;
      }
      
      // Set loading state for this specific course
      setTogglingFavorites(prev => new Set(prev).add(String(courseId)));
      console.log('🔥 FavouritesScreen: Set loading state for course:', courseId);
      
      const result = await courseAPI.toggleFavorite(token, courseId);
      
      console.log('🔥 FavouritesScreen: Toggle favorite API call completed');
      console.log('🔥 FavouritesScreen: Result success:', result.success);
      console.log('🔥 FavouritesScreen: Result status:', result.status);
      console.log('🔥 FavouritesScreen: Full result object:', JSON.stringify(result, null, 2));
      console.log('🔥 FavouritesScreen: Result data:', result.data);
      console.log('🔥 FavouritesScreen: Result data.success:', result.data?.success);
      console.log('🔥 FavouritesScreen: Result data.data:', result.data?.data);
      
      if (result.success && result.data.success) {
        // Get the new favorite status from the API response
        const newFavoriteStatus = result.data.data.isLike;
        console.log('🔥 FavouritesScreen: New favorite status:', newFavoriteStatus);
        
        if (!newFavoriteStatus) {
          console.log('🔥 FavouritesScreen: Course was removed from favorites, removing from list');
          // Course was removed from favorites, remove it from the list
          setFavouriteCourses(prevCourses => 
            prevCourses.filter(course => String(course._id) !== String(courseId))
          );
        } else {
          console.log('🔥 FavouritesScreen: Course is still favorited');
        }
      } else {
        console.log('❌ FavouritesScreen: Toggle favorite API call failed');
        console.log('❌ FavouritesScreen: Error message:', result.data?.message);
      }
    } catch (error) {
      console.error('💥 FavouritesScreen: Exception caught while toggling favorite');
      console.error('💥 FavouritesScreen: Error type:', typeof error);
      console.error('💥 FavouritesScreen: Error message:', error.message);
      console.error('💥 FavouritesScreen: Error stack:', error.stack);
      console.error('💥 FavouritesScreen: Full error object:', error);
    } finally {
      console.log('🔥 FavouritesScreen: Removing loading state for course:', courseId);
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
            color={togglingFavorites.has(String(course._id)) ? "#FF8800" : "#FF8800"}
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
        <Text style={styles.headerTitle}>Favourites  </Text>
        {refreshing && (
          <View style={styles.refreshIndicator}>
            <ActivityIndicator size="small" color="#FF8800" />
            <Text style={styles.refreshText}>Refreshing...</Text>
          </View>
        )}
      </View>

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
              {favouriteCourses.map((course) => renderCourseCard(course))}
              
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
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