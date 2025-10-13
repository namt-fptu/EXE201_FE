import api from './axios';

export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalPackages: number;
  revenue: number;
}

export interface DashboardResponse {
  isSuccess: boolean;
  data: DashboardStats;
  message: string;
  exception: string | null;
}

export const dashboardService = {
  getTotalUsers: async (): Promise<{ isSuccess: boolean; data: number; message: string }> => {
    try {
      const response = await api.get<{ isSuccess: boolean; data: number; message: string }>('/users/total');
      return response.data;
    } catch (error) {
      console.error('Error fetching total users:', error);
      return {
        isSuccess: false,
        data: 0,
        message: 'Failed to fetch total users'
      };
    }
  },

  getStats: async (): Promise<DashboardResponse> => {
    try {
      const response = await api.get<DashboardResponse>('/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        isSuccess: false,
        data: {
          totalUsers: 0,
          totalPosts: 0,
          totalPackages: 0,
          revenue: 0
        },
        message: 'Failed to fetch dashboard stats',
        exception: null
      };
    }
  }
};