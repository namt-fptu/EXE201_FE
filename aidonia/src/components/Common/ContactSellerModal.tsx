"use client";
import React, { useState } from "react";
import useUserStore from "@/redux/userStore";
import ChatWindow from "@/components/Chat/ChatWindow";
import Image from "next/image";

interface ContactSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerInfo: {
    phoneNumber?: string;
    sellerId?: number;
    sellerName?: string;
    avatarImage?: string;
  };
  item: {
    id: number;
    title: string;
  };
  isLoading?: boolean;
}

const ContactSellerModal = ({
  isOpen,
  onClose,
  sellerInfo,
  item,
  isLoading = false,
}: ContactSellerModalProps) => {
  const { isAuthenticated } = useUserStore();
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [showChat, setShowChat] = useState(false);

  if (!isOpen) return null;

  const handlePhoneClick = () => {
    if (!isAuthenticated()) {
      // Don't do anything if not authenticated - button is disabled
      return;
    }
    setShowFullPhone(!showFullPhone);
  };

  const handleChatClick = () => {
    if (!isAuthenticated()) {
      // Don't do anything if not authenticated - button is disabled
      return;
    }

    console.log("ContactSellerModal: Starting chat with data:", {
      itemId: item.id,
      sellerId: sellerInfo.sellerId,
      sellerName: sellerInfo.sellerName,
      itemTitle: item.title,
    });

    setShowChat(true);
  };

  const formatPhoneNumber = (phone: string | undefined) => {
    if (!phone) return "Not available";

    if (showFullPhone) {
      return phone;
    }

    // Show first 4 digits and hide the rest
    const digits = phone.replace(/\D/g, ""); // Remove non-digits
    if (digits.length >= 4) {
      return digits.substring(0, 4) + "****";
    }
    return phone;
  };

  if (showChat) {
    // Validate postId before opening chat
    if (!item.id || item.id <= 0) {
      console.error("Invalid post ID for chat:", item.id);
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100000]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              Chat Error
            </h3>
            <p className="text-gray-700 mb-4">
              Unable to start chat. This item may not be available for
              messaging.
            </p>
            <button
              onClick={() => {
                setShowChat(false);
                onClose();
              }}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100000]">
        <div className="w-full max-w-lg h-[500px]">
          <ChatWindow
            recipientId={sellerInfo.sellerId}
            recipientName={sellerInfo.sellerName}
            postId={item.id}
            onClose={() => {
              setShowChat(false);
              onClose();
            }}
            className="h-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100000]"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md p-6 modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Contact Seller
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Seller Info Section */}
        <div className="mb-4 p-4 bg-blue/5 rounded-lg border border-blue/20">
          <div className="flex items-center space-x-3 mb-3">
            {sellerInfo.avatarImage ? (
              <Image
                src={sellerInfo.avatarImage}
                alt={sellerInfo.sellerName || "Seller"}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-blue rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {(sellerInfo.sellerName || "S").charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {isLoading ? "Loading..." : sellerInfo.sellerName || "Seller"}
              </p>
              <p className="text-sm text-gray-500">Seller</p>
            </div>
          </div>
          <div className="pt-3 border-t border-blue/10">
            <p className="text-sm text-gray-600 mb-1">Item:</p>
            <p className="font-medium text-gray-900 truncate">{item.title}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Phone Number Option */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg
                className="w-5 h-5 text-blue mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <h4 className="font-medium text-gray-900">Phone Number</h4>
            </div>

            <div className="mb-3">
              <p className="text-lg font-mono text-gray-900">
                {formatPhoneNumber(sellerInfo.phoneNumber)}
              </p>
            </div>

            <button
              onClick={handlePhoneClick}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                !isAuthenticated()
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue text-white hover:bg-blue-600"
              }`}
              disabled={!isAuthenticated()}
            >
              {!isAuthenticated()
                ? "Sign In to View"
                : showFullPhone
                  ? "Hide Number"
                  : "Show All"}
            </button>
          </div>

          {/* Chat Option */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <svg
                className="w-5 h-5 text-green-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <h4 className="font-medium text-gray-900">Chat with Seller</h4>
            </div>

            <p className="text-sm text-gray-600 mb-3">
              Send a message directly to the seller
            </p>

            <button
              onClick={handleChatClick}
              className={`w-full px-4 py-2 rounded-md transition-colors ${
                !isAuthenticated()
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
              disabled={!isAuthenticated()}
            >
              {!isAuthenticated() ? "Sign In to Chat" : "Start Chat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSellerModal;
