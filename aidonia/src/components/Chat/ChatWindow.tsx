"use client";

import React, { useState, useEffect, useRef } from "react";
import { Message, Conversation } from "@/services/chat";
import chatService from "@/services/chat";
import chatSignalRService from "@/services/signalr";
import useUserStore from "@/redux/userStore";
import { getUserIdAsNumber, getIdAsNumber } from "@/utils/id-helpers";
import { X, Send, Phone, Video, MoreVertical } from "lucide-react";

interface ChatWindowProps {
  conversation?: Conversation;
  recipientId?: number;
  recipientName?: string;
  postId?: number; // Required when creating new conversations
  onClose: () => void;
  className?: string;
}

export default function ChatWindow({
  conversation: initialConversation,
  recipientId,
  recipientName,
  postId,
  onClose,
  className = "",
}: ChatWindowProps) {
  const { user } = useUserStore();
  const [conversation, setConversation] = useState<Conversation | null>(
    initialConversation || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize or create conversation
  useEffect(() => {
    const initializeChat = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      try {
        let currentConversation = conversation;

        // If no conversation provided but we have recipientId, create or get conversation
        if (!currentConversation && recipientId && postId && postId > 0) {
          console.log("ChatWindow: Creating conversation with:", {
            postId,
            userId: user.id,
            recipientId,
          });

          try {
            // Determine buyer and seller based on who owns the post
            // The post owner is always the seller, the other person is the buyer
            const currentUserId = getUserIdAsNumber(user.id);
            const otherUserId = getIdAsNumber(recipientId);

            let buyerId: number, sellerId: number;
            let postOwnerId: number | undefined;

            // Try to fetch post details to determine the owner
            try {
              const postResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"}/posts/${postId}`
              );

              if (postResponse.ok) {
                const postData = await postResponse.json();
                postOwnerId = postData?.data?.userId || postData?.userId;

                console.log("ChatWindow: Successfully fetched post data:", {
                  postId,
                  postOwnerId,
                  responseStatus: postResponse.status,
                });
              } else {
                console.warn("ChatWindow: Failed to fetch post data:", {
                  status: postResponse.status,
                  statusText: postResponse.statusText,
                });
              }
            } catch (fetchError) {
              console.warn("ChatWindow: Error fetching post data:", fetchError);
            }

            // Determine roles: post owner is always the seller
            if (postOwnerId && postOwnerId === currentUserId) {
              // Current user owns the post, so they are the seller
              sellerId = currentUserId;
              buyerId = otherUserId;
            } else if (postOwnerId && postOwnerId === otherUserId) {
              // Recipient owns the post, so they are the seller
              sellerId = otherUserId;
              buyerId = currentUserId;
            } else {
              // Fallback: if we can't determine owner, assume current user is buyer
              // This maintains backward compatibility with the bidirectional lookup
              console.warn(
                "Could not determine post owner, using default roles (current user = buyer)"
              );
              buyerId = currentUserId;
              sellerId = otherUserId;
            }

            console.log("ChatWindow: Conversation roles determined:", {
              postOwnerId,
              currentUserId,
              recipientId: otherUserId,
              buyerId,
              sellerId,
            });

            const result = await chatService.getOrCreateConversation(
              postId,
              buyerId,
              sellerId
            );

            if (result.isSuccess && result.data) {
              currentConversation = result.data;
              setConversation(currentConversation);
              console.log(
                "✅ ChatWindow: Successfully created/retrieved conversation:",
                {
                  conversationId: result.data.id,
                  buyerId: result.data.buyerId,
                  sellerId: result.data.sellerId,
                  postId: result.data.postId,
                  currentUserId: user.id,
                  currentUserIdType: typeof user.id,
                  buyerIdType: typeof result.data.buyerId,
                  sellerIdType: typeof result.data.sellerId,
                  recipientId: recipientId,
                }
              );

              // CRITICAL: Verify the conversation was created with correct participants
              const userIdNum = getUserIdAsNumber(user.id);
              const isUserInConversation =
                result.data.buyerId === userIdNum ||
                result.data.sellerId === userIdNum;

              if (!isUserInConversation) {
                console.error(
                  "❌ CRITICAL ERROR: User is not part of the created conversation!",
                  {
                    expectedUserId: userIdNum,
                    conversationBuyerId: result.data.buyerId,
                    conversationSellerId: result.data.sellerId,
                  }
                );
                alert(
                  "Error: Failed to create conversation correctly. Please try again."
                );
                return;
              }
            } else {
              console.error(
                "Failed to create or get conversation:",
                result.message
              );
              // Set an error state or show notification to user
            }
          } catch (error: unknown) {
            console.error("Error in conversation creation:", error);
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";

            // Check if it's a 500 error indicating the post doesn't exist
            if (
              errorMessage.includes("500") ||
              errorMessage.includes("Foreign key")
            ) {
              console.warn(
                `Post ID ${postId} may not exist in database. This could be a wishlist/favorites ID instead of a post ID.`
              );
            }
          }
        } else if (!currentConversation && recipientId && !postId) {
          console.warn("Cannot create conversation without a valid postId");
        }

        // Load messages if we have a conversation
        if (currentConversation) {
          const messagesResult = await chatService.getConversationMessages(
            currentConversation.id,
            user.id
          );
          if (messagesResult.isSuccess && messagesResult.data) {
            setMessages(messagesResult.data);
          }

          // Mark messages as read when opening conversation
          try {
            const userIdNum = getUserIdAsNumber(user.id);
            await chatService.markMessagesAsRead(
              currentConversation.id,
              userIdNum
            );
            console.log(
              "✅ Marked messages as read for conversation:",
              currentConversation.id
            );
          } catch (error) {
            console.error("Error marking messages as read:", error);
          }

          // Start SignalR connection and setup callbacks
          await chatSignalRService.start();

          chatSignalRService.setCallbacks({
            onMessageReceived: (message: Message) => {
              setMessages((prev) => {
                // Avoid duplicates
                if (!prev.find((m) => m.id === message.id)) {
                  return [...prev, message];
                }
                return prev;
              });
              scrollToBottom();

              // Mark new messages as read immediately since the chat is open
              try {
                const userIdNum = getUserIdAsNumber(user.id);
                chatService.markMessagesAsRead(
                  currentConversation.id,
                  userIdNum
                );
              } catch (error) {
                console.error("Error marking new message as read:", error);
              }

              // Stop typing indicator when message is received
              setIsOtherUserTyping(false);
            },
            onTypingStart: (typingUserId: number, userName: string) => {
              // Only show typing indicator if it's from the other user
              const currentUserId = getUserIdAsNumber(user.id);
              if (typingUserId !== currentUserId) {
                console.log(`${userName} started typing`);
                setIsOtherUserTyping(true);
              }
            },
            onTypingStop: (typingUserId: number) => {
              // Only hide typing indicator if it's from the other user
              const currentUserId = getUserIdAsNumber(user.id);
              if (typingUserId !== currentUserId) {
                setIsOtherUserTyping(false);
              }
            },
            onError: (error: string) => {
              console.error("Chat polling error:", error);
            },
          });

          await chatSignalRService.joinConversation(
            currentConversation.id,
            user.id
          );
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();

    // Cleanup on unmount
    return () => {
      if (conversation) {
        chatSignalRService.leaveConversation(conversation.id);
      }
    };
  }, [conversation, recipientId, user?.id, recipientName, postId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !conversation || isSending) return;

    // Stop typing indicator before sending
    stopTypingIndicator();

    // Validate conversation setup
    if (!conversation.id || conversation.id <= 0) {
      console.error("ChatWindow: Invalid conversation ID:", conversation.id);
      return;
    }

    // Validate user is part of conversation - handle both string and number user IDs
    const userIdNum = getUserIdAsNumber(user.id);
    const isUserBuyer = conversation.buyerId === userIdNum;
    const isUserSeller = conversation.sellerId === userIdNum;

    console.log("=== MESSAGE SEND VALIDATION ===");
    console.log("User ID (original):", user.id, typeof user.id);
    console.log("User ID (numeric):", userIdNum, typeof userIdNum);
    console.log(
      "Conversation buyerId:",
      conversation.buyerId,
      typeof conversation.buyerId
    );
    console.log(
      "Conversation sellerId:",
      conversation.sellerId,
      typeof conversation.sellerId
    );
    console.log("Is user buyer?", isUserBuyer);
    console.log("Is user seller?", isUserSeller);

    if (!isUserBuyer && !isUserSeller) {
      console.error(
        "❌ VALIDATION FAILED: User is not part of this conversation"
      );
      alert(
        "Error: You are not authorized to send messages in this conversation. Please refresh and try again."
      );
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    try {
      console.log("=== SENDING MESSAGE ===");
      console.log("ChatWindow: Sending message with conversation data:", {
        conversationId: conversation.id,
        senderId: getUserIdAsNumber(user.id),
        senderIdType: typeof getUserIdAsNumber(user.id),
        messageText: messageText,
        conversationBuyerId: conversation.buyerId,
        conversationSellerId: conversation.sellerId,
      });

      const result = await chatService.sendMessage({
        conversationId: conversation.id,
        senderId: getUserIdAsNumber(user.id),
        messageText: messageText,
      });

      if (result.isSuccess && result.data) {
        console.log("✅ Message sent successfully:", result.data);
        // Add message to local state immediately for better UX
        setMessages((prev) => [...prev, result.data]);
        scrollToBottom();
      } else {
        console.error("❌ Failed to send message - API response:", result);

        // Check if it's a backend validation error
        if (result.message && result.message.includes("not part of")) {
          alert(
            `Unable to send message: You may not have permission to message in this conversation. Please refresh and try again.`
          );
        } else if (
          result.message &&
          result.message.includes("Failed to send")
        ) {
          alert(
            `Failed to send message: ${result.message}. The conversation may have been deleted. Please refresh the page.`
          );
        } else {
          alert(`Failed to send message: ${result.message || "Unknown error"}`);
        }

        // Restore message on error
        setNewMessage(messageText);
      }
    } catch (error) {
      console.error("❌ Error sending message:", error);
      alert("Failed to send message. Please try again.");
      // Restore message on error
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!conversation?.id || !user?.id) return;

    const userIdNum = getUserIdAsNumber(user.id);
    const userName = user.userName || user.email || "User";

    // Start typing indicator
    if (value.length > 0 && !isTypingRef.current) {
      isTypingRef.current = true;
      chatService
        .startTyping(conversation.id, userIdNum, userName)
        .catch((error) => {
          console.error("Error starting typing indicator:", error);
        });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        chatService.stopTyping(conversation.id, userIdNum).catch((error) => {
          console.error("Error stopping typing indicator:", error);
        });
      }
    }, 3000);
  };

  // Stop typing when sending message
  const stopTypingIndicator = () => {
    if (conversation?.id && isTypingRef.current && user?.id) {
      isTypingRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      const userIdNum = getUserIdAsNumber(user.id);
      chatService.stopTyping(conversation.id, userIdNum).catch((error) => {
        console.error("Error stopping typing indicator:", error);
      });
    }
  };

  // Cleanup typing indicator on unmount
  useEffect(() => {
    return () => {
      stopTypingIndicator();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);

  // Format message time
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  // Get other participant name
  const getOtherParticipantName = () => {
    if (recipientName) return recipientName;
    if (!conversation || !user?.id) return "User";

    const otherParticipant =
      conversation.buyerId === user.id
        ? conversation.seller?.userName
        : conversation.buyer?.userName;

    return otherParticipant || "User";
  };

  return (
    <div
      className={`flex flex-col bg-white rounded-lg shadow-lg border ${className}`}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {getOtherParticipantName().charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {getOtherParticipantName()}
            </h3>
            <p className="text-xs text-gray-500">
              {chatSignalRService.isConnected ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Voice Call"
          >
            <Phone size={18} />
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Video Call"
          >
            <Video size={18} />
          </button>
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="More Options"
          >
            <MoreVertical size={18} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            title="Close Chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 max-h-96 overflow-y-auto space-y-3">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = user?.id
              ? getUserIdAsNumber(user.id) === message.senderId
              : false;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? "bg-blue text-white rounded-br-md"
                        : "bg-gray-100 text-gray-900 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.messageText}
                    </p>
                  </div>
                  <div
                    className={`mt-1 text-xs text-gray-500 ${isOwn ? "text-right" : "text-left"}`}
                  >
                    <span>{formatMessageTime(message.sentAt)}</span>
                    {message.readStatus && isOwn && (
                      <span className="ml-2 text-blue">✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {isOtherUserTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-2xl rounded-bl-md">
              <p className="text-sm text-gray-500 italic">
                {getOtherParticipantName()} is typing...
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
              rows={1}
              maxLength={1000}
              disabled={isSending}
            />
          </div>
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="p-3 bg-blue text-white rounded-full hover:bg-blue/90 focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            title="Send Message"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-2 text-xs text-gray-500 text-right">
          {newMessage.length}/1000
        </div>
      </div>
    </div>
  );
}
