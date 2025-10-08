/**
 * Test file to verify auth utilities functionality
 * This file can be deleted after testing
 */

import { 
  normalizeRole, 
  getRedirectPathByRole, 
  redirectByRole, 
  hasRequiredRole 
} from "@/utils/auth-helpers";

// Test role normalization
console.log("Testing role normalization:");
console.log("Admin -> ", normalizeRole("Admin")); // Should be "admin"
console.log("ADMIN -> ", normalizeRole("ADMIN")); // Should be "admin"
console.log("user -> ", normalizeRole("user")); // Should be "user"
console.log("USER -> ", normalizeRole("USER")); // Should be "user"
console.log("null -> ", normalizeRole(null)); // Should be "user"
console.log("undefined -> ", normalizeRole(undefined)); // Should be "user"
console.log("unknown -> ", normalizeRole("unknown")); // Should be "user"

// Test redirect paths
console.log("\nTesting redirect paths:");
console.log("admin -> ", getRedirectPathByRole("admin")); // Should be "/admin"
console.log("user -> ", getRedirectPathByRole("user")); // Should be "/"

// Test role validation
console.log("\nTesting role validation:");
console.log("Admin has admin role -> ", hasRequiredRole("Admin", ["admin"])); // Should be true
console.log("user has admin role -> ", hasRequiredRole("user", ["admin"])); // Should be false
console.log("Admin has user role -> ", hasRequiredRole("Admin", ["user"])); // Should be false
console.log("null has admin role -> ", hasRequiredRole(null, ["admin"])); // Should be false

export default function AuthUtilsTest() {
  return (
    <div>
      <h1>Auth Utils Test</h1>
      <p>Check console for test results</p>
    </div>
  );
}