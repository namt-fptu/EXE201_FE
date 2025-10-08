// Test script for personal info update API
// Run this in browser console to test the API

const testPersonalInfoUpdate = async () => {
  try {
    console.log("🧪 Testing Personal Info Update API...");
    
    // Get current user first
    const currentUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}users/3`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!currentUserResponse.ok) {
      throw new Error(`Failed to get current user: ${currentUserResponse.status}`);
    }
    
    const currentUser = await currentUserResponse.json();
    console.log("📋 Current user data:", currentUser);
    
    // Test update with new data
    const updateData = {
      userName: "UpdatedUsername_" + Date.now(),
      phoneNumber: "+1234567890",
      // Email is intentionally excluded
    };
    
    console.log("📤 Sending update request:", updateData);
    
    const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}users/3`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });
    
    if (!updateResponse.ok) {
      throw new Error(`Update failed: ${updateResponse.status}`);
    }
    
    const updatedUser = await updateResponse.json();
    console.log("✅ Update successful:", updatedUser);
    
    // Verify the changes
    console.log("🔍 Verification:");
    console.log("- Username changed:", currentUser.data?.userName !== updatedUser.data?.userName);
    console.log("- Phone updated:", updatedUser.data?.phoneNumber === updateData.phoneNumber);
    console.log("- Email unchanged:", currentUser.data?.email === updatedUser.data?.email);
    
    return {
      success: true,
      before: currentUser,
      after: updatedUser,
      changes: updateData
    };
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Export for use
if (typeof window !== 'undefined') {
  window.testPersonalInfoUpdate = testPersonalInfoUpdate;
  console.log("🚀 Test function loaded! Run: testPersonalInfoUpdate()");
}