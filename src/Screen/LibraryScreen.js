import React from 'react';
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

const LibraryScreen = ({ navigation }) => {
  const libraryCourses = [
    {
      id: 1,
      title: 'Data Privacy',
      modules: '4 Modules',
      image: require('../assests/images/Frame1.png'),
    },
    {
      id: 2,
      title: 'Cloud Computing',
      modules: '6 Modules',
      image: require('../assests/images/Frame2.png'),
    },
    {
      id: 3,
      title: 'Artificial Intelligence',
      modules: '3 Modules',
      image: require('../assests/images/Frame3.png'),
    },
    {
      id: 4,
      title: 'Blockchain Technology',
      modules: '5 Modules',
      image: require('../assests/images/Frame4.png'),
    },
  ];

  const renderLibraryCard = (course) => (
    <TouchableOpacity 
      key={course.id} 
      style={styles.libraryCard}
      onPress={() => navigation.navigate('SubCourse')}
    >
      <Image source={course.image} style={styles.libraryCardImage} resizeMode="cover" />
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
        <Text style={styles.headerTitle}>Library</Text>
      </View>

      {/* Library Cards */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.libraryCardsContainer}>
          {libraryCourses.map((course) => renderLibraryCard(course))}
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
    alignItems: 'center',
  },
  headerTitle: {
    marginTop:30,
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
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
});