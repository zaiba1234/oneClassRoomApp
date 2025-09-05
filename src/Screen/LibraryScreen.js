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
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';

const { width, height } = Dimensions.get('window');

const LibraryScreen = ({ navigation }) => {
  // Get user data from Redux
  const { token } = useAppSelector((state) => state.user);

  // State for course data from API
  const [libraryCourses, setLibraryCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [courseError, setCourseError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch course data when component mounts
  useEffect(() => {
    if (token) {
      fetchCourseData();
    }
  }, [token]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    console.log('🔄 LibraryScreen: Pull-to-refresh triggered');
    setRefreshing(true);
    try {
      await fetchCourseData();
      console.log('✅ LibraryScreen: Pull-to-refresh completed');
    } catch (error) {
      console.error('💥 LibraryScreen: Error during pull-to-refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Function to fetch course data from API
  const fetchCourseData = async () => {
    try {
      setIsLoadingCourses(true);
      setCourseError(null);

    

      const result = await courseAPI.getAllCourses(token);

      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
      

        // Transform API data to match existing UI structure
        const transformedCourses = apiCourses.map((course, index) => {
          console.log(`🖼️ LibraryScreen: Course ${index + 1} - ${course.courseName}`);
          console.log(`🖼️ LibraryScreen: CoverImageUrl: ${course.CoverImageUrl || 'No image URL'}`);
          
          const courseImage = course.CoverImageUrl ? { uri: course.CoverImageUrl } : require('../assests/images/Frame1.png');
          
          console.log(`🖼️ LibraryScreen: Final image object:`, courseImage);
          console.log(`🖼️ LibraryScreen: Image type: ${course.CoverImageUrl ? 'URI' : 'require'}`);

          return {
            id: course._id || index + 1,
            title: course.courseName || 'Course Title',
            modules: `${course.totalModules || 0} Modules`,
            image: courseImage,
          };
        });

        console.log('🔄 LibraryScreen: Transformed courses:', transformedCourses);
        setLibraryCourses(transformedCourses);

      } else {
        console.log('❌ LibraryScreen: Failed to fetch course data:', result.data?.message);
        console.log('❌ LibraryScreen: API response:', result);
        setCourseError(result.data?.message || 'Failed to fetch courses');
        // Keep existing course data if API fails
      }
    } catch (error) {
      console.error('💥 LibraryScreen: Error fetching course data:', error);
      setCourseError(error.message || 'Network error occurred');
      // Keep existing course data if error occurs
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const renderLibraryCard = (course) => (
    <TouchableOpacity 
      key={course.id} 
      style={styles.libraryCard}
      onPress={() => navigation.navigate('SubCourse', { courseId: course.id, courseName: course.title })}
    >
      <Image 
        source={course.image} 
        style={styles.libraryCardImage} 
        resizeMode="cover"
        onLoad={() => console.log('✅ Image loaded successfully for:', course.title)}
        onError={(error) => console.log('❌ Image failed to load for:', course.title, 'Error:', error.nativeEvent.error)}
        onLoadStart={() => console.log('🔄 Image loading started for:', course.title)}
      />
      <View style={styles.libraryCardContent}>
        <Text style={styles.libraryCardTitle}>{course.title}</Text>
        <Text style={styles.libraryCardModules}>{course.modules}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color="#666" style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Library </Text>
       
      </View>
      {refreshing && (
        <View style={styles.refreshIndicator}>
          <ActivityIndicator size="small" color="#007BFF" />
          <Text style={styles.refreshText}>Refreshing...</Text>
        </View>
      )}

      {/* Library Cards */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.libraryCardsContainer}>
          {isLoadingCourses ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading courses...</Text>
            </View>
          ) : courseError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {courseError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchCourseData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : libraryCourses.length > 0 ? (
            libraryCourses.map((course) => renderLibraryCard(course))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No courses available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LibraryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  refreshButton: {
    marginTop: 30,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  refreshButtonText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  libraryCardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  libraryCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  libraryCardImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  libraryCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  libraryCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  libraryCardModules: {
    fontSize: 14,
    color: '#666',
  },
  arrowIcon: {
    marginLeft: 10,
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
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  refreshIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  refreshText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#007BFF',
  },
});