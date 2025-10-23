// Gợi ý tên file: excelService.ts
import api from './axios';

/**
 * Service để xử lý các API xuất file Excel.
 * Các hàm này sẽ trả về một đối tượng Blob nếu thành công,
 * hoặc null nếu có lỗi xảy ra.
 */
export const excelService = {
  // GET /api/excel/reports/overall-statistics
  getOverallStatisticsReport: async (): Promise<Blob | null> => {
    try {
      const response = await api.get('/excel/reports/overall-statistics', {
        responseType: 'blob', // Yêu cầu axios trả về dữ liệu dạng Blob
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching overall statistics report:', error);
      return null;
    }
  },

  // GET /api/excel/reports/user-statistics
  getUserStatisticsReport: async (): Promise<Blob | null> => {
    try {
      const response = await api.get('/excel/reports/user-statistics', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user statistics report:', error);
      return null;
    }
  },

  // GET /api/excel/reports/post-statistics
  getPostStatisticsReport: async (): Promise<Blob | null> => {
    try {
      const response = await api.get('/excel/reports/post-statistics', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching post statistics report:', error);
      return null;
    }
  },

  // GET /api/excel/reports/payment-statistics
  getPaymentStatisticsReport: async (): Promise<Blob | null> => {
    try {
      const response = await api.get('/excel/reports/payment-statistics', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment statistics report:', error);
      return null;
    }
  },

  // GET /api/excel/exports/users
  exportUsers: async (): Promise<Blob | null> => {
    try {
      const response = await api.get('/excel/exports/users', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting users:', error);
      return null;
    }
  },

  // GET /api/excel/exports/posts
  exportPosts: async (): Promise<Blob | null> => {
    try {
      const response = await api.get('/excel/exports/posts', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting posts:', error);
      return null;
    }
  },

  // GET /api/excel/exports/payments
  exportPayments: async (): Promise<Blob | null> => {
    try {
      const response = await api.get('/excel/exports/payments', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting payments:', error);
      return null;
    }
  },

  // GET /api/excel/reports/comprehensive
  getComprehensiveReport: async (): Promise<Blob | null> => {
    try {
      const response = await api.get('/excel/reports/comprehensive', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comprehensive report:', error);
      return null;
    }
  },

  // GET /api/excel/reports/monthly-revenue/{year}
  getMonthlyRevenueReport: async (year: number): Promise<Blob | null> => {
    try {
      const response = await api.get(
        `/excel/reports/monthly-revenue/${year}`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly revenue report:', error);
      return null;
    }
  },

  // GET /api/excel/test
  getTestExcel: async (): Promise<Blob | null> => {
    try {
      const response = await api.get('/excel/test', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching test excel:', error);
      return null;
    }
  },

  // GET /api/excel/health
  getExcelHealth: async (): Promise<Blob | null> => {
    try {
      // Endpoint 'health' có thể trả về JSON, nhưng để nhất quán
      // với các API 'excel' khác, chúng ta có thể giả định nó
      // cũng có thể là file. Nếu nó trả về JSON, bạn nên
      // đổi responseType: 'json' hoặc bỏ nó đi.
      const response = await api.get('/excel/health', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching excel health:', error);
      return null;
    }
  },
};