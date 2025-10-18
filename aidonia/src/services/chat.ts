import api from "@/services/axios";

// Types based on backend models
export interface User {
  id: number;
  userName: string;
  email?: string;
  phoneNumber?: string;
  avataImage?: string;
}

export interface Post {
  id: number;
  title: string;
  description?: string;
  price: number;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  messageText: string;
  sentAt: string;
  readStatus: boolean;
  sender: User;
}

export interface Conversation {
  id: number;
  postId: number;
  buyerId: number;
  sellerId: number;
  createdAt: string;
  post: Post;
  buyer: User;
  seller: User;
  messages?: Message[];
}

export interface ConversationWithPreview extends Conversation {
  lastMessage?: Message;
  unreadCount?: number;
}

// Request types
export interface CreateConversationRequest {
  postId: number;
  buyerId: number;
  sellerId: number;
}

export interface SendMessageRequest {
  conversationId: number;
  senderId: number;
  messageText: string;
}

export interface GetMessagesRequest {
  conversationId: number;
  pageNumber: number;
  pageSize: number;
}

// API Response wrapper
interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

class ChatService {
  // Conversation endpoints
  async getUserConversations(
    userId: number
  ): Promise<ApiResponse<Conversation[]>> {
    try {
      const response = await api.get(`chat/conversations/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting user conversations:", error);
      throw error;
    }
  }

  async getConversationsWithPreview(
    userId: number
  ): Promise<ApiResponse<ConversationWithPreview[]>> {
    try {
      console.log(
        "🔄 ChatService: Fetching conversations with preview for user:",
        userId
      );
      const response = await api.get(
        `chat/conversations/user/${userId}/with-preview`
      );
      console.log(
        "✅ ChatService: Successfully fetched",
        response.data?.data?.length || 0,
        "conversations"
      );
      return response.data;
    } catch (error) {
      console.error(
        "❌ ChatService: Error getting conversations with preview:",
        error
      );
      throw error;
    }
  }

  async getConversationById(
    conversationId: number,
    userId: number
  ): Promise<ApiResponse<Conversation>> {
    try {
      const response = await api.get(
        `chat/conversations/${conversationId}/user/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting conversation by id:", error);
      throw error;
    }
  }

  async getOrCreateConversation(
    postId: number,
    buyerId: number,
    sellerId: number
  ): Promise<ApiResponse<Conversation>> {
    try {
      const url = `chat/conversations/post/${postId}/buyer/${buyerId}/seller/${sellerId}`;
      console.log("=== CHAT DEBUG: getOrCreateConversation ===");
      console.log("Full URL:", `${api.defaults.baseURL}/${url}`);
      console.log("Request params:", { postId, buyerId, sellerId });
      console.log("API base URL:", api.defaults.baseURL);
      console.log("Request headers:", api.defaults.headers);

      const response = await api.get(url);
      console.log("SUCCESS: Conversation response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("=== CHAT ERROR: getOrCreateConversation ===");
      console.error("Request failed for:", { postId, buyerId, sellerId });

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { status?: number; data?: unknown; statusText?: string };
        };
        console.error("HTTP Status:", axiosError.response?.status);
        console.error("Status Text:", axiosError.response?.statusText);
        console.error("Response Data:", axiosError.response?.data);
      } else if (error && typeof error === "object" && "code" in error) {
        const networkError = error as { code?: string; message?: string };
        console.error("Network Error Code:", networkError.code);
        if (networkError.code === "ERR_CERT_AUTHORITY_INVALID") {
          console.error(
            "🔒 SSL Certificate Error: Please navigate to https://localhost:5001 in your browser and accept the self-signed certificate."
          );
        } else if (networkError.code === "ERR_CONNECTION_REFUSED") {
          console.error(
            "🚫 Connection Refused: Backend server may not be running on https://localhost:5001"
          );
        }
      }

      console.error(
        "Full error:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  async createConversation(
    request: CreateConversationRequest
  ): Promise<ApiResponse<Conversation>> {
    try {
      const response = await api.post("chat/conversations", request);
      return response.data;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  async deleteConversation(
    conversationId: number,
    userId: number
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.delete(
        `chat/conversations/${conversationId}/user/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  }

  // Message endpoints
  async getConversationMessages(
    conversationId: number,
    userId: number
  ): Promise<ApiResponse<Message[]>> {
    try {
      const response = await api.get(
        `chat/conversations/${conversationId}/messages/user/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting conversation messages:", error);
      throw error;
    }
  }

  async getConversationMessagesPaged(
    request: GetMessagesRequest,
    userId: number
  ): Promise<ApiResponse<Message[]>> {
    try {
      const response = await api.post(
        `chat/conversations/messages/paged?userId=${userId}`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error getting paged conversation messages:", error);
      throw error;
    }
  }

  async sendMessage(
    request: SendMessageRequest
  ): Promise<ApiResponse<Message>> {
    try {
      const url = "chat/messages";
      console.log("=== CHAT DEBUG: sendMessage ===");
      console.log("Full URL:", `${api.defaults.baseURL}/${url}`);
      console.log("Request payload:", request);
      console.log("API base URL:", api.defaults.baseURL);
      console.log("Request headers:", api.defaults.headers);

      const response = await api.post(url, request);
      console.log("SUCCESS: Message sent response:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("=== CHAT ERROR: sendMessage ===");
      console.error("Request failed for:", request);

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            status?: number;
            data?: unknown;
            statusText?: string;
            headers?: unknown;
          };
        };
        console.error("HTTP Status:", axiosError.response?.status);
        console.error("Status Text:", axiosError.response?.statusText);
        console.error("Response Headers:", axiosError.response?.headers);
        console.error("Response Data:", axiosError.response?.data);

        // If it's a 500 error with backend response, try to extract the actual error
        if (axiosError.response?.status === 500 && axiosError.response?.data) {
          const errorData = axiosError.response.data as {
            message?: string;
            detail?: string;
          };
          if (errorData.message) {
            console.error("❌ Backend Error Message:", errorData.message);
          }
          if (errorData.detail) {
            console.error("❌ Backend Error Detail:", errorData.detail);
          }
        }
      } else if (error && typeof error === "object" && "code" in error) {
        const networkError = error as { code?: string; message?: string };
        console.error("Network Error Code:", networkError.code);
        if (networkError.code === "ERR_CERT_AUTHORITY_INVALID") {
          console.error(
            "🔒 SSL Certificate Error: Please navigate to https://localhost:5001 in your browser and accept the self-signed certificate."
          );
        } else if (networkError.code === "ERR_CONNECTION_REFUSED") {
          console.error(
            "🚫 Connection Refused: Backend server may not be running on https://localhost:5001"
          );
        }
      }

      console.error(
        "Full error:",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  async deleteMessage(
    messageId: number,
    userId: number
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.delete(
        `chat/messages/${messageId}/user/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  }

  // Utility endpoints
  async markMessagesAsRead(
    conversationId: number,
    userId: number
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.put(
        `chat/conversations/${conversationId}/mark-read/user/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  }

  async getUnreadMessageCount(userId: number): Promise<ApiResponse<number>> {
    try {
      const response = await api.get(`chat/unread-count/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting unread message count:", error);
      throw error;
    }
  }

  // Typing indicator endpoints
  async startTyping(
    conversationId: number,
    userId: number,
    userName: string
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.post(
        `chat/conversations/${conversationId}/typing/start?userId=${userId}&userName=${encodeURIComponent(userName)}`
      );
      return response.data;
    } catch (error) {
      console.error("Error starting typing indicator:", error);
      throw error;
    }
  }

  async stopTyping(
    conversationId: number,
    userId: number
  ): Promise<ApiResponse<boolean>> {
    try {
      const response = await api.post(
        `chat/conversations/${conversationId}/typing/stop?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error stopping typing indicator:", error);
      throw error;
    }
  }
}

export const chatService = new ChatService();
export default chatService;
