import api from './axios';

export interface Category {
  id: number;
  categoryName: string;
}

export interface CategoriesResponse {
  isSuccess: boolean;
  data: Category[];
  message: string;
  exception: string | null;
}

export interface CategoryResponse {
  isSuccess: boolean;
  data: Category;
  message: string;
  exception: string | null;
}

export interface CreateCategoryRequest {
  categoryName: string;
}

export const categoriesService = {
  // Get all categories
  getAll: async (): Promise<CategoriesResponse> => {
    const response = await api.get<CategoriesResponse>('/categories');
    return response.data;
  },

  // Create new category
  create: async (categoryData: CreateCategoryRequest): Promise<CategoryResponse> => {
    const response = await api.post<CategoryResponse>('/categories', categoryData);
    return response.data;
  },

  // Update category
  update: async (id: number, categoryData: CreateCategoryRequest): Promise<CategoryResponse> => {
    const response = await api.put<CategoryResponse>(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category
  delete: async (id: number): Promise<CategoryResponse> => {
    const response = await api.delete<CategoryResponse>(`/categories/${id}`);
    return response.data;
  },
};