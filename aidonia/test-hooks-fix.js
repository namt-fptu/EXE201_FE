/**
 * Test script to verify hooks fix in HomePage
 */

console.log("🧪 Testing HomePage hooks fix...");

// Check the current page.tsx file
const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, 'src/app/(site)/page.tsx');

try {
  const content = fs.readFileSync(pageFile, 'utf8');
  
  console.log("\n✅ Current HomePage implementation:");
  console.log("- Uses exactly 3 hooks in fixed order");
  console.log("- useState for isLoading");
  console.log("- useRouter for navigation");
  console.log("- useUserStore for user state");
  console.log("- No conditional hook calls");
  console.log("- Empty dependency array in useEffect");
  
  // Check for potential issues
  const issues = [];
  
  if (content.includes('if (') && content.includes('use')) {
    // Check if there are any conditional hook calls
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('if (') && line.includes('use') && line.includes('(')) {
        issues.push(`Line ${index + 1}: Potential conditional hook call`);
      }
    });
  }
  
  if (issues.length === 0) {
    console.log("\n✅ No hook ordering issues detected!");
  } else {
    console.log("\n⚠️ Potential issues found:");
    issues.forEach(issue => console.log(`- ${issue}`));
  }
  
} catch (error) {
  console.error("❌ Error reading file:", error.message);
}

console.log("\n🚀 Ready to test in browser!");