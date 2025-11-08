import api from './axios';

// Response interfaces
export interface StatisticsResponse<T> {
  isSuccess: boolean;
  data: T;
  message: string;
  exception?: string | null;
}

// Revenue data interfaces
export interface RevenueByMonth {
  month: number;
  year: number;
  totalRevenue: number;
}

export interface RevenueByYear {
  year: number;
  totalRevenue: number;
}

// Completed payment interface
export interface CompletedPayment {
  id: number;
  userId: number;
  username: string;
  userEmail: string;
  packageId: number;
  packageName: string;
  amount: number;
  paidAt: string;
  status: string;
}

export const statisticsService = {
  // Get total posts
  getTotalPosts: async (): Promise<StatisticsResponse<number>> => {
    try {
      const response = await api.get<StatisticsResponse<number>>('/statistical/total-posts');
      return response.data;
    } catch (error) {
      console.error('Error fetching total posts:', error);
      return {
        isSuccess: false,
        data: 0,
        message: 'Failed to fetch total posts'
      };
    }
  },

  // Get total active posts
  getTotalActivePosts: async (): Promise<StatisticsResponse<number>> => {
    try {
      const response = await api.get<StatisticsResponse<number>>('/statistical/total-active-posts');
      return response.data;
    } catch (error) {
      console.error('Error fetching total active posts:', error);
      return {
        isSuccess: false,
        data: 0,
        message: 'Failed to fetch total active posts'
      };
    }
  },

  // Get total inactive posts
  getTotalInactivePosts: async (): Promise<StatisticsResponse<number>> => {
    try {
      const response = await api.get<StatisticsResponse<number>>('/statistical/total-inactive-posts');
      return response.data;
    } catch (error) {
      console.error('Error fetching total inactive posts:', error);
      return {
        isSuccess: false,
        data: 0,
        message: 'Failed to fetch total inactive posts'
      };
    }
  },

  // Get total payments
  getTotalPayments: async (): Promise<StatisticsResponse<number>> => {
    try {
      const response = await api.get<StatisticsResponse<number>>('/statistical/total-payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching total payments:', error);
      return {
        isSuccess: false,
        data: 0,
        message: 'Failed to fetch total payments'
      };
    }
  },

  // Get total revenue
  getTotalRevenue: async (): Promise<StatisticsResponse<number>> => {
    try {
      const response = await api.get<StatisticsResponse<number>>('/statistical/total-revenue');
      return response.data;
    } catch (error) {
      console.error('Error fetching total revenue:', error);
      return {
        isSuccess: false,
        data: 0,
        message: 'Failed to fetch total revenue'
      };
    }
  },

  // Get revenue by month
  getRevenueByMonth: async (month: number, year: number): Promise<StatisticsResponse<RevenueByMonth>> => {
    try {
      const response = await api.get<StatisticsResponse<RevenueByMonth>>(
        '/statistical/revenue-by-month',
        {
          params: { month, year }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue by month:', error);
      return {
        isSuccess: false,
        data: {
          month,
          year,
          totalRevenue: 0
        },
        message: 'Failed to fetch revenue by month'
      };
    }
  },

  // Get revenue by year
  getRevenueByYear: async (year: number): Promise<StatisticsResponse<RevenueByYear>> => {
    try {
      const response = await api.get<StatisticsResponse<RevenueByYear>>(
        '/statistical/revenue-by-year',
        {
          params: { year }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue by year:', error);
      return {
        isSuccess: false,
        data: {
          year,
          totalRevenue: 0
        },
        message: 'Failed to fetch revenue by year'
      };
    }
  },

  // Get completed payments
  getCompletedPayments: async (): Promise<StatisticsResponse<CompletedPayment[]>> => {
    try {
      const response = await api.get<StatisticsResponse<CompletedPayment[]>>('/statistical/completed-payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching completed payments:', error);
      return {
        isSuccess: false,
        data: [],
        message: 'Failed to fetch completed payments'
      };
    }
  }
};