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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';

const FavouritesScreen = ({ navigation }) => {
  const { token } = useAppSelector((state) => state.user);
  const [favouriteCourses, setFavouriteCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch favorite courses when component mounts
  useEffect(() => {
    if (token) {
      fetchFavoriteCourses();
    } else {
      setIsLoading(false);
      setError('No token available');
    }
  }, [token]);

  const fetchFavoriteCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('❤️ FavouritesScreen: Fetching favorite courses...');
      const result = await courseAPI.getFavoriteCourses(token);
      
      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('✅ FavouritesScreen: Favorite courses fetched successfully:', apiCourses);
        
        // Transform API data to match existing UI structure
        const transformedCourses = apiCourses.map((course, index) => ({
          id: course.id?._id || course.subcourseId || index + 1,
          title: course.subcourseName || 'Course Title',
          lessons: `${course.totalLessons || 0} lessons`,
          rating: course.avgRating ? course.avgRating.toString() : '4.8',
          price: `₹${course.price || 0}.00`,
          thumbnail: course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/Frame1.png'),
          _id: course.id?._id, // Store the actual _id for navigation
        }));
        
        setFavouriteCourses(transformedCourses);
      } else {
        console.log('❌ FavouritesScreen: Failed to fetch favorite courses:', result.data?.message);
        setError(result.data?.message || 'Failed to fetch favorite courses');
      }
    } catch (error) {
      console.error('💥 FavouritesScreen: Error fetching favorite courses:', error);
      setError('Failed to load favorite courses');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCourseCard = (course) => (
    <TouchableOpacity 
      key={course.id} 
      style={styles.courseCard}
      onPress={() => {
        console.log('❤️ FavouritesScreen: Navigating to Enroll with courseId:', course._id);
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

        <Image source={require('../assests/images/Heart.png')} style={styles.heartIcon} resizeMode="contain" />
        <Text style={styles.coursePrice}>{course.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favourites</Text>
      </View>

      {/* Course List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.courseList}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading favorite courses...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchFavoriteCourses}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : favouriteCourses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No favorite courses found</Text>
            </View>
          ) : (
            favouriteCourses.map((course) => renderCourseCard(course))
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
  },
  headerTitle: {
    marginTop:30,
    fontSize: 24,
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
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
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
});