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
  const [showCompletionPopup, setShowCompletionPopup] = useState(false); // Add state for completion popup
  const [isRefreshing, setIsRefreshing] = useState(false); // Add refresh state

  // State for favorite toggling (same as HomeScreen)
  const [togglingFavorites, setTogglingFavorites] = useState(new Set());

  // Fetch subcourse data when component mounts
  useEffect(() => {
    console.log('🚀 SubCourseScreen: Component mounted with route params:', { courseId, courseName });
    if (token && courseId) {
      fetchSubcourseData();
    } else {
      console.log('⚠️ SubCourseScreen: Missing token or courseId, using fallback data');
      setIsLoadingSubcourses(false);
    }
  }, [token, courseId]);

  // Show completion popup when course is completed
  useEffect(() => {
    if (courseData?.isCourseCompleted) {
      console.log('🎯 SubCourseScreen: Course completed! Showing completion popup...');
      setShowCompletionPopup(true);
    }
  }, [courseData?.isCourseCompleted]);

  // Function to fetch subcourse data from API
  const fetchSubcourseData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoadingSubcourses(true);
      }
      setSubcourseError(null);

      console.log('📚 SubCourseScreen: Fetching subcourses for course ID:', courseId);
      console.log('🔑 SubCourseScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');

      const result = await courseAPI.getSubcoursesByCourseId(token, courseId);

      if (result.success && result.data.success) {
        const apiData = result.data.data;
      

        // Set course data
        setCourseData(apiData);

       
        // Transform API data to match existing UI structure
        const transformedSubcourses = apiData.subcourses.map((subcourse, index) => {
          console.log(`📚 SubCourseScreen: Subcourse ${index + 1} - ${subcourse.subcourseName}`);
          console.log(`🖼️ SubCourseScreen: Thumbnail URL: ${subcourse.thumbnailImageUrl || 'No image URL'}`);
          
          const thumbnailImage = subcourse.thumbnailImageUrl ? { uri: subcourse.thumbnailImageUrl } : require('../assests/images/Frame1.png');
          
          console.log(`🖼️ SubCourseScreen: Final image object:`, thumbnailImage);
          console.log(`🖼️ SubCourseScreen: Image type: ${subcourse.thumbnailImageUrl ? 'URI' : 'require'}`);

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

        console.log('🔄 SubCourseScreen: Transformed subcourses:', transformedSubcourses);
        console.log('🔄 SubCourseScreen: Number of transformed subcourses:', transformedSubcourses.length);
        setSubcourses(transformedSubcourses);

      } else {
        console.log('❌ SubCourseScreen: Failed to fetch subcourse data:', result.data?.message);
        console.log('❌ SubCourseScreen: API response:', result);
        setSubcourseError(result.data?.message || 'Failed to fetch subcourses');
        // Keep existing subcourse data if API fails
      }
    } catch (error) {
      console.error('💥 SubCourseScreen: Error fetching subcourse data:', error);
      setSubcourseError(error.message || 'Network error occurred');
      // Keep existing subcourse data if error occurs
    } finally {
      if (isRefresh) {
        setIsRefreshing(false);
      } else {
        setIsLoadingSubcourses(false);
      }
    }
  };



  // Function to handle refresh
  const handleRefresh = () => {
    console.log('🔄 SubCourseScreen: Pull to refresh triggered');
    fetchSubcourseData(true);
  };

  // Function to toggle favorite status (same as HomeScreen)
  const toggleFavorite = async (courseId, currentFavoriteStatus) => {
    try {
      // Check if token exists
      if (!token) {
        console.log('❌ SubCourseScreen: No token available for toggle favorite');
        return;
      }
      
      // Check if courseId exists
      if (!courseId) {
        console.log('❌ SubCourseScreen: No courseId provided for toggle favorite');
        return;
      }
      
      // Check if already toggling this course to prevent double calls
      if (togglingFavorites.has(String(courseId))) {
        console.log('⏳ SubCourseScreen: Already toggling favorite for course:', courseId);
        return;
      }
      
      console.log('❤️ SubCourseScreen: Starting toggle favorite for course:', courseId);
      console.log('❤️ SubCourseScreen: Current favorite status:', currentFavoriteStatus);
      console.log('❤️ SubCourseScreen: Action will be:', currentFavoriteStatus ? 'REMOVE from favorites' : 'ADD to favorites');
      
      // Set loading state for this specific course
      setTogglingFavorites(prev => new Set(prev).add(String(courseId)));
      
      console.log('📡 SubCourseScreen: Calling toggleFavorite API...');
      const result = await courseAPI.toggleFavorite(token, courseId);
      console.log('📡 SubCourseScreen: Toggle favorite API response:', result);
      
      if (result.success && result.data.success) {
        // Get the new favorite status from the API response
        const newFavoriteStatus = result.data.data.isLike;
        console.log('✅ SubCourseScreen: Toggle successful! New favorite status:', newFavoriteStatus);
        console.log('✅ SubCourseScreen: Action completed:', newFavoriteStatus ? 'ADDED to favorites' : 'REMOVED from favorites');
        
        // Update the course in the local state
        setSubcourses(prevCourses => {
          const updatedCourses = prevCourses.map(course => {
            // Convert both IDs to strings for comparison to handle type mismatches
            if (String(course.id) === String(courseId)) {
              console.log('🔄 SubCourseScreen: Updating course in local state:', course.title, 'isLike:', newFavoriteStatus);
              return { ...course, isLike: newFavoriteStatus };
            }
            return course;
          });
          return updatedCourses;
        });
        
      } else {
        console.log('❌ SubCourseScreen: Toggle favorite failed:', result.data?.message || 'Unknown error');
      }
    } catch (error) {
      console.error('💥 SubCourseScreen: Error during toggle favorite:', error);
    } finally {
      // Remove loading state for this course
      setTogglingFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(String(courseId));
        return newSet;
      });
      console.log('🏁 SubCourseScreen: Toggle favorite process completed for course:', courseId);
    }
  };

  // Use API data only
  const displaySubcourses = subcourses;
  const displayCourseName = courseData?.courseName || courseName || 'Course';

  console.log('🔄 SubCourseScreen: Using subcourses:', 'API data only');
  console.log('🔄 SubCourseScreen: Display course name:', displayCourseName);
  console.log('🔄 SubCourseScreen: Number of display subcourses:', displaySubcourses.length);

  const renderCourseCard = (course) => {
    console.log(`💖 SubCourseScreen: Rendering course card for "${course.title}" - isLike: ${course.isLike}, ID: ${course.id}`);
    
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
              console.log(`💖 SubCourseScreen: Heart button pressed for "${course.title}" (ID: ${course.id})`);
              console.log(`💖 SubCourseScreen: Current isLike status: ${course.isLike}`);
              console.log(`💖 SubCourseScreen: Will ${course.isLike ? 'REMOVE from' : 'ADD to'} favorites`);
              toggleFavorite(course.id, course.isLike);
            }}
            disabled={togglingFavorites.has(String(course.id))}
          >
            <Icon 
              name={course.isLike ? "heart" : "heart-outline"} 
              size={20} 
              color={course.isLike ? "#FF0000" : "#FF8800"}
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
              <Text style={styles.errorText}>Error: {subcourseError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchSubcourseData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : displaySubcourses.length > 0 ? (
            displaySubcourses.map((course) => renderCourseCard(course))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No subcourses available</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Course Completion Popup */}
      <Modal
        visible={showCompletionPopup}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCompletionPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.completionModal}>
            {/* Close Button positioned at top-right corner */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowCompletionPopup(false)}
            >
              <Icon name="close" size={24} color="#FF8800" />
            </TouchableOpacity>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  console.log('📜 SubCourseScreen: Get Internship Letter clicked');
                  console.log('📜 SubCourseScreen: Passing courseId (not subcourseId):', courseId);
                  setShowCompletionPopup(false);
                  // Navigate to internship letter screen with course ID (not subcourse ID)
                  navigation.navigate('Internship', { courseId: courseId });
                }}
              >
                <Text style={styles.modalButtonText}>Get Internship Letter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  console.log('🏆 SubCourseScreen: Get Course Certificate clicked');
                  setShowCompletionPopup(false);
                  // Navigate to course certificate download screen
                  navigation.navigate('CourseCertificate', { courseId: courseId });
                }}
              >
                <Text style={styles.modalButtonText}>Get Course Certificate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 30,
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
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 18,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 20,
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
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end', // Position at bottom
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Only overlay background, no shadow
  },
  completionModal: {
    backgroundColor: '#2C2C2E', // Dark theme background - NO SHADOW
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24, // Increased padding for better button spacing
    width: '100%', // Full width
    alignItems: 'center',
    // NO SHADOW PROPERTIES - COMPLETELY CLEAN
  },
  closeButton: {
    position: 'absolute',
    top: -15,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    borderWidth: 2,
    borderColor: '#FF8800',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },

  modalButtons: {
    flexDirection: 'column', // Changed from 'row' to 'column' for vertical stacking
    justifyContent: 'space-between',
    width: '100%',
    gap: 16, // Increased gap between buttons
  },
  modalButton: {
    backgroundColor: '#FFFFFF', // White buttons - NO SHADOW
    paddingHorizontal: 16, // Increased horizontal padding
    paddingVertical: 14, // Increased vertical padding
    borderRadius: 10, 
    width: '100%', // Ensure full width
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50, // Increased minimum height
    // NO SHADOW PROPERTIES - COMPLETELY CLEAN
  },
  modalButtonText: {
    color: '#FF8800', // Orange text
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholder: {
    width: 40, // Adjust as needed for spacing
  },
});