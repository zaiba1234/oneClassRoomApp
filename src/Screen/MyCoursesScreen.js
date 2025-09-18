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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';

const { width, height } = Dimensions.get('window');

const MyCoursesScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState('All Course');
  const [courseCards, setCourseCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get user token from Redux
  const { token } = useAppSelector((state) => state.user);

  const filterOptions = ['All Course', 'In Progress', 'Completed'];

  // Fetch courses based on selected filter
  const fetchCourses = async (filter) => {
    if (!token) {
      console.log('❌ MyCoursesScreen: No token available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      let result;
      
      switch (filter) {
        case 'All Course':
          console.log('📚 MyCoursesScreen: Fetching purchased subcourses...');
          result = await courseAPI.getPurchasedSubcourses(token);
          break;
        case 'In Progress':
          console.log('📚 MyCoursesScreen: Fetching in-progress subcourses...');
          result = await courseAPI.getInProgressSubcourses(token);
          break;
        case 'Completed':
          console.log('📚 MyCoursesScreen: Fetching completed subcourses...');
          result = await courseAPI.getCompletedSubcourses(token);
          break;
        default:
          result = await courseAPI.getPurchasedSubcourses(token);
      }

      if (result.success && result.data.success) {
        console.log('✅ MyCoursesScreen: Successfully fetched courses for filter:', filter);
        
        // Transform API data to match the existing UI structure
        const transformedCourses = result.data.data.map((course, index) => ({
          id: course.subcourseId || index + 1,
          title: course.subcourseName || 'Course Title',
          lessons: `${course.totalLessons || 0} lessons`,
          rating: '4.5', // Default rating since API doesn't provide it
          progress: parseInt(course.progress?.replace('%', '') || '0'),
          image: course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/HomeImage.png'),
          subcourseId: course.subcourseId,
        }));

        console.log('🔄 MyCoursesScreen: Transformed courses:', transformedCourses);
        setCourseCards(transformedCourses);
      } else {
        console.log('❌ MyCoursesScreen: Failed to fetch courses:', result.data?.message);
        setError(result.data?.message || 'Failed to fetch courses');
        setCourseCards([]);
      }
    } catch (error) {
      console.error('💥 MyCoursesScreen: Error fetching courses:', error);
      setError('Network error occurred');
      setCourseCards([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch courses when component mounts or filter changes
  useEffect(() => {
    if (token) {
      fetchCourses(selectedFilter);
    }
  }, [selectedFilter, token]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    console.log('🔄 MyCoursesScreen: Pull-to-refresh triggered');
    setRefreshing(true);
    try {
      await fetchCourses(selectedFilter);
      console.log('✅ MyCoursesScreen: Pull-to-refresh completed');
    } catch (error) {
      console.error('💥 MyCoursesScreen: Error during pull-to-refresh:', error);
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
        console.log('Course clicked:', course.title);
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
        <Text style={styles.headerTitle}>My Courses</Text>
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
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchCourses(selectedFilter)}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : courseCards.length === 0 ? (
            <Text style={styles.emptyText}>No courses found</Text>
          ) : (
            courseCards.map((course) => renderCourseCard(course))
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'flex-start',
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
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
});