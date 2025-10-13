// Debug script for authentication issues
// Run this in browser console after login to diagnose the problem

const debugAuth = () => {
  console.log('🔍 DEBUGGING AUTHENTICATION FLOW...\n');
  
  // 1. Check localStorage
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const user = localStorage.getItem('user');
  
  console.log('📱 LocalStorage Data:');
  console.log('  - Token:', token ? '✅ Present' : '❌ Missing');
  console.log('  - RefreshToken:', refreshToken ? '✅ Present' : '❌ Missing');
  console.log('  - User:', user ? '✅ Present' : '❌ Missing');
  
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      console.log('  - User Role:', parsedUser.role);
      console.log('  - User Data:', parsedUser);
    } catch (e) {
      console.log('  - User Data: ❌ Invalid JSON');
    }
  }
  
  // 2. Check cookies
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});
  
  console.log('\n🍪 Cookie Data:');
  console.log('  - Token Cookie:', cookies.token ? '✅ Present' : '❌ Missing');
  console.log('  - All Cookies:', cookies);
  
  // 3. Check token validity
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const isExpired = payload.exp < currentTime;
      
      console.log('\n🔑 Token Analysis:');
      console.log('  - Valid Format:', '✅ Yes');
      console.log('  - Expires At:', new Date(payload.exp * 1000).toLocaleString());
      console.log('  - Is Expired:', isExpired ? '❌ Yes' : '✅ No');
      console.log('  - Role in Token:', payload.role || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
      console.log('  - Full Payload:', payload);
    } catch (e) {
      console.log('\n🔑 Token Analysis:');
      console.log('  - Valid Format:', '❌ Invalid JWT');
    }
  }
  
  // 4. Test API calls
  const testApiCall = async () => {
    try {
      const response = await fetch('/api/test', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('\n🌐 API Test:');
      console.log('  - Status:', response.status);
      console.log('  - Auth Header Works:', response.status !== 401 ? '✅ Yes' : '❌ No');
    } catch (e) {
      console.log('\n🌐 API Test:');
      console.log('  - Error:', e.message);
    }
  };
  
  if (token) {
    testApiCall();
  }
  
  // 5. Check current page and expected behavior
  const currentPath = window.location.pathname;
  console.log('\n📍 Navigation Analysis:');
  console.log('  - Current Path:', currentPath);
  
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      const expectedPath = parsedUser.role === 'admin' ? '/admin' : '/';
      console.log('  - Expected Path:', expectedPath);
      console.log('  - Redirect Needed:', currentPath !== expectedPath ? '✅ Yes' : '❌ No');
      
      if (currentPath !== expectedPath) {
        console.log('  - 🔧 Manual Redirect Available: Use forceRedirect()');
      }
    } catch (e) {
      console.log('  - Cannot determine expected path due to invalid user data');
    }
  }
  
  // 6. Check middleware logs in Network tab
  console.log('\n🛡️ Middleware Debugging:');
  console.log('  - Check Network tab for middleware logs');
  console.log('  - Look for requests to protected routes');
  console.log('  - Verify cookies are being sent with requests');
  
  return {
    hasToken: !!token,
    hasRefreshToken: !!refreshToken,
    hasUser: !!user,
    hasCookie: !!cookies.token,
    currentPath,
    userRole: user ? JSON.parse(user).role : null
  };
};

// Force redirect function
const forceRedirect = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      const targetPath = parsedUser.role === 'admin' ? '/admin' : '/';
      console.log(`🚀 Force redirecting to: ${targetPath}`);
      window.location.href = targetPath;
    } catch (e) {
      console.log('❌ Cannot force redirect - invalid user data');
    }
  } else {
    console.log('❌ Cannot force redirect - no user data');
  }
};

// Fix authentication by ensuring cookie is set
const fixAuthCookie = () => {
  const token = localStorage.getItem('token');
  if (token) {
    // Set cookie with proper expiration
    const maxAge = 60 * 30; // 30 minutes
    document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
    console.log('✅ Auth cookie has been set/refreshed');
    
    // Try redirect after setting cookie
    setTimeout(() => {
      forceRedirect();
    }, 500);
  } else {
    console.log('❌ No token to set cookie with');
  }
};

// Export functions to window for easy access
if (typeof window !== 'undefined') {
  window.debugAuth = debugAuth;
  window.forceRedirect = forceRedirect;
  window.fixAuthCookie = fixAuthCookie;
  
  console.log('🛠️ Auth debugging tools loaded!');
  console.log('📋 Available functions:');
  console.log('  - debugAuth() - Full authentication analysis');
  console.log('  - forceRedirect() - Manual redirect based on user role');
  console.log('  - fixAuthCookie() - Fix authentication cookie and redirect');
  
  // Auto-run debug after 1 second
  setTimeout(() => {
    debugAuth();
  }, 1000);
}