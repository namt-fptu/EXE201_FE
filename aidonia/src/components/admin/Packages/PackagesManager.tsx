"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Package, CreatePackageRequest, packagesService } from "@/services/packages";
import PackageTable from "./PackageTable";
import PackageModal from "./PackageModal";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function PackagesManager() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

  // Load packages on component mount
  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setIsLoading(true);
      const response = await packagesService.getAll();
      
      if (response.isSuccess) {
        setPackages(response.data);
      } else {
        toast.error(response.message || "Failed to load packages");
      }
    } catch (error) {
      console.error("Error loading packages:", error);
      toast.error("Failed to load packages. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePackage = () => {
    setEditingPackage(null);
    setIsModalOpen(true);
  };

  const handleEditPackage = (pkg: Package) => {
    console.log("Editing package:", pkg);
    
    if (pkg.id === undefined) {
      toast.error("Invalid package data", {
        duration: 3000,
        description: "Package ID is missing",
      });
      return;
    }
    
    setEditingPackage(pkg);
    setIsModalOpen(true);
  };

  const handleSavePackage = async (packageData: CreatePackageRequest) => {
    try {
      setIsSaving(true);
      
      if (editingPackage?.id !== undefined) {
        // Update existing package
        console.log("Updating package with ID:", editingPackage.id, "Data:", packageData);
        const response = await packagesService.update(editingPackage.id, packageData);
        console.log("Update response:", response);
        
        if (response.isSuccess) {
          toast.success("Package updated successfully!", {
            duration: 3000,
            description: `Package "${packageData.packageName}" has been updated`,
          });
          setIsModalOpen(false);
          await loadPackages(); // Reload to get fresh data
        } else {
          toast.error(response.message || "Failed to update package", {
            duration: 4000,
          });
        }
      } else {
        // Create new package
        console.log("Creating new package:", packageData);
        const response = await packagesService.create(packageData);
        console.log("Create response:", response);
        
        if (response.isSuccess) {
          toast.success("Package created successfully!", {
            duration: 3000,
            description: `Package "${packageData.packageName}" has been created`,
          });
          setIsModalOpen(false);
          await loadPackages(); // Reload to get fresh data
        } else {
          toast.error(response.message || "Failed to create package", {
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error("Error saving package:", error);
      toast.error("Failed to save package. Please try again.", {
        duration: 4000,
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePackage = (id: number) => {
    console.log("Attempting to delete package with ID:", id);
    const packageToDelete = packages.find(pkg => pkg.id === id);
    
    if (packageToDelete) {
      console.log("Package found for deletion:", packageToDelete);
      setPackageToDelete(packageToDelete);
      setShowDeleteDialog(true);
    } else {
      console.error("Package not found with ID:", id);
      toast.error("Package not found", {
        duration: 3000,
        description: `Cannot find package with ID: ${id}`,
      });
    }
  };

  const confirmDeletePackage = async () => {
    if (packageToDelete?.id === undefined) {
      toast.error("Invalid package ID", {
        duration: 3000,
      });
      return;
    }

    try {
      console.log("Deleting package with ID:", packageToDelete.id);
      const response = await packagesService.delete(packageToDelete.id);
      console.log("Delete response:", response);
      
      if (response.isSuccess) {
        toast.success("Package deleted successfully!", {
          duration: 3000,
          description: `Package "${packageToDelete.packageName}" has been removed`,
        });
        await loadPackages(); // Reload to get fresh data
      } else {
        toast.error(response.message || "Failed to delete package", {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      toast.error("Failed to delete package. Please try again.", {
        duration: 4000,
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setShowDeleteDialog(false);
      setPackageToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

  // Debug function to show package IDs
  const debugPackageIds = () => {
    console.log("=== Package IDs Debug ===");
    packages.forEach((pkg, index) => {
      console.log(`Package ${index + 1}:`, {
        id: pkg.id,
        name: pkg.packageName,
        price: pkg.price,
        postLimit: pkg.postLimit,
        durationInDays: pkg.durationInDays
      });
    });
    
    toast.info(`Found ${packages.length} packages`, {
      duration: 3000,
      description: "Check console for detailed package data with IDs",
    });
  };

  return (
    <div className="mx-auto max-w-full">
      {/* Breadcrumb */}
      <Breadcrumb pageName="Packages" />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-bold text-slate-900">
            Package Management
          </h2>
          <p className="text-body font-medium text-slate-600">
            Create, edit, and manage subscription packages
          </p>
        </div>
        <div className="flex gap-3">
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={debugPackageIds}
              className="inline-flex items-center justify-center gap-2.5 rounded-[7px] bg-gray-500 px-4 py-[7px] text-regular font-medium text-white duration-300 ease-in-out hover:bg-gray-600"
            >
              <svg className="fill-current" width="16" height="16" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Debug IDs
            </button>
          )}
          <button
            onClick={handleCreatePackage}
            className="inline-flex items-center justify-center gap-2.5 rounded-[7px] bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-[7px] text-regular font-semibold text-white duration-300 ease-in-out hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary-500/25 transform hover:scale-105"
          >
            <svg 
              className="fill-current" 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none"
            >
              <path d="M15 7H9V1C9 0.4 8.6 0 8 0C7.4 0 7 0.4 7 1V7H1C0.4 7 0 7.4 0 8C0 8.6 0.4 9 1 9H7V15C7 15.6 7.4 16 8 16C8.6 16 9 15.6 9 15V9H15C15.6 9 16 8.6 16 8C16 7.4 15.6 7 15 7Z"/>
            </svg>
            Add New Package
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
        <div className="rounded-[10px] border border-primary-200 bg-gradient-to-br from-white to-primary-50/50 px-7.5 py-6 shadow-lg shadow-primary-100/25 hover:shadow-xl hover:shadow-primary-200/30 transition-all duration-300">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-primary-100">
            <svg className="fill-primary-600" width="22" height="16" viewBox="0 0 22 16" fill="none">
              <path d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z"/>
              <path d="M11 10.9219C9.38438 10.9219 8.07812 9.61562 8.07812 8C8.07812 6.38438 9.38438 5.07812 11 5.07812C12.6156 5.07812 13.9219 6.38438 13.9219 8C13.9219 9.61562 12.6156 10.9219 11 10.9219ZM11 6.625C10.2437 6.625 9.625 7.24375 9.625 8C9.625 8.75625 10.2437 9.375 11 9.375C11.7563 9.375 12.375 8.75625 12.375 8C12.375 7.24375 11.7563 6.625 11 6.625Z"/>
            </svg>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-slate-900">
                {packages.length}
              </h4>
              <span className="text-body-sm font-semibold text-primary-700">Total Packages</span>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-accent-200 bg-gradient-to-br from-white to-accent-50/50 px-7.5 py-6 shadow-lg shadow-accent-100/25 hover:shadow-xl hover:shadow-accent-200/30 transition-all duration-300">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-accent-100">
            <svg className="fill-accent-600" width="22" height="18" viewBox="0 0 22 18" fill="none">
              <path d="M7.18418 8.03751C9.31543 8.03751 11.7949 8.03751 14.0078 8.03751C14.2891 8.03751 14.5703 7.89063 14.7188 7.64688C14.8672 7.40313 14.8672 7.12656 14.7188 6.88281L13.5 5.02344C13.3516 4.77969 13.0703 4.63281 12.7891 4.63281H11.5234C10.8281 4.63281 10.0469 3.98438 9.78906 3.25L8.5625 0.046875C8.30469 -0.6875 7.52344 -1.33594 6.82813 -1.33594H5.5625C4.86719 -1.33594 4.08594 -0.6875 3.82813 0.046875L2.60156 3.25C2.34375 3.98438 1.5625 4.63281 0.867188 4.63281H-0.398438C-1.09375 4.63281 -1.875 5.28125 -1.875 5.95313V15.4063C-1.875 16.0781 -1.09375 16.7266 -0.398438 16.7266H20.6016C21.2969 16.7266 22.0781 16.0781 22.0781 15.4063V5.95313C22.0781 5.28125 21.2969 4.63281 20.6016 4.63281H19.3359C18.6406 4.63281 17.8594 3.98438 17.6016 3.25L16.375 0.046875C16.1172 -0.6875 15.3359 -1.33594 14.6406 -1.33594H13.375C12.6797 -1.33594 11.8984 -0.6875 11.6406 0.046875L10.4141 3.25C10.1563 3.98438 9.375 4.63281 8.67969 4.63281H7.41406C6.71875 4.63281 5.9375 5.28125 5.9375 5.95313V15.4063C5.9375 16.0781 6.71875 16.7266 7.41406 16.7266H20.6016Z" />
            </svg>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-slate-900">
                {packages.length > 0 ? `${Math.round(packages.reduce((sum, pkg) => sum + pkg.price, 0) / packages.length / 1000)}K` : '0'}
              </h4>
              <span className="text-body-sm font-semibold text-accent-700">Avg Price (VND)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Package Table */}
      <PackageTable
        packages={packages}
        onEdit={handleEditPackage}
        onDelete={handleDeletePackage}
        isLoading={isLoading}
      />

      {/* Modal */}
      <PackageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSavePackage}
        package={editingPackage}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Package"
        message={`Are you sure you want to delete "${packageToDelete?.packageName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDeletePackage}
        onClose={() => {
          setShowDeleteDialog(false);
          setPackageToDelete(null);
        }}
      />
    </div>
  );
}
