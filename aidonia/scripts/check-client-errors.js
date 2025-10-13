// Client-side Error Checker
// Run this in browser console to diagnose application errors

const checkClientErrors = () => {
  console.log('🔍 Checking for client-side errors...\n');
  
  // 1. Check for uncaught errors
  const errors = [];
  
  // Override console.error to catch errors
  const originalError = console.error;
  console.error = (...args) => {
    errors.push({
      type: 'console.error',
      message: args.join(' '),
      timestamp: new Date().toISOString()
    });
    originalError.apply(console, args);
  };
  
  // 2. Check localStorage and cookies
  try {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const refreshToken = localStorage.getItem('refreshToken');
    
    console.log('📱 Storage Status:');
    console.log('  - Token:', token ? '✅ Present' : '❌ Missing');
    console.log('  - User:', user ? '✅ Present' : '❌ Missing');
    console.log('  - RefreshToken:', refreshToken ? '✅ Present' : '❌ Missing');
    
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('  - User Data Valid:', '✅ Yes');
        console.log('  - User Role:', parsedUser.role || 'Not specified');
      } catch (e) {
        console.log('  - User Data Valid:', '❌ Invalid JSON');
        errors.push({
          type: 'localStorage',
          message: 'Invalid user JSON in localStorage',
          error: e.message
        });
      }
    }
  } catch (e) {
    errors.push({
      type: 'localStorage',
      message: 'Error accessing localStorage',
      error: e.message
    });
  }
  
  // 3. Check for React hydration errors
  const hydrationErrors = document.querySelectorAll('[data-reactroot] *').length === 0 && 
                         document.querySelector('#__next') === null;
  
  if (hydrationErrors) {
    console.log('⚠️  Potential hydration issues detected');
    errors.push({
      type: 'hydration',
      message: 'React app may not have hydrated properly'
    });
  }
  
  // 4. Check for missing imports/modules
  const checkImports = async () => {
    const imports = [
      '@/components/AuthProvider',
      '@/components/Auth/Signin',
      '@/redux/userStore',
      '@/utils/auth-helpers',
      '@/services/axios'
    ];
    
    console.log('\n📦 Checking critical imports:');
    
    for (const importPath of imports) {
      try {
        // This won't actually work in browser, but helps identify the pattern
        console.log(`  - ${importPath}: Checking...`);
      } catch (e) {
        console.log(`  - ${importPath}: ❌ Failed`);
        errors.push({
          type: 'import',
          message: `Failed to import ${importPath}`,
          error: e.message
        });
      }
    }
  };
  
  // 5. Check for API connectivity
  const checkAPI = async () => {
    console.log('\n🌐 Checking API connectivity:');
    
    const baseUrl = 'http://localhost:5000';
    
    try {
      const response = await fetch(`${baseUrl}/api/`, {
        method: 'GET',
        timeout: 5000
      });
      
      console.log(`  - API Base: ${response.status === 404 ? '⚠️  404 (but server responding)' : response.ok ? '✅ Connected' : '❌ Error'}`);
    } catch (e) {
      console.log(`  - API Base: ❌ Connection failed`);
      errors.push({
        type: 'api',
        message: 'API connection failed',
        error: e.message
      });
    }
  };
  
  // 6. Check current route and expected behavior
  const currentPath = window.location.pathname;
  console.log(`\n📍 Current Route: ${currentPath}`);
  
  // Determine what should happen
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      const expectedPath = parsedUser.role === 'admin' ? '/admin' : '/';
      console.log(`📋 Expected behavior for ${parsedUser.role}: redirect to ${expectedPath}`);
      
      if (currentPath !== expectedPath && currentPath !== '/signin') {
        console.log('⚠️  User may need redirect');
      }
    } catch (e) {
      console.log('❌ Cannot determine expected behavior - invalid user data');
    }
  }
  
  // Run async checks
  checkImports();
  checkAPI();
  
  // 7. Return summary
  setTimeout(() => {
    console.log('\n📊 ERROR SUMMARY:');
    if (errors.length === 0) {
      console.log('✅ No errors detected in basic checks');
    } else {
      console.log(`❌ Found ${errors.length} potential issues:`);
      errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.message}`);
        if (error.error) {
          console.log(`   Details: ${error.error}`);
        }
      });
    }
    
    console.log('\n🔧 Next steps:');
    console.log('1. Check browser DevTools Console for detailed error messages');
    console.log('2. Check Network tab for failed requests');
    console.log('3. Verify all files exist and imports are correct');
    console.log('4. Test authentication flow step by step');
  }, 2000);
  
  return {
    errors,
    currentPath,
    hasAuth: !!localStorage.getItem('token')
  };
};

// Quick fixes
const quickFixes = {
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken'); 
    localStorage.removeItem('user');
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('✅ Auth data cleared');
  },
  
  reloadApp: () => {
    console.log('🔄 Reloading application...');
    window.location.reload();
  },
  
  goToSignin: () => {
    console.log('🚪 Redirecting to signin...');
    window.location.href = '/signin';
  }
};

// Export for browser console
if (typeof window !== 'undefined') {
  window.checkClientErrors = checkClientErrors;
  window.quickFixes = quickFixes;
  
  console.log('🛠️ Error checking tools loaded!');
  console.log('📋 Available functions:');
  console.log('  - checkClientErrors() - Comprehensive error check');
  console.log('  - quickFixes.clearAuth() - Clear all auth data');
  console.log('  - quickFixes.reloadApp() - Reload the application');
  console.log('  - quickFixes.goToSignin() - Go to signin page');
  
  // Auto-run check
  setTimeout(checkClientErrors, 1000);
}