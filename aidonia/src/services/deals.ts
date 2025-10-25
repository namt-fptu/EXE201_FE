import api from "@/services/axios";

// Types based on backend models
export interface CreateDealRequest {
  postId: number;
  sellerId: number;
  buyerId: number;
  buyerAddressId: number;
}

export interface UpdateDealStatusRequest {
  status: number; // 1: Confirmed, 2: Delivering, 3: Delivered
}

// Backend returns PascalCase, so we need to handle both formats
export interface DealResponse {
  Id?: number;
  id?: number;
  PostId?: number;
  postId?: number;
  PostTitle?: string;
  postTitle?: string;
  PostPrice?: number;
  postPrice?: number;
  SellerId?: number;
  sellerId?: number;
  SellerName?: string;
  sellerName?: string;
  SellerPhoneNumber?: string;
  sellerPhoneNumber?: string;
  BuyerId?: number;
  buyerId?: number;
  BuyerName?: string;
  buyerName?: string;
  BuyerPhoneNumber?: string;
  buyerPhoneNumber?: string;
  BuyerAddressId?: number;
  buyerAddressId?: number;
  Province?: string;
  province?: string;
  District?: string;
  district?: string;
  Ward?: string;
  ward?: string;
  Street?: string;
  street?: string;
  HouseNumber?: string;
  houseNumber?: string;
  DealDate?: string;
  dealDate?: string;
  Status?: string;
  status?: string;
  ConfirmImage?: string;
  confirmImage?: string;
  // Actual backend response uses these generic names:
  UserName?: string;
  userName?: string;
  PhoneNumber?: string;
  phoneNumber?: string;
}

export interface Deal {
  id: number;
  postId: number;
  postTitle: string;
  postPrice: number;
  postImage?: string; // First image from post
  sellerId: number;
  sellerName: string;
  sellerPhoneNumber?: string;
  buyerId: number;
  buyerName: string;
  buyerPhoneNumber?: string;
  buyerAddressId: number;
  province: string;
  district: string;
  ward: string;
  street: string;
  houseNumber: string;
  dealDate: string;
  status: string; // "Pending" | "Confirmed" | "Delivering" | "Delivered" | "Completed"
  confirmImage?: string;
  isBuyerView?: boolean; // To know if this is from buyer or seller perspective
}

// Helper function to normalize deal data from backend
export const normalizeDeal = (
  dealData: DealResponse,
  isBuyerView: boolean = true
): Deal => {
  // Backend returns userName as the opposite party's name
  // For buyer view: userName = seller's name
  // For seller view: userName = buyer's name
  const userName = dealData.UserName ?? dealData.userName ?? "";
  const phoneNumber = dealData.PhoneNumber ?? dealData.phoneNumber;

  return {
    id: dealData.Id ?? dealData.id ?? 0,
    postId: dealData.PostId ?? dealData.postId ?? 0,
    postTitle: dealData.PostTitle ?? dealData.postTitle ?? "",
    postPrice: dealData.PostPrice ?? dealData.postPrice ?? 0,
    sellerId: isBuyerView ? 0 : (dealData.SellerId ?? dealData.sellerId ?? 0),
    sellerName: isBuyerView
      ? userName
      : (dealData.SellerName ?? dealData.sellerName ?? ""),
    sellerPhoneNumber: isBuyerView
      ? phoneNumber
      : (dealData.SellerPhoneNumber ?? dealData.sellerPhoneNumber),
    buyerId: isBuyerView ? (dealData.BuyerId ?? dealData.buyerId ?? 0) : 0,
    buyerName: isBuyerView
      ? (dealData.BuyerName ?? dealData.buyerName ?? "")
      : userName,
    buyerPhoneNumber: isBuyerView
      ? (dealData.BuyerPhoneNumber ?? dealData.buyerPhoneNumber)
      : phoneNumber,
    buyerAddressId: dealData.BuyerAddressId ?? dealData.buyerAddressId ?? 0,
    province: dealData.Province ?? dealData.province ?? "",
    district: dealData.District ?? dealData.district ?? "",
    ward: dealData.Ward ?? dealData.ward ?? "",
    street: dealData.Street ?? dealData.street ?? "",
    houseNumber: dealData.HouseNumber ?? dealData.houseNumber ?? "",
    dealDate: dealData.DealDate ?? dealData.dealDate ?? "",
    status: dealData.Status ?? dealData.status ?? "Pending",
    confirmImage: dealData.ConfirmImage ?? dealData.confirmImage,
    isBuyerView,
  };
};

// API Response wrapper
interface ApiResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

class DealService {
  /**
   * Create a new deal (buyer creates order)
   */
  async createDeal(dealData: CreateDealRequest): Promise<ApiResponse<Deal>> {
    try {
      console.log("🔄 DealService: Creating deal:", dealData);
      const response = await api.post("deals", dealData);
      console.log("✅ DealService: Deal created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ DealService: Error creating deal:", error);
      throw error;
    }
  }

  /**
   * Update deal status
   * Status: 1 (Confirmed), 2 (Delivering), 3 (Delivered)
   */
  async updateDealStatus(
    dealId: number,
    status: number
  ): Promise<ApiResponse<Deal>> {
    try {
      console.log("🔄 DealService: Updating deal status:", { dealId, status });
      const response = await api.put(`deals/status/${dealId}`, { status });
      console.log("✅ DealService: Deal status updated:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ DealService: Error updating deal status:", error);
      throw error;
    }
  }

  /**
   * Confirm deal completion with image (buyer uploads proof after delivery)
   */
  async confirmDeal(
    dealId: number,
    confirmImage: string
  ): Promise<ApiResponse<Deal>> {
    try {
      console.log("🔄 DealService: Confirming deal completion:", { dealId });
      const response = await api.put(`deals/confirm/${dealId}`, {
        confirmImage,
      });
      console.log(
        "✅ DealService: Deal confirmed successfully:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("❌ DealService: Error confirming deal:", error);
      throw error;
    }
  }

  /**
   * Get deal by conversation (postId, buyerId, sellerId)
   */
  async getDealByConversation(
    postId: number,
    buyerId: number,
    sellerId: number
  ): Promise<ApiResponse<Deal | null>> {
    try {
      console.log("🔄 DealService: Getting deal by conversation:", {
        postId,
        buyerId,
        sellerId,
      });

      // Get buyer's deals and find matching one
      const response = await api.get(
        `deals/buyer/${buyerId}?pageNumber=1&pageSize=100`
      );

      if (response.data.isSuccess && response.data.data?.items) {
        const deal = response.data.data.items.find(
          (d: Deal) => d.postId === postId && d.sellerId === sellerId
        );

        if (deal) {
          console.log("✅ DealService: Found deal:", deal);
          return {
            isSuccess: true,
            message: "Deal found",
            data: deal,
          };
        }
      }

      console.log("ℹ️ DealService: No deal found");
      return {
        isSuccess: true,
        message: "No deal found",
        data: null,
      };
    } catch (error) {
      console.error("❌ DealService: Error getting deal:", error);
      // Return null instead of throwing to prevent chat from breaking
      return {
        isSuccess: true,
        message: "No deal found",
        data: null,
      };
    }
  }

  /**
   * Get deals by buyer ID
   */
  async getDealsByBuyerId(
    buyerId: number,
    pageNumber = 1,
    pageSize = 10
  ): Promise<ApiResponse<{ items: Deal[]; totalCount: number }>> {
    try {
      const response = await api.get(
        `deals/buyer/${buyerId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );

      console.log("🔍 Raw API response for buyer deals:", response.data);

      // Normalize the deals data
      if (response.data.isSuccess && response.data.data?.items) {
        const normalizedItems = response.data.data.items.map(
          (item: DealResponse) => {
            console.log("🔍 Raw deal item from API:", item);
            console.log("🔍 Raw deal item keys:", Object.keys(item));
            const normalized = normalizeDeal(item, true); // true = buyer view
            console.log("🔄 Normalized deal:", normalized);
            return normalized;
          }
        );

        return {
          ...response.data,
          data: {
            items: normalizedItems,
            totalCount: response.data.data.totalCount || 0,
          },
        };
      }

      return response.data;
    } catch (error) {
      console.error("❌ DealService: Error getting buyer deals:", error);
      throw error;
    }
  }

  /**
   * Get deals by seller ID
   */
  async getDealsBySellerId(
    sellerId: number,
    pageNumber = 1,
    pageSize = 10
  ): Promise<ApiResponse<{ items: Deal[]; totalCount: number }>> {
    try {
      const response = await api.get(
        `deals/seller/${sellerId}?pageNumber=${pageNumber}&pageSize=${pageSize}`
      );

      console.log("🔍 Raw API response for seller deals:", response.data);

      // Normalize the deals data
      if (response.data.isSuccess && response.data.data?.items) {
        const normalizedItems = response.data.data.items.map(
          (item: DealResponse) => {
            console.log("🔍 Raw deal item from API:", item);
            console.log("🔍 Raw deal item keys:", Object.keys(item));
            const normalized = normalizeDeal(item, false); // false = seller view
            console.log("🔄 Normalized deal:", normalized);
            return normalized;
          }
        );

        return {
          ...response.data,
          data: {
            items: normalizedItems,
            totalCount: response.data.data.totalCount || 0,
          },
        };
      }

      return response.data;
    } catch (error) {
      console.error("❌ DealService: Error getting seller deals:", error);
      throw error;
    }
  }
}

const dealService = new DealService();
export default dealService;
