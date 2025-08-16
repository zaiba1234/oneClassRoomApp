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
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
const getResponsiveSize = (size) => {
  const scale = Math.min(width, height) / 375; // Base width
  return Math.round(size * scale);
};

const SearchScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleSearch = (text) => {
    setSearchText(text);
    // Add your search logic here
    console.log('Searching for:', text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Icon name="chevron-back" size={getResponsiveSize(24)} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Image 
          source={require('../assests/images/Search.png')} 
          style={styles.searchIcon}
          resizeMode="contain"
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleSearch}
          autoFocus={true}
        />
      </View>

      {/* Search Results */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {searchText.length > 0 ? (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsText}>Search results for "{searchText}"</Text>
            {/* Add your search results here */}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Icon name="search" size={getResponsiveSize(60)} color="#ccc" />
            <Text style={styles.emptyText}>Search for courses</Text>
            <Text style={styles.emptySubtext}>Find the perfect course for you</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSize(20),
    paddingTop: getResponsiveSize(10),
    paddingBottom: getResponsiveSize(15),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: getResponsiveSize(8),
    marginTop:30,
  },
  headerTitle: {
    marginTop:30,
    fontSize: getResponsiveSize(18),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  placeholder: {
    width: getResponsiveSize(40),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: getResponsiveSize(20),
    marginVertical: getResponsiveSize(15),
    paddingHorizontal: getResponsiveSize(16),
    paddingVertical: getResponsiveSize(1),
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
  searchInput: {
    flex: 1,
    fontSize: getResponsiveSize(16),
    color: '#333',
    fontWeight: '400',
  },
  scrollView: {
    flex: 1,
  },
  resultsContainer: {
    paddingHorizontal: getResponsiveSize(20),
  },
  resultsText: {
    fontSize: getResponsiveSize(16),
    color: '#333',
    fontWeight: '600',
    marginBottom: getResponsiveSize(20),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSize(20),
    marginTop: getResponsiveSize(100),
  },
  emptyText: {
    fontSize: getResponsiveSize(20),
    color: '#333',
    fontWeight: '600',
    marginTop: getResponsiveSize(20),
    marginBottom: getResponsiveSize(8),
  },
  emptySubtext: {
    fontSize: getResponsiveSize(16),
    color: '#666',
    textAlign: 'center',
  },
});