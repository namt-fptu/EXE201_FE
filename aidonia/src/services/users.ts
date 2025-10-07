import api from "./axios";

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
  email?: string;
  password?: string;
  phoneNumber?: string;
  location?: string;
  residentId?: string;
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

  // Update user
  async update(id: number, data: UpdateUserRequest): Promise<ApiResponse<User>> {
    try {
      const updatePayload = {
        userName: data.userName || "",
        email: data.email || "",
        password: data.password || "",
        phoneNumber: data.phoneNumber || "",
        location: data.location || "",
        residentId: data.residentId || ""
      };
      
      const response = await api.put(`/users/${id}`, updatePayload);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
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
      
      // For testing purposes, return a default ID
      // In production, this should decode JWT token
      return 3; // Match the ID from your API documentation
    } catch (error) {
      console.error("Error getting current user ID:", error);
      return 3; // Fallback to test ID
    }
  }
}

export const usersService = new UsersService();