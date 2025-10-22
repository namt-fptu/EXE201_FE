import api from "./axios";

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
  condition?: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR" | string;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
  priority: "LOW" | "MEDIUM" | "HIGH" | string;
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

    // Normalize postImages shape for consistency with getPaged
    try {
      const data = response.data;
      if (Array.isArray(data.data)) {
        data.data = data.data.map((it: any) => {
          const normalizeImages = (imgs: any[] | undefined) => {
            if (!imgs) return [] as PostImage[];
            return imgs.map((img: any, idx: number) => {
              if (!img) return { id: String(idx), url: "" } as PostImage;
              if (typeof img === "string")
                return {
                  id: img.split("/").pop() ?? String(idx),
                  url: img,
                } as PostImage;
              const url = img.url ?? img.downloadURL ?? img.path ?? img;
              const id = String(img.id ?? img._id ?? img.publicId ?? idx);
              return { id, url } as PostImage;
            });
          };

          return {
            ...it,
            postImages: normalizeImages(it.postImages ?? it.images ?? []),
          };
        });
      }
    } catch (err) {
      // ignore normalization errors and return original response
    }

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
      if (status && status !== "ALL") body.status = status;

      const response = await api.post<PagedResponse<any>>("/posts/paged", body);

      // Normalize items to Post interface
      const items = (response.data?.data?.items || []).map((it: any) => {
        // Map numeric priority to string
        let priority: any = it.priority;
        if (typeof it.priority === "number") {
          const map = ["LOW", "MEDIUM", "HIGH"];
          priority = map[it.priority] ?? String(it.priority);
        }

        // Normalize status to uppercase tokens
        let statusNorm = it.status ?? "";
        if (typeof statusNorm === "string")
          statusNorm = statusNorm.toUpperCase();

        // Price formatting
        const priceNum =
          typeof it.price === "number" ? it.price : Number(it.price || 0);
        const priceFormatted =
          new Intl.NumberFormat("vi-VN").format(priceNum) + " VND";

        // Normalize postImages to always be array of objects { id, url }
        const normalizeImages = (imgs: any[] | undefined) => {
          if (!imgs) return [] as PostImage[];
          return imgs.map((it: any, idx: number) => {
            if (!it) return { id: String(idx), url: "" } as PostImage;
            if (typeof it === "string") {
              return {
                id: it.split("/").pop() ?? String(idx),
                url: it,
              } as PostImage;
            }
            // If it's already an object, try to pick id and url fields
            const url = it.url ?? it.downloadURL ?? it.path ?? it;
            const id = String(it.id ?? it._id ?? it.publicId ?? idx);
            return { id, url } as PostImage;
          });
        };

        return {
          id: String(it.id ?? it._id ?? ""),
          title: it.title ?? it.name ?? "",
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
          postImages: normalizeImages(it.postImages ?? it.images ?? []),
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
      console.error("Error fetching paged posts:", error);
      return {
        isSuccess: false,
        data: {
          items: [],
          pageNumber: pageNumber,
          pageSize: pageSize,
          totalPages: 0,
        },
        message: "Failed to fetch paged posts",
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
