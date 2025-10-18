"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import ProductItem from "@/components/Common/ProductItem";
import api from "@/services/axios";
import { Product } from "@/types/product";

interface PostData {
  id: number;
  title: string;
  description?: string;
  price: number;
  condition?: string;
  categoryId?: number;
  category?: { name?: string; categoryName?: string }; // Category object from API (some responses)
  categoryName?: string; // Direct categoryName field (other responses)
  postImages?: Array<string | { url: string }>; // Can be array of URLs or objects
  createdAt: string;
  status: string;
  priority?: number;
}

// Extended Product type to match ProductItem expectations
interface ExtendedProduct extends Product {
  category?: string;
  condition?: string;
  description?: string;
  createdAt?: string;
}

const NewArrival = () => {
  const [posts, setPosts] = useState<ExtendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching posts from /api/posts");
        console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
        console.log(
          "Full URL will be:",
          `${process.env.NEXT_PUBLIC_API_BASE_URL}posts`
        );

        const response = await api.get("posts");
        console.log("Posts API response:", response.data);

        let postsData: PostData[] = [];

        // Handle different response structures
        if (response.data && response.data.data) {
          postsData = Array.isArray(response.data.data)
            ? response.data.data
            : [response.data.data];
        } else if (response.data && Array.isArray(response.data)) {
          postsData = response.data;
        }

        console.log("=== POSTS DEBUG INFO ===");
        console.log("Raw posts data:", postsData);
        console.log("Posts count before filtering:", postsData.length);

        // Show all unique status values to understand what's available
        const statusValues = Array.from(
          new Set(postsData.map((post) => post.status))
        );
        console.log("All unique status values found:", statusValues);

        // Show a sample of posts with their status
        postsData.slice(0, 3).forEach((post) => {
          console.log(
            `Sample post ${post.id}: title="${post.title}", status="${post.status}"`
          );
        });

        // Transform posts to ExtendedProduct format for ProductItem component
        const transformedPosts: ExtendedProduct[] = postsData
          .filter((post) => {
            const isValidStatus =
              post.status === "Approved" || post.status === "approved";
            console.log(
              `Post ${post.id} status: "${post.status}", valid: ${isValidStatus}`
            );
            return isValidStatus;
          }) // Show approved and pending posts
          .slice(0, 8) // Limit to 8 posts for new arrivals
          .map((post) => ({
            id: post.id,
            title: post.title,
            price: post.price || 0,
            discountedPrice: post.price || 0, // Use same price for now, can be enhanced later
            reviews: 0, // Default value, can be enhanced with actual reviews
            imgs: {
              thumbnails: post.postImages?.map((img) => {
                const url = typeof img === "string" ? img : img.url;
                console.log(`Processing image for post ${post.id}:`, url);
                return url;
              }) || ["/images/products/product-1-bg-1.png"],
              previews: post.postImages?.map((img) => {
                const url = typeof img === "string" ? img : img.url;
                console.log(`Processing preview for post ${post.id}:`, url);
                return url;
              }) || ["/images/products/product-1-bg-1.png"],
            },
            // Additional fields for posts
            category:
              post.categoryName || // Direct categoryName field
              post.category?.name ||
              post.category?.categoryName ||
              (typeof post.category === "string"
                ? post.category
                : "Uncategorized"),
            condition: post.condition || "Not specified",
            description: post.description || "",
            createdAt: post.createdAt,
          }));

        console.log(
          "Posts after filtering for 'Approved/Pending':",
          transformedPosts.length
        );
        console.log("Transformed posts:", transformedPosts);

        // If no approved/pending posts found, let's try showing any posts for debugging
        if (transformedPosts.length === 0 && postsData.length > 0) {
          console.log(
            "⚠️ No approved/pending posts found! Showing first few posts with any status for debugging:"
          );
          const debugPosts: ExtendedProduct[] = postsData
            .slice(0, 4) // Show first 4 posts regardless of status
            .map((post) => ({
              id: post.id,
              title: `[${post.status}] ${post.title}`, // Show status in title for debugging
              price: post.price || 0,
              discountedPrice: post.price || 0,
              reviews: 0,
              imgs: {
                thumbnails: post.postImages?.map((img) =>
                  typeof img === "string" ? img : img.url
                ) || ["/images/products/product-1-bg-1.png"],
                previews: post.postImages?.map((img) =>
                  typeof img === "string" ? img : img.url
                ) || ["/images/products/product-1-bg-1.png"],
              },
              // Additional fields for posts
              category:
                post.categoryName || // Direct categoryName field
                post.category?.name ||
                post.category?.categoryName ||
                (typeof post.category === "string"
                  ? post.category
                  : "Uncategorized"),
              condition: post.condition || "Not specified",
              description: post.description || "",
              createdAt: post.createdAt,
            }));

          console.log("Debug posts (any status):", debugPosts);
          setPosts(debugPosts);
          console.log("=== END POSTS DEBUG (showing debug posts) ===");
        } else {
          setPosts(transformedPosts);
          console.log("=== END POSTS DEBUG ===");
        }
        setError(null);
      } catch (error) {
        console.error("Error fetching posts:", error);

        // Provide more specific error messages
        const err = error as {
          code?: string;
          response?: { status: number };
          message?: string;
          name?: string;
        };

        console.log("📊 Error details:", {
          code: err.code,
          message: err.message,
          name: err.name,
          status: err.response?.status,
        });

        if (
          err.code === "ERR_NETWORK" ||
          err.message?.includes("Network Error")
        ) {
          setError(
            "🚫 CORS Error: Backend is running but blocking browser requests. Add CORS policy for http://localhost:3000 in your backend."
          );
        } else if (err.response?.status === 404) {
          setError(
            "❌ API endpoint not found - Check if /api/posts exists in backend"
          );
        } else if (err.response?.status && err.response.status >= 500) {
          setError("⚠️ Server error - Check backend logs");
        } else {
          setError(
            `❌ Failed to load posts: ${err.message || "Unknown error"}`
          );
        }

        // Fallback to empty array on error
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No posts available at the moment.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7.5 gap-y-9">
        {posts.map((item, key) => (
          <ProductItem item={item} key={key} />
        ))}
      </div>
    );
  };
  return (
    <section className="overflow-hidden pt-15">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.11826 15.4622C4.11794 16.6668 5.97853 16.6668 9.69971 16.6668H10.3007C14.0219 16.6668 15.8825 16.6668 16.8821 15.4622M3.11826 15.4622C2.11857 14.2577 2.46146 12.429 3.14723 8.77153C3.63491 6.17055 3.87875 4.87006 4.8045 4.10175M3.11826 15.4622C3.11826 15.4622 3.11826 15.4622 3.11826 15.4622ZM16.8821 15.4622C17.8818 14.2577 17.5389 12.429 16.8532 8.77153C16.3655 6.17055 16.1216 4.87006 15.1959 4.10175M16.8821 15.4622C16.8821 15.4622 16.8821 15.4622 16.8821 15.4622ZM15.1959 4.10175C14.2701 3.33345 12.947 3.33345 10.3007 3.33345H9.69971C7.0534 3.33345 5.73025 3.33345 4.8045 4.10175M15.1959 4.10175C15.1959 4.10175 15.1959 4.10175 15.1959 4.10175ZM4.8045 4.10175C4.8045 4.10175 4.8045 4.10175 4.8045 4.10175Z"
                  stroke="#3C50E0"
                  strokeWidth="1.5"
                />
                <path
                  d="M7.64258 6.66678C7.98578 7.63778 8.91181 8.33345 10.0003 8.33345C11.0888 8.33345 12.0149 7.63778 12.3581 6.66678"
                  stroke="#3C50E0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              This Week’s
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              New Arrivals
            </h2>
          </div>

          <Link
            href="/shop-with-sidebar"
            className="inline-flex font-medium text-custom-sm py-2.5 px-7 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            View All Posts
          </Link>
        </div>

        {renderContent()}
      </div>
    </section>
  );
};

export default NewArrival;
