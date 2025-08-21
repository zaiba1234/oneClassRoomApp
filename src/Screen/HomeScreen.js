import { useNavigation } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  SafeAreaView,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppSelector } from '../Redux/hooks';
import { courseAPI } from '../API/courseAPI';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const HomeScreen = () => {
  const navigation=useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('All Course');
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Get user data from Redux
  const { fullName, mobileNumber, token, isAuthenticated, _id, userId, profileImageUrl, address, email } = useAppSelector((state) => state.user);

  // State for course data
  const [courseCards, setCourseCards] = useState([]); // Start with empty array instead of hardcoded data
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [courseError, setCourseError] = useState(null);

  // State for featured courses (banner)
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [featuredError, setFeaturedError] = useState(null);

  // Fetch course data when component mounts or token changes
  useEffect(() => {
    if (token) {
      fetchCourseData();
      fetchFeaturedCourses();
    }
  }, [token]);

  // Function to fetch featured courses from API
  const fetchFeaturedCourses = async () => {
    try {
      setIsLoadingFeatured(true);
      setFeaturedError(null);
      
      console.log('🏠 HomeScreen: Fetching featured courses (banner) with token...');
      console.log('🔑 HomeScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
      const result = await courseAPI.getPurchasedCourse(token);
      
      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('🎉 HomeScreen: Featured courses received successfully!');
        console.log('📚 HomeScreen: Number of featured courses:', apiCourses.length);
        console.log('📚 HomeScreen: First featured course:', apiCourses[0]);
        
        // Transform API data to match existing UI structure
        const transformedFeaturedCourses = apiCourses.slice(0, 3).map((course, index) => {
          const courseImage = course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/Circular.png');
          const progress = parseInt(course.progress?.replace('%', '') || '0');
          
          return {
            id: course.subcourseId || index + 1,
            title: course.subcourseName || 'Course Title',
            lessons: `${course.totalLessons || 0} lessons`,
            progress: progress,
            image: courseImage,
            buttonText: progress > 0 ? 'Continue Learning' : 'Explore',
          };
        });
        
        console.log('🔄 HomeScreen: Transformed featured courses:', transformedFeaturedCourses);
        setFeaturedCourses(transformedFeaturedCourses);
        
      } else {
        console.log('❌ HomeScreen: Failed to fetch featured courses:', result.data?.message);
        console.log('❌ HomeScreen: API response:', result);
        setFeaturedError(result.data?.message || 'Failed to fetch featured courses');
        // Keep existing featured courses if API fails
      }
    } catch (error) {
      console.error('💥 HomeScreen: Error fetching featured courses:', error);
      setFeaturedError(error.message || 'Network error occurred');
      // Keep existing featured courses if error occurs
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  // Function to fetch course data from API
  const fetchCourseData = async () => {
    try {
      setIsLoadingCourses(true);
      setCourseError(null);
      
      console.log('🏠 HomeScreen: Fetching course data with token...');
      console.log('🔑 HomeScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
      const result = await courseAPI.getAllSubcourses(token);
      
      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('🎉 HomeScreen: Course data received successfully!');
        console.log('📚 HomeScreen: Number of courses:', apiCourses.length);
        console.log('📚 HomeScreen: First course:', apiCourses[0]);
        
        // Transform API data to match existing UI structure
        const transformedCourses = apiCourses.map((course, index) => {
          const courseImage = course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/HomeImage.png');
          
         
          
          return {
            id: course._id || index + 1,
            title: course.subcourseName || 'Course Title',
            lessons: `${course.totalLessons || 0} lessons`,
            rating: course.avgRating ? course.avgRating.toString() : '4.5',
            price: `₹${course.price || 0}.00`,
            image: courseImage,
            isFavorite: Math.random() > 0.5, // Random favorite status
          };
        });
        
        console.log('🔄 HomeScreen: Transformed courses:', transformedCourses);
        setCourseCards(transformedCourses);
        
      } else {
        
        setCourseError(result.data?.message || 'Failed to fetch courses');
        // Keep existing course data if API fails
      }
    } catch (error) {
      console.error('💥 HomeScreen: Error fetching course data:', error);
      setCourseError(error.message || 'Network error occurred');
      // Keep existing course data if error occurs
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Function to fetch popular courses from API
  const fetchPopularCourses = async () => {
    try {
      setIsLoadingCourses(true);
      setCourseError(null);
      
      console.log('🏠 HomeScreen: Fetching popular courses with token...');
      console.log('🔑 HomeScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
      const result = await courseAPI.getPopularSubcourses(token);
      
      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('🎉 HomeScreen: Popular courses received successfully!');
        console.log('📚 HomeScreen: Number of popular courses:', apiCourses.length);
        console.log('📚 HomeScreen: First popular course:', apiCourses[0]);
        
        // Transform API data to match existing UI structure
        const transformedCourses = apiCourses.map((course, index) => {
          const courseImage = course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/HomeImage.png');
          
          console.log(`📚 HomeScreen: Popular Course ${index + 1} - ${course.subcourseName}`);
          console.log(`🖼️ HomeScreen: Thumbnail URL: ${course.thumbnailImageUrl || 'Using fallback image'}`);
          console.log(`🖼️ HomeScreen: Final image object:`, courseImage);
          console.log(`🖼️ HomeScreen: Image type: ${course.thumbnailImageUrl ? 'URI' : 'require'}`);
          
          return {
            id: course._id || index + 1,
            title: course.subcourseName || 'Course Title',
            lessons: `${course.totalLessons || 0} lessons`,
            rating: course.avgRating ? course.avgRating.toString() : '4.5',
            price: `₹${course.price || 0}.00`,
            image: courseImage,
            isFavorite: Math.random() > 0.5, // Random favorite status
          };
        });
        
        console.log('🔄 HomeScreen: Transformed popular courses:', transformedCourses);
        setCourseCards(transformedCourses);
        
      } else {
        console.log('❌ HomeScreen: Failed to fetch popular courses:', result.data?.message);
        console.log('❌ HomeScreen: API response:', result);
        setCourseError(result.data?.message || 'Failed to fetch popular courses');
        // Keep existing course data if API fails
      }
    } catch (error) {
      console.error('💥 HomeScreen: Error fetching popular courses:', error);
      setCourseError(error.message || 'Network error occurred');
      // Keep existing course data if error occurs
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Function to fetch newest courses from API
  const fetchNewestCourses = async () => {
    try {
      setIsLoadingCourses(true);
      setCourseError(null);
      
      console.log('🏠 HomeScreen: Fetching newest courses with token...');
      console.log('🔑 HomeScreen: Using token:', token ? token.substring(0, 30) + '...' : 'No token');
      
      const result = await courseAPI.getNewestSubcourses(token);
      
      if (result.success && result.data.success) {
        const apiCourses = result.data.data;
        console.log('🎉 HomeScreen: Newest courses received successfully!');
        console.log('📚 HomeScreen: Number of newest courses:', apiCourses.length);
        console.log('📚 HomeScreen: First newest course:', apiCourses[0]);
        
        // Transform API data to match existing UI structure
        const transformedCourses = apiCourses.map((course, index) => {
          const courseImage = course.thumbnailImageUrl ? { uri: course.thumbnailImageUrl } : require('../assests/images/HomeImage.png');
          
          console.log(`📚 HomeScreen: Newest Course ${index + 1} - ${course.subcourseName}`);
          console.log(`🖼️ HomeScreen: Thumbnail URL: ${course.thumbnailImageUrl || 'Using fallback image'}`);
          console.log(`🖼️ HomeScreen: Final image object:`, courseImage);
          console.log(`🖼️ HomeScreen: Image type: ${course.thumbnailImageUrl ? 'URI' : 'require'}`);
          
          return {
            id: course._id || index + 1,
            title: course.subcourseName || 'Course Title',
            lessons: `${course.totalLessons || 0} lessons`,
            rating: course.avgRating ? course.avgRating.toString() : '4.5',
            price: `₹${course.price || 0}.00`,
            image: courseImage,
            isFavorite: Math.random() > 0.5, // Random favorite status
          };
        });
        
        console.log('🔄 HomeScreen: Transformed newest courses:', transformedCourses);
        setCourseCards(transformedCourses);
        
      } else {
        console.log('❌ HomeScreen: Failed to fetch newest courses:', result.data?.message);
        console.log('❌ HomeScreen: API response:', result);
        setCourseError(result.data?.message || 'Failed to fetch newest courses');
        // Keep existing course data if API fails
      }
    } catch (error) {
      console.error('💥 HomeScreen: Error fetching newest courses:', error);
      setCourseError(error.message || 'Network error occurred');
      // Keep existing course data if error occurs
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Manual refresh function (can be called if needed)
  const refreshCourseData = () => {
    if (token) {
      console.log('🔄 HomeScreen: Manual refresh triggered');
      fetchCourseData();
    } else {
      console.log('⚠️ HomeScreen: No token available for refresh');
    }
  };

  // Track Redux state changes
  useEffect(() => {
    console.log('🔄 HomeScreen: Redux state changed!');
    console.log('🔄 HomeScreen: New fullName:', fullName);
 
  }, [fullName, mobileNumber, token, isAuthenticated]);

  // Track courseCards state changes
  useEffect(() => {
    
    console.log('🔄 HomeScreen: Number of courses in state:', courseCards.length);
    courseCards.forEach((course, index) => {
      console.log(`🔄 HomeScreen: Course ${index + 1} in state:`, {
        title: course.title,
        imageType: typeof course.image,
        imageSource: course.image
      });
    });
  }, [courseCards]);

  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);

  const filterOptions = ['All Course', 'Popular', 'Newest'];

  const renderProgressCircle = (progress) => {
    const radius = getResponsiveSize(20);
    const strokeWidth = 3;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          <View style={styles.progressBackground} />
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
                  borderTopColor: '#fff',
                  borderRightColor: progress > 25 ? '#fff' : 'transparent',
                  borderBottomColor: progress > 50 ? '#fff' : 'transparent',
                  borderLeftColor: progress > 75 ? '#fff' : 'transparent',
                  transform: [{ rotate: `${(progress / 100) * 360}deg` }],
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progress}%</Text>
        </View>
      </View>
    );
  };

  const renderCarouselItem = (item, index) => (
    <View key={item.id} style={styles.carouselItem}>
      {item.id === 3 ? (
        <View style={[styles.carouselCard, { padding: 0, overflow: 'hidden' }]}>
          <Image source={item.image} style={styles.carouselBannerImage} resizeMode="cover" />
        </View>
      ) : (
        <LinearGradient
          colors={['#2285FA', '#0029B9']}
          style={styles.carouselCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.carouselContentRow}>
            <Image source={item.image} style={styles.carouselImage} resizeMode="cover" />
            <View style={styles.carouselTextGroup}>
              <Text style={styles.carouselTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.carouselLessons}>{item.lessons}</Text>
            </View>
            {item.id !== 2 && (
              <View style={styles.progressContainerAbsolute}>{renderProgressCircle(item.progress)}</View>
            )}
          </View>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => {
              console.log('Button pressed:', item.buttonText);
              if (item.buttonText === 'Continue Learning') {
                navigation.navigate('CourseDetail');
              } else if (item.buttonText === 'Explore') {
                navigation.navigate('Enroll');
              }
            }}
          >
            <Text style={styles.continueButtonText}>{item.buttonText}</Text>
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );

  const renderCourseCard = (course) => (
    <TouchableOpacity 
      key={course.id} 
      style={styles.courseCard}
      onPress={() => {
        console.log('Course card pressed:', course.title, 'ID:', course.id);
        navigation.navigate('Enroll', { courseId: course.id });
      }}
    >
      <Image 
        source={course.image} 
        style={styles.courseCardImage} 
        resizeMode="cover"
        onLoad={() => console.log(`✅ Image loaded successfully for course: ${course.title}`)}
        onError={(error) => console.log(`❌ Image failed to load for course: ${course.title}`, error.nativeEvent)}
        onLoadStart={() => console.log(`🔄 Starting to load image for course: ${course.title}`)}
      />
      <View style={styles.courseCardContent}>
        <Text style={styles.courseCardTitle}>{course.title}</Text>
        <View style={styles.courseCardDetails}>
          <Text style={styles.courseCardLessons}>{course.lessons}</Text>
          
        </View>
        <View style={styles.ratingContainer}>
            <Icon name="star" size={getResponsiveSize(14)} color="#FFD700" />
            <Text style={styles.ratingText}>{course.rating}</Text>
          </View>
      </View>
      <View style={styles.courseCardRight}>
        <TouchableOpacity style={styles.heartButton}>
          <Icon 
            name={course.isFavorite ? "heart" : "heart-outline"} 
            size={getResponsiveSize(20)} 
            color="#FF8800"
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
        <View style={styles.headerTop}>
          <View style={styles.profileSection}>
            <Image source={require('../assests/images/Profile.png')} style={styles.profileImage} />
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>Hello!</Text>
              <Text style={styles.userName}>{fullName || 'User'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notification')}>
            <Image 
              source={require('../assests/images/Notification.png')} 
              style={styles.notificationIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
         
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <TouchableOpacity 
          style={styles.searchContainer}
          onPress={() => navigation.navigate('Search')}
        >
          <Image 
            source={require('../assests/images/Search.png')} 
            style={styles.searchIcon}
            resizeMode="contain"
          />
          <Text style={styles.searchPlaceholder}>Search now...</Text>
        </TouchableOpacity>


        {/* Featured Course Carousel */}
        <View style={styles.carouselSection}>
          {isLoadingFeatured ? (
            <View style={styles.carouselLoadingContainer}>
              <Text style={styles.carouselLoadingText}>Loading featured courses...</Text>
            </View>
          ) : featuredError ? (
            <View style={styles.carouselErrorContainer}>
              <Text style={styles.carouselErrorText}>Error loading featured courses</Text>
            </View>
          ) : featuredCourses.length === 0 ? (
            <View style={styles.carouselEmptyContainer}>
              <Text style={styles.carouselEmptyText}>No featured courses available</Text>
            </View>
          ) : (
            <>
              <ScrollView
                ref={carouselRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / (width - getResponsiveSize(40)));
                  setCurrentCarouselIndex(index);
                }}
                snapToInterval={width - getResponsiveSize(40)}
                decelerationRate="fast"
                style={styles.carousel}
                contentContainerStyle={styles.carouselContentContainer}
              >
                {featuredCourses.map((course, index) => renderCarouselItem(course, index))}
              </ScrollView>
              
              {/* Carousel Dots */}
              <View style={styles.dotsContainer}>
                {featuredCourses.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentCarouselIndex === index && styles.activeDot,
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => {
                setSelectedFilter(filter);
                if (filter === 'Popular' && token) {
                  fetchPopularCourses();
                } else if (filter === 'All Course' && token) {
                  fetchCourseData();
                } else if (filter === 'Newest' && token) {
                  fetchNewestCourses(); // For now, use same as All Course, can be changed later
                }
              }}
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
        <View style={styles.courseCardsContainer}>
          {isLoadingCourses ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading courses...</Text>
            </View>
          ) : courseError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {courseError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refreshCourseData}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : courseCards.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No courses available</Text>
            </View>
          ) : (
            courseCards.map((course) => renderCourseCard(course))
          )}
        </View>
      </ScrollView>

    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: getResponsiveSize(20),
    paddingTop: getResponsiveSize(50),
    paddingBottom: getResponsiveSize(20),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    marginRight: getResponsiveSize(10),
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: getResponsiveSize(16),
    color: '#FF8800',
    fontWeight: '600',
  },
  userName: {
    fontSize: getResponsiveSize(18),
    fontWeight: '600',
    color: '#333',
  },
  notificationButton: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    width: getResponsiveSize(20),
    height: getResponsiveSize(20),
  },
  refreshButton: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: getResponsiveSize(10),
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: getResponsiveSize(20),
    marginBottom: getResponsiveSize(20),
    paddingHorizontal: getResponsiveSize(16),
    paddingVertical: getResponsiveSize(8),
    borderRadius: getResponsiveSize(16),
    borderWidth: 1.5,
    borderColor: '#FFF3E0',
    shadowColor: '#FFB300',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    width: getResponsiveSize(20),
    height: getResponsiveSize(20),
    marginRight: getResponsiveSize(12),
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: getResponsiveSize(16),
    color: '#999',
    fontWeight: '400',
    paddingVertical: getResponsiveSize(4),
  },
  carouselSection: {
    marginBottom: getResponsiveSize(20),
  },
  carousel: {
    height: getResponsiveSize(200),
  },
  carouselContentContainer: {
    paddingHorizontal: getResponsiveSize(10),
  },
  carouselItem: {
    width: width - getResponsiveSize(40),
    marginRight: getResponsiveSize(10),
  },
  carouselCard: {
    flex: 1,
    borderRadius: getResponsiveSize(20),
    padding: getResponsiveSize(20),
    justifyContent: 'space-between',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.15,
    // shadowRadius: 8,
    // elevation: 8,
  },
  carouselContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  carouselLeft: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselImage: {
    width: getResponsiveSize(70),
    height: getResponsiveSize(70),
    borderRadius: getResponsiveSize(35), // Make it perfectly circular
    overflow: 'hidden', // Ensure circular shape is complete
  },
  carouselBannerImage: {
    width: '120%',
    height: '100%',
    borderRadius: getResponsiveSize(16),
    resizeMode: 'cover',
    marginLeft: -getResponsiveSize(20),
  },
  carouselRight: {
    flex: 1,
    justifyContent: 'space-between',
    paddingLeft: getResponsiveSize(15),
    position: 'relative',
  },
  carouselTitle: {
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
    color: '#fff',
    marginBottom: getResponsiveSize(4),
    flexWrap: 'wrap', // Allow text to wrap
    maxWidth: '100%', // Ensure text doesn't overflow
  },
  carouselLessons: {
    fontSize: getResponsiveSize(14),
    color: '#E0E0E0',
    marginTop: getResponsiveSize(2),
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  progressCircle: {
    width: getResponsiveSize(45),
    height: getResponsiveSize(45),
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    fontSize: getResponsiveSize(10),
    fontWeight: '600',
    color: '#fff',
  },
  continueButton: {
    backgroundColor: '#fff',
    paddingVertical: getResponsiveSize(10),
    paddingHorizontal: getResponsiveSize(20),
    borderRadius: getResponsiveSize(12),
    alignItems: 'center',
    marginTop: getResponsiveSize(15),
  },
  continueButtonText: {
    fontSize: getResponsiveSize(14),
    fontWeight: '600',
    color: '#2285FA',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: getResponsiveSize(15),
  },
  dot: {
    width: getResponsiveSize(8),
    height: getResponsiveSize(8),
    borderRadius: getResponsiveSize(4),
    backgroundColor: '#D0D0D0',
    marginHorizontal: getResponsiveSize(4),
  },
  activeDot: {
    backgroundColor: '#2285FA',
    width: getResponsiveSize(12),
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSize(20),
    marginBottom: getResponsiveSize(20),
  },
  filterButton: {
    flex: 1,
    paddingVertical: getResponsiveSize(10),
    paddingHorizontal: getResponsiveSize(15),
    borderRadius: getResponsiveSize(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: getResponsiveSize(5),
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#2285FA',
    borderColor: '#2285FA',
  },
  filterButtonText: {
    fontSize: getResponsiveSize(14),
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  courseCardsContainer: {
    paddingHorizontal: getResponsiveSize(20),
    paddingBottom: getResponsiveSize(100),
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: getResponsiveSize(16),
    padding: getResponsiveSize(16),
    marginBottom: getResponsiveSize(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseCardImage: {
    width: getResponsiveSize(70),
    height: getResponsiveSize(70),
    borderRadius: getResponsiveSize(35), // Make it perfectly circular
    marginRight: getResponsiveSize(16),
    overflow: 'hidden', // Ensure circular shape is complete
  },
  courseCardContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: getResponsiveSize(2),
  },
  courseCardTitle: {
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: getResponsiveSize(4),
  },
  courseCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: getResponsiveSize(4),
    gap: getResponsiveSize(8),
  },
  courseCardLessons: {
    fontSize: getResponsiveSize(14),
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: getResponsiveSize(14),
    color: '#666',
    marginLeft: getResponsiveSize(4),
  },
  courseCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  heartButton: {
    width: getResponsiveSize(30),
    height: getResponsiveSize(30),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getResponsiveSize(8),
  },
  heartIcon: {
    width: getResponsiveSize(20),
    height: getResponsiveSize(20),
  },
  coursePrice: {
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
    color: '#FF8800',
    textAlign: 'right',
  },
  carouselContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  carouselTextGroup: {
    marginLeft: getResponsiveSize(15),
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginRight: getResponsiveSize(60), // Add right margin to prevent overlap with progress
  },
  progressContainerAbsolute: {
    position: 'absolute',
    right: getResponsiveSize(10),
    top: getResponsiveSize(10),
    zIndex: 1, // Ensure progress is above other elements
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(50),
  },
  loadingText: {
    fontSize: getResponsiveSize(18),
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(50),
  },
  errorText: {
    fontSize: getResponsiveSize(18),
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: getResponsiveSize(20),
  },
  retryButton: {
    backgroundColor: '#2285FA',
    paddingVertical: getResponsiveSize(12),
    paddingHorizontal: getResponsiveSize(30),
    borderRadius: getResponsiveSize(12),
  },
  retryButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(16),
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSize(50),
  },
  emptyText: {
    fontSize: getResponsiveSize(18),
    color: '#666',
    textAlign: 'center',
  },
  carouselLoadingContainer: {
    height: getResponsiveSize(200),
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselLoadingText: {
    fontSize: getResponsiveSize(18),
    color: '#666',
    fontStyle: 'italic',
  },
  carouselErrorContainer: {
    height: getResponsiveSize(200),
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselErrorText: {
    fontSize: getResponsiveSize(18),
    color: '#FF0000',
    textAlign: 'center',
  },
  carouselEmptyContainer: {
    height: getResponsiveSize(200),
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselEmptyText: {
    fontSize: getResponsiveSize(18),
    color: '#666',
    textAlign: 'center',
  },
});