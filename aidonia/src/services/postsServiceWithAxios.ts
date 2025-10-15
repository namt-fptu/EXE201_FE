import api from './axios';

export interface PostImage {
  id: string;
  url: string;
  publicId?: string;
}

export interface Post {
  id: string;
  title: string;
  description?: string;
  price: number;
  priceFormatted?: string;
  condition?: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR' | string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  categoryId?: string;
  categoryName?: string;
  authorId?: string;
  authorName?: string;
  authorEmail?: string;
  postImages?: PostImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PagedData<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems?: number;
}

export interface PagedResponse<T> {
  isSuccess: boolean;
  data: PagedData<T>;
  message?: string | null;
  exception?: any;
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

  // Paged posts (new API: POST /posts/paged)
  getPaged: async (
    pageNumber: number = 1,
    pageSize: number = 10,
    searchTerm?: string,
    status?: string
  ): Promise<PagedResponse<Post>> => {
    try {
      const body: any = {
        pageNumber,
        pageSize,
      };
      if (searchTerm && searchTerm.trim()) body.searchTerm = searchTerm.trim();
      if (status && status !== 'ALL') body.status = status;

      const response = await api.post<PagedResponse<any>>('/posts/paged', body);

      // Normalize items to Post interface
      const items = (response.data?.data?.items || []).map((it: any) => {
        // Map numeric priority to string
        let priority: any = it.priority;
        if (typeof it.priority === 'number') {
          const map = ['LOW', 'MEDIUM', 'HIGH'];
          priority = map[it.priority] ?? String(it.priority);
        }

        // Normalize status to uppercase tokens
        let statusNorm = it.status ?? '';
        if (typeof statusNorm === 'string') statusNorm = statusNorm.toUpperCase();

        // Price formatting
        const priceNum = typeof it.price === 'number' ? it.price : Number(it.price || 0);
        const priceFormatted = new Intl.NumberFormat('vi-VN').format(priceNum) + ' VND';

        return {
          id: String(it.id ?? it._id ?? ''),
          title: it.title ?? it.name ?? '',
          description: it.description,
          price: priceNum,
          priceFormatted,
          condition: it.condition,
          status: statusNorm,
          priority,
          categoryId: it.categoryId,
          categoryName: it.categoryName,
          authorId: it.userId ?? it.authorId,
          authorName: it.authorName ?? it.userName ?? it.user?.name,
          authorEmail: it.authorEmail ?? it.userEmail ?? it.user?.email,
          postImages: it.postImages ?? it.images ?? [],
          createdAt: it.createdAt,
          updatedAt: it.updatedAt,
        } as Post;
      });

      const paged: PagedResponse<Post> = {
        isSuccess: response.data.isSuccess,
        data: {
          items,
          pageNumber: response.data.data?.pageNumber ?? pageNumber,
          pageSize: response.data.data?.pageSize ?? pageSize,
          totalPages: response.data.data?.totalPages ?? 0,
          totalItems: response.data.data?.totalItems ?? undefined,
        },
        message: response.data.message ?? null,
        exception: response.data.exception ?? null,
      };

      return paged;
    } catch (error: any) {
      console.error('Error fetching paged posts:', error);
      return {
        isSuccess: false,
        data: { items: [], pageNumber: pageNumber, pageSize: pageSize, totalPages: 0 },
        message: 'Failed to fetch paged posts',
        exception: error?.toString?.() ?? error,
      };
    }
  },

  // Approve post
  approve: async (postId: string): Promise<PostResponse> => {
    console.log(`Calling API: /posts/approve/${postId}`);
    try {
      const response = await api.put<PostResponse>(`/posts/approve/${postId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error approving post ${postId}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to approve post.');
    }
  },

  // Reject post
  reject: async (postId: string): Promise<PostResponse> => {
    try {
      const response = await api.put<PostResponse>(`/posts/reject/${postId}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error rejecting post ${postId}:`, error);
      throw new Error(error.response?.data?.message || 'Failed to reject post.');
    }
  },
};