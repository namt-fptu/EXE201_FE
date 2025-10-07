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
        if (trimmedName.length < 3) return "Package name must be at least 3 characters";
        if (trimmedName.length > 50) return "Package name must not exceed 50 characters";
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
        if (!Number.isInteger(postLimit)) return "Post limit must be a whole number";
        return "";

      case "durationInDays":
        if (!value.trim()) return "Duration is required";
        const duration = parseInt(value);
        if (isNaN(duration)) return "Duration must be a valid number";
        if (duration < 1) return "Duration must be at least 1 day";
        if (!Number.isInteger(duration)) return "Duration must be a whole number";
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
    return Object.values(fieldValidations).every(error => !error) &&
           Object.values(formData).every(value => value.trim() !== "");
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

    setFormData(prev => ({ ...prev, [field]: processedValue }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Final trim for package name on blur
    if (field === "packageName") {
      setFormData(prev => ({ ...prev, packageName: prev.packageName.trim() }));
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
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-[10px] border border-stroke shadow-1">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-7.5">
            <h3 className="text-title-md font-bold text-dark">
              {editPackage ? "Edit Package" : "Create New Package"}
            </h3>
            <button
              onClick={onClose}
              className="flex h-8.5 w-8.5 items-center justify-center rounded-md border border-stroke bg-gray-2 text-dark hover:border-primary hover:bg-primary hover:text-white"
              disabled={isLoading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Package Name */}
            <div className="mb-4.5">
              <div>
                <label className="text-body-sm font-medium text-dark">
                  Package Name <span className="ml-1 select-none text-red">*</span>
                </label>
                <div className="relative mt-3 [&_svg]:absolute [&_svg]:top-1/2 [&_svg]:-translate-y-1/2 [&_svg]:left-4.5">
                  <input
                    type="text"
                    placeholder="Enter package name"
                    value={formData.packageName}
                    onChange={(e) => handleInputChange("packageName", e.target.value)}
                    onBlur={() => handleBlur("packageName")}
                    disabled={isLoading}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 px-5.5 py-3 text-dark placeholder:text-dark-6 pl-12.5"
                  />
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V5a1 1 0 112 0v5a7 7 0 11-14 0V9a1 1 0 012 0v.5a.5.5 0 001 0V3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {touched.packageName && fieldValidations.packageName && (
                <div className="mt-2 flex items-center gap-1 text-red text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldValidations.packageName}
                </div>
              )}
            </div>

            {/* Price */}
            <div className="mb-4.5">
              <div>
                <label className="text-body-sm font-medium text-dark">
                  Price (VND) <span className="ml-1 select-none text-red">*</span>
                </label>
                <div className="relative mt-3 [&_svg]:absolute [&_svg]:top-1/2 [&_svg]:-translate-y-1/2 [&_svg]:left-4.5">
                  <input
                    type="text"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    onBlur={() => handleBlur("price")}
                    disabled={isLoading}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 px-5.5 py-3 text-dark placeholder:text-dark-6 pl-12.5"
                  />
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {touched.price && fieldValidations.price && (
                <div className="mt-2 flex items-center gap-1 text-red text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldValidations.price}
                </div>
              )}
            </div>

            {/* Post Limit */}
            <div className="mb-4.5">
              <div>
                <label className="text-body-sm font-medium text-dark">
                  Post Limit <span className="ml-1 select-none text-red">*</span>
                </label>
                <div className="relative mt-3 [&_svg]:absolute [&_svg]:top-1/2 [&_svg]:-translate-y-1/2 [&_svg]:left-4.5">
                  <input
                    type="text"
                    placeholder="Enter maximum posts allowed"
                    value={formData.postLimit}
                    onChange={(e) => handleInputChange("postLimit", e.target.value)}
                    onBlur={() => handleBlur("postLimit")}
                    disabled={isLoading}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 px-5.5 py-3 text-dark placeholder:text-dark-6 pl-12.5"
                  />
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {touched.postLimit && fieldValidations.postLimit && (
                <div className="mt-2 flex items-center gap-1 text-red text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldValidations.postLimit}
                </div>
              )}
            </div>

            {/* Duration in Days */}
            <div className="mb-6">
              <div>
                <label className="text-body-sm font-medium text-dark">
                  Duration (Days) <span className="ml-1 select-none text-red">*</span>
                </label>
                <div className="relative mt-3 [&_svg]:absolute [&_svg]:top-1/2 [&_svg]:-translate-y-1/2 [&_svg]:left-4.5">
                  <input
                    type="text"
                    placeholder="Enter package validity in days"
                    value={formData.durationInDays}
                    onChange={(e) => handleInputChange("durationInDays", e.target.value)}
                    onBlur={() => handleBlur("durationInDays")}
                    disabled={isLoading}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition focus:border-primary disabled:cursor-default disabled:bg-gray-2 px-5.5 py-3 text-dark placeholder:text-dark-6 pl-12.5"
                  />
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {touched.durationInDays && fieldValidations.durationInDays && (
                <div className="mt-2 flex items-center gap-1 text-red text-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldValidations.durationInDays}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex justify-center rounded-lg border border-stroke bg-gray-2 p-[13px] font-medium text-dark hover:bg-gray-3 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto w-full"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isLoading}
                className="flex justify-center rounded-lg bg-primary p-[13px] font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 flex-1"
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
