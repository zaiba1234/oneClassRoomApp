import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const MyCoursesScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('All Course');

  const filterOptions = ['All Course', 'In Progress', 'Completed'];

  const courseCards = [
    {
      id: 1,
      title: '3D Design Basic',
      lessons: '24 lessons',
      rating: '4.9',
      progress: 65,
      image: require('../assests/images/HomeImage.png'),
    },
    {
      id: 2,
      title: 'Characters Animation',
      lessons: '22 lessons',
      rating: '4.8',
      progress: 40,
      image: require('../assests/images/SavedImage.png'),
    },
    {
      id: 3,
      title: '3D Abstract Design',
      lessons: '18 lessons',
      rating: '4.5',
      progress: 80,
      image: require('../assests/images/HomeImage.png'),
    },
    {
      id: 4,
      title: 'Product Design',
      lessons: '16 lessons',
      rating: '4.7',
      progress: 100,
      image: require('../assests/images/SavedImage.png'),
    },
    {
      id: 5,
      title: 'Game Design',
      lessons: '20 lessons',
      rating: '4.6',
      progress: 100,
      image: require('../assests/images/HomeImage.png'),
    },
  ];

  const renderProgressCircle = (progress) => {
    const radius = 20;
    const strokeWidth = 3;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          <View style={[
            styles.progressBackground,
            { borderColor: progress === 100 ? '#2285FA' : '#E0E0E0' }
          ]} />
          {progress === 100 ? (
            <View style={[
              styles.progressFill,
              {
                width: radius * 2,
                height: radius * 2,
                borderRadius: radius,
                backgroundColor: '#2285FA',
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}>
              <Text style={[styles.progressText, { color: '#fff' }]}>
                {progress}%
              </Text>
            </View>
          ) : (
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
                    borderTopColor: '#2285FA',
                    borderRightColor: progress > 25 ? '#2285FA' : 'transparent',
                    borderBottomColor: progress > 50 ? '#2285FA' : 'transparent',
                    borderLeftColor: progress > 75 ? '#2285FA' : 'transparent',
                    transform: [{ rotate: `${(progress / 100) * 360}deg` }],
                  },
                ]}
              />
            </View>
          )}
          {progress !== 100 && (
            <Text style={[styles.progressText, { color: '#2285FA' }]}>
              {progress}%
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderCourseCard = (course) => (
    <TouchableOpacity 
      key={course.id} 
      style={styles.courseCard}
      onPress={() => {
        console.log('Course clicked:', course.title);
        if (course.progress === 100) {
          navigation.navigate('BadgeCourse');
        } else {
          navigation.navigate('CourseDetail');
        }
      }}
    >
      <Image source={course.image} style={styles.courseCardImage} resizeMode="cover" />
      <View style={styles.courseCardContent}>
        <Text style={styles.courseCardTitle}>{course.title}</Text>
        <View style={styles.courseCardDetails}>
          <Text style={styles.courseCardLessons}>{course.lessons}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{course.rating}</Text>
          </View>
        </View>
      </View>
      <View style={styles.progressContainer}>
        {renderProgressCircle(course.progress)}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Courses</Text>
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.courseCardsContainer}>
          {courseCards.map((course) => renderCourseCard(course))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyCoursesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    marginTop:20,
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2285FA',
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#2285FA',
    borderColor: '#2285FA',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2285FA',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  courseCardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  courseCardImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
  },
  courseCardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  courseCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  courseCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  courseCardLessons: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  progressContainer: {
    marginLeft: 10,
  },
  progressCircle: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E0E0E0',
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
    fontSize: 10,
    fontWeight: '600',
  },
});