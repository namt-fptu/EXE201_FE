"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ConversationWithPreview } from "@/services/chat";
import chatService from "@/services/chat";
import useUserStore from "@/redux/userStore";
import ChatWindow from "@/components/Chat/ChatWindow";
import { MessageCircle, User } from "lucide-react";
import { getUserIdAsNumber } from "@/utils/id-helpers";

export default function ChatList() {
  const { user } = useUserStore();
  const [conversations, setConversations] = useState<ConversationWithPreview[]>(
    []
  );
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationWithPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const result = await chatService.getConversationsWithPreview(user.id);

        if (result.isSuccess && result.data) {
          console.log("📦 Raw conversations from API:", result.data);

          // Deduplicate conversations based on unique combination of postId + participant IDs
          // This handles cases where backend returns duplicates with swapped buyer/seller
          const uniqueConversations = result.data.reduce(
            (acc, conversation) => {
              // Create a normalized key that's the same regardless of buyer/seller order
              // Sort the IDs so that key is consistent: postId-smallerId-largerId
              const ids = [conversation.buyerId, conversation.sellerId].sort(
                (a, b) => a - b
              );
              const key = `${conversation.postId}-${ids[0]}-${ids[1]}`;

              // Keep only the first occurrence of each unique conversation
              if (!acc.has(key)) {
                acc.set(key, conversation);
                console.log("✅ Keeping conversation:", {
                  id: conversation.id,
                  postId: conversation.postId,
                  buyerId: conversation.buyerId,
                  sellerId: conversation.sellerId,
                  key,
                });
              } else {
                console.warn(
                  "⚠️ Duplicate conversation detected and removed:",
                  {
                    duplicateId: conversation.id,
                    keptId: acc.get(key)?.id,
                    postId: conversation.postId,
                    buyerId: conversation.buyerId,
                    sellerId: conversation.sellerId,
                    key,
                  }
                );
              }
              return acc;
            },
            new Map<string, ConversationWithPreview>()
          );

          const deduplicatedConversations = Array.from(
            uniqueConversations.values()
          );
          console.log(
            `✅ Loaded ${result.data.length} conversations, deduplicated to ${deduplicatedConversations.length}`
          );
          setConversations(deduplicatedConversations);
        } else {
          setError("Failed to load conversations");
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
        setError("Error loading conversations");
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [user?.id]);

  // Mark conversation as read and select it
  const handleSelectConversation = async (
    conversation: ConversationWithPreview
  ) => {
    if (!user?.id) return;

    // Mark messages as read if there are unread messages
    if (conversation.unreadCount && conversation.unreadCount > 0) {
      try {
        const userIdNum = getUserIdAsNumber(user.id);
        await chatService.markMessagesAsRead(conversation.id, userIdNum);
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
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    }

    setSelectedConversation(conversation);
  };

  // Format message time
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

    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Get other participant info
  const getOtherParticipant = (conversation: ConversationWithPreview) => {
    if (!user?.id) return { name: "Unknown", id: 0, avataImage: undefined };

    const isUserBuyer = conversation.buyerId === user.id;
    const otherUser = isUserBuyer ? conversation.seller : conversation.buyer;
    return {
      name: otherUser?.userName || "Unknown",
      id: isUserBuyer ? conversation.sellerId : conversation.buyerId,
      avataImage: otherUser?.avataImage,
    };
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your messages</p>
      </div>
    );
  }

  if (selectedConversation) {
    const otherParticipant = getOtherParticipant(selectedConversation);
    return (
      <div className="h-[600px]">
        <ChatWindow
          conversation={selectedConversation}
          recipientId={otherParticipant.id}
          recipientName={otherParticipant.name}
          postId={selectedConversation.postId}
          onClose={() => setSelectedConversation(null)}
          className="h-full border rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <MessageCircle className="mr-2" size={24} />
          Messages
        </h2>
      </div>

      {/* Conversations List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="mx-auto mb-2" size={48} />
            <p>No conversations yet</p>
            <p className="text-sm">Start chatting with sellers!</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherParticipant = getOtherParticipant(conversation);
            const lastMessage = conversation.lastMessage;
            const hasUnread = (conversation.unreadCount || 0) > 0;
            // Use combination of conversation details for truly unique key
            const conversationKey = `conv-${conversation.id}-${conversation.postId}-${conversation.buyerId}-${conversation.sellerId}`;

            return (
              <div
                key={conversationKey}
                onClick={() => handleSelectConversation(conversation)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  hasUnread ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                      {otherParticipant.avataImage ? (
                        <Image
                          src={otherParticipant.avataImage}
                          alt={otherParticipant.name || "User"}
                          fill
                          className="object-cover"
                          unoptimized={otherParticipant.avataImage.includes(
                            "firebasestorage.googleapis.com"
                          )}
                          onError={() => {
                            console.error(
                              "Failed to load avatar in ChatList:",
                              otherParticipant.avataImage
                            );
                          }}
                        />
                      ) : otherParticipant.name ? (
                        <span className="text-white font-medium text-sm">
                          {otherParticipant.name.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User className="text-white" size={20} />
                      )}
                    </div>

                    {/* Conversation Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`text-sm truncate ${hasUnread ? "font-semibold" : "font-medium"}`}
                        >
                          {otherParticipant.name || "Unknown User"}
                        </h3>
                        {lastMessage && (
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatTime(lastMessage.sentAt)}
                          </span>
                        )}
                      </div>

                      {/* Post title */}
                      <p className="text-xs text-gray-500 truncate mt-1">
                        About: {conversation.post?.title || "Item"}
                      </p>

                      {/* Last message */}
                      {lastMessage && (
                        <p
                          className={`text-sm text-gray-600 truncate mt-1 ${
                            hasUnread ? "font-medium" : ""
                          }`}
                        >
                          {lastMessage.senderId === user.id ? "You: " : ""}
                          {lastMessage.messageText}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {hasUnread &&
                    conversation.unreadCount &&
                    conversation.unreadCount > 0 && (
                      <div className="ml-2 flex-shrink-0">
                        <div className="min-w-[20px] h-5 bg-blue-500 rounded-full flex items-center justify-center px-2">
                          <span className="text-white text-xs font-bold">
                            {conversation.unreadCount}
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
