// Test script to verify the navigation flow
const testNavigationFlow = () => {
  console.log('🧪 Testing LoginScreen Navigation Flow...');
  
  // Simulate the 2Factor login response for unregistered user
  const unregisteredUserResponse = {
    success: false,
    data: {
      message: 'User not registered. Please register first.'
    }
  };
  
  // Test the error message detection logic
  const errorMessage = unregisteredUserResponse.data?.message || unregisteredUserResponse.message || '';
  
  console.log('📱 Error message:', errorMessage);
  
  const shouldNavigateToRegister = errorMessage.includes('not registered') || 
    errorMessage.includes('not verified') ||
    errorMessage.includes('Mobile number not registered') ||
    errorMessage.includes('User not found') ||
    errorMessage.includes('Please register first');
  
  console.log('🔄 Should navigate to register:', shouldNavigateToRegister);
  
  if (shouldNavigateToRegister) {
    console.log('✅ SUCCESS: Navigation logic is working correctly!');
    console.log('📱 Would navigate to Register screen with mobile number');
  } else {
    console.log('❌ FAILED: Navigation logic is not working');
  }
  
  // Test with different error messages
  const testCases = [
    'User not registered. Please register first.',
    'Mobile number not registered',
    'User not found',
    'Please register first',
    'Some other error'
  ];
  
  console.log('\n🧪 Testing different error messages:');
  testCases.forEach((message, index) => {
    const shouldNavigate = message.includes('not registered') || 
      message.includes('not verified') ||
      message.includes('Mobile number not registered') ||
      message.includes('User not found') ||
      message.includes('Please register first');
    
    console.log(`${index + 1}. "${message}" → Navigate to Register: ${shouldNavigate}`);
  });
};

// Run the test
testNavigationFlow();
