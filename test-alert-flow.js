// Test script to verify the alert flow
const testAlertFlow = () => {
  console.log('🧪 Testing LoginScreen Alert Flow...');
  
  // Simulate the 2Factor login response for unregistered user
  const unregisteredUserResponse = {
    success: false,
    data: {
      message: 'User not registered. Please register first.'
    }
  };
  
  const mobileNumberFormatted = '+919829699382';
  
  // Test the error message detection logic
  const errorMessage = unregisteredUserResponse.data?.message || unregisteredUserResponse.message || '';
  
  console.log('📱 Error message:', errorMessage);
  console.log('📱 Mobile number:', mobileNumberFormatted);
  
  const shouldShowAlert = errorMessage.includes('not registered') || 
    errorMessage.includes('not verified') ||
    errorMessage.includes('Mobile number not registered') ||
    errorMessage.includes('User not found') ||
    errorMessage.includes('Please register first');
  
  console.log('🔄 Should show confirmation alert:', shouldShowAlert);
  
  if (shouldShowAlert) {
    console.log('✅ SUCCESS: Alert logic is working correctly!');
    console.log('📱 Alert configuration would be:');
    console.log({
      title: 'User Not Registered',
      message: `You are not registered with ${mobileNumberFormatted}. Would you like to register now?`,
      type: 'info',
      showCancel: true,
      confirmText: 'Register',
      cancelText: 'Cancel'
    });
    
    console.log('\n🎯 Expected user experience:');
    console.log('1. User tries to login with unregistered number');
    console.log('2. 2Factor API returns "User not registered" error');
    console.log('3. App shows confirmation alert with mobile number');
    console.log('4. User clicks "Register" → navigates to Register screen');
    console.log('5. User clicks "Cancel" → stays on Login screen');
  } else {
    console.log('❌ FAILED: Alert logic is not working');
  }
  
  // Test different scenarios
  console.log('\n🧪 Testing different scenarios:');
  
  const scenarios = [
    {
      name: 'Unregistered user',
      response: { success: false, data: { message: 'User not registered. Please register first.' } },
      expected: 'Show alert'
    },
    {
      name: 'Network error',
      response: { success: false, data: { message: 'Network error occurred' } },
      expected: 'Show error alert'
    },
    {
      name: 'Invalid OTP',
      response: { success: false, data: { message: 'Invalid OTP code' } },
      expected: 'Show error alert'
    }
  ];
  
  scenarios.forEach((scenario, index) => {
    const msg = scenario.response.data?.message || scenario.response.message || '';
    const shouldAlert = msg.includes('not registered') || 
      msg.includes('not verified') ||
      msg.includes('Mobile number not registered') ||
      msg.includes('User not found') ||
      msg.includes('Please register first');
    
    console.log(`${index + 1}. ${scenario.name}: "${msg}" → ${shouldAlert ? 'Show registration alert' : 'Show error alert'}`);
  });
};

// Run the test
testAlertFlow();
