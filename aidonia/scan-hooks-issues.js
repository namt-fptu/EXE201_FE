/**
 * 🔍 Find components with potential hooks issues
 */

const fs = require('fs');
const path = require('path');

function scanDirectory(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath, results);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  
  return results;
}

function checkFileForHooksIssues(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    
    // Check for conditional hook calls
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Pattern 1: if statement with hooks
      if (line.includes('if (') && line.includes('use') && line.includes('(')) {
        issues.push(`Line ${i + 1}: Potential conditional hook - ${line}`);
      }
      
      // Pattern 2: hooks inside loops
      if ((line.includes('for (') || line.includes('while (')) && 
          lines.slice(i, i + 10).some(l => l.includes('use') && l.includes('('))) {
        issues.push(`Line ${i + 1}: Potential hook in loop`);
      }
      
      // Pattern 3: hooks in nested functions
      if (line.includes('function ') && 
          lines.slice(i, i + 20).some(l => l.includes('use') && l.includes('('))) {
        issues.push(`Line ${i + 1}: Potential hook in nested function`);
      }
    }
    
    return issues;
  } catch (error) {
    return [`Error reading file: ${error.message}`];
  }
}

console.log("🔍 Scanning for hooks issues...\n");

// Scan components directory
const componentsDir = path.join(__dirname, 'src', 'components');
const appDir = path.join(__dirname, 'src', 'app');

const allFiles = [
  ...scanDirectory(componentsDir),
  ...scanDirectory(appDir)
];

let totalIssues = 0;

for (const file of allFiles) {
  const issues = checkFileForHooksIssues(file);
  if (issues.length > 0) {
    const relativePath = path.relative(__dirname, file);
    console.log(`⚠️  ${relativePath}:`);
    issues.forEach(issue => console.log(`   ${issue}`));
    console.log('');
    totalIssues += issues.length;
  }
}

if (totalIssues === 0) {
  console.log("✅ No obvious hooks issues found!");
} else {
  console.log(`❌ Found ${totalIssues} potential hooks issues`);
}

console.log("\n🧪 Testing current page.tsx:");
const pageFile = path.join(__dirname, 'src', 'app', '(site)', 'page.tsx');
const pageIssues = checkFileForHooksIssues(pageFile);

if (pageIssues.length === 0) {
  console.log("✅ page.tsx looks clean!");
} else {
  console.log("❌ page.tsx has issues:");
  pageIssues.forEach(issue => console.log(`   ${issue}`));
}