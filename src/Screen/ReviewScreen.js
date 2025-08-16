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
const RamAvatar = require('../assests/images/John.png');
const EmmaJohnsonAvatar = require('../assests/images/John.png');
const LucasBrownAvatar = require('../assests/images/John.png');
const SophiaCarterAvatar = require('../assests/images/John.png');

// Get screen dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Responsive scaling factors
const scale = width / 375; // Base width for iPhone 8
const verticalScale = height / 812; // Base height for iPhone 8

// Responsive font sizes
const getFontSize = (size) => size * scale;
const getVerticalSize = (size) => size * verticalScale;

const ReviewScreen = ({ navigation }) => {
  // Mock review data
  const reviews = [
    {
      id: 1,
      name: 'John Smith',
      avatar: JohnSmithAvatar,
      rating: 5,
    },
    {
      id: 2,
      name: 'Ace Smith',
      avatar: AceSmithAvatar,
      rating: 4,
    },
    {
      id: 3,
      name: 'Alice',
      avatar: AliceAvatar,
      rating: 4,
    },
    {
      id: 4,
      name: 'Rohan',
      avatar: RohanAvatar,
      rating: 5,
    },
    {
      id: 5,
      name: 'Ram',
      avatar: RamAvatar,
      rating: 4,
    },
    {
      id: 6,
      name: 'Emma Johnson',
      avatar: EmmaJohnsonAvatar,
      rating: 3,
    },
    {
      id: 7,
      name: 'Lucas Brown',
      avatar: LucasBrownAvatar,
      rating: 5,
    },
    {
      id: 8,
      name: 'Sophia Carter',
      avatar: SophiaCarterAvatar,
      rating: 2,
    },
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Text key={`full-${i}`} style={styles.starIcon}>
          ⭐
        </Text>
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <Text key="half" style={styles.starIcon}>
          ⭐
        </Text>
      );
    }

    // Empty stars
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Text key={`empty-${i}`} style={styles.emptyStarIcon}>
          ⭐
        </Text>
      );
    }

    return stars;
  };

  const handleReviewPress = (review) => {
    console.log('Review clicked:', review.name);
    // Navigate to review detail screen if needed
    // navigation.navigate('ReviewDetail', { review });
  };

  const renderReviewItem = (review) => (
    <TouchableOpacity
      key={review.id}
      style={styles.reviewItem}
      onPress={() => handleReviewPress(review)}
    >
      <Image source={review.avatar} style={styles.reviewAvatar} />
      <View style={styles.reviewContent}>
        <View style={styles.nameAndStarsRow}>
          <Text style={styles.reviewName}>{review.name}</Text>
          <View style={styles.starContainer}>
            {renderStars(review.rating)}
          </View>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Reviews List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollViewContent}
      >
        {reviews.map(renderReviewItem)}
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
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: getFontSize(15),
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
  reviewAvatar: {
    width: getFontSize(50),
    height: getFontSize(50),
    borderRadius: getFontSize(25),
    marginRight: getVerticalSize(15),
  },
  reviewContent: {
    flex: 1,
  },
  nameAndStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewName: {
    fontSize: getFontSize(16),
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: getFontSize(16),
    color: '#FFD700',
    marginLeft: getVerticalSize(2),
  },
  emptyStarIcon: {
    fontSize: getFontSize(16),
    color: '#D3D3D3',
    marginLeft: getVerticalSize(2),
  },
});

export default ReviewScreen;