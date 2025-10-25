"use client";

import React, { useState, useEffect } from "react";
import dealService, { Deal } from "@/services/deals";
import { postsService } from "@/services/postsServiceWithAxios";
import useUserStore from "@/redux/userStore";
import { getUserIdAsNumber } from "@/utils/id-helpers";
import { toast } from "sonner";
import { uploadImage } from "@/services/firebaseUtils";
import {
  ShoppingCart,
  Package,
  CheckCircle,
  Upload,
  X,
  Image as ImageIcon,
  Clock,
  Truck,
  Check,
} from "lucide-react";

export default function DealTab() {
  const { user } = useUserStore();
  const [activeArea, setActiveArea] = useState<"buying" | "selling">("buying");
  const [buyingDeals, setBuyingDeals] = useState<Deal[]>([]);
  const [sellingDeals, setSellingDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUpdatingDeal, setIsUpdatingDeal] = useState(false);

  // Image upload states
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  // Fetch deals on mount and when area changes
  useEffect(() => {
    if (user?.id) {
      fetchDeals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, activeArea]);

  // Function to fetch post details and enrich deal data
  const enrichDealWithPostData = async (deal: Deal): Promise<Deal> => {
    try {
      const postResponse = await postsService.getById(deal.postId);
      if (postResponse.isSuccess && postResponse.data) {
        const post = postResponse.data;
        // Get first image URL from postImages array
        const firstImageUrl =
          post.postImages && post.postImages.length > 0
            ? post.postImages[0].url
            : undefined;

        console.log(`🖼️ Post ${deal.postId}:`, {
          title: post.title,
          price: post.price,
          image: firstImageUrl,
          createdAt: post.createdAt,
        });

        return {
          ...deal,
          postTitle: post.title || deal.postTitle,
          postPrice: post.price || deal.postPrice,
          postImage: firstImageUrl,
        };
      }
    } catch (error) {
      console.error(`Error fetching post ${deal.postId}:`, error);
    }
    return deal;
  };

  const fetchDeals = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const userId = getUserIdAsNumber(user.id);

      if (activeArea === "buying") {
        const result = await dealService.getDealsByBuyerId(userId);
        console.log("📦 Buying deals result:", result);
        if (result.isSuccess && result.data) {
          const deals = result.data.items || [];
          console.log("📦 Buying deals items:", deals);
          if (deals.length > 0) {
            console.log("📦 First deal structure:", deals[0]);
            console.log("📦 Deal keys:", Object.keys(deals[0]));
          }

          // Enrich deals with post images
          const enrichedDeals = await Promise.all(
            deals.map((deal) => enrichDealWithPostData(deal))
          );

          setBuyingDeals(enrichedDeals);
        }
      } else {
        const result = await dealService.getDealsBySellerId(userId);
        console.log("📦 Selling deals result:", result);
        if (result.isSuccess && result.data) {
          const deals = result.data.items || [];
          console.log("📦 Selling deals items:", deals);
          if (deals.length > 0) {
            console.log("📦 First deal structure:", deals[0]);
            console.log("📦 Deal keys:", Object.keys(deals[0]));
          }

          // Enrich deals with post images
          const enrichedDeals = await Promise.all(
            deals.map((deal) => enrichDealWithPostData(deal))
          );

          setSellingDeals(enrichedDeals);
        }
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  // Handle status update based on role
  const handleConfirmAction = async (deal: Deal) => {
    if (!user?.id || isUpdatingDeal) return;

    // Use the activeArea to determine if user is buyer or seller
    const isBuyer = activeArea === "buying";
    const isSeller = activeArea === "selling";

    try {
      setIsUpdatingDeal(true);

      // Role-based status transitions
      if (deal.status === "Pending" && isBuyer) {
        // Step 1: Buyer confirms order (Pending → Confirmed)
        const result = await dealService.updateDealStatus(deal.id, 1);
        if (result.isSuccess && result.data) {
          toast.success("Order confirmed successfully!");
          await fetchDeals();
        } else {
          toast.error(result.message || "Failed to confirm order");
        }
      } else if (deal.status === "Confirmed" && isSeller) {
        // Step 2: Seller confirms delivery (Confirmed → Delivering)
        const result = await dealService.updateDealStatus(deal.id, 2);
        if (result.isSuccess && result.data) {
          toast.success("Delivery confirmed successfully!");
          await fetchDeals();
        } else {
          toast.error(result.message || "Failed to confirm delivery");
        }
      } else if (deal.status === "Delivering" && isSeller) {
        // Step 3: Seller marks as delivered (Delivering → Delivered)
        const result = await dealService.updateDealStatus(deal.id, 3);
        if (result.isSuccess && result.data) {
          toast.success("Marked as delivered successfully!");
          await fetchDeals();
        } else {
          toast.error(result.message || "Failed to mark as delivered");
        }
      } else if (deal.status === "Delivered" && isBuyer) {
        // Step 4: Buyer uploads proof and completes deal (Delivered → Completed)
        setSelectedDeal(deal);
        setShowImageUploadModal(true);
      } else {
        // Wrong role or invalid status
        if (!isBuyer && !isSeller) {
          toast.error("You are not part of this deal");
        } else if (deal.status === "Pending" && isSeller) {
          toast.error("Only the buyer can confirm the order");
        } else if (deal.status === "Confirmed" && isBuyer) {
          toast.error("Only the seller can start delivery");
        } else if (deal.status === "Delivering" && isBuyer) {
          toast.error("Only the seller can mark as delivered");
        } else if (deal.status === "Delivered" && isSeller) {
          toast.error("Only the buyer can complete the deal");
        } else {
          toast.error("Invalid action for current deal status");
        }
      }
    } catch (error) {
      console.error("Error updating deal status:", error);
      let errorMessage = "Failed to update deal status";
      if (error && typeof error === "object") {
        const err = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        errorMessage =
          err.response?.data?.message || err.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setIsUpdatingDeal(false);
    }
  };

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle deal completion with image upload
  const handleCompleteDeal = async () => {
    if (!selectedDeal || !selectedImage || !user?.id) return;

    try {
      setUploadingImage(true);

      // Upload image to Firebase Storage
      console.log("📤 Uploading proof image to Firebase...");
      const userId = getUserIdAsNumber(user.id).toString();
      const imageUrl = await uploadImage(
        selectedImage,
        "deal-proofs", // folder name
        userId
      );
      console.log("✅ Image uploaded successfully:", imageUrl);

      // Call confirm endpoint with Firebase image URL
      const result = await dealService.confirmDeal(selectedDeal.id, imageUrl);

      if (result.isSuccess && result.data) {
        toast.success("Deal completed successfully!");

        // Close modal and reset states
        setShowImageUploadModal(false);
        setSelectedImage(null);
        setImagePreview("");
        setSelectedDeal(null);

        // Refresh deals list
        await fetchDeals();
      } else {
        toast.error(result.message || "Failed to complete deal");
      }
    } catch (error) {
      console.error("Error completing deal:", error);
      let errorMessage = "Failed to complete deal";
      if (error && typeof error === "object") {
        const err = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        errorMessage =
          err.response?.data?.message || err.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setUploadingImage(false);
    }
  };

  const closeImageModal = () => {
    setShowImageUploadModal(false);
    setSelectedImage(null);
    setImagePreview("");
    setSelectedDeal(null);
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock size={20} className="text-yellow-600" />;
      case "Confirmed":
        return <CheckCircle size={20} className="text-blue-600" />;
      case "Delivering":
        return <Truck size={20} className="text-orange-600" />;
      case "Delivered":
        return <Package size={20} className="text-purple-600" />;
      case "Completed":
        return <Check size={20} className="text-green-600" />;
      default:
        return <Package size={20} className="text-gray-600" />;
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Delivering":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Delivered":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Get action button for deal
  const getActionButton = (deal: Deal) => {
    if (!user?.id) return null;

    // Use the activeArea to determine if user is buyer or seller
    const isBuyer = activeArea === "buying";
    const isSeller = activeArea === "selling";

    console.log(
      `🎯 Deal ${deal.postId} - Status: ${deal.status}, isBuyer: ${isBuyer}, isSeller: ${isSeller}, activeArea: ${activeArea}, dealId: ${deal.id}`
    );

    if (deal.status === "Completed") {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <CheckCircle size={16} />
          Completed
        </div>
      );
    }

    // Buyer: Confirm Order (Pending → Confirmed)
    if (deal.status === "Pending" && isBuyer) {
      return (
        <button
          onClick={() => handleConfirmAction(deal)}
          disabled={isUpdatingDeal}
          className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          <CheckCircle size={16} />
          Confirm Order
        </button>
      );
    }

    // Seller: Confirm Delivery (Confirmed → Delivering)
    if (deal.status === "Confirmed" && isSeller) {
      console.log("✅ Rendering Start Delivery button for deal", deal.postId);
      return (
        <button
          onClick={() => handleConfirmAction(deal)}
          disabled={isUpdatingDeal}
          className="px-4 py-2 bg-orange text-white rounded-lg hover:bg-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Truck size={16} />
          Start Delivery
        </button>
      );
    }

    // Seller: Mark as Delivered (Delivering → Delivered)
    if (deal.status === "Delivering" && isSeller) {
      console.log(
        "✅ Rendering Mark as Delivered button for deal",
        deal.postId
      );
      return (
        <button
          onClick={() => handleConfirmAction(deal)}
          disabled={isUpdatingDeal}
          className="px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Package size={16} />
          Mark as Delivered
        </button>
      );
    }

    // Buyer: Complete Deal (Delivered → Completed)
    if (deal.status === "Delivered" && isBuyer) {
      return (
        <button
          onClick={() => handleConfirmAction(deal)}
          disabled={isUpdatingDeal}
          className="px-4 py-2 bg-green text-white rounded-lg hover:bg-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
        >
          <Upload size={16} />
          Complete Deal
        </button>
      );
    }

    // Waiting message for the other party
    if (deal.status === "Pending" && isSeller) {
      return (
        <div className="text-sm text-gray-500">
          ⏳ Waiting for buyer confirmation
        </div>
      );
    }

    if (deal.status === "Confirmed" && isBuyer) {
      console.log(
        "⏳ Showing waiting message for buyer on Confirmed deal",
        deal.postId
      );
      return (
        <div className="text-sm text-gray-500">
          ⏳ Waiting for seller to start delivery
        </div>
      );
    }

    if (deal.status === "Delivering" && isBuyer) {
      return (
        <div className="text-sm text-gray-500">
          ⏳ Waiting for seller to mark as delivered
        </div>
      );
    }

    if (deal.status === "Delivered" && isSeller) {
      console.log(
        "⏳ Showing waiting message for seller on Delivered deal",
        deal.postId
      );
      return (
        <div className="text-sm text-gray-500">
          ⏳ Waiting for buyer completion
        </div>
      );
    }

    console.log("❌ No button condition matched for deal", deal.postId);
    return null;
  };

  const currentDeals = activeArea === "buying" ? buyingDeals : sellingDeals;

  return (
    <div className="space-y-6">
      {/* Area Toggle */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveArea("buying")}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeArea === "buying"
              ? "text-blue border-b-2 border-blue"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            Buying
          </div>
        </button>
        <button
          onClick={() => setActiveArea("selling")}
          className={`px-6 py-3 font-medium transition-colors relative ${
            activeArea === "selling"
              ? "text-blue border-b-2 border-blue"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Package size={20} />
            Selling
          </div>
        </button>
      </div>

      {/* Deals List */}
      <div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
          </div>
        ) : currentDeals.length === 0 ? (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">
              No {activeArea === "buying" ? "purchases" : "sales"} found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentDeals.map((deal) => (
              <div
                key={deal.id}
                className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Post Image */}
                  {deal.postImage && (
                    <div className="flex-shrink-0">
                      <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={deal.postImage}
                          alt={deal.postTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Deal Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getStatusIcon(deal.status)}</div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {deal.postTitle || "Untitled Post"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Post #{deal.postId}
                            {deal.id > 0 && ` • Deal #${deal.id}`}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          {/* Price */}
                          <div>
                            <span className="text-gray-600">Price:</span>
                            <span className="ml-2 font-semibold text-blue">
                              {deal.postPrice?.toLocaleString("vi-VN")} ₫
                            </span>
                          </div>

                          {/* Buyer/Seller Info */}
                          {activeArea === "buying" ? (
                            <div>
                              <span className="text-gray-600">Seller:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {deal.sellerName}
                              </span>
                              {deal.sellerPhoneNumber && (
                                <span className="ml-1 text-gray-500">
                                  ({deal.sellerPhoneNumber})
                                </span>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span className="text-gray-600">Buyer:</span>
                              <span className="ml-2 font-medium text-gray-900">
                                {deal.buyerName}
                              </span>
                              {deal.buyerPhoneNumber && (
                                <span className="ml-1 text-gray-500">
                                  ({deal.buyerPhoneNumber})
                                </span>
                              )}
                            </div>
                          )}

                          {/* Delivery Address */}
                          <div className="md:col-span-2">
                            <span className="text-gray-600">
                              Delivery Address:
                            </span>
                            <p className="text-gray-900 mt-1">
                              {deal.houseNumber} {deal.street}, {deal.ward},{" "}
                              {deal.district}, {deal.province}
                            </p>
                          </div>

                          {/* Date */}
                          {deal.dealDate && (
                            <div className="md:col-span-2">
                              <span className="text-gray-600">Created:</span>
                              <span className="ml-2 text-gray-900">
                                {new Date(deal.dealDate).toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          deal.status
                        )}`}
                      >
                        {deal.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center">
                    {getActionButton(deal)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Upload Modal */}
      {showImageUploadModal && selectedDeal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Proof of Receipt
              </h3>
              <button
                onClick={closeImageModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={uploadingImage}
              >
                <X size={24} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Please upload a photo as proof that you received the item to
              complete Deal #{selectedDeal.id}.
            </p>

            {/* Image Preview */}
            {imagePreview ? (
              <div className="mb-4">
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview("");
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                  disabled={uploadingImage}
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block w-full">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue transition-colors cursor-pointer">
                    <ImageIcon
                      size={48}
                      className="mx-auto mb-2 text-gray-400"
                    />
                    <p className="text-sm text-gray-600">
                      Click to select an image
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeImageModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={uploadingImage}
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteDeal}
                disabled={!selectedImage || uploadingImage}
                className="flex-1 px-4 py-2 bg-blue text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploadingImage ? "Uploading..." : "Complete Deal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
