"use client";

import { Package, CreatePackageRequest } from "@/services/packages";
import { useState, useEffect } from "react";

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
    price: 0,
    postLimit: 1,
    durationInDays: 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editPackage) {
      setFormData({
        packageName: editPackage.packageName,
        price: editPackage.price,
        postLimit: editPackage.postLimit,
        durationInDays: editPackage.durationInDays,
      });
    } else {
      setFormData({
        packageName: "",
        price: 0,
        postLimit: 1,
        durationInDays: 30,
      });
    }
    setErrors({});
  }, [editPackage, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.packageName.trim()) {
      newErrors.packageName = "Package name is required";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (formData.postLimit <= 0) {
      newErrors.postLimit = "Post limit must be greater than 0";
    }

    if (formData.durationInDays <= 0) {
      newErrors.durationInDays = "Duration must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSave(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5.5">
            {/* Package Name */}
            <div>
              <label className="mb-3 block text-body-xs font-medium text-dark dark:text-white">
                Package Name <span className="text-red">*</span>
              </label>
              <input
                type="text"
                value={formData.packageName}
                onChange={(e) => handleInputChange("packageName", e.target.value)}
                className={`w-full rounded-[7px] border bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:bg-dark-2 dark:text-white ${
                  errors.packageName 
                    ? "border-red focus:border-red" 
                    : "border-stroke dark:border-dark-3"
                }`}
                placeholder="Enter package name"
                disabled={isLoading}
              />
              {errors.packageName && (
                <p className="mt-1 text-xs text-red">{errors.packageName}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="mb-3 block text-body-xs font-medium text-dark dark:text-white">
                Price <span className="text-red">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", parseFloat(e.target.value) || 0)}
                className={`w-full rounded-[7px] border bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:bg-dark-2 dark:text-white ${
                  errors.price 
                    ? "border-red focus:border-red" 
                    : "border-stroke dark:border-dark-3"
                }`}
                placeholder="Enter price (VND)"
                min="0"
                step="1000"
                disabled={isLoading}
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red">{errors.price}</p>
              )}
            </div>

            {/* Post Limit */}
            <div>
              <label className="mb-3 block text-body-xs font-medium text-dark dark:text-white">
                Post Limit <span className="text-red">*</span>
              </label>
              <input
                type="number"
                value={formData.postLimit}
                onChange={(e) => handleInputChange("postLimit", parseInt(e.target.value) || 1)}
                className={`w-full rounded-[7px] border bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:bg-dark-2 dark:text-white ${
                  errors.postLimit 
                    ? "border-red focus:border-red" 
                    : "border-stroke dark:border-dark-3"
                }`}
                placeholder="Enter post limit"
                min="1"
                disabled={isLoading}
              />
              {errors.postLimit && (
                <p className="mt-1 text-xs text-red">{errors.postLimit}</p>
              )}
            </div>

            {/* Duration in Days */}
            <div>
              <label className="mb-3 block text-body-xs font-medium text-dark dark:text-white">
                Duration (Days) <span className="text-red">*</span>
              </label>
              <input
                type="number"
                value={formData.durationInDays}
                onChange={(e) => handleInputChange("durationInDays", parseInt(e.target.value) || 1)}
                className={`w-full rounded-[7px] border bg-transparent px-5.5 py-3 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:bg-dark-2 dark:text-white ${
                  errors.durationInDays 
                    ? "border-red focus:border-red" 
                    : "border-stroke dark:border-dark-3"
                }`}
                placeholder="Enter duration in days"
                min="1"
                disabled={isLoading}
              />
              {errors.durationInDays && (
                <p className="mt-1 text-xs text-red">{errors.durationInDays}</p>
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
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  editPackage ? "Update Package" : "Create Package"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}