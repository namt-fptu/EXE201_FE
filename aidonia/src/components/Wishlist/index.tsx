"use client";
import React, { useState, useEffect, useCallback } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SingleItem from "./SingleItem";
import { getUserFavoritesRaw, addToFavorites } from "@/services/favorites";
import useUserStore from "@/redux/userStore";
import { toast } from "react-hot-toast";

interface WishlistPost {
  id: number; // Favorites table ID (for deletion)
  postId?: number; // Post ID
  userId?: number; // User ID
  title: string;
  description: string;
  price: number;
  image: string;
  imageUrl?: string; // Firebase image URL
  category?: string;
  categoryName?: string;
  status: string;
  favoriteId?: number; // Backup field name
  // Seller information
  seller?: {
    id?: number;
    name?: string;
    phoneNumber?: string;
    avataImage?: string;
    avatarImage?: string;
  };
  sellerPhoneNumber?: string;
  sellerName?: string;
  sellerId?: number;
  postImages?: Array<string | { url: string }>;
  imgs?: {
    thumbnails?: string[];
  };
  // Add other properties as needed based on your API response
}

export const Wishlist = () => {
  const { user, isAuthenticated } = useUserStore();
  const [wishlistItems, setWishlistItems] = useState<WishlistPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 12,
  });

  // Function to trigger a refresh
  const refreshWishlist = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Function to fetch wishlist items (extracted for reuse)
  const fetchWishlistItems = useCallback(async () => {
    if (!isAuthenticated() || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Use the GET /api/favorites/user/{userId} endpoint from Swagger
      const response = await getUserFavoritesRaw(user.id);

      // Debug: Log the actual response structure
      console.log("Wishlist API response:", response);
      console.log("Response data:", response?.data);

      // The GET /api/favorites/user/{userId} endpoint returns a simple list
      let items = [];

      if (response?.success && response?.data) {
        // Response format: { success: true, data: [...], message: "..." }
        items = Array.isArray(response.data) ? response.data : [];
      } else if (response?.data) {
        // Direct data array
        items = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response)) {
        items = response;
      }

      // Since this endpoint doesn't support pagination, show all items
      const paginationData = {
        currentPage: 1,
        totalPages: 1,
        totalItems: items.length,
        pageSize: items.length || 12,
      };

      console.log("Processed items:", items);
      console.log("Pagination data:", paginationData);

      // Debug: Log first item structure to understand the ID fields
      if (items.length > 0) {
        console.log("First item structure:", items[0]);
        console.log("First item ALL keys:", Object.keys(items[0]));
        console.log("Available ID fields:", {
          id: items[0].id,
          Id: items[0].Id, // Check if backend returns capitalized Id
          postId: items[0].postId,
          favoriteId: items[0].favoriteId,
          userId: items[0].userId,
        });
      }

      // Map items to ensure id field is properly set (backend might return capitalized Id)
      const mappedItems = items.map((item: WishlistPost) => ({
        ...item,
        id: item.id || (item as unknown as { Id: number }).Id, // Use lowercase id, fallback to capitalized Id
        favoriteId: item.id || (item as unknown as { Id: number }).Id, // Also set favoriteId for clarity
      }));

      console.log("Mapped items with id:", mappedItems);

      setWishlistItems(mappedItems);
      setPagination(paginationData);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number } };
      console.error("Error fetching wishlist items:", error);

      // If it's a 404 (no favorites found), just show empty list instead of error
      if (err?.response?.status === 404) {
        console.log("No favorites found - showing empty list");
        setWishlistItems([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          pageSize: 12,
        });
      } else {
        toast.error("Failed to load wishlist items");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated]); // Removed pagination dependencies since endpoint doesn't support pagination

  // Fetch wishlist items when component mounts or dependencies change
  useEffect(() => {
    fetchWishlistItems();
  }, [fetchWishlistItems, refreshTrigger]); // Add refreshTrigger to dependencies

  // Handle page change
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // Test adding a favorite for debugging
  const handleTestAddFavorite = async () => {
    if (!user?.id) return;

    try {
      toast.loading("Adding test favorite...");
      await addToFavorites(user.id, 1); // Test with postId 1
      toast.dismiss();
      toast.success("Test favorite added! Refreshing list...");

      // Refresh the list
      window.location.reload();
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to add test favorite");
      console.error("Test add favorite error:", error);
    }
  };

  // Clear all wishlist items
  const handleClearWishlist = () => {
    // This would need to call an API to clear all favorites
    // For now, just show a message
    toast.success("Clear wishlist functionality coming soon");
  };

  if (!isAuthenticated()) {
    return (
      <>
        <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center py-20">
              <h2 className="text-2xl font-medium text-dark mb-4">
                Please Sign In
              </h2>
              <p className="text-gray-500">
                You need to sign in to view your wishlist.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title={"Wishlist"} pages={["Wishlist"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">
              Your Wishlist{" "}
              {pagination.totalItems > 0 && `(${pagination.totalItems} items)`}
            </h2>
            <div className="flex gap-3">
              <button
                onClick={handleTestAddFavorite}
                className="text-green-600 hover:text-green-700 transition-colors text-sm"
              >
                Test Add Favorite
              </button>
              <button
                onClick={() => window.location.reload()}
                className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                Refresh
              </button>
              <button
                onClick={handleClearWishlist}
                className="text-blue hover:text-blue-600 transition-colors"
              >
                Clear Wishlist Cart
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[10px] shadow-1">
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin h-8 w-8 border-4 border-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500">Loading your wishlist...</p>
              </div>
            ) : wishlistItems.length === 0 ? (
              <div className="text-center py-20 px-4">
                <div className="max-w-md mx-auto">
                  <svg
                    className="w-24 h-24 mx-auto mb-6 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  <h3 className="text-2xl font-semibold text-dark mb-3">
                    Your wishlist is empty
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start adding items to your wishlist by clicking the heart
                    icon on products you love!
                  </p>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="inline-block bg-blue text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* <!-- table header --> */}
                  <div className="flex items-center py-5.5 px-10">
                    <div className="min-w-[83px]"></div>
                    <div className="min-w-[387px]">
                      <p className="text-dark">Item</p>
                    </div>

                    <div className="min-w-[205px]">
                      <p className="text-dark">Price</p>
                    </div>

                    <div className="min-w-[265px]">
                      <p className="text-dark">Category</p>
                    </div>

                    <div className="min-w-[150px]">
                      <p className="text-dark text-right">Contact</p>
                    </div>
                  </div>

                  {/* <!-- wish item --> */}
                  {wishlistItems.map((item, key) => (
                    <SingleItem
                      item={item}
                      key={key}
                      onRemove={refreshWishlist}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      page === pagination.currentPage
                        ? "bg-blue text-white"
                        : "bg-white text-dark border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
