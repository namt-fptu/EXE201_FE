import api from "./axios";

export interface PostImage {
  id: string;
  url: string;
  publicId?: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  status: "PENDING" | "APPROVED" | "REJECTED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  categoryId: string;
  categoryName: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  postImages: PostImage[];
  createdAt: string;
  updatedAt: string;
  // Backend also returns these fields
  userId?: number;
  userName?: string;
}

export interface PostsResponse {
  isSuccess: boolean;
  data: Post[];
  total: number;
  page: number;
  limit: number;
  message: string;
  exception: string | null;
}

export interface PagedPostsResponse {
  isSuccess: boolean;
  data: {
    items: Post[];
    pageNumber: number;
    pageSize: number;
    totalPages: number;
  };
  message: string;
  exception: string | null;
}

export interface PostResponse {
  isSuccess: boolean;
  data: Post;
  message: string;
  exception: string | null;
}

export const postsService = {
  // Get all posts with pagination and search (using POST endpoint)
  getPaged: async (
    page: number = 1,
    limit: number = 20,
    status?: string,
    searchTerm?: string,
    categoryName?: string
  ): Promise<PagedPostsResponse> => {
    try {
      const requestBody = {
        pageNumber: page,
        pageSize: limit,
        searchTerm: searchTerm || "",
        status: status || "",
        categoryName: categoryName || "",
      };

      const response = await api.post<PagedPostsResponse>(
        "/posts/paged",
        requestBody
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching paged posts:", error);

      // If it's a "no posts found" error, return empty result instead of throwing
      if (error.response?.data?.message?.includes("No posts found")) {
        return {
          isSuccess: true,
          data: {
            items: [],
            pageNumber: page,
            pageSize: limit,
            totalPages: 0,
          },
          message: "No posts found for the given criteria",
          exception: null,
        };
      }

      throw new Error(
        error.response?.data?.message || "Failed to fetch posts."
      );
    }
  },

  // Get all posts (legacy method for backward compatibility)
  getAll: async (
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string
  ): Promise<PostsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (status && status !== "ALL") {
      params.append("status", status);
    }

    if (search && search.trim()) {
      params.append("search", search.trim());
    }

    const response = await api.get<PostsResponse>(`/posts?${params}`);
    return response.data;
  },

  // Approve post
  approve: async (postId: string): Promise<PostResponse> => {
    console.log(`Calling API: /posts/approve/${postId}`);
    try {
      const response = await api.put<PostResponse>(`/posts/approve/${postId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error approving post ${postId}:`, error);
      throw new Error(
        error.response?.data?.message || "Failed to approve post."
      );
    }
  },

  // Reject post
  reject: async (postId: string): Promise<PostResponse> => {
    try {
      const response = await api.put<PostResponse>(`/posts/reject/${postId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error rejecting post ${postId}:`, error);
      throw new Error(
        error.response?.data?.message || "Failed to reject post."
      );
    }
  },

  // Get post by ID
  getById: async (postId: number): Promise<PostResponse> => {
    try {
      const response = await api.get<PostResponse>(`/posts/${postId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching post ${postId}:`, error);
      throw new Error(error.response?.data?.message || "Failed to fetch post.");
    }
  },
};
