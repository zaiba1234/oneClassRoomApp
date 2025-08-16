import React from 'react';
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

const StudentScreen = ({ navigation }) => {
  // Mock student data
  const students = [
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
    console.log('Student clicked:', student.name);
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
        {students.map(renderStudentItem)}
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
});

export default StudentScreen;