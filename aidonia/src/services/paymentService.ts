import api from "./axios";

// Buy package - creates payment link
export const buyPackage = async (userId: number, packageId: number) => {
  try {
    console.log("Buying package:", { userId, packageId });

    const response = await api.post("payments/buy-package", {
      userID: userId,
      packageID: packageId,
    });

    console.log("Buy package response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error buying package:", error);
    throw error;
  }
};

// Check payment status
export const checkPaymentStatus = async (orderCode: number) => {
  try {
    const response = await api.get(`payments/status/${orderCode}`);
    return response.data;
  } catch (error) {
    console.error("Error checking payment status:", error);
    throw error;
  }
};

// Get payment history
export const getPaymentHistory = async (
  userId: number,
  pageNumber: number = 1,
  pageSize: number = 10
) => {
  try {
    const response = await api.post("payments/paged", {
      userId,
      pageNumber,
      pageSize,
      searchTerm: "",
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching payment history:", error);
    throw error;
  }
};

const paymentService = {
  buyPackage,
  checkPaymentStatus,
  getPaymentHistory,
};

export default paymentService;
