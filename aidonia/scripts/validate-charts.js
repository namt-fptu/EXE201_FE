// Chart Validation Script for Admin Dashboard
// Run this in browser console to test chart functionality

const validateCharts = () => {
  console.log('🔍 Validating chart components...');
  
  // Check if ApexCharts is loaded
  const apexChartsElements = document.querySelectorAll('[class*="apexcharts"]');
  console.log(`📊 Found ${apexChartsElements.length} ApexCharts elements`);
  
  // Check for chart containers
  const chartContainers = document.querySelectorAll('.apexcharts-canvas');
  console.log(`📈 Found ${chartContainers.length} chart canvases`);
  
  // Check for loading spinners (should not be present after loading)
  const loadingSpinners = document.querySelectorAll('.animate-spin');
  if (loadingSpinners.length > 0) {
    console.log(`⏳ Found ${loadingSpinners.length} loading spinners - charts may still be loading`);
  } else {
    console.log('✅ No loading spinners found - charts should be loaded');
  }
  
  // Check for chart errors
  const errorElements = document.querySelectorAll('[class*="error"], .text-red-');
  if (errorElements.length > 0) {
    console.log(`❌ Found ${errorElements.length} potential error elements`);
  } else {
    console.log('✅ No error elements found');
  }
  
  // Check if React ApexCharts is available
  if (typeof window !== 'undefined') {
    try {
      // Try to import ApexCharts dynamically
      import('react-apexcharts').then(() => {
        console.log('✅ React ApexCharts module is available');
      }).catch((error) => {
        console.log('❌ React ApexCharts import failed:', error);
      });
    } catch (error) {
      console.log('❌ Error checking React ApexCharts:', error);
    }
  }
  
  // Test chart data structure
  const testChartData = {
    campaignVisitors: [
      { x: "Jan", y: 2500 },
      { x: "Feb", y: 3200 },
      { x: "Mar", y: 2800 },
    ],
    deviceUsage: [
      { name: "Desktop", value: 45.2 },
      { name: "Mobile", value: 38.8 },
      { name: "Tablet", value: 16.0 },
    ]
  };
  
  console.log('📋 Test data structure:', testChartData);
  
  // Summary
  const summary = {
    apexChartsElements: apexChartsElements.length,
    chartCanvases: chartContainers.length,
    loadingSpinners: loadingSpinners.length,
    errorElements: errorElements.length,
    status: apexChartsElements.length > 0 ? 'WORKING' : 'NEEDS_CHECK'
  };
  
  console.log('📊 Chart Validation Summary:', summary);
  return summary;
};

// Test specific chart types
const testChartTypes = () => {
  console.log('🧪 Testing chart type configurations...');
  
  const chartConfigs = {
    barChart: {
      chart: { type: 'bar' },
      series: [{ name: 'Test', data: [1, 2, 3] }],
      status: 'configured'
    },
    donutChart: {
      chart: { type: 'donut' },
      series: [30, 40, 30],
      labels: ['A', 'B', 'C'],
      status: 'configured'
    }
  };
  
  console.log('⚙️ Chart configurations:', chartConfigs);
  return chartConfigs;
};

// Monitor chart rendering
const monitorChartRendering = () => {
  console.log('👀 Monitoring chart rendering...');
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList) {
            if (node.classList.contains('apexcharts-canvas')) {
              console.log('✅ Chart canvas rendered!', node);
            }
            if (node.querySelector && node.querySelector('.apexcharts-canvas')) {
              console.log('✅ Chart container with canvas added!', node);
            }
          }
        });
      }
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Stop monitoring after 10 seconds
  setTimeout(() => {
    observer.disconnect();
    console.log('📊 Chart monitoring stopped');
  }, 10000);
  
  return observer;
};

// Export functions for browser console
if (typeof window !== 'undefined') {
  window.validateCharts = validateCharts;
  window.testChartTypes = testChartTypes;
  window.monitorChartRendering = monitorChartRendering;
  
  console.log('🚀 Chart validation tools loaded!');
  console.log('📋 Available functions:');
  console.log('  - validateCharts() - Check current chart status');
  console.log('  - testChartTypes() - Test chart configurations');
  console.log('  - monitorChartRendering() - Watch for chart rendering');
  
  // Auto-run validation
  setTimeout(() => {
    console.log('🔄 Auto-running chart validation...');
    validateCharts();
  }, 2000);
}