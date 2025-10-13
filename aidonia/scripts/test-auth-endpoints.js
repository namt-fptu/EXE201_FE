// API Endpoint Tester
// Run this in browser console to find the correct authentication endpoint

const testAuthEndpoints = async () => {
  console.log('🔍 Testing authentication endpoints...\n');
  
  const baseUrl = 'http://localhost:5000';
  const testCredentials = {
    email: 'admin@example.com',
    password: '123456'
  };
  
  const endpoints = [
    // Common authentication endpoints
    '/api/auth/authentication',
    '/api/auth/login',
    '/api/auth/signin',
    '/api/authentication',
    '/api/login',
    '/api/signin',
    '/auth/authentication',
    '/auth/login',
    '/auth/signin',
    '/authentication',
    '/login',
    '/signin',
    '/users/authenticate',
    '/users/login',
    '/account/login',
    '/account/authenticate',
    
    // Alternative patterns
    '/api/v1/auth/login',
    '/api/v1/authentication',
    '/v1/auth/login',
    '/auth/authenticate',
    '/user/login',
    '/admin/login'
  ];

  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${baseUrl}${endpoint}`);
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(testCredentials)
      });

      const status = response.status;
      const statusText = response.statusText;
      
      let responseData = null;
      try {
        responseData = await response.text();
        if (responseData) {
          try {
            responseData = JSON.parse(responseData);
          } catch {
            // Keep as text if not JSON
          }
        }
      } catch {
        responseData = 'No response body';
      }

      const result = {
        endpoint,
        status,
        statusText,
        exists: status !== 404,
        working: status === 200 || status === 201,
        needsAuth: status === 401,
        badRequest: status === 400,
        serverError: status >= 500,
        response: responseData
      };
      
      results.push(result);
      
      // Log result with color coding
      if (result.working) {
        console.log(`✅ ${endpoint} - Status: ${status} (WORKING!)`);
      } else if (result.needsAuth) {
        console.log(`🔑 ${endpoint} - Status: ${status} (Needs different auth)`);
      } else if (result.badRequest) {
        console.log(`⚠️  ${endpoint} - Status: ${status} (Bad request format)`);
      } else if (result.exists && !result.serverError) {
        console.log(`🟡 ${endpoint} - Status: ${status} (Exists but ${statusText})`);
      } else if (result.serverError) {
        console.log(`🔴 ${endpoint} - Status: ${status} (Server error)`);
      } else {
        console.log(`❌ ${endpoint} - Status: ${status} (Not found)`);
      }
      
    } catch (error) {
      const result = {
        endpoint,
        status: 'NETWORK_ERROR',
        statusText: error instanceof Error ? error.message : 'Unknown error',
        exists: false,
        working: false,
        error: true
      };
      
      results.push(result);
      console.log(`🚫 ${endpoint} - Network Error: ${result.statusText}`);
    }
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  const working = results.filter(r => r.working);
  const existing = results.filter(r => r.exists && !r.working);
  const notFound = results.filter(r => !r.exists);
  
  console.log(`✅ Working endpoints: ${working.length}`);
  working.forEach(r => console.log(`   - ${r.endpoint} (${r.status})`));
  
  console.log(`🟡 Existing but not working: ${existing.length}`);
  existing.forEach(r => console.log(`   - ${r.endpoint} (${r.status}: ${r.statusText})`));
  
  console.log(`❌ Not found: ${notFound.length}`);
  
  return results;
};

// Test specific endpoint with different payloads
const testEndpointPayloads = async (endpoint) => {
  const baseUrl = 'http://localhost:5000';
  const payloads = [
    // Standard login formats
    { email: 'admin@example.com', password: '123456' },
    { username: 'admin', password: '123456' },
    { Email: 'admin@example.com', Password: '123456' },
    { Username: 'admin', Password: '123456' },
    
    // Alternative formats
    { user: 'admin@example.com', pass: '123456' },
    { login: 'admin@example.com', password: '123456' },
    { identifier: 'admin@example.com', password: '123456' },
    
    // With additional fields
    { email: 'admin@example.com', password: '123456', rememberMe: true },
    { email: 'admin@example.com', password: '123456', clientId: 'web' }
  ];
  
  console.log(`\n🧪 Testing different payloads for: ${endpoint}`);
  
  for (const payload of payloads) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      console.log(`📦 Payload: ${JSON.stringify(payload)} -> Status: ${response.status}`);
      
      if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        console.log('✅ SUCCESS! Response:', data);
        return { payload, response: data };
      }
    } catch (error) {
      console.log(`❌ Error with payload: ${JSON.stringify(payload)}`);
    }
  }
  
  return null;
};

// Export functions for browser console
if (typeof window !== 'undefined') {
  window.testAuthEndpoints = testAuthEndpoints;
  window.testEndpointPayloads = testEndpointPayloads;
  
  console.log('🛠️ API Testing tools loaded!');
  console.log('📋 Available functions:');
  console.log('  - testAuthEndpoints() - Test all possible auth endpoints');
  console.log('  - testEndpointPayloads("/api/auth/login") - Test different payload formats');
  
  console.log('\n🚀 Auto-running endpoint test in 2 seconds...');
  setTimeout(() => {
    testAuthEndpoints();
  }, 2000);
}