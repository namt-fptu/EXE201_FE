import api from "./axios";
import { handleApiResponse, handleApiError } from "@/utils/toast-helper";

export interface User {
  id: number;
  userName: string; // API trả về userName
  email: string;
  phoneNumber?: string;
  location?: string;
  role?: string;
  reputationScore?: number;
  avataImage?: string; // API trả về avataImage
  phoneVerified?: boolean;
  mailVerified?: boolean;
  token?: string;
  refreshToken?: string;
  // Thêm fields cho compatibility
  username?: string; // alias cho userName
  fullName?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserRequest {
  userName?: string;
  password?: string; // Single password field - current or new password
  phoneNumber?: string;  
  residentId?: string;
  // Only these 4 fields are allowed by the API
}

export interface UpdatePersonalInfoRequest {
  userName?: string;
  phoneNumber?: string;
  // Email is excluded for security reasons
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  isSuccess: boolean;
}

class UsersService {
  // Get all users
  async getAll(): Promise<ApiResponse<User[]>> {
    try {
      const response = await api.get("/users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  // Get user by ID
  async getById(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  // Update user - only send the 4 allowed fields: userName, password, phoneNumber, residentId
  async update(id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    try {
      // Only these 4 fields are allowed, any other field will cause error
      const updatePayload = {
        userName: data.userName || "",
        password: data.password || "",
        phoneNumber: data.phoneNumber || "",
        residentId: data.residentId || ""
      };
      
      console.log(`Calling PUT /api/users/${id} with payload:`, updatePayload);
      
      const response = await api.put(`/users/${id}`, updatePayload);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.message === "Old password incorrect") {
          throw new Error("Current password is incorrect");
        }
      }
      
      throw error;
    }
  }

  // Update personal information only (username and phone) using PATCH
  async updatePersonalInfo(id: number, data: UpdatePersonalInfoRequest): Promise<ApiResponse<User>> {
    try {
      // Only send fields that can be updated
      const updatePayload: any = {};
      
      if (data.userName !== undefined) {
        updatePayload.userName = data.userName;
      }
      
      if (data.phoneNumber !== undefined) {
        updatePayload.phoneNumber = data.phoneNumber;
      }
      
      console.log("Sending personal info update via PATCH:", updatePayload);
      
      // Try PATCH first for partial updates
      const response = await api.patch(`/users/${id}`, updatePayload);
      return response.data;
    } catch (error) {
      console.error(`Error updating personal info for user ${id}:`, error);
      throw error;
    }
  }

  // Upload avatar (if supported by backend)
  async uploadAvatar(id: number, file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      
      const response = await api.post(`/users/${id}/avatar`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error uploading avatar for user ${id}:`, error);
      throw error;
    }
  }

  // Get current user info by current user ID
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      // Get current user ID from localStorage or token
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId) {
        throw new Error("No user ID found");
      }
      
      const response = await api.get(`/users/${currentUserId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  }

  // Get current user from token (helper method)  
  getCurrentUserId(): number | null {
    try {
      // Try to get from stored user data first
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        return user.id || null;
      }
      
      // Try to decode from JWT token
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Decode JWT token to get user ID
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload.userId || payload.id || payload.sub || null;
        } catch (tokenError) {
          console.error("Error decoding token:", tokenError);
        }
      }
      
      // No user ID found - return null instead of hardcoded value
      return null;
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return null; // Return null instead of hardcoded fallback
    }
  }
}

export const usersService = new UsersService();