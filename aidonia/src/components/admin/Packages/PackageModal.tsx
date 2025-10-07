"use client";

import { Package, CreatePackageRequest } from "@/services/packages";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (packageData: CreatePackageRequest) => Promise<void>;
  package?: Package | null;
  isLoading: boolean;
}

export default function PackageModal({
  isOpen,
  onClose,
  onSave,
  package: editPackage,
  isLoading,
}: PackageModalProps) {
  const [formData, setFormData] = useState({
    packageName: "",
    price: "",
    postLimit: "",
    durationInDays: "",
  });

  const [touched, setTouched] = useState({
    packageName: false,
    price: false,
    postLimit: false,
    durationInDays: false,
  });

  useEffect(() => {
    if (editPackage) {
      setFormData({
        packageName: editPackage.packageName,
        price: editPackage.price.toString(),
        postLimit: editPackage.postLimit.toString(),
        durationInDays: editPackage.durationInDays.toString(),
      });
    } else {
      setFormData({
        packageName: "",
        price: "",
        postLimit: "",
        durationInDays: "",
      });
    }
    setTouched({
      packageName: false,
      price: false,
      postLimit: false,
      durationInDays: false,
    });
  }, [editPackage, isOpen]);

  // Enhanced validation function with specific error messages
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "packageName":
        const trimmedName = value.trim();
        if (!trimmedName) return "Package name is required";
        if (trimmedName.length < 3)
          return "Package name must be at least 3 characters";
        if (trimmedName.length > 50)
          return "Package name must not exceed 50 characters";
        return "";

      case "price":
        if (!value.trim()) return "Price is required";
        const price = parseFloat(value);
        if (isNaN(price)) return "Price must be a valid number";
        if (price < 0) return "Price cannot be negative";
        return "";

      case "postLimit":
        if (!value.trim()) return "Post limit is required";
        const postLimit = parseInt(value);
        if (isNaN(postLimit)) return "Post limit must be a valid number";
        if (postLimit < 1) return "Post limit must be at least 1";
        if (!Number.isInteger(postLimit))
          return "Post limit must be a whole number";
        return "";

      case "durationInDays":
        if (!value.trim()) return "Duration is required";
        const duration = parseInt(value);
        if (isNaN(duration)) return "Duration must be a valid number";
        if (duration < 1) return "Duration must be at least 1 day";
        if (!Number.isInteger(duration))
          return "Duration must be a whole number";
        return "";

      default:
        return "";
    }
  };

  // Real-time validation using useMemo
  const fieldValidations = useMemo(() => {
    return {
      packageName: validateField("packageName", formData.packageName),
      price: validateField("price", formData.price),
      postLimit: validateField("postLimit", formData.postLimit),
      durationInDays: validateField("durationInDays", formData.durationInDays),
    };
  }, [formData]);

  // Check if form is valid
  const isFormValid = useMemo(() => {
    return (
      Object.values(fieldValidations).every((error) => !error) &&
      Object.values(formData).every((value) => value.trim() !== "")
    );
  }, [fieldValidations, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      packageName: true,
      price: true,
      postLimit: true,
      durationInDays: true,
    });

    if (!isFormValid) {
      toast.error("Please fix all errors before submitting", {
        duration: 4000,
      });
      return;
    }

    try {
      const submitData: CreatePackageRequest = {
        packageName: formData.packageName.trim(),
        price: parseFloat(formData.price),
        postLimit: parseInt(formData.postLimit),
        durationInDays: parseInt(formData.durationInDays),
      };

      await onSave(submitData);
    } catch (error) {
      toast.error("Failed to save package", {
        duration: 4000,
      });
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    let processedValue = value;

    // Auto-trim for package name
    if (field === "packageName") {
      processedValue = value.trimStart(); // Remove leading spaces while typing
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Final trim for package name on blur
    if (field === "packageName") {
      setFormData((prev) => ({
        ...prev,
        packageName: prev.packageName.trim(),
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-dark rounded-[10px] border border-stroke dark:border-dark-3 shadow-1 dark:shadow-card">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-7.5">
            <h3 className="text-title-md font-bold text-dark dark:text-white">
              {editPackage ? "Edit Package" : "Create New Package"}
            </h3>
            <button
              onClick={onClose}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-md border border-stroke bg-gray-2 text-dark hover:border-primary hover:bg-primary hover:text-white dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:border-primary dark:hover:bg-primary"
              disabled={isLoading}
            >
              <svg
                className="w-4 h-4"
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Package Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-dark dark:text-white">
                Package Name <span className="text-red">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.packageName}
                  onChange={(e) =>
                    handleInputChange("packageName", e.target.value)
                  }
                  onBlur={() => handleBlur("packageName")}
                  className={`w-full rounded-lg border-2 bg-transparent px-4 py-3 text-dark outline-none transition-all duration-200 placeholder:text-gray-400 disabled:cursor-default disabled:bg-gray-2 dark:bg-dark-2 dark:text-white ${
                    touched.packageName && fieldValidations.packageName
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : touched.packageName && !fieldValidations.packageName
                        ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-dark-3"
                  }`}
                  placeholder="Enter package name (3-50 characters)"
                  disabled={isLoading}
                  maxLength={50}
                />
                {/* Character counter */}
                <div className="absolute right-3 top-3 text-xs text-gray-400">
                  {formData.packageName.length}/50
                </div>
              </div>
              {touched.packageName && fieldValidations.packageName && (
                <div className="flex items-center gap-1 text-red-500">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">
                    {fieldValidations.packageName}
                  </span>
                </div>
              )}
              {touched.packageName &&
                !fieldValidations.packageName &&
                formData.packageName && (
                  <div className="flex items-center gap-1 text-green-500">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">Looks good!</span>
                  </div>
                )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-dark dark:text-white">
                  Price <span className="text-red">*</span>
                </label>
                <div className="relative group">
                  <svg
                    className="w-4 h-4 text-gray-400 cursor-help"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Enter price in VND (numbers and decimals only)
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  onBlur={() => handleBlur("price")}
                  className={`w-full rounded-lg border-2 bg-transparent pl-12 pr-4 py-3 text-dark outline-none transition-all duration-200 placeholder:text-gray-400 disabled:cursor-default disabled:bg-gray-2 dark:bg-dark-2 dark:text-white ${
                    touched.price && fieldValidations.price
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : touched.price && !fieldValidations.price
                        ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-dark-3"
                  }`}
                  placeholder="0.00"
                  disabled={isLoading}
                />
                {/* Currency symbol */}
                <div className="absolute left-3 top-3 text-gray-500 font-medium">
                  ₫
                </div>
                {/* Formatted preview */}
                {formData.price && !fieldValidations.price && (
                  <div className="absolute right-3 top-3 text-sm text-gray-500">
                    {new Intl.NumberFormat("vi-VN").format(
                      parseFloat(formData.price) || 0
                    )}{" "}
                    VND
                  </div>
                )}
              </div>
              {touched.price && fieldValidations.price && (
                <div className="flex items-center gap-1 text-red-500">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">{fieldValidations.price}</span>
                </div>
              )}
              {touched.price && !fieldValidations.price && formData.price && (
                <div className="flex items-center gap-1 text-green-500">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">Valid price format!</span>
                </div>
              )}
            </div>

            {/* Post Limit */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-dark dark:text-white">
                  Post Limit <span className="text-red">*</span>
                </label>
                <div className="relative group">
                  <svg
                    className="w-4 h-4 text-gray-400 cursor-help"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Maximum number of posts allowed for this package
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.postLimit}
                  onChange={(e) =>
                    handleInputChange("postLimit", e.target.value)
                  }
                  onBlur={() => handleBlur("postLimit")}
                  className={`w-full rounded-lg border-2 bg-transparent pl-12 pr-16 py-3 text-dark outline-none transition-all duration-200 placeholder:text-gray-400 disabled:cursor-default disabled:bg-gray-2 dark:bg-dark-2 dark:text-white ${
                    touched.postLimit && fieldValidations.postLimit
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : touched.postLimit && !fieldValidations.postLimit
                        ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-dark-3"
                  }`}
                  placeholder="1"
                  disabled={isLoading}
                />
                {/* Icon */}
                <div className="absolute left-3 top-3 text-gray-500">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {/* Posts label */}
                <div className="absolute right-3 top-3 text-sm font-medium text-gray-500">
                  posts
                </div>
              </div>
              {touched.postLimit && fieldValidations.postLimit && (
                <div className="flex items-center gap-1 text-red-500">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">{fieldValidations.postLimit}</span>
                </div>
              )}
              {touched.postLimit &&
                !fieldValidations.postLimit &&
                formData.postLimit && (
                  <div className="flex items-center gap-1 text-green-500">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">Valid post limit!</span>
                  </div>
                )}
            </div>

            {/* Duration in Days */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-dark dark:text-white">
                  Duration (Days) <span className="text-red">*</span>
                </label>
                <div className="relative group">
                  <svg
                    className="w-4 h-4 text-gray-400 cursor-help"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Package validity period in days
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={formData.durationInDays}
                  onChange={(e) =>
                    handleInputChange("durationInDays", e.target.value)
                  }
                  onBlur={() => handleBlur("durationInDays")}
                  className={`w-full rounded-lg border-2 bg-transparent pl-12 pr-16 py-3 text-dark outline-none transition-all duration-200 placeholder:text-gray-400 disabled:cursor-default disabled:bg-gray-2 dark:bg-dark-2 dark:text-white ${
                    touched.durationInDays && fieldValidations.durationInDays
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : touched.durationInDays &&
                          !fieldValidations.durationInDays
                        ? "border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-dark-3"
                  }`}
                  placeholder="30"
                  disabled={isLoading}
                />
                {/* Calendar icon */}
                <div className="absolute left-3 top-3 text-gray-500">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                {/* Days label */}
                <div className="absolute right-3 top-3 text-sm font-medium text-gray-500">
                  days
                </div>
              </div>
              {touched.durationInDays && fieldValidations.durationInDays && (
                <div className="flex items-center gap-1 text-red-500">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm">
                    {fieldValidations.durationInDays}
                  </span>
                </div>
              )}
              {touched.durationInDays &&
                !fieldValidations.durationInDays &&
                formData.durationInDays && (
                  <div className="flex items-center gap-1 text-green-500">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm">Valid duration!</span>
                  </div>
                )}
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-5.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex flex-1 justify-center rounded-[7px] border border-stroke bg-gray-2 px-6 py-[7px] text-dark transition hover:border-gray-3 hover:bg-gray-3 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:hover:border-gray dark:hover:bg-gray disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex flex-1 justify-center rounded-[7px] bg-primary px-6 py-[7px] font-medium text-gray-2 transition hover:bg-blue-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </div>
                ) : editPackage ? (
                  "Update Package"
                ) : (
                  "Create Package"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
