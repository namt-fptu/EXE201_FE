#!/usr/bin/env node

/**
 * Security Audit Script for Admin Pages
 * This script checks all admin pages for proper authentication/authorization
 */

const fs = require('fs');
const path = require('path');

const ADMIN_DIR = path.join(__dirname, '../src/app/admin');
const PROTECTED_PATTERNS = [
  'useAuthGuard',
  'ProtectedRoute', 
  'AdminLayout',
  'withProtectedRoute'
];

function findPageFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findPageFiles(fullPath, files);
    } else if (entry.name === 'page.tsx') {
      files.push(fullPath);
    }
  }
  
  return files;
}

function checkPageProtection(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasProtection = PROTECTED_PATTERNS.some(pattern => 
      content.includes(pattern)
    );
    
    return {
      protected: hasProtection,
      content: content.slice(0, 500) // First 500 chars for analysis
    };
  } catch (error) {
    return { protected: false, error: error.message };
  }
}

function runSecurityAudit() {
  console.log('🔍 Starting Admin Pages Security Audit...\n');
  
  if (!fs.existsSync(ADMIN_DIR)) {
    console.error('❌ Admin directory not found:', ADMIN_DIR);
    return;
  }
  
  const pageFiles = findPageFiles(ADMIN_DIR);
  const unprotectedPages = [];
  const protectedPages = [];
  
  console.log(`📊 Found ${pageFiles.length} admin page(s) to check:\n`);
  
  for (const filePath of pageFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    const result = checkPageProtection(filePath);
    
    if (result.protected) {
      console.log(`✅ ${relativePath}`);
      protectedPages.push(relativePath);
    } else {
      console.log(`❌ ${relativePath} - NO PROTECTION FOUND`);
      unprotectedPages.push({ path: relativePath, result });
    }
  }
  
  console.log('\n📈 Security Audit Results:');
  console.log(`✅ Protected: ${protectedPages.length}`);
  console.log(`❌ Unprotected: ${unprotectedPages.length}`);
  
  if (unprotectedPages.length > 0) {
    console.log('\n🚨 CRITICAL: The following pages need immediate protection:');
    unprotectedPages.forEach(({ path, result }) => {
      console.log(`  - ${path}`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });
    
    console.log('\n🔧 To fix unprotected pages, add one of these patterns:');
    PROTECTED_PATTERNS.forEach(pattern => {
      console.log(`  - ${pattern}`);
    });
    
    process.exit(1); // Exit with error code
  } else {
    console.log('\n🎉 All admin pages are properly protected!');
    process.exit(0);
  }
}

// Run audit if this script is executed directly
if (require.main === module) {
  runSecurityAudit();
}

module.exports = { runSecurityAudit, checkPageProtection, findPageFiles };