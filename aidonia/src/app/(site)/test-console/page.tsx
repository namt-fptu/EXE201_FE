// TEST: Console Removal Demo
// Run production build to see these removed

export default function TestConsolePage() {
  console.log("This will be REMOVED in production build"); // ❌ Removed
  console.debug("This will be REMOVED in production build"); // ❌ Removed
  console.info("This will be REMOVED in production build"); // ❌ Removed
  console.warn("This will STAY in production build"); // ✅ Kept
  console.error("This will STAY in production build"); // ✅ Kept

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Console Removal Test</h1>
      <p>Check your browser console:</p>
      <ul>
        <li>In DEV mode: You&apos;ll see ALL 5 messages</li>
        <li>In PRODUCTION: You&apos;ll only see 2 messages (warn + error)</li>
      </ul>
      <p>
        <strong>Current Mode:</strong> {process.env.NODE_ENV}
      </p>
    </div>
  );
}
