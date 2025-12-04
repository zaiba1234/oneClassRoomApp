// Test script to check backend connection
const testBackendConnection = async () => {
  // const baseUrl = 'http://192.168.1.28:3000'; // Local IP (commented out - use production URL)
  const baseUrl = 'https://main.learningsaint.com'; // Production URL
  
  console.log('🧪 Testing backend connection...');
  console.log('🌐 Base URL:', baseUrl);
  
  try {
    // Test health endpoint
    console.log('\n1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthText = await healthResponse.text();
    console.log('📡 Health Status:', healthResponse.status);
    console.log('📡 Health Response:', healthText);
    
    // Test 2Factor status endpoint
    console.log('\n2️⃣ Testing 2Factor status endpoint...');
    const statusResponse = await fetch(`${baseUrl}/api/2factor/status`);
    const statusText = await statusResponse.text();
    console.log('📡 2Factor Status:', statusResponse.status);
    console.log('📡 2Factor Response:', statusText);
    
    // Test 2Factor login endpoint
    console.log('\n3️⃣ Testing 2Factor login endpoint...');
    const loginResponse = await fetch(`${baseUrl}/api/2factor/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mobileNumber: '+919829699382'
      }),
    });
    const loginText = await loginResponse.text();
    console.log('📡 Login Status:', loginResponse.status);
    console.log('📡 Login Response:', loginText);
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if server is accessible: https://main.learningsaint.com');
    console.log('2. Verify network connectivity');
    console.log('3. Check SSL certificate validity');
  }
};

// Run the test
testBackendConnection();
