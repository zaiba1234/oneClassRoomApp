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
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../Redux/hooks';
import { setUserData, saveUserToStorage } from '../Redux/userSlice';

const { width, height } = Dimensions.get('window');

const CategoryScreen = () => {
  const navigation = useNavigation();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.user);

  // Function to mark user as no longer new and navigate to Home
  const handleNavigateToHome = () => {
    console.log('🏠 CategoryScreen: User interacting with categories, marking as no longer new');
    
    // Update user data to mark as no longer new
    const updatedUserData = {
      ...userData,
      isNewUser: false
    };
    
    // Update Redux state
    dispatch(setUserData(updatedUserData));
    
    // Save to storage
    dispatch(saveUserToStorage(updatedUserData));
    
    console.log('✅ CategoryScreen: User marked as existing user, navigating to Home');
    navigation.navigate('Home');
  };

  // Function to get different colors for each card
  const getComingSoonColor = (index) => {
    const colors = ['#2196F3', '#666666', '#2196F3', '#FF8A00'];
    return colors[index];
  };

  const categoryCards = [
    {
      id: 1,
      image: require('../assests/images/frm1.png'),
      title: 'Design Courses',
      comingSoonText: 'COMING SOON',
    },
    {
      id: 2,
      image: require('../assests/images/frm2.png'),
      title: 'Graduation',
      comingSoonText: 'COMING SOON',
    },
    {
      id: 3,
      image: require('../assests/images/frm3.png'),
      title: 'Study Materials',
      comingSoonText: 'COMING SOON',
    },
    {
      id: 4,
      image: require('../assests/images/frm4.png'),
      title: 'Academic Success',
      comingSoonText: 'COMING SOON',
    },
  ];

  // Quarter-circle arrow button for cards and banner
  const renderArrowButtonBanner = (size = 40) => (
    <View style={[styles.arrowCornerBanner, { width: size, height: size, borderBottomRightRadius: size }]}> 
      <Icon 
        name="chevron-forward-sharp" 
        size={16} 
        color="#fff"
        style={styles.arrowIcon}
      />
    </View>
  );
  const renderArrowButton = (size = 40) => (
    <View style={[styles.arrowCorner, { width: size, height: size, borderBottomRightRadius: size }]}> 
      <Icon 
        name="chevron-forward-sharp" 
        size={16} 
        color="#fff"
        style={styles.arrowIcon}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.container}>
      

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Featured Banner */}
          <TouchableOpacity 
            style={styles.bannerContainer}
            onPress={handleNavigateToHome}
          >
            <View style={styles.bannerContent}>
              <Image 
                source={require('../assests/images/FrameImg.png')} 
                style={styles.bannerImage}
                resizeMode="cover"
              />
              {renderArrowButtonBanner(44)}
            </View>
          </TouchableOpacity>

          {/* Category Grid */}
          <View style={styles.gridContainer}>
            {categoryCards.map((card, index) => (
                             <TouchableOpacity 
                 key={card.id} 
                 style={[
                   styles.categoryCard,
                   index % 2 === 0 ? styles.leftCard : styles.rightCard
                 ]}
               >
                <Image 
                  source={card.image} 
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
                <View style={styles.comingSoonContainer}>
                  <Text style={[styles.comingSoonText, { color: getComingSoonColor(index) }]}>
                    {card.comingSoonText.split(' ')[0]}
                  </Text>
                  <Text style={[styles.comingSoonText, { color: getComingSoonColor(index) }]}>
                    {card.comingSoonText.split(' ')[1]}
                  </Text>
                </View>
                {renderArrowButton(36)}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CategoryScreen;

const CARD_SIZE = (width - 60) / 2; // Reduced card size for 2x2 layout

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor: '#fff',
    marginTop: 20,
  },
  container: {
    flex: 1,
    // backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  bannerContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
    marginTop: 30, // shift banner down
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  bannerContent: {
    height: 180,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  arrowCornerBanner: {
    borderRadius:25,
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
  },
  arrowCorner: {
    borderRadius:25,
    position: 'absolute',
    bottom: -10,
    right: -10,
    backgroundColor: 'gray',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 20,
  },
  arrowIcon: {
    marginBottom: 8,
    marginRight: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#E3F2FD',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftCard: {
    marginRight: 5,
  },
  rightCard: {
    marginLeft: 5,
  },
  comingSoonContainer: {
    position: 'absolute',
    top: 5,
    right: 6,
    zIndex: 2,

  },
  comingSoonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  categoryImage: {
    width: 120,
    height: 120,
    borderRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});