"use client";

import {
  EmailIcon,
  UserIcon,
} from "@/assets/icons";
import { InputGroup } from "@/components/admin/FormElements/InputGroup"; // ✅ Sửa từ default import thành named import
import { ShowcaseSection } from "@/components/admin/Layouts/showcase-section";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/redux/userStore";
import { toast } from "sonner";
import { usersService } from "@/services/users";
import { handleApiResponse, handleApiError, showLoadingToast, showSuccessToast, showErrorToast, showInfoToast, MultiStepToastHandler } from "@/utils/toast-helper";

export default function PersonalInfo() {
  const { user, setUser, loadUserFromStorage, logout } = useUserStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
    oldPassword: "", // Current password for verification
    newPassword: "", // New password (optional)
    confirmPassword: "", // Confirm new password
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load user data from API when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching user data from API...");
        
        const response = await usersService.getCurrentUser();
        
        // Handle the API response silently on initial load
        if (!response.isSuccess) {
          handleApiResponse(response, {
            context: "load profile",
            showDataInfo: false
          });
        }
        
        if (response.isSuccess && response.data) {
          console.log("API Response:", response.data);
          setUser(response.data);
          
          // Also update localStorage to ensure consistency
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(response.data));
          }
        } else {
          console.error("API call unsuccessful:", response);
          showErrorToast("Failed to load user data", {
            description: "Falling back to locally stored information"
          });
          // Fallback to localStorage
          loadUserFromStorage();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        
        // Use comprehensive error handling
        handleApiError(error, {
          context: 'load profile',
          customMessage: "Failed to load user data",
          showDetails: true
        });
        
        // Fallback to localStorage
        loadUserFromStorage();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [setUser, loadUserFromStorage]);

  useEffect(() => {
    console.log("User data in settings:", user);
    if (user) {
      setFormData(prev => ({
        ...prev,
        userName: user.userName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        // Keep password fields as they are to avoid clearing during typing
        oldPassword: prev.oldPassword,
        newPassword: prev.newPassword,
        confirmPassword: prev.confirmPassword,
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        userName: user.userName || "",
        email: user.email || "", // Keep for display but won't be sent to API
        phoneNumber: user.phoneNumber || "",
        oldPassword: "", // Always reset password fields
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      // Reset to empty form if no user data
      setFormData({
        userName: "",
        email: "",
        phoneNumber: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setIsChangingPassword(false); // Reset password change state
    toast.info("Changes cancelled");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      showErrorToast("No user data available", {
        description: "Please refresh the page and try again"
      });
      return;
    }

    // Enhanced validation with better error messages
    if (!formData.oldPassword.trim()) {
      showErrorToast("Current password is required", {
        description: "Please enter your current password to verify your identity"
      });
      return;
    }

    if (isChangingPassword) {
      if (!formData.newPassword.trim()) {
        showErrorToast("New password is required", {
          description: "Please enter your new password"
        });
        return;
      }
      
      if (formData.newPassword.length < 6) {
        showErrorToast("Password must be at least 6 characters", {
          description: "Please choose a stronger password for better security"
        });
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        showErrorToast("Passwords do not match", {
          description: "Please make sure both password fields contain the same value"
        });
        return;
      }
    }
    
    // Initialize multi-step toast handler for profile update
    const toastHandler = new MultiStepToastHandler([
      "Validating current password...",
      isChangingPassword ? "Updating password..." : "Updating profile information...",
      "Synchronizing changes...",
      "Finalizing update..."
    ]);
    
    try {
      setIsLoading(true);
      
      // Step 1: Validation
      toastHandler.startStep(0);
      
      // Prepare update data - only 4 allowed fields: userName, password, phoneNumber, residentId
      const updateData = {
        userName: formData.userName.trim() || user.userName || "",
        password: isChangingPassword ? formData.newPassword.trim() : formData.oldPassword.trim(),
        phoneNumber: formData.phoneNumber.trim() || user.phoneNumber || "",
        residentId: user.residentId || ""
      };
      
      console.log("Updating user with data:", updateData);
      toastHandler.completeStep(0, "Validation successful");
      
      // Step 2: Update API call
      toastHandler.startStep(1);
      const response = await usersService.update(user.id, updateData);
      
      toastHandler.completeStep(1, isChangingPassword ? "Password updated" : "Profile information updated");
      
      if (response.isSuccess) {
        // Step 3: Synchronizing changes
        toastHandler.startStep(2);
        
        // Check if password was changed
        const passwordWasChanged = isChangingPassword && formData.newPassword.trim();
        
        if (passwordWasChanged) {
          toastHandler.completeStep(2, "Changes synchronized");
          toastHandler.complete("Password changed successfully! Redirecting to login...");
          
          // Wait a moment for the toast to show, then logout
          setTimeout(() => {
            logout();
            router.push("/auth/signin");
          }, 2000);
          
          return; // Exit early, don't update local state since we're logging out
        }
        
        // For non-password updates, update local store immediately
        const updatedUser = {
          ...user,
          userName: updateData.userName,
          phoneNumber: updateData.phoneNumber,
          residentId: updateData.residentId,
          // Keep other fields unchanged
          email: user.email,
          id: user.id,
          role: user.role,
          avataImage: user.avataImage
        };
        setUser(updatedUser);
        
        // Also update localStorage to persist changes
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        
        console.log("Profile updated successfully, user store updated:", updatedUser);
        toastHandler.completeStep(2, "Local data synchronized");
        
        // Step 4: Finalize
        toastHandler.startStep(3);
        
        // Update form data to reflect changes immediately
        setFormData(prev => ({
          ...prev,
          userName: updateData.userName,
          phoneNumber: updateData.phoneNumber,
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
        setIsChangingPassword(false);
        
        toastHandler.complete("Profile updated successfully! All changes have been saved.");
      } else {
        console.error("Update failed:", response);
        toastHandler.cleanup();
        
        // Use comprehensive response handling
        handleApiResponse(response, {
          errorMessage: "Failed to update profile",
          context: "update profile"
        });
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toastHandler.cleanup();
      
      // Handle specific error messages with enhanced feedback
      if (error.message === "Current password is incorrect") {
        showErrorToast("Current password is incorrect", {
          description: "Please verify your current password and try again"
        });
      } else {
        // Use comprehensive error handling
        handleApiError(error, {
          context: 'update profile',
          showDetails: true
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ShowcaseSection title="Personal Information">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-sm text-gray-600">Loading user data...</span>
        </div>
      </ShowcaseSection>
    );
  }

  return (
    <ShowcaseSection title="Personal Information">
      <form onSubmit={handleSubmit}>
        <div className="mb-5.5">
          <InputGroup
            label="User Name"
            placeholder="Enter your username"
            value={formData.userName}
            handleChange={(e) => handleInputChange("userName", e.target.value)}
            name="userName"
            icon={<UserIcon />}
            disabled={isLoading}
          />
        </div>

        <div className="mt-5.5">
          <InputGroup
            label="Email Address"
            placeholder="Email address (view only)"
            value={formData.email}
            handleChange={(e) => handleInputChange("email", e.target.value)}
            name="email"
            type="email"
            icon={<EmailIcon />}
            disabled={true} // Always disabled - view only
          />
          <p className="text-xs text-gray-500 mt-1">Email cannot be changed for security reasons</p>
        </div>

        <div className="mt-5.5">
          <InputGroup
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phoneNumber}
            handleChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            name="phoneNumber"
            type="tel"
            disabled={isLoading}
          />
        </div>

        <div className="mt-5.5">
          <InputGroup
            label="Current Password"
            placeholder="Enter current password to confirm changes"
            value={formData.oldPassword}
            handleChange={(e) => handleInputChange("oldPassword", e.target.value)}
            name="oldPassword"
            type="password"
            disabled={isLoading}
            icon={
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
              </svg>
            }
          />
          <p className="text-xs text-gray-500 mt-1">Required to verify your identity</p>
        </div>

        <div className="mt-5.5">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="changePassword"
              checked={isChangingPassword}
              onChange={(e) => setIsChangingPassword(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="changePassword" className="text-sm font-medium text-gray-700">
              Change Password
            </label>
          </div>
          
          {isChangingPassword && (
            <>
              <div className="mb-4">
                <InputGroup
                  label="New Password"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  handleChange={(e) => handleInputChange("newPassword", e.target.value)}
                  name="newPassword"
                  type="password"
                  disabled={isLoading}
                  icon={
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  }
                />
              </div>
              
              <div className="mb-4">
                <InputGroup
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  handleChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  name="confirmPassword"
                  type="password"
                  disabled={isLoading}
                  icon={
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  }
                />
              </div>
            </>
          )}
        </div>

        



        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex justify-center rounded-lg border border-stroke bg-gray-2 px-6 py-2 font-medium text-dark hover:bg-gray-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex justify-center rounded-lg bg-primary px-6 py-2 font-medium text-white hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </ShowcaseSection>
  );
}
