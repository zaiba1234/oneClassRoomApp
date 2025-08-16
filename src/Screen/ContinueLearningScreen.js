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
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

const ContinueLearningScreen = ({ navigation }) => {
  const continueCourses = [
    {
      id: 1,
      title: '3D Design Basic',
      progress: 65,
      thumbnail: require('../assests/images/Frame1.png'),
      timeLeft: '2h 30m left',
      lesson: 'Lesson 8 of 24',
    },
    {
      id: 2,
      title: 'Characters Animation',
      progress: 45,
      thumbnail: require('../assests/images/Frame2.png'),
      timeLeft: '3h 15m left',
      lesson: 'Lesson 5 of 22',
    },
    {
      id: 3,
      title: '3D Abstract Design',
      progress: 80,
      thumbnail: require('../assests/images/Frame3.png'),
      timeLeft: '1h 45m left',
      lesson: 'Lesson 15 of 18',
    },
  ];

  const renderContinueCourse = (course) => (
    <TouchableOpacity key={course.id} style={styles.courseCard}>
      <View style={styles.courseImageContainer}>
        <Image source={course.thumbnail} style={styles.courseImage} resizeMode="cover" />
        <View style={styles.playButtonOverlay}>
          <LinearGradient
            colors={['#FF8800', '#FFB800']}
            style={styles.playButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.playIcon}>▶</Text>
          </LinearGradient>
        </View>
      </View>
      
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseLesson}>{course.lesson}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${course.progress}%` }]} />
          </View>
          <Text style={styles.progressText}>{course.progress}%</Text>
        </View>
        
        <View style={styles.timeContainer}>
          <Image source={require('../assests/images/Clock.png')} style={styles.clockIcon} />
          <Text style={styles.timeText}>{course.timeLeft}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Continue Learning</Text>
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {continueCourses.map((course) => renderContinueCourse(course))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab}>
          <LinearGradient
            colors={['#FF8800', '#FFB800']}
            style={styles.fabGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.fabIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ContinueLearningScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    position: 'relative',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  viewAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8800',
  },
  scrollView: {
    flex: 1,
    position: 'relative',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  courseImageContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
  },
  courseImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  courseContent: {
    padding: 20,
    position: 'relative',
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  courseLesson: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 3,
    marginRight: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF8800',
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8800',
    minWidth: 40,
    textAlign: 'right',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
    tintColor: '#666',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabIcon: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});