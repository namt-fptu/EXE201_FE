import React, { useState } from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";

import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { removeFromFavorites } from "@/services/favorites";
import { formatVNDNumber } from "@/utils/currency";
import { getImageUrl } from "@/utils/image-helper";
import { toast } from "react-hot-toast";
import ContactSellerModal from "@/components/Common/ContactSellerModal";

import Image from "next/image";

interface WishlistItem {
  id: number; // This should be the favorites table ID for deletion
  postId?: number; // The actual post ID
  title: string;
  description?: string;
  price?: number;
  discountedPrice?: number;
  image?: string;
  imageUrl?: string;
  category?: string;
  categoryName?: string;
  favoriteId?: number; // Backup field name
  userId?: number;
  // Image data from API
  postImages?: Array<string | { url: string }>; // Support for API image format
  // Seller information
  seller?: {
    id?: number;
    name?: string;
    phoneNumber?: string;
  };
  sellerPhoneNumber?: string; // Direct field
  sellerName?: string; // Direct field
  sellerId?: number; // Direct field
  imgs?: {
    thumbnails?: string[];
  };
}

interface SingleItemProps {
  item: WishlistItem;
  onRemove?: () => void;
}

const SingleItem = ({ item, onRemove }: SingleItemProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showContactModal, setShowContactModal] = useState(false);

  const handleRemoveFromWishlist = async () => {
    try {
      toast.loading("Removing item from wishlist...");

      // Debug: Log item structure to understand ID fields
      console.log("Removing item:", item);
      console.log("Available IDs:", {
        id: item.id,
        favoriteId: item.favoriteId,
        postId: item.postId,
        userId: item.userId,
      });

      // The ID from the wishlist API response should be the favorites table ID
      const favoriteIdToDelete = item.favoriteId || item.id;

      console.log("Using favoriteId for deletion:", favoriteIdToDelete);

      if (!favoriteIdToDelete) {
        toast.dismiss();
        toast.error("Cannot remove item: Invalid favorite ID");
        return;
      }

      // Call the DELETE API to remove from favorites
      await removeFromFavorites(favoriteIdToDelete);

      // Remove from Redux store (local state) using postId if available, otherwise use id
      const itemIdForRedux = item.postId || item.id;
      dispatch(removeItemFromWishlist(itemIdForRedux));

      toast.dismiss();
      toast.success("Item removed from wishlist");

      // Call parent component's onRemove callback to refresh the list
      if (onRemove) {
        onRemove();
      }
    } catch (error) {
      toast.dismiss();
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove item from wishlist");
    }
  };

  return (
    <div className="flex items-center border-t border-gray-3 py-5 px-10">
      <div className="min-w-[83px]">
        <button
          onClick={() => handleRemoveFromWishlist()}
          aria-label="button for remove product from wishlist"
          className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
        >
          <svg
            className="fill-current"
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.19509 8.22222C8.92661 7.95374 8.49131 7.95374 8.22282 8.22222C7.95433 8.49071 7.95433 8.92601 8.22282 9.1945L10.0284 11L8.22284 12.8056C7.95435 13.074 7.95435 13.5093 8.22284 13.7778C8.49133 14.0463 8.92663 14.0463 9.19511 13.7778L11.0006 11.9723L12.8061 13.7778C13.0746 14.0463 13.5099 14.0463 13.7784 13.7778C14.0469 13.5093 14.0469 13.074 13.7784 12.8055L11.9729 11L13.7784 9.19451C14.0469 8.92603 14.0469 8.49073 13.7784 8.22224C13.5099 7.95376 13.0746 7.95376 12.8062 8.22224L11.0006 10.0278L9.19509 8.22222Z"
              fill=""
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.0007 1.14587C5.55835 1.14587 1.14648 5.55773 1.14648 11C1.14648 16.4423 5.55835 20.8542 11.0007 20.8542C16.443 20.8542 20.8548 16.4423 20.8548 11C20.8548 5.55773 16.443 1.14587 11.0007 1.14587ZM2.52148 11C2.52148 6.31713 6.31774 2.52087 11.0007 2.52087C15.6836 2.52087 19.4798 6.31713 19.4798 11C19.4798 15.683 15.6836 19.4792 11.0007 19.4792C6.31774 19.4792 2.52148 15.683 2.52148 11Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      <div className="min-w-[387px]">
        <div className="flex items-center justify-between gap-5">
          <div className="w-full flex items-center gap-5.5">
            <div className="flex items-center justify-center rounded-[5px] bg-gray-2 max-w-[80px] w-full h-17.5 overflow-hidden">
              <Image
                src={getImageUrl(item)}
                alt={item.title || "Product image"}
                width={80}
                height={70}
                className="object-cover w-full h-full"
                unoptimized={true}
                onError={(e) => {
                  console.error("Image failed to load:", getImageUrl(item));
                  // Fallback to placeholder on error
                  e.currentTarget.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='70' viewBox='0 0 80 70' fill='%23f3f4f6'%3E%3Crect width='80' height='70' fill='%23e5e7eb'/%3E%3Cpath d='M28 25h24v4H28zm0 8h16v4H28zm0 8h20v4H28z' fill='%239ca3af'/%3E%3C/svg%3E";
                }}
              />
            </div>

            <div>
              <h3 className="text-dark ease-out duration-200 hover:text-blue">
                <a href="#"> {item.title} </a>
              </h3>
              {item.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-[205px]">
        <p className="text-dark font-medium">
          {formatVNDNumber(item.price || item.discountedPrice || 0)}
        </p>
      </div>

      <div className="min-w-[265px]">
        <div className="flex items-center gap-1.5">
          <span className="px-3 py-1 bg-blue-50 text-blue rounded-full text-sm">
            {item.category || item.categoryName || "General"}
          </span>
        </div>
      </div>

      <div className="min-w-[150px] flex justify-end gap-2">
        {/* Contact Seller Button */}
        <button
          onClick={() => setShowContactModal(true)}
          className="inline-flex items-center gap-2 text-dark hover:text-white bg-gray-1 border border-gray-3 py-2.5 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 12h.01M8 8V6m0 0V4a2 2 0 114 0v2M8 6a2 2 0 11-4 0"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Contact
        </button>

        {/* Remove Button */}
        <button
          onClick={() => handleRemoveFromWishlist()}
          className="inline-flex items-center gap-1 text-gray-500 hover:text-red bg-transparent border border-gray-300 py-2.5 px-3 rounded-md ease-out duration-200 hover:bg-red-50 hover:border-red"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Contact Seller Modal */}
      <ContactSellerModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        sellerInfo={{
          phoneNumber:
            item.sellerPhoneNumber || item.seller?.phoneNumber || "0123456789", // Fallback for demo
          sellerId: item.sellerId || item.seller?.id || 1, // Fallback for demo
          sellerName: item.sellerName || item.seller?.name || "Seller", // Fallback for demo
        }}
        item={{
          id:
            item.postId && item.postId > 0
              ? item.postId
              : item.id && item.id > 0
                ? item.id
                : 0,
          title: item.title,
        }}
      />
    </div>
  );
};

export default SingleItem;
