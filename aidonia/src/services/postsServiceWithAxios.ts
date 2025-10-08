import api from './axios';

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
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  categoryId: string;
  categoryName: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  postImages: PostImage[];
  createdAt: string;
  updatedAt: string;
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

export interface PostResponse {
  isSuccess: boolean;
  data: Post;
  message: string;
  exception: string | null;
}

export const postsService = {
  // Get all posts
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
    
    if (status && status !== 'ALL') {
      params.append('status', status);
    }
    
    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    const response = await api.get<PostsResponse>(`/posts?${params}`);
    return response.data;
  },

  // Approve post
  approve: async (postId: string): Promise<PostResponse> => {
    const response = await api.put<PostResponse>(`/posts/approve/${postId}`);
    return response.data;
  },

  // Reject post
  reject: async (postId: string): Promise<PostResponse> => {
    const response = await api.put<PostResponse>(`/posts/reject/${postId}`);
    return response.data;
  },
};