"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useUserStore from "@/redux/userStore";
import { useFirebaseUpload } from "@/hooks/useFirebaseUpload";
import api from "@/services/axios";
import Image from "next/image";
import { AxiosError } from "axios";
import DebugPanel from "@/components/Common/DebugPanel";

interface Category {
  id: number;
  name?: string;
  categoryName?: string;
}

const CreatePost = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useUserStore();
  const { uploadImage, isUploading, error, resetUpload } = useFirebaseUpload();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated() || !user) {
      router.push("/signin");
      return;
    }
  }, [isAuthenticated, user, router]);

  const [formData, setFormData] = useState({
    userPackagePackageId: 0,
    title: "",
    description: "",
    price: 0.01,
    condition: "",
    categoryId: 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.get("categories");
        const categoryData = response.data?.data || response.data;
        if (Array.isArray(categoryData)) {
          setCategories(categoryData);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        // Show user-friendly message for category loading failure
        console.log("Using default categories due to API error");
      }
    };

    const loadDraftPost = () => {
      try {
        const draftPost = localStorage.getItem("draftPost");
        if (draftPost) {
          const draft = JSON.parse(draftPost);
          const shouldLoadDraft = window.confirm(
            "You have a saved draft from a previous session. Would you like to load it?"
          );

          if (shouldLoadDraft) {
            setFormData({
              userPackagePackageId: draft.userPackagePackageId || 0,
              title: draft.title || "",
              description: draft.description || "",
              price: draft.price || 0.01,
              condition: draft.condition || "",
              categoryId: draft.categoryId || 0,
            });
            // Note: Images can't be restored from localStorage
          }

          // Clear the draft after loading (or declining to load)
          localStorage.removeItem("draftPost");
        }
      } catch (error) {
        console.error("Error loading draft post:", error);
        localStorage.removeItem("draftPost"); // Clear corrupted draft
      }
    };

    loadCategories();
    loadDraftPost();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "categoryId" ||
        name === "userPackagePackageId"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      alert(`File validation errors:\n${errors.join("\n")}`);
    }

    if (valid.length === 0) return;

    // Clean up previous URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    // Combine existing images with new ones, limit to 5 total
    const allFiles = [...selectedImages, ...valid];
    const selectedFiles = allFiles.slice(0, 5);

    if (allFiles.length > 5) {
      alert(`Maximum 5 images allowed. Only the first 5 images were selected.`);
    }

    setSelectedImages(selectedFiles);

    // Create previews
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    // Reset input value
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (selectedImages.length >= 5) {
      alert("Maximum 5 images allowed. Please remove some images first.");
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Validate files
    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      alert(`File validation errors:\n${errors.join("\n")}`);
    }

    if (valid.length === 0) return;

    // Clean up previous URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));

    // Combine existing images with new ones, limit to 5 total
    const allFiles = [...selectedImages, ...valid];
    const selectedFiles = allFiles.slice(0, 5);

    if (allFiles.length > 5) {
      alert(
        `Maximum 5 images allowed. Only the first ${5 - selectedImages.length} images were added.`
      );
    }

    setSelectedImages(selectedFiles);

    // Create previews
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    // Clean up the removed preview URL
    URL.revokeObjectURL(imagePreviews[index]);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const clearAllImages = () => {
    // Clean up all preview URLs
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const validateFiles = (
    files: File[]
  ): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not an image file`);
        return;
      }

      if (file.size > maxSize) {
        errors.push(`${file.name} is larger than 10MB`);
        return;
      }

      valid.push(file);
    });

    return { valid, errors };
  };

  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const image of selectedImages) {
      try {
        const url = await uploadImage(image, "posts", user?.id?.toString());
        if (url) {
          urls.push(url);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error(`Failed to upload image: ${image.name}`);
      }
    }

    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      alert("User not found. Please sign in again.");
      return;
    }

    if (selectedImages.length === 0) {
      alert("Please select at least one image.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user is still authenticated
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You are not authenticated. Please sign in again.");
        router.push("/signin");
        return;
      }

      // Upload images to Firebase
      const imageUrls = await uploadImages();

      // Create post with uploaded image URLs
      const postData = {
        userPackagePackageId: Number(formData.userPackagePackageId),
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        condition: formData.condition.trim(),
        categoryId: Number(formData.categoryId),
        postImages: imageUrls,
      };

      console.log("Submitting post data:", postData);
      console.log("User ID:", user.id, "Type:", typeof user.id);
      console.log("API endpoint:", `posts/${user.id}`);
      console.log("API Base URL:", process.env.NEXT_PUBLIC_API_BASE_URL);
      console.log(
        "Auth token:",
        localStorage.getItem("token") ? "Present" : "Missing"
      );

      // Check if we should use mock mode (when backend is down)
      const useMockMode =
        !process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_USE_MOCK === "true";

      if (useMockMode) {
        console.log("Using mock mode - simulating successful post creation");
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Save to localStorage as a mock database
        const mockPosts = JSON.parse(localStorage.getItem("mockPosts") || "[]");
        const newPost = {
          id: Date.now(),
          userId: user.id,
          ...postData,
          createdAt: new Date().toISOString(),
        };
        mockPosts.push(newPost);
        localStorage.setItem("mockPosts", JSON.stringify(mockPosts));

        alert("Post created successfully! (Mock Mode - Backend unavailable)");
        router.push("/");
        return;
      }

      // Validate required fields
      if (!postData.title.trim()) {
        throw new Error("Title is required");
      }
      if (!postData.description.trim()) {
        throw new Error("Description is required");
      }
      if (postData.categoryId <= 0) {
        throw new Error("Please select a valid category");
      }
      if (!postData.condition.trim()) {
        throw new Error("Please select a condition");
      }
      if (postData.price <= 0) {
        throw new Error("Price must be greater than 0");
      }
      if (!imageUrls || imageUrls.length === 0) {
        throw new Error("At least one image is required");
      }

      // Call API to create post
      const response = await api.post(`posts/${user.id}`, postData);

      if (response.status === 200 || response.status === 201) {
        alert("Post created successfully!");
        router.push("/"); // Redirect to home or posts list
      }
    } catch (error) {
      console.error("Error creating post:", error);
      let errorMessage = "Failed to create post. Please try again.";

      if (error instanceof AxiosError) {
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        console.error("Error headers:", error.response?.headers);

        if (error.response?.status === 401) {
          errorMessage = "Authentication failed. Please sign in again.";
          // Redirect to login after showing error
          setTimeout(() => {
            router.push("/signin");
          }, 2000);
        } else if (error.response?.status === 500) {
          errorMessage =
            "Server error. The backend service is currently unavailable. Please try again later.";
        } else if (error.response?.status === 400) {
          // Handle validation errors
          if (error.response?.data?.message) {
            errorMessage = `Validation error: ${error.response.data.message}`;
          } else if (error.response?.data?.error) {
            errorMessage = `Bad request: ${error.response.data.error}`;
          } else {
            errorMessage =
              "Invalid data. Please check your input and try again.";
          }
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data) {
          errorMessage =
            typeof error.response.data === "string"
              ? error.response.data
              : JSON.stringify(error.response.data);
        } else if (error.message) {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(`Error: ${errorMessage}`);
      console.log("Full error object:", error);
    } finally {
      setIsSubmitting(false);
      resetUpload();
    }
  };

  if (!isAuthenticated() || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue"></div>
          <p className="mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Create New Post
            </h1>
            <p className="mt-1 text-gray-600">
              Share your product with the community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
                placeholder="Enter post title"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
                placeholder="Describe your product"
              />
            </div>

            {/* Price and Category Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price ($) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
                  placeholder="0.01"
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
                >
                  <option value={0}>Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name || category.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label
                htmlFor="condition"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Condition *
              </label>
              <select
                id="condition"
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-blue"
              >
                <option value="">Select condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images * (Max 5 images) - {selectedImages.length}/5
                selected
              </label>
              <div
                className={`border-2 border-dashed rounded-md p-6 transition-colors ${
                  isDragOver
                    ? "border-blue-500 bg-blue-50"
                    : selectedImages.length >= 5
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-300 hover:border-blue-400"
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={selectedImages.length >= 5}
                />
                <label
                  htmlFor="image-upload"
                  className={`flex flex-col items-center justify-center ${
                    selectedImages.length >= 5
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer"
                  }`}
                >
                  <svg
                    className="w-12 h-12 text-gray-400 mb-4"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-gray-600 text-center">
                    {selectedImages.length === 0
                      ? "Click to select images or drag and drop"
                      : "Click to add more images (drag and drop also works)"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB each
                  </p>
                  {selectedImages.length >= 5 && (
                    <p className="text-sm text-red-500 mt-2">
                      Maximum 5 images reached. Remove some to add more.
                    </p>
                  )}
                </label>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-gray-700">
                      Selected Images ({imagePreviews.length})
                    </h4>
                    <button
                      type="button"
                      onClick={clearAllImages}
                      className="text-sm text-red-600 hover:text-red-800 underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors">
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-80 group-hover:opacity-100"
                          title="Remove image"
                        >
                          ×
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting || isUploading || selectedImages.length === 0
                }
                className="px-6 py-2 bg-blue text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting || isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isUploading ? "Uploading Images..." : "Creating Post..."}
                  </>
                ) : (
                  "Create Post"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <DebugPanel />
    </div>
  );
};

export default CreatePost;
