"use client";

import { useState, useEffect } from "react";
import { Category, CreateCategoryRequest } from "@/services/categories";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: CreateCategoryRequest) => Promise<void>;
  category?: Category | null;
  isLoading: boolean;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSave,
  category,
  isLoading,
}: CategoryModalProps) {
  const [categoryName, setCategoryName] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (category) {
      setCategoryName(category.categoryName);
    } else {
      setCategoryName("");
    }
    setErrors({});
  }, [category, isOpen]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!categoryName.trim()) {
      newErrors.categoryName = "Category name is required";
    } else if (categoryName.trim().length < 2) {
      newErrors.categoryName = "Category name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const categoryData: CreateCategoryRequest = {
      categoryName: categoryName.trim(),
    };

    await onSave(categoryData);
  };

  const handleClose = () => {
    setCategoryName("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/80 px-4 py-5">
      <div className="w-full max-w-md rounded-[10px] border border-stroke bg-white px-8 py-12 shadow-1 dark:border-dark-3 dark:bg-gray-dark">
        <div className="mb-8">
          <h3 className="mb-2 text-2xl font-bold text-dark dark:text-white">
            {category ? "Edit Category" : "Add New Category"}
          </h3>
          <p className="text-body-sm text-body-color dark:text-dark-6">
            {category ? "Update the category name" : "Create a new category for your products"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-5.5">
            <label
              htmlFor="categoryName"
              className="mb-3 block text-body-sm font-medium text-dark dark:text-white"
            >
              Category Name *
            </label>
            <input
              type="text"
              id="categoryName"
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className={`w-full rounded-[7px] border-[1.5px] bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
                errors.categoryName
                  ? "border-red-500 focus:border-red-500"
                  : "border-stroke"
              }`}
              disabled={isLoading}
            />
            {errors.categoryName && (
              <p className="mt-2 text-sm text-red-500">{errors.categoryName}</p>
            )}
          </div>



          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="rounded-[7px] border border-stroke bg-gray-2 px-6 py-[7px] text-dark hover:shadow-1 dark:border-dark-3 dark:bg-dark-2 dark:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2.5 rounded-[7px] bg-primary px-6 py-[7px] font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  {category ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {category ? "Update Category" : "Create Category"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}