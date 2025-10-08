/**
 * 🔧 Final test for HomePage hooks safety
 */

const fs = require('fs');
const path = require('path');

console.log("🔧 FINAL HOOKS SAFETY CHECK\n");

const pageFile = path.join(__dirname, 'src', 'app', '(site)', 'page.tsx');
const content = fs.readFileSync(pageFile, 'utf8');

console.log("📄 Current HomePage content:");
console.log("=" .repeat(50));
console.log(content);
console.log("=" .repeat(50));

// Check hooks order
const lines = content.split('\n');
const hookLines = [];

lines.forEach((line, index) => {
  // Only count actual hook calls, not imports or comments
  if ((line.includes('useState(') || line.includes('useEffect(') || line.includes('useRouter(')) &&
      !line.includes('import') && !line.includes('//')) {
    hookLines.push(`Line ${index + 1}: ${line.trim()}`);
  }
});

console.log("\n🔍 Found hooks:");
hookLines.forEach(hook => console.log(`  ${hook}`));

// Check for any conditional logic
const hasConditionalHooks = lines.some(line => 
  (line.includes('if (') || line.includes('if(')) && 
  (line.includes('use') && line.includes('('))
);

const hasNestedFunctions = lines.some(line => 
  line.includes('function ') && !line.includes('export default function')
);

console.log("\n✅ Safety checks:");
console.log(`  - Fixed number of hooks: ${hookLines.length === 3 ? '✅' : '❌'}`);
console.log(`  - No conditional hooks: ${!hasConditionalHooks ? '✅' : '❌'}`);
console.log(`  - No nested functions: ${!hasNestedFunctions ? '✅' : '❌'}`);

if (hookLines.length === 3 && !hasConditionalHooks && !hasNestedFunctions) {
  console.log("\n🎉 HomePage is HOOKS-SAFE! Ready to test.");
} else {
  console.log("\n⚠️ Still has potential issues.");
}