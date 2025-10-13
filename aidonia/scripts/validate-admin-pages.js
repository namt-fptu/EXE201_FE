// Admin Pages Validation Script
// Run this in browser console after loading each admin page

const validateAdminPage = () => {
  const currentPath = window.location.pathname;
  console.log(`🔍 Validating admin page: ${currentPath}`);
  
  // Check if we're on an admin page
  if (!currentPath.startsWith('/admin')) {
    console.log('❌ Not an admin page');
    return false;
  }
  
  // Check for React hooks errors in console
  const hasHooksError = window.console.error.toString().includes('Hooks') || 
                       document.querySelector('[data-react-error]');
  
  if (hasHooksError) {
    console.log('❌ React Hooks error detected');
    return false;
  }
  
  // Check if page is actually rendered (not stuck in loading)
  const hasContent = document.querySelector('main') || 
                    document.querySelector('.p-6') ||
                    document.querySelector('[class*="admin"]');
  
  if (!hasContent) {
    console.log('❌ Page content not found - might be stuck loading');
    return false;
  }
  
  // Check for auth guard loading spinner
  const hasLoadingSpinner = document.querySelector('.animate-spin');
  if (hasLoadingSpinner) {
    console.log('⏳ Auth guard still checking or loading...');
    return 'loading';
  }
  
  // Check if user is properly authenticated
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  
  if (!user || !token) {
    console.log('❌ User not authenticated');
    return false;
  }
  
  if (user.role !== 'admin') {
    console.log('❌ User does not have admin role');
    return false;
  }
  
  console.log('✅ Admin page validation passed');
  console.log('📊 Page info:', {
    path: currentPath,
    user: user.userName,
    role: user.role,
    hasContent: !!hasContent,
    isLoading: !!hasLoadingSpinner
  });
  
  return true;
};

// Auto-run validation after 2 seconds
setTimeout(() => {
  console.log('🚀 Auto-running admin page validation...');
  validateAdminPage();
}, 2000);

// Export for manual testing
if (typeof window !== 'undefined') {
  window.validateAdminPage = validateAdminPage;
  console.log('🛠️ Admin validation loaded! Use: validateAdminPage()');
}

// Test all admin routes
const testAllAdminPages = async () => {
  const adminRoutes = [
    '/admin',
    '/admin/analytics', 
    '/admin/profile',
    '/admin/reports',
    '/admin/packages',
    '/admin/pages/settings'
  ];
  
  console.log('🧪 Testing all admin pages...');
  
  for (const route of adminRoutes) {
    console.log(`\n📄 Testing: ${route}`);
    
    // Navigate to route
    window.history.pushState({}, '', route);
    
    // Wait for potential re-render
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate
    const result = validateAdminPage();
    
    if (result === true) {
      console.log(`✅ ${route} - PASSED`);
    } else if (result === 'loading') {
      console.log(`⏳ ${route} - LOADING`);
    } else {
      console.log(`❌ ${route} - FAILED`);
    }
  }
  
  console.log('\n🏁 Admin pages testing completed!');
};

if (typeof window !== 'undefined') {
  window.testAllAdminPages = testAllAdminPages;
}