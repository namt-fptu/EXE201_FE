"use client";
import React, { useState, useEffect, useCallback } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import SingleItem from "./SingleItem";
import { getWishlistPosts, addToFavorites } from "@/services/favorites";
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
  // Add other properties as needed based on your API response
}

export const Wishlist = () => {
  const { user, isAuthenticated } = useUserStore();
  const [wishlistItems, setWishlistItems] = useState<WishlistPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 12,
  });

  // Function to fetch wishlist items (extracted for reuse)
  const fetchWishlistItems = useCallback(async () => {
    if (!isAuthenticated() || !user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getWishlistPosts(
        user.id,
        pagination.currentPage,
        pagination.pageSize
      );

      // Debug: Log the actual response structure
      console.log("Wishlist API response:", response);
      console.log("Response data:", response?.data);

      // Handle different possible response structures
      let items = [];
      let paginationData = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        pageSize: 12,
      };

      if (response?.success && response?.data) {
        // Check various possible nested structures
        if (response.data.items) {
          items = response.data.items;
        } else if (response.data.data && response.data.data.items) {
          items = response.data.data.items;
          paginationData = {
            currentPage: response.data.data.pageNumber || 1,
            totalPages: response.data.data.totalPages || 1,
            totalItems: response.data.data.totalCount || 0,
            pageSize: response.data.data.pageSize || 12,
          };
        } else if (Array.isArray(response.data)) {
          items = response.data;
        }

        // Update pagination data
        paginationData = {
          currentPage:
            response.data.pageNumber || response.data.data?.pageNumber || 1,
          totalPages:
            response.data.totalPages || response.data.data?.totalPages || 1,
          totalItems:
            response.data.totalCount ||
            response.data.data?.totalCount ||
            items.length,
          pageSize:
            response.data.pageSize || response.data.data?.pageSize || 12,
        };
      } else if (response?.data) {
        // Direct data response
        if (Array.isArray(response.data)) {
          items = response.data;
        } else if (response.data.items) {
          items = response.data.items;
        }
      }

      console.log("Processed items:", items);
      console.log("Pagination data:", paginationData);

      // Debug: Log first item structure to understand the ID fields
      if (items.length > 0) {
        console.log("First item structure:", items[0]);
        console.log("Available ID fields:", {
          id: items[0].id,
          postId: items[0].postId,
          favoriteId: items[0].favoriteId,
          userId: items[0].userId,
        });
      }

      setWishlistItems(items);
      setPagination(paginationData);
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
      toast.error("Failed to load wishlist items");
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAuthenticated, pagination.currentPage, pagination.pageSize]);

  // Fetch wishlist items when component mounts or dependencies change
  useEffect(() => {
    fetchWishlistItems();
  }, [fetchWishlistItems]);

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
              <div className="text-center py-20">
                <h3 className="text-xl font-medium text-dark mb-2">
                  Your wishlist is empty
                </h3>
                <p className="text-gray-500 mb-4">
                  Start adding items to your wishlist!
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Debug info: User ID: {user?.id}</div>
                  <div>Total Items: {pagination.totalItems}</div>
                  <div>Current Page: {pagination.currentPage}</div>
                  <div>Check the browser console for API response details</div>
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
                      onRemove={() => {
                        // Refresh the wishlist after removing an item
                        fetchWishlistItems();
                      }}
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
