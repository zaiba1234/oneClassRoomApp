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
} from 'react-native';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';

// Import local assets
const ArrowIcon = require('../assests/images/Arrow.png');
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

const StudentScreen = ({ navigation, route }) => {
  // Get subcourseId from route params
  const subcourseId = route.params?.subcourseId;
  
  // Get user data from Redux
  const { token } = useAppSelector((state) => state.user);

  // State for enrolled students data
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch enrolled students when component mounts
  useEffect(() => {
    console.log('🔍 StudentScreen: useEffect triggered');
    console.log('🔍 StudentScreen: subcourseId:', subcourseId);
    console.log('🔍 StudentScreen: token:', token ? 'Present' : 'Missing');
    
    if (subcourseId && token) {
      console.log('✅ StudentScreen: Both subcourseId and token present, calling fetchEnrolledStudents');
      fetchEnrolledStudents();
    } else {
      console.log('❌ StudentScreen: Missing subcourseId or token, setting loading to false');
      console.log('❌ StudentScreen: subcourseId present:', !!subcourseId);
      console.log('❌ StudentScreen: token present:', !!token);
      setIsLoading(false);
    }
  }, [subcourseId, token]);

  // Function to fetch enrolled students from API
  const fetchEnrolledStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 StudentScreen: Starting to fetch enrolled students...');
      console.log('🔍 StudentScreen: subcourseId:', subcourseId);
      console.log('🔍 StudentScreen: token:', token ? 'Present' : 'Missing');
      
      const result = await courseAPI.getEnrolledStudents(token, subcourseId);
      
      console.log('✅ StudentScreen: API call successful, response:', result);
      console.log('🔍 StudentScreen: Response structure:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data.success) {
        const responseData = result.data.data;
        console.log('✅ StudentScreen: API response data:', responseData);
        console.log('🔍 StudentScreen: Response data structure:', JSON.stringify(responseData, null, 2));
        
        // Extract users array from the response
        const apiStudents = responseData.users || responseData;
        console.log('✅ StudentScreen: API students data:', apiStudents);
        console.log('🔍 StudentScreen: API students count:', apiStudents ? apiStudents.length : 'undefined');
        console.log('🔍 StudentScreen: API students type:', typeof apiStudents);
        console.log('🔍 StudentScreen: API students is array:', Array.isArray(apiStudents));
        
        // Check if we have pagination data
        if (responseData.pagination) {
          console.log('✅ StudentScreen: Pagination data:', responseData.pagination);
        }
        
        // Transform API data to match existing UI structure
        const transformedStudents = apiStudents.map((student, index) => {
          console.log(`🔍 StudentScreen: Processing student ${index}:`, student);
          const studentImage = student.profileImageUrl && student.profileImageUrl.trim() !== '' 
            ? { uri: student.profileImageUrl } 
            : require('../assests/images/John.png');
          
          const transformedStudent = {
            id: student.userId || index + 1,
            name: student.fullName || 'Unknown Student',
            avatar: studentImage,
          };
          
          console.log(`✅ StudentScreen: Transformed student ${index}:`, transformedStudent);
          return transformedStudent;
        });
        
        console.log('✅ StudentScreen: All transformed students:', transformedStudents);
        setEnrolledStudents(transformedStudents);
        
      } else {
        console.log('❌ StudentScreen: API response not successful:', result);
        console.log('❌ StudentScreen: Error message:', result.data?.message);
        setError(result.data?.message || 'Failed to fetch enrolled students');
        // Keep empty array if API fails
        setEnrolledStudents([]);
      }
    } catch (error) {
      console.error('💥 StudentScreen: Error fetching enrolled students:', error);
      console.error('💥 StudentScreen: Error details:', error.message);
      console.error('💥 StudentScreen: Error stack:', error.stack);
      setError(error.message || 'Network error occurred');
      // Keep empty array if error occurs
      setEnrolledStudents([]);
    } finally {
      console.log('🏁 StudentScreen: fetchEnrolledStudents completed, setting loading to false');
      setIsLoading(false);
    }
  };

  // Log subcourseId for debugging
  useEffect(() => {
  }, [subcourseId]);

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

  // Use API data if available, otherwise use mock data
  const students = enrolledStudents.length > 0 ? enrolledStudents : mockStudents;
  
  // Debug logging for render
  console.log('🔍 StudentScreen: Render - enrolledStudents:', enrolledStudents);
  console.log('🔍 StudentScreen: Render - enrolledStudents.length:', enrolledStudents.length);
  console.log('🔍 StudentScreen: Render - mockStudents.length:', mockStudents.length);
  console.log('🔍 StudentScreen: Render - students:', students);
  console.log('🔍 StudentScreen: Render - students.length:', students.length);
  console.log('🔍 StudentScreen: Render - isLoading:', isLoading);
  console.log('🔍 StudentScreen: Render - error:', error);

  const handleStudentPress = (student) => {
    // Navigate to student detail screen if needed
    // navigation.navigate('StudentDetail', { student });
  };

  const renderStudentItem = (student) => (
    <TouchableOpacity
      key={student.id}
      style={styles.studentItem}
      onPress={() => handleStudentPress(student)}
    >
      <Image source={student.avatar} style={styles.studentAvatar} />
      <Text style={styles.studentName}>{student.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image source={ArrowIcon} style={styles.backIcon} />
        </TouchableOpacity>
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
            <TouchableOpacity style={styles.retryButton} onPress={fetchEnrolledStudents}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : students.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No enrolled students found</Text>
          </View>
        ) : (
          students.map(renderStudentItem)
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
    paddingTop: Platform.OS === 'ios' ? getVerticalSize(10) : getVerticalSize(20),
    paddingBottom: getVerticalSize(15),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: getVerticalSize(8),
  },
  backIcon: {
    width: getFontSize(24),
    height: getFontSize(24),
    resizeMode: 'contain',
  },
  headerTitle: {
    marginTop:20,
    fontSize: getFontSize(18),
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
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
});

export default StudentScreen;