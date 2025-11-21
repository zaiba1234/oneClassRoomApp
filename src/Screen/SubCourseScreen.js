import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BackButton from '../Component/BackButton';

import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';
import { useState, useEffect } from 'react';

const SubCourseScreen = ({ navigation, route }) => {
  // Get route params
  const { courseId, courseName } = route.params || {};
  
  // Get user data from Redux
  const { token } = useAppSelector((state) => state.user);

  // State for subcourse data from API
  const [subcourses, setSubcourses] = useState([]);
  const [isLoadingSubcourses, setIsLoadingSubcourses] = useState(true);
  const [subcourseError, setSubcourseError] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false); // Add refresh state

  // State for favorite toggling (same as HomeScreen)
  const [togglingFavorites, setTogglingFavorites] = useState(new Set());

  // Fetch subcourse data when component mounts
  useEffect(() => {
    if (token && courseId) {
      fetchSubcourseData();
    } else {
      setIsLoadingSubcourses(false);
    }
  }, [token, courseId]);


  // Function to fetch subcourse data from API
  const fetchSubcourseData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoadingSubcourses(true);
      }
      setSubcourseError(null);


      const result = await courseAPI.getSubcoursesByCourseId(token, courseId);

      if (result.success && result.data.success) {
        const apiData = result.data.data;
      

        // Set course data
        setCourseData(apiData);

       
        // Transform API data to match existing UI structure
        const transformedSubcourses = apiData.subcourses.map((subcourse, index) => {
          
          const thumbnailImage = subcourse.thumbnailImageUrl ? { uri: subcourse.thumbnailImageUrl } : require('../assests/images/Frame1.png');
          

          return {
            id: subcourse._id || index + 1,
            title: subcourse.subcourseName || 'Subcourse Title',
            lessons: `${subcourse.totalLessons || 0} lessons`,
            rating: subcourse.avgRating ? subcourse.avgRating.toString() : '0',
            price: `₹${subcourse.price || 0}.00`,
            thumbnail: thumbnailImage,
            isLike: subcourse.isLike || false,
          };
        });

        setSubcourses(transformedSubcourses);

      } else {
        // Check for specific error messages and show user-friendly messages
        const errorMessage = result.data?.message || 'Failed to fetch subcourses';
        if (errorMessage.toLowerCase().includes('no subcourses found') || 
            errorMessage.toLowerCase().includes('no subcourse')) {
          setSubcourseError('No subcourses available for this course.');
        } else if (errorMessage.toLowerCase().includes('not found') || result.status === 404) {
          setSubcourseError('Course not found.');
        } else {
          setSubcourseError('Unable to load subcourses. Please try again.');
        }
        // Keep existing subcourse data if API fails
      }
    } catch (error) {
      // Show user-friendly network error message
      if (error.message && error.message.toLowerCase().includes('network')) {
        setSubcourseError('Network issue. Please check your internet and try again.');
      } else {
        setSubcourseError('Unable to load subcourses. Please try again.');
      }
      // Keep existing subcourse data if error occurs
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoadingSubcourses(false);
      }
    }
  };

  // Fallback data if API fails or no data
  const favouriteCourses = [
    {
      id: 1,
      title: '3D Design Basic',
      lessons: '24 lessons',
      rating: '4.9',
      price: '₹1.00',
      thumbnail: require('../assests/images/Frame1.png'),
    },
    {
      id: 2,
      title: 'Characters Animation',
      lessons: '22 lessons',
      rating: '4.8',
      price: '₹1.00',
      thumbnail: require('../assests/images/Frame2.png'),
    },
    {
      id: 3,
      title: '3D Abstract Design',
      lessons: '18 lessons',
      rating: '4.7',
      price: '₹1.00',
      thumbnail: require('../assests/images/Frame3.png'),
    },
    {
      id: 4,
      title: 'Product Design',
      lessons: '23 lessons',
      rating: '4.8',
      price: '₹1.00',
      thumbnail: require('../assests/images/Frame4.png'),
    },
    {
      id: 5,
      title: 'Game Design',
      lessons: '25 lessons',
      rating: '4.9',
      price: '₹1.00',
      thumbnail: require('../assests/images/Frame.png'),
    },
  ];

  // Function to handle refresh
  const handleRefresh = () => {
    fetchSubcourseData(true);
  };

  // Function to toggle favorite status (same as HomeScreen)
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
        setSubcourses(prevCourses => {
          const updatedCourses = prevCourses.map(course => {
            // Convert both IDs to strings for comparison to handle type mismatches
            if (String(course.id) === String(courseId)) {
              return { ...course, isLike: newFavoriteStatus };
            }
            return course;
          });
          return updatedCourses;
        });
        
      } else {
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

  // Use API data if available, otherwise use fallback data
  const displaySubcourses = subcourses.length > 0 ? subcourses : favouriteCourses;
  const displayCourseName = courseData?.courseName || courseName || 'Cybersecurity';


  const renderCourseCard = (course) => {
    
    return (
      <TouchableOpacity 
        key={course.id} 
        style={styles.courseCard}
        onPress={() => navigation.navigate('Enroll', { courseId: course.id })}
      >
        <Image source={course.thumbnail} style={styles.courseThumbnail} resizeMode="cover" />
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle} numberOfLines={2} ellipsizeMode="tail">{course.title}</Text>
          <Text style={styles.courseLessons} numberOfLines={1} ellipsizeMode="tail">{course.lessons}</Text>
          <Text style={styles.courseRating} numberOfLines={1} ellipsizeMode="tail">⭐ {course.rating}</Text>
        </View>
        <View style={styles.courseActions}>
          <TouchableOpacity 
            style={[
              styles.heartButton,
              togglingFavorites.has(String(course.id)) && styles.heartButtonLoading
            ]} 
            onPress={() => {
              toggleFavorite(course.id, course.isLike);
            }}
            disabled={togglingFavorites.has(String(course.id))}
          >
            <Icon 
              name={course.isLike ? "heart" : "heart-outline"} 
              size={20} 
              color={course.isLike ? "#F6B800" : "#FF8800"}
            />
          </TouchableOpacity>
          <Text style={styles.coursePrice}>{course.price}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        
        <Text style={styles.headerTitle} numberOfLines={2} ellipsizeMode="tail">{displayCourseName}</Text>
        
        <View style={styles.placeholder} />
      </View>

      {/* Course List */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#FF8800']}
            tintColor="#FF8800"
            title="Pull to refresh..."
            titleColor="#666666"
          />
        }
      >
        <View style={styles.courseList}>
          {isLoadingSubcourses ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF8800" />
              <Text style={styles.loadingText}>Loading subcourses...</Text>
            </View>
          ) : subcourseError ? (
            <View style={styles.errorContainer}>
              <Icon name="book-outline" size={64} color="#CCCCCC" style={styles.errorIcon} />
              <Text style={styles.errorText}>{subcourseError}</Text>
            </View>
          ) : displaySubcourses.length > 0 ? (
            displaySubcourses.map((course) => renderCourseCard(course))
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="book-outline" size={64} color="#CCCCCC" style={styles.emptyIcon} />
              <Text style={styles.emptyText}>No subcourses available for this course.</Text>
            </View>
          )}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

export default SubCourseScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 10,
    minHeight: 80,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    flexWrap: 'wrap',
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
    minHeight: 100,
  },
  courseThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
    flexShrink: 0,
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'space-between',
    marginRight: 8,
    minWidth: 0,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  courseLessons: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  courseRating: {
    fontSize: 14,
    color: '#666',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  courseActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
    minWidth: 60,
    flexShrink: 0,
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
  heartButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  heartButtonLoading: {
    opacity: 0.7, // Make it look disabled
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF8800',
  },

  certificateButton: {
    backgroundColor: '#FF8800',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  certificateText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  downloadArrow: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  certificateButtonCompleted: {
    backgroundColor: '#4CAF50', // A different color for completed course
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 60,
  },
  errorIcon: {
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#FF8800',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
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
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  placeholder: {
    width: 40, // Adjust as needed for spacing
  },
});