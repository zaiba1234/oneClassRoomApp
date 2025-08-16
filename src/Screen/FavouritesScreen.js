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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const FavouritesScreen = ({ navigation }) => {
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

  const renderCourseCard = (course) => (
    <TouchableOpacity 
      key={course.id} 
      style={styles.courseCard}
      onPress={() => navigation.navigate('Enroll')}
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
          {favouriteCourses.map((course) => renderCourseCard(course))}
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
});