import React, { useState, useEffect } from 'react';
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
  Platform,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';
import BackButton from '../Component/BackButton';

const { width, height } = Dimensions.get('window');

// Responsive scaling factors
const scale = width / 375; // Base width for iPhone 8
const verticalScale = height / 812; // Base height for iPhone 8

// Responsive font sizes
const getFontSize = (size) => size * scale;
const getVerticalSize = (size) => size * verticalScale;

const MyCoursesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('All Course');
  const [courseCards, setCourseCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Get user token from Redux
  const { token } = useAppSelector((state) => state.user);

  const filterOptions = ['All Course', 'In Progress', 'Completed'];

  // Fetch courses based on selected filter (first page)
  const fetchCourses = async (filter, page = 1, append = false) => {
    if (!token) {
      return;
    }

    try {
      if (page === 1) {
        setIsLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);
      
      let result;
      
      switch (filter) {
        case 'All Course':
          result = await courseAPI.getPurchasedSubcourses(token, page, 10);
          break;
        case 'In Progress':
          result = await courseAPI.getInProgressSubcourses(token, page, 10);
          break;
        case 'Completed':
          result = await courseAPI.getCompletedSubcourses(token, page, 10);
          break;
        default:
          result = await courseAPI.getPurchasedSubcourses(token, page, 10);
      }

      if (result.success && result.data.success) {
        // Handle new API response structure with pagination
        const coursesData = result.data.data;
        const courses = coursesData.subcourses || coursesData; // Handle both old and new structure
        const pagination = coursesData.pagination || {};
        
        // Ensure courses is an array
        if (!Array.isArray(courses)) {
          setError('Invalid data format received');
          if (!append) {
            setCourseCards([]);
          }
          return;
        }

        // Transform API data to match the existing UI structure
        const transformedCourses = courses.map((course, index) => ({
          id: course.subcourseId || index + 1,
          title: course.subcourseName || 'Course Title',
          lessons: `${course.totalLessons || 0} lessons`,
          rating: '4.5', // Default rating since API doesn't provide it
          progress: parseInt(course.progress?.replace('%', '') || '0'),
          image: course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/HomeImage.png'),
          subcourseId: course.subcourseId,
        }));
        
        // Update pagination state
        setCurrentPage(pagination.currentPage || page);
        setTotalPages(pagination.totalPages || 1);
        setTotalCourses(pagination.totalSubcourses || courses.length);
        setHasMoreData((pagination.currentPage || page) < (pagination.totalPages || 1));
        
        // Update courses list
        if (append && page > 1) {
          setCourseCards(prev => [...prev, ...transformedCourses]);
        } else {
          setCourseCards(transformedCourses);
        }
      } else {
        setError(result.data?.message || 'Failed to fetch courses');
        if (!append) {
          setCourseCards([]);
        }
      }
    } catch (error) {
      setError('Network error occurred');
      if (!append) {
        setCourseCards([]);
      }
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more courses (next page)
  const loadMoreCourses = async () => {
    if (hasMoreData && !loadingMore && !isLoading) {
      await fetchCourses(selectedFilter, currentPage + 1, true);
    }
  };

  // Fetch courses when component mounts or filter changes
  useEffect(() => {
    if (token) {
      // Reset pagination when filter changes
      setCurrentPage(1);
      setTotalPages(1);
      setTotalCourses(0);
      setHasMoreData(false);
      setCourseCards([]);
      fetchCourses(selectedFilter, 1, false);
    }
  }, [selectedFilter, token]);

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
      await fetchCourses(selectedFilter, 1, false);
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const renderProgressCircle = (progress) => {
    const radius = 20;
    const strokeWidth = 3;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          <View style={[
            styles.progressBackground,
            { borderColor: progress === 100 ? '#006C99' : '#E0E0E0' }
          ]} />
          {progress === 100 ? (
            <View style={[
              styles.progressFill,
              {
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                backgroundColor: '#006C99',
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}>
              <Text style={[styles.progressText, { color: '#fff' }]}>
                {progress}%
              </Text>
            </View>
          ) : progress > 0 ? (
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
                    borderTopColor: '#006C99',
                    borderRightColor: progress > 25 ? '#006C99' : 'transparent',
                    borderBottomColor: progress > 50 ? '#006C99' : 'transparent',
                    borderLeftColor: progress > 75 ? '#006C99' : 'transparent',
                    transform: [{ rotate: `${(progress / 100) * 360}deg` }],
                  },
                ]}
              />
            </View>
          ) : null}
          {progress !== 100 && (
            <Text style={[styles.progressText, { color: '#006C99' }]}>
              {progress}%
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderCourseCard = (course) => (
    <TouchableOpacity 
      key={course.id} 
      style={styles.courseCard}
      onPress={() => {
        if (course.progress === 100) {
          navigation.navigate('Enroll', { courseId: course.subcourseId });
        } else {
          // Navigate to EnrollScreen with subcourseId for enrolled courses
          navigation.navigate('Enroll', { courseId: course.subcourseId });
        }
      }}
    >
      <Image source={course.image} style={styles.courseCardImage} resizeMode="cover" />
      <View style={styles.courseCardContent}>
        <Text style={styles.courseCardTitle}>{course.title}</Text>
        <View style={styles.courseCardDetails}>
          <Text style={styles.courseCardLessons}>{course.lessons}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{course.rating}</Text>
          </View>
        </View>
      </View>
      <View style={styles.progressContainer}>
        {renderProgressCircle(course.progress)}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>My Courses</Text>
        <View style={styles.placeholder} />
      </View>
      {refreshing && (
        <View style={styles.refreshIndicator}>
          <Text style={styles.refreshText}>Refreshing...</Text>
        </View>
      )}

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {filterOptions.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
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
            colors={['#2285FA']}
            tintColor="#2285FA"
          />
        }
      >
        <View style={styles.courseCardsContainer}>
          {isLoading ? (
            <Text style={styles.loadingText}>Loading courses...</Text>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchCourses(selectedFilter, 1, false)}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : courseCards.length === 0 ? (
            <Text style={styles.emptyText}>No courses found</Text>
          ) : (
            <>
              {courseCards.map((course) => renderCourseCard(course))}
              
              {/* Pagination Info */}
              {totalCourses > 0 && (
                <View style={styles.paginationInfo}>
                  <Text style={styles.paginationText}>
                    Showing {courseCards.length} of {totalCourses} courses
                  </Text>
                  {totalPages > 1 && (
                    <Text style={styles.paginationText}>
                      Page {currentPage} of {totalPages}
                    </Text>
                  )}
                </View>
              )}
              
              {/* Load More Button */}
              {hasMoreData && (
                <TouchableOpacity 
                  style={[styles.loadMoreButton, loadingMore && styles.loadMoreButtonDisabled]} 
                  onPress={loadMoreCourses}
                  disabled={loadingMore || isLoading}
                >
                  <Text style={styles.loadMoreButtonText}>
                    {loadingMore ? 'Loading...' : 'Load More Courses'}
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

export default MyCoursesScreen;

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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#006C99',
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#006C99',
    borderColor: '#006C99',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#006C99',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  courseCardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#006C991A',
   
  },
  courseCardImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  courseCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  courseCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  courseCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  courseCardLessons: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  progressContainer: {
    marginLeft: 10,
  },
  progressCircle: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E0E0E0',
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
    fontSize: 10,
    fontWeight: '600',
  },
  loadingText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 16,
    color: '#FF0000',
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  retryButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: '#2285FA',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
    fontSize: 16,
    color: '#666',
  },
  refreshIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  refreshText: {
    fontSize: 14,
    color: '#2285FA',
    fontWeight: '600',
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
    backgroundColor: '#006C99',
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