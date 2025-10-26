"use client";

import {
  EmailIcon,
  UserIcon,
} from "@/assets/icons";
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
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load user data from API when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching user data from API...");
        
        const response = await usersService.getCurrentUser();
        
        if (!response.isSuccess) {
          handleApiResponse(response, {
            context: "load profile",
            showDataInfo: false
          });
        }
        
        if (response.isSuccess && response.data) {
          console.log("API Response:", response.data);
          setUser(response.data);
          
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(response.data));
          }
        } else {
          console.error("API call unsuccessful:", response);
          showErrorToast("Failed to load user data", {
            description: "Falling back to locally stored information"
          });
          loadUserFromStorage();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        
        handleApiError(error, {
          context: 'load profile',
          customMessage: "Failed to load user data",
          showDetails: true
        });
        
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
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      setFormData({
        userName: "",
        email: "",
        phoneNumber: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setIsChangingPassword(false);
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
    
    const toastHandler = new MultiStepToastHandler([
      "Validating current password...",
      isChangingPassword ? "Updating password..." : "Updating profile information...",
      "Synchronizing changes...",
      "Finalizing update..."
    ]);
    
    try {
      setIsLoading(true);
      
      toastHandler.startStep(0);
      
      const updateData = {
        userName: formData.userName.trim() || user.userName || "",
        password: isChangingPassword ? formData.newPassword.trim() : formData.oldPassword.trim(),
        phoneNumber: formData.phoneNumber.trim() || user.phoneNumber || "",
        residentId: user.residentId || ""
      };
      
      console.log("Updating user with data:", updateData);
      toastHandler.completeStep(0, "Validation successful");
      
      toastHandler.startStep(1);
      const response = await usersService.update(user.id, updateData);
      
      toastHandler.completeStep(1, isChangingPassword ? "Password updated" : "Profile information updated");
      
      if (response.isSuccess) {
        toastHandler.startStep(2);
        
        const passwordWasChanged = isChangingPassword && formData.newPassword.trim();
        
        if (passwordWasChanged) {
          toastHandler.completeStep(2, "Changes synchronized");
          toastHandler.complete("Password changed successfully! Redirecting to login...");
          
          setTimeout(() => {
            logout();
            router.push("/auth/signin");
          }, 2000);
          
          return;
        }
        
        const updatedUser = {
          ...user,
          userName: updateData.userName,
          phoneNumber: updateData.phoneNumber,
          residentId: updateData.residentId,
          email: user.email,
          id: user.id,
          role: user.role,
          avataImage: user.avataImage
        };
        setUser(updatedUser);
        
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        
        console.log("Profile updated successfully, user store updated:", updatedUser);
        toastHandler.completeStep(2, "Local data synchronized");
        
        toastHandler.startStep(3);
        
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
        
        handleApiResponse(response, {
          errorMessage: "Failed to update profile",
          context: "update profile"
        });
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toastHandler.cleanup();
      
      if (error.message === "Current password is incorrect") {
        showErrorToast("Current password is incorrect", {
          description: "Please verify your current password and try again"
        });
      } else {
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
      <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-sm text-gray-600">Loading user data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-lg border border-gray-100">
      {/* Header */}
      <div className="border-b border-gray-100 px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
        <p className="text-sm text-gray-600 mt-1">Update your personal details and account settings</p>
      </div>

      {/* Form Content */}
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Name Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              User Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => handleInputChange("userName", e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Email Field (Disabled) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EmailIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                placeholder="Email address (view only)"
                disabled={true}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500">Email cannot be changed for security reasons</p>
          </div>

          {/* Phone Number Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                placeholder="Enter your phone number"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Current Password Field */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Current Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <input
                type="password"
                value={formData.oldPassword}
                onChange={(e) => handleInputChange("oldPassword", e.target.value)}
                placeholder="Enter current password to confirm changes"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500">Required to verify your identity</p>
          </div>

          {/* Change Password Checkbox */}
          <div className="flex items-center space-x-3 py-2">
            <input
              type="checkbox"
              id="changePassword"
              checked={isChangingPassword}
              onChange={(e) => setIsChangingPassword(e.target.checked)}
              className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
            />
            <label htmlFor="changePassword" className="text-sm font-medium text-gray-700 cursor-pointer">
              Change Password
            </label>
          </div>

          {/* New Password Fields - Animated */}
          <div className={`transition-all duration-300 ease-in-out ${isChangingPassword ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <div className="space-y-4 pt-2">
              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    placeholder="Enter new password"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Confirm new password"
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
