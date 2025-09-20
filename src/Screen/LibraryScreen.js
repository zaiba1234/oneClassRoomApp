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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [hasMoreData, setHasMoreData] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch course data when component mounts
  useEffect(() => {
    if (token) {
      // Reset pagination when component mounts
      setCurrentPage(1);
      setTotalPages(1);
      setTotalCourses(0);
      setHasMoreData(false);
      setLibraryCourses([]);
      fetchCourseData(1, false);
    }
  }, [token]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Reset pagination on refresh
      setCurrentPage(1);
      setTotalPages(1);
      setTotalCourses(0);
      setHasMoreData(false);
      await fetchCourseData(1, false);
    } catch (error) {
      console.error('💥 LibraryScreen: Error during pull-to-refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Function to fetch course data from API (first page)
  const fetchCourseData = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setIsLoadingCourses(true);
      } else {
        setLoadingMore(true);
      }
      setCourseError(null);

      console.log('🔥 LibraryScreen: Starting API call to getAllCourses...');
      console.log('🔥 LibraryScreen: Page:', page, 'Append:', append);
      console.log('🔥 LibraryScreen: Token provided:', !!token);
      console.log('🔥 LibraryScreen: Token value:', token ? token.substring(0, 20) + '...' : 'No token');

      const result = await courseAPI.getAllCourses(token, page, 10);

      console.log('🔥 LibraryScreen: API call completed');
      console.log('🔥 LibraryScreen: Result success:', result.success);
      console.log('🔥 LibraryScreen: Result status:', result.status);
      console.log('🔥 LibraryScreen: Full result object:', JSON.stringify(result, null, 2));
      console.log('🔥 LibraryScreen: Result data:', result.data);
      console.log('🔥 LibraryScreen: Result data type:', typeof result.data);
      console.log('🔥 LibraryScreen: Result data.success:', result.data?.success);
      console.log('🔥 LibraryScreen: Result data.data:', result.data?.data);
      console.log('🔥 LibraryScreen: Result data.data type:', typeof result.data?.data);

      if (result.success && result.data.success) {
        // Handle new API response structure with pagination
        const coursesData = result.data.data;
        const courses = coursesData.courses || coursesData; // Handle both old and new structure
        const pagination = coursesData.pagination || {};
        
        console.log('🔥 LibraryScreen: API courses array:', courses);
        console.log('🔥 LibraryScreen: API courses length:', courses?.length);
        console.log('🔥 LibraryScreen: First course object:', courses?.[0]);
        console.log('🔥 LibraryScreen: Pagination data:', pagination);

        // Check if courses is an array
        if (!Array.isArray(courses)) {
          console.log('❌ LibraryScreen: API courses is not an array:', courses);
          setCourseError('Invalid data format received from API');
          if (!append) {
            setLibraryCourses([]);
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
          console.log(`🔥 LibraryScreen: Processing course ${index + 1}:`, course);
          console.log(`🔥 LibraryScreen: Course _id:`, course._id);
          console.log(`🔥 LibraryScreen: Course courseName:`, course.courseName);
          console.log(`🔥 LibraryScreen: Course totalModules:`, course.totalModules);
          console.log(`🔥 LibraryScreen: Course CoverImageUrl:`, course.CoverImageUrl);
          
          const courseImage = course.CoverImageUrl ? { uri: course.CoverImageUrl } : require('../assests/images/Frame1.png');
          
          const transformedCourse = {
            id: course._id || index + 1,
            title: course.courseName || 'Course Title',
            modules: `${course.totalModules || 0} Modules`,
            image: courseImage,
          };
          
          console.log(`🔥 LibraryScreen: Transformed course ${index + 1}:`, transformedCourse);
          return transformedCourse;
        });

        console.log('🔥 LibraryScreen: All transformed courses:', transformedCourses);
        
        // Update courses list
        if (append && page > 1) {
          setLibraryCourses(prev => [...prev, ...transformedCourses]);
        } else {
          setLibraryCourses(transformedCourses);
        }

      } else {
        console.log('❌ LibraryScreen: API call failed');
        console.log('❌ LibraryScreen: Result success:', result.success);
        console.log('❌ LibraryScreen: Result data success:', result.data?.success);
        console.log('❌ LibraryScreen: Error message:', result.data?.message);
        setCourseError(result.data?.message || 'Failed to fetch courses');
        if (!append) {
          setLibraryCourses([]);
        }
      }
    } catch (error) {
      console.error('💥 LibraryScreen: Exception caught while fetching course data');
      console.error('💥 LibraryScreen: Error type:', typeof error);
      console.error('💥 LibraryScreen: Error message:', error.message);
      console.error('💥 LibraryScreen: Error stack:', error.stack);
      console.error('💥 LibraryScreen: Full error object:', error);
      setCourseError(error.message || 'Network error occurred');
      if (!append) {
        setLibraryCourses([]);
      }
    } finally {
      console.log('🔥 LibraryScreen: Setting loading to false');
      setIsLoadingCourses(false);
      setLoadingMore(false);
    }
  };

  // Load more courses (next page)
  const loadMoreCourses = async () => {
    if (hasMoreData && !loadingMore && !isLoadingCourses) {
      console.log('📚 LibraryScreen: Loading more courses, page:', currentPage + 1);
      await fetchCourseData(currentPage + 1, true);
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
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchCourseData(1, false)}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : libraryCourses.length > 0 ? (
            <>
              {libraryCourses.map((course) => renderLibraryCard(course))}
            </>
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
    marginTop: 20,
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
    backgroundColor: '#007BFF',
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