"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MessageCircle, X } from "lucide-react";
import useUserStore from "@/redux/userStore";
import chatService, { ConversationWithPreview } from "@/services/chat";
import ChatWindow from "./ChatWindow";
import { getUserIdAsNumber } from "@/utils/id-helpers";

interface OpenChat {
  conversationId: number;
  recipientId: number;
  recipientName: string;
  postId: number;
}

export default function ChatBubble() {
  const { user, isAuthenticated } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationWithPreview[]>(
    []
  );
  const [openChats, setOpenChats] = useState<OpenChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load conversations function
  const loadConversations = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      console.log("🔄 ChatBubble: Loading conversations for user:", user.id);
      const result = await chatService.getConversationsWithPreview(
        getUserIdAsNumber(user.id)
      );

      console.log("📥 ChatBubble: API Response:", {
        success: result.isSuccess,
        conversationCount: result.data?.length || 0,
        conversations: result.data,
      });

      if (result.isSuccess && result.data) {
        setConversations(result.data);

        // Calculate total unread count
        const total = result.data.reduce(
          (sum, conv) => sum + (conv.unreadCount || 0),
          0
        );
        setUnreadCount(total);

        console.log(
          "✅ ChatBubble: Loaded",
          result.data.length,
          "conversations with",
          total,
          "unread messages"
        );
      } else {
        console.warn(
          "⚠️ ChatBubble: Failed to load conversations:",
          result.message
        );
      }
    } catch (error) {
      console.error("❌ ChatBubble: Error loading conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load unread count function
  const loadUnreadCount = async () => {
    if (!user?.id) return;

    try {
      const result = await chatService.getUnreadMessageCount(
        getUserIdAsNumber(user.id)
      );

      if (result.isSuccess && typeof result.data === "number") {
        setUnreadCount(result.data);
      }
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  // Load conversations when bubble is opened
  useEffect(() => {
    if (isOpen && user?.id && isAuthenticated()) {
      loadConversations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user?.id]);

  // Poll for new messages every 10 seconds
  useEffect(() => {
    if (!user?.id || !isAuthenticated()) return;

    const interval = setInterval(() => {
      loadUnreadCount();
    }, 10000);

    // Initial load
    loadUnreadCount();

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const openChat = (conversation: ConversationWithPreview) => {
    if (!user?.id) return;

    const userIdNum = getUserIdAsNumber(user.id);
    const isUserBuyer = conversation.buyerId === userIdNum;
    const recipientId = isUserBuyer
      ? conversation.sellerId
      : conversation.buyerId;
    const recipientName = isUserBuyer
      ? conversation.seller.userName
      : conversation.buyer.userName;

    // Check if chat is already open
    const existingChat = openChats.find(
      (chat) => chat.conversationId === conversation.id
    );

    if (!existingChat) {
      const newChat: OpenChat = {
        conversationId: conversation.id,
        recipientId,
        recipientName,
        postId: conversation.postId,
      };

      // Only allow max 3 open chats
      if (openChats.length >= 3) {
        setOpenChats([...openChats.slice(1), newChat]);
      } else {
        setOpenChats([...openChats, newChat]);
      }
    }

    // Mark messages as read when opening conversation
    if (conversation.unreadCount && conversation.unreadCount > 0) {
      chatService
        .markMessagesAsRead(conversation.id, userIdNum)
        .then(() => {
          console.log(
            "✅ Marked messages as read for conversation:",
            conversation.id
          );
          // Update local state to reflect read status
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
            )
          );
          // Update unread count
          loadUnreadCount();
        })
        .catch((error) => {
          console.error("Error marking messages as read:", error);
        });
    }

    // Close the bubble list
    setIsOpen(false);
  };

  const closeChat = (conversationId: number) => {
    setOpenChats(
      openChats.filter((chat) => chat.conversationId !== conversationId)
    );
  };

  const formatTime = (dateString: string) => {
    // Ensure proper date parsing - append 'Z' if no timezone info to force UTC interpretation
    const normalizedDateString =
      dateString.includes("Z") ||
      dateString.includes("+") ||
      dateString.includes("-")
        ? dateString
        : `${dateString}Z`;

    const date = new Date(normalizedDateString);
    const now = new Date();

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date string:", dateString);
      return "Invalid time";
    }

    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Don't show if not authenticated
  if (!isAuthenticated() || !user) {
    return null;
  }

  return (
    <>
      {/* Chat Windows - Bottom Right Corner */}
      <div className="fixed bottom-24 right-4 flex gap-2 z-[9998]">
        {openChats.map((chat) => (
          <div
            key={chat.conversationId}
            className="w-[350px] h-[500px] bg-white rounded-t-lg shadow-2xl"
          >
            <ChatWindow
              recipientId={chat.recipientId}
              recipientName={chat.recipientName}
              postId={chat.postId}
              onClose={() => closeChat(chat.conversationId)}
              className="h-full rounded-t-lg"
            />
          </div>
        ))}
      </div>

      {/* Conversations List */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 w-[350px] bg-white rounded-lg shadow-2xl z-[9999]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-blue text-white rounded-t-lg">
            <h3 className="font-semibold text-lg">Messages</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conversations List */}
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-1">
                  Start chatting with sellers!
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map((conversation) => {
                  const userIdNum = getUserIdAsNumber(user.id);
                  const isUserBuyer = conversation.buyerId === userIdNum;
                  const otherUser = isUserBuyer
                    ? conversation.seller
                    : conversation.buyer;
                  const lastMessage = conversation.lastMessage;

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => openChat(conversation)}
                      className="w-full p-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-blue text-white flex items-center justify-center font-semibold flex-shrink-0 overflow-hidden relative">
                          {otherUser.avataImage ? (
                            <Image
                              src={otherUser.avataImage}
                              alt={otherUser.userName}
                              fill
                              className="object-cover"
                              unoptimized={otherUser.avataImage.includes(
                                "firebasestorage.googleapis.com"
                              )}
                              onError={() => {
                                console.error(
                                  "Failed to load avatar in ChatBubble:",
                                  otherUser.avataImage
                                );
                              }}
                            />
                          ) : (
                            <span>
                              {otherUser.userName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {otherUser.userName}
                            </h4>
                            {lastMessage && (
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {formatTime(lastMessage.sentAt)}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 truncate mb-1">
                            {conversation.post.title}
                          </p>

                          {lastMessage && (
                            <div className="flex items-center justify-between">
                              <p
                                className={`text-sm truncate ${
                                  conversation.unreadCount &&
                                  conversation.unreadCount > 0
                                    ? "font-semibold text-gray-900"
                                    : "text-gray-500"
                                }`}
                              >
                                {lastMessage.senderId === userIdNum && "You: "}
                                {lastMessage.messageText}
                              </p>
                              {conversation.unreadCount &&
                                conversation.unreadCount > 0 && (
                                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ml-2">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-blue text-white rounded-full shadow-lg hover:bg-blue-600 transition-all hover:scale-110 z-[9999] flex items-center justify-center"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}
