// Sample user data for testing the settings page
// This can be used to initialize user data with complete profile information

export const sampleUserData = {
  id: 3,
  userName: "admin_user",
  email: "admin@example.com",
  phoneNumber: "0909090909",
  location: null,
  role: "Admin",
  reputationScore: 0,
  avataImage: null,
  phoneVerified: true,
  mailVerified: true,
  token: null,
  refreshToken: null,
  fullName: "Admin User",
  bio: "I'm an administrator at Aidonia, passionate about creating amazing user experiences and building innovative solutions.",
};

// Function to set sample user data (for development/testing)
export const setSampleUserData = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(sampleUserData));
    localStorage.setItem("token", "sample-jwt-token");
    console.log("Sample user data set:", sampleUserData);
  }
};

// Function to check if user has complete profile data
export const hasCompleteProfile = (user: any): boolean => {
  return !!(
    user?.fullName?.trim() &&
    user?.email?.trim() &&
    user?.phoneNumber?.trim() &&  
    user?.bio?.trim()
  );
};