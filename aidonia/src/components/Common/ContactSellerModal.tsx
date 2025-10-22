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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100000] overflow-y-auto"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md p-6 modal-content my-4 max-h-[90vh] overflow-y-auto"
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
          <div className="border-2 border-blue/20 bg-gradient-to-br from-blue/5 to-indigo-50/30 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-blue/10 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-blue"
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
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Phone Number</h4>
                <p className="text-xs text-blue font-medium">📞 Direct call</p>
              </div>
            </div>

            <div className="mb-3 pl-2">
              <p className="text-lg font-mono text-gray-900 tracking-wider">
                {formatPhoneNumber(sellerInfo.phoneNumber)}
              </p>
            </div>

            <button
              onClick={handlePhoneClick}
              className={`w-full px-5 py-3 rounded-lg font-semibold transition-all duration-200 transform flex items-center justify-center gap-2 ${
                !isAuthenticated()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              }`}
              disabled={!isAuthenticated()}
            >
              {!isAuthenticated() ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Sign In to View</span>
                </>
              ) : showFullPhone ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                  <span>Hide Number</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <span>Show Full Number</span>
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Chat Option */}
          <div className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-green-600"
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
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  Chat with Seller
                </h4>
                <p className="text-xs text-green-600 font-medium">
                  💬 Instant messaging
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Send a message directly to the seller. Get quick responses and
              negotiate the best deal!
            </p>

            <button
              onClick={handleChatClick}
              className={`w-full px-5 py-3 rounded-lg font-semibold transition-all duration-200 transform flex items-center justify-center gap-2 ${
                !isAuthenticated()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              }`}
              disabled={!isAuthenticated()}
            >
              {!isAuthenticated() ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Sign In to Chat</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <span>Start Conversation</span>
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSellerModal;
