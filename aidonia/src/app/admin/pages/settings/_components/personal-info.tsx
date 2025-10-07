"use client";

import {
  EmailIcon,
  UserIcon,
} from "@/assets/icons";
import { InputGroup } from "@/components/admin/FormElements/InputGroup"; // ✅ Sửa từ default import thành named import
import { ShowcaseSection } from "@/components/admin/Layouts/showcase-section";
import { useState, useEffect } from "react";
import useUserStore from "@/redux/userStore";
import { toast } from "sonner";
import { usersService } from "@/services/users";

export default function PersonalInfo() {
  const { user, setUser, loadUserFromStorage } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
  });

  // Load user data from API when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching user data from API...");
        
        const response = await usersService.getCurrentUser();
        
        if (response.isSuccess && response.data) {
          console.log("API Response:", response.data);
          setUser(response.data);
        } else {
          console.error("API call unsuccessful:", response);
          toast.error("Failed to load user data");
          // Fallback to localStorage
          loadUserFromStorage();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error loading user data");
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
      setFormData({
        userName: user.userName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
      });
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
      });
    } else {
      // Reset to empty form if no user data
      setFormData({
        userName: "",
        email: "",
        phoneNumber: "",
      });
    }
    toast.info("Changes cancelled");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("No user data available");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare update data
      const updateData = {
        userName: formData.userName.trim() || user.userName,
        email: formData.email.trim() || user.email,
        phoneNumber: formData.phoneNumber.trim() || user.phoneNumber || "",
      };
      
      console.log("Updating user with data:", updateData);
      
      // Call API to update user
      const response = await usersService.update(user.id, updateData);
      
      if (response.isSuccess && response.data) {
        // Update local store with API response
        setUser(response.data);
        console.log("Profile updated successfully:", response.data);
        toast.success("Profile updated successfully!");
      } else {
        console.error("Update failed:", response);
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
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
            placeholder="Enter your email address"
            value={formData.email}
            handleChange={(e) => handleInputChange("email", e.target.value)}
            name="email"
            type="email"
            icon={<EmailIcon />}
            disabled={isLoading}
          />
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
