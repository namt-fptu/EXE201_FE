"use client";

import { useState, useEffect } from "react";
import { Post } from "@/services/postsServiceWithAxios";
import Image from "next/image";

interface PostDetailModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (post: Post) => void;
  onReject: (post: Post) => void;
  post?: Post;
}

export default function PostDetailModal({
  postId,
  isOpen,
  onClose,
  onApprove,
  onReject,
  post: initialPost,
}: PostDetailModalProps) {
  const [post, setPost] = useState<Post | null>(initialPost || null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen && initialPost) {
      setPost(initialPost);
      setCurrentImageIndex(0);
    }
  }, [isOpen, initialPost]);

  const getConditionLabel = (condition: string) => {
    const labels = {
      NEW: "New",
      LIKE_NEW: "Like New",
      GOOD: "Good",
      FAIR: "Fair",
      POOR: "Poor",
    };
    return labels[condition as keyof typeof labels] || condition;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
            Pending
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US").format(price) + " VND";
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-6xl rounded-lg bg-white shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
        >
          <svg
            className="h-5 w-5"
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

        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600"></div>
          </div>
        ) : post ? (
          <div className="max-h-[90vh] overflow-y-auto p-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left Column - Images */}
              <div className="space-y-4">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  {post.postImages && post.postImages.length > 0 ? (
                    <Image
                      src={post.postImages[currentImageIndex]?.url || "/images/placeholder.png"}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <svg
                        className="h-20 w-20 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Thumbnail Images */}
                {post.postImages && post.postImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {post.postImages.map((image, index) => (
                      <button
                        key={image.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded-lg ${
                          currentImageIndex === index
                            ? "ring-2 ring-primary-600"
                            : "ring-1 ring-gray-200"
                        }`}
                      >
                        <Image
                          src={image.url}
                          alt={`${post.title} - ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Information */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {post.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-3">
                    {getStatusBadge(post.status)}
                    <span className="text-sm text-gray-500">
                      Posted on {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="border-b border-t border-gray-200 py-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary-600">
                      {formatPrice(post.price)}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <p className="mt-1 text-base font-semibold text-gray-900">
                        {post.categoryName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Condition</p>
                      <p className="mt-1 text-base font-semibold text-gray-900">
                        {getConditionLabel(post.condition)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Posted By</p>
                      <p className="mt-1 text-base font-semibold text-gray-900">
                        {post.authorName}
                      </p>
                      <p className="text-sm text-gray-500">{post.authorEmail}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Priority</p>
                      <p className="mt-1 text-base font-semibold text-gray-900">
                        {post.priority}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {post.description}
                  </p>
                </div>

                {/* Admin Actions */}
                {post.status === "PENDING" && (
                  <div className="space-y-3 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Admin Actions
                    </h3>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          onApprove(post);
                          onClose();
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-white hover:bg-green-700"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Approve Post
                      </button>
                      <button
                        onClick={() => {
                          onReject(post);
                          onClose();
                        }}
                        className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700"
                      >
                        <svg
                          className="h-5 w-5"
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
                        Reject Post
                      </button>
                    </div>
                  </div>
                )}

                {/* Back Button */}
                <button
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-gray-700 hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to List
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center">
            <p className="text-gray-500">Post not found</p>
          </div>
        )}
      </div>
    </div>
  );
}
