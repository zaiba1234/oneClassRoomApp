import { useNavigation } from '@react-navigation/native';
import React, { useState, useRef } from 'react';
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

  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef(null);

  const featuredCourses = [
    {
      id: 1,
      title: '3D Design Basic',
      lessons: '24 lessons',
      progress: 65,
      image: require('../assests/images/Circular.png'),
      buttonText: 'Continue Learning',
    },
    {
      id: 2,
      title: '3D Design Basic',
      lessons: '24 lessons',
      progress: 40,
      image: require('../assests/images/Circular.png'),
      buttonText: 'Explore',
    },
    {
      id: 3,
      title: '3D Design Basic',
      lessons: '24 lessons',
      progress: 80,
      image: require('../assests/images/Banner1.png'),
      buttonText: 'Explore',
    },
  ];

  const courseCards = [
    {
      id: 1,
      title: '3D Design Basic',
      lessons: '24 lessons',
      rating: '4.9',
      price: '₹1.00',
      image: require('../assests/images/HomeImage.png'),
      isFavorite: true,
    },
    {
      id: 2,
      title: 'Characters Animation',
      lessons: '22 lessons',
      rating: '4.8',
      price: '₹1.00',
      image: require('../assests/images/SavedImage.png'),
      isFavorite: false,
    },
    {
      id: 3,
      title: '3D Abstract Design',
      lessons: '18 lessons',
      rating: '4.7',
      price: '₹1.00',
      image: require('../assests/images/HomeImage.png'),
      isFavorite: false,
    },
    {
      id: 4,
      title: '3D Abstract Design',
      lessons: '18 lessons',
      rating: '4.7',
      price: '₹100.00',
      image: require('../assests/images/SavedImage.png'),
      isFavorite: true,
    },
  ];

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
            <Image source={item.image} style={styles.carouselImage} resizeMode="contain" />
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
        console.log('Course card pressed');
        navigation.navigate('Enroll');
      }}
    >
      <Image source={course.image} style={styles.courseCardImage} resizeMode="cover" />
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
              <Text style={styles.userName}>John Smith</Text>
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
        <View style={styles.courseCardsContainer}>
          {courseCards.map((course) => renderCourseCard(course))}
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
    borderRadius: getResponsiveSize(12),
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
    borderRadius: getResponsiveSize(12),
    marginRight: getResponsiveSize(16),
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
  },
  progressContainerAbsolute: {
    position: 'absolute',
    right: getResponsiveSize(10),
    top: getResponsiveSize(10),
  },
});