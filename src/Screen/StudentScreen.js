import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';
import BackButton from '../Component/BackButton';

// Import local assets
const JohnSmithAvatar = require('../assests/images/John.png');
const AceSmithAvatar = require('../assests/images/John.png');
const AliceAvatar = require('../assests/images/John.png');
const RohanAvatar = require('../assests/images/John.png');




// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Responsive scaling factors
const scale = width / 375; // Base width for iPhone 8
const verticalScale = height / 812; // Base height for iPhone 8

// Responsive font sizes
const getFontSize = (size) => size * scale;
const getVerticalSize = (size) => size * verticalScale;

/**
 * ============================================
 * STUDENTSCREEN - API CALLS SUMMARY
 * ============================================
 * 
 * This screen uses the following API:
 * 
 * 1. courseAPI.getEnrolledStudents(token, subcourseId)
 *    - Endpoint: /api/user/course/get-enrolled-students/{subcourseId}
 *    - Method: GET
 *    - Purpose: Fetch enrolled students for a specific subcourse
 *    - Parameters:
 *      - token: User authentication token
 *      - subcourseId: ID of the subcourse to get enrolled students for
 * 
 * ============================================
 */

const StudentScreen = ({ navigation, route }) => {
  // Get subcourseId from route params
  const subcourseId = route.params?.subcourseId;
  
  // Get user data from Redux
  const { token } = useAppSelector((state) => state.user);

  // State for enrolled students data
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const limit = 10; // Students per page

  // Fetch enrolled students when component mounts
  useEffect(() => {
    if (subcourseId && token) {
      fetchEnrolledStudents(1, true); // Reset to page 1 on mount
    } else {
      setIsLoading(false);
    }
  }, [subcourseId, token]);

  // Function to fetch enrolled students from API
  const fetchEnrolledStudents = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setEnrolledStudents([]);
        setCurrentPage(1);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);
      
      const result = await courseAPI.getEnrolledStudents(token, subcourseId, { page, limit });
      
      // API RESPONSE LOGS ONLY
      console.log('🔥🔥🔥 ENROLLED STUDENTS API RESPONSE 🔥🔥🔥');
      console.log('🔥 [API] API Name: getEnrolledStudents');
      console.log('🔥 [API] Endpoint: /api/user/course/get-enrolled-students/{subcourseId}');
      console.log('🔥 [API] SubcourseId:', subcourseId);
      console.log('🔥 [API] Response Success:', result.success);
      console.log('🔥 [API] Response Status:', result.status);
      console.log('🔥 [API] Full Response:', JSON.stringify(result, null, 2));
      console.log('🔥 [API] Response Data:', result.data);
      console.log('🔥 [API] Response Data Success:', result.data?.success);
      console.log('🔥 [API] Response Data Keys:', result.data ? Object.keys(result.data) : 'No data');
      
      if (result.success && result.data.success) {
        const responseData = result.data.data;
        console.log('🔥 [API] Response Data Details:', {
          responseData,
          dataKeys: responseData ? Object.keys(responseData) : 'No data',
          hasUsers: !!responseData.users,
          usersType: typeof responseData.users,
          usersIsArray: Array.isArray(responseData.users),
          usersLength: responseData.users?.length || 0,
          hasPagination: !!responseData.pagination,
          paginationInfo: responseData.pagination || 'No pagination data',
          resultDataKeys: result.data ? Object.keys(result.data) : 'No result.data',
          resultDataPagination: result.data.pagination || 'No pagination at result.data level'
        });
        
        // Extract users array from the response
        const apiStudents = responseData.users || responseData;
        console.log('🔥 [API] Extracted Students:', {
          apiStudents,
          type: typeof apiStudents,
          isArray: Array.isArray(apiStudents),
          length: apiStudents?.length || 0,
          firstStudent: apiStudents && apiStudents[0] ? {
            userId: apiStudents[0].userId,
            fullName: apiStudents[0].fullName,
            hasProfileImage: !!apiStudents[0].profileImageUrl
          } : 'No students'
        });
        
        // Check pagination data - it might be at different levels
        const paginationData = responseData.pagination || result.data.pagination || result.data.data?.pagination;
        
        if (paginationData) {
          console.log('🔥 [API] Pagination Data:', {
            currentPage: paginationData.currentPage,
            totalPages: paginationData.totalPages,
            totalStudents: paginationData.totalStudents,
            hasNextPage: paginationData.hasNextPage,
            hasPrevPage: paginationData.hasPrevPage
          });
        }
        console.log('🔥🔥🔥 END API RESPONSE 🔥🔥🔥');
        
        // Update pagination state
        const receivedCount = apiStudents?.length || 0;
        
        if (paginationData) {
          // Use pagination data from API
          setCurrentPage(paginationData.currentPage || page);
          setTotalPages(paginationData.totalPages || 1);
          setTotalStudents(paginationData.totalStudents || 0);
          setHasNextPage(paginationData.hasNextPage !== undefined ? paginationData.hasNextPage : (receivedCount >= limit));
        } else {
          // Fallback pagination logic when API doesn't provide pagination
          // If we received exactly 'limit' students, there might be more
          const hasMore = receivedCount >= limit;
          setCurrentPage(page);
          
          // Calculate total pages based on received data
          // If we got less than limit, this is the last page
          if (hasMore) {
            // We got full page, estimate there are more
            // For now, set a high number or calculate based on current data
            setTotalPages(page + 1); // At least one more page
            setTotalStudents((reset || page === 1) ? receivedCount : (enrolledStudents.length + receivedCount));
          } else {
            // We got less than limit, this is likely the last page
            setTotalPages(page);
            if (reset || page === 1) {
              setTotalStudents(receivedCount);
            } else {
              setTotalStudents(enrolledStudents.length + receivedCount);
            }
          }
          setHasNextPage(hasMore);
        }
        
        // Transform API data to match existing UI structure
        const transformedStudents = (apiStudents || []).map((student, index) => {
          // Use avatar icon if no profile image, otherwise use the profile image
          const hasProfileImage = student.profileImageUrl && student.profileImageUrl.trim() !== '';
          
          return {
            id: student.userId || index + 1,
            name: student.fullName || 'Unknown Student',
            profileImageUrl: hasProfileImage ? student.profileImageUrl : null,
            hasProfileImage: hasProfileImage,
          };
        });
        
        if (reset || page === 1) {
          setEnrolledStudents(transformedStudents);
        } else {
          setEnrolledStudents(prev => [...prev, ...transformedStudents]);
        }
        
      } else {
        const errorMessage = result.data?.message || 'Failed to fetch enrolled students';
        console.log('🔥 [API] API call failed - Response:', JSON.stringify(result, null, 2));
        setError(errorMessage);
        setEnrolledStudents([]);
      }
    } catch (error) {
      const errorMessage = error.message || 'Network error occurred';
      console.log('🔥 [API] Error - Response:', {
        message: errorMessage,
        name: error.name,
        stack: error.stack
      });
      setError(errorMessage);
      if (reset) {
        setEnrolledStudents([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Function to load more students
  const loadMoreStudents = () => {
    if (!isLoadingMore && hasNextPage) {
      const nextPage = currentPage + 1;
      fetchEnrolledStudents(nextPage, false);
    }
  };


  // Mock student data (fallback)
  const mockStudents = [
    {
      id: 1,
      name: 'John Smith',
      avatar: RohanAvatar,
    },
    {
      id: 2,
      name: 'Ace Smith',
      avatar: RohanAvatar,
    },
    {
      id: 3,
      name: 'Alice',
      avatar: RohanAvatar,
    },
    {
      id: 4,
      name: 'Rohan',
      avatar: RohanAvatar,
    },
    {
      id: 5,
      name: 'Ram',
      avatar: RohanAvatar,
    },
    {
      id: 6,
      name: 'Emma Johnson',
      avatar: RohanAvatar,
    },
    {
      id: 7,
      name: 'Lucas Brown',
      avatar: RohanAvatar,
    },
    {
      id: 8,
      name: 'Sophia Carter',
      avatar: RohanAvatar,
    },
  ];

  const handleStudentPress = (student) => {
    // Navigate to student detail screen if needed
    // navigation.navigate('StudentDetail', { student });
  };

  const renderStudentItem = (student) => {
    // Render avatar icon if no profile image, otherwise render the image
    const renderAvatar = () => {
      if (student.hasProfileImage && student.profileImageUrl) {
        return (
          <Image 
            source={{ uri: student.profileImageUrl }} 
            style={styles.studentAvatar}
            defaultSource={require('../assests/images/John.png')}
          />
        );
      } else {
        return (
          <View style={styles.avatarIconContainer}>
            <Icon name="person" size={getFontSize(30)} color="#999999" />
          </View>
        );
      }
    };

    return (
      <TouchableOpacity
        key={student.id}
        style={styles.studentItem}
        onPress={() => handleStudentPress(student)}
      >
        {renderAvatar()}
        <Text style={styles.studentName}>{student.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Students</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Student List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollViewContent}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading enrolled students...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchEnrolledStudents(1, true)}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : enrolledStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No enrolled students found</Text>
          </View>
        ) : (
          <>
            {enrolledStudents.map(renderStudentItem)}
            {hasNextPage && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMoreStudents}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.loadMoreButtonText}>Load More</Text>
                )}
              </TouchableOpacity>
            )}
            {!hasNextPage && enrolledStudents.length > 0 && (
              <View style={styles.endOfListContainer}>
                <Text style={styles.endOfListText}>
                  {totalStudents > 0 
                    ? `Showing ${enrolledStudents.length} of ${totalStudents} students`
                    : `Showing ${enrolledStudents.length} student${enrolledStudents.length !== 1 ? 's' : ''}`
                  }
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getVerticalSize(20),
    paddingTop: Platform.OS === 'ios' ? getVerticalSize(50) : getVerticalSize(40),
    paddingBottom: getVerticalSize(15),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  scrollViewContent: {
    padding: getVerticalSize(20),
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: getFontSize(25),
    padding: getVerticalSize(15),
    marginBottom: getVerticalSize(10),
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentAvatar: {
    width: getFontSize(50),
    height: getFontSize(50),
    borderRadius: getFontSize(25),
    marginRight: getVerticalSize(15),
    backgroundColor: '#F0F0F0',
  },
  avatarIconContainer: {
    width: getFontSize(50),
    height: getFontSize(50),
    borderRadius: getFontSize(25),
    marginRight: getVerticalSize(15),
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  studentName: {
    fontSize: getFontSize(16),
    fontWeight: '500',
    color: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getVerticalSize(20),
  },
  loadingText: {
    fontSize: getFontSize(18),
    color: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getVerticalSize(20),
  },
  errorText: {
    fontSize: getFontSize(18),
    color: '#FF0000',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: getVerticalSize(20),
    backgroundColor: '#007BFF',
    paddingVertical: getVerticalSize(10),
    paddingHorizontal: getVerticalSize(20),
    borderRadius: getFontSize(25),
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getVerticalSize(20),
  },
  emptyText: {
    fontSize: getFontSize(18),
    color: '#888888',
    textAlign: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: getVerticalSize(12),
    paddingHorizontal: getVerticalSize(20),
    borderRadius: getFontSize(25),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getVerticalSize(20),
    marginBottom: getVerticalSize(10),
  },
  loadMoreButtonText: {
    color: '#FFFFFF',
    fontSize: getFontSize(16),
    fontWeight: 'bold',
  },
  endOfListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getVerticalSize(20),
  },
  endOfListText: {
    fontSize: getFontSize(14),
    color: '#999999',
    textAlign: 'center',
  },
});

export default StudentScreen;