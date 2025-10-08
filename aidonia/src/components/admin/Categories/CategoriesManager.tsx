"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Category, categoriesService, CreateCategoryRequest } from "@/services/categories";
import CategoryTable from "@/components/admin/Categories/CategoryTable";
import CategoryModal from "@/components/admin/Categories/CategoryModal";
import Breadcrumb from "@/components/admin/Breadcrumbs/Breadcrumb";
import ConfirmDialog from "@/components/admin/ui/ConfirmDialog";

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await categoriesService.getAll();

      if (response.isSuccess) {
        setCategories(response.data);
      } else {
        toast.error(response.message || "Failed to load categories");
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (categoryData: CreateCategoryRequest) => {
    try {
      setIsSaving(true);

      if (editingCategory) {
        // Update existing category
        const response = await categoriesService.update(editingCategory.id, categoryData);

        if (response.isSuccess) {
          toast.success("Category updated successfully!", {
            duration: 3000,
            description: `Category "${categoryData.categoryName}" has been updated`,
          });
          setIsModalOpen(false);
          await loadCategories();
        } else {
          toast.error(response.message || "Failed to update category", {
            duration: 4000,
          });
        }
      } else {
        // Create new category
        const response = await categoriesService.create(categoryData);

        if (response.isSuccess) {
          toast.success("Category created successfully!", {
            duration: 3000,
            description: `Category "${categoryData.categoryName}" has been created`,
          });
          setIsModalOpen(false);
          await loadCategories();
        } else {
          toast.error(response.message || "Failed to create category", {
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category. Please try again.", {
        duration: 4000,
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = (id: number) => {
    const categoryToDelete = categories.find((cat) => cat.id === id);

    if (categoryToDelete) {
      setCategoryToDelete(categoryToDelete);
      setShowDeleteDialog(true);
    } else {
      toast.error("Category not found", {
        duration: 3000,
        description: `Cannot find category with ID: ${id}`,
      });
    }
  };

  const confirmDeleteCategory = async () => {
    if (categoryToDelete?.id === undefined) {
      toast.error("Invalid category ID", {
        duration: 3000,
      });
      return;
    }

    try {
      const response = await categoriesService.delete(categoryToDelete.id);

      if (response.isSuccess) {
        toast.success("Category deleted successfully!", {
          duration: 3000,
          description: `Category "${categoryToDelete.categoryName}" has been removed`,
        });
        await loadCategories();
      } else {
        toast.error(response.message || "Failed to delete category", {
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.", {
        duration: 4000,
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="mx-auto max-w-full">
      {/* Breadcrumb */}
      <Breadcrumb pageName="Categories" />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md2 font-bold text-slate-900">
            Category Management
          </h2>
          <p className="text-body font-medium text-slate-600">
            Create, edit, and manage product categories
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateCategory}
            className="inline-flex items-center justify-center gap-2.5 rounded-[7px] bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-[7px] text-regular font-semibold text-white duration-300 ease-in-out hover:from-primary-600 hover:to-primary-700 hover:shadow-lg hover:shadow-primary-500/25 transform hover:scale-105"
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M15 7H9V1C9 0.4 8.6 0 8 0C7.4 0 7 0.4 7 1V7H1C0.4 7 0 7.4 0 8C0 8.6 0.4 9 1 9H7V15C7 15.6 7.4 16 8 16C8.6 16 9 15.6 9 15V9H15C15.6 9 16 8.6 16 8C16 7.4 15.6 7 15 7Z" />
            </svg>
            Add New Category
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-2 2xl:gap-7.5">
        <div className="rounded-[10px] border border-primary-200 bg-gradient-to-br from-white to-primary-50/50 px-7.5 py-6 shadow-lg shadow-primary-100/25 hover:shadow-xl hover:shadow-primary-200/30 transition-all duration-300">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-primary-100">
            <svg className="fill-primary-600" width="22" height="16" viewBox="0 0 22 16" fill="none">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-slate-900">
                {categories.length}
              </h4>
              <span className="text-body-sm font-semibold text-primary-700">Total Categories</span>
            </div>
          </div>
        </div>

        <div className="rounded-[10px] border border-accent-200 bg-gradient-to-br from-white to-accent-50/50 px-7.5 py-6 shadow-lg shadow-accent-100/25 hover:shadow-xl hover:shadow-accent-200/30 transition-all duration-300">
          <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-accent-100">
            <svg className="fill-accent-600" width="22" height="18" viewBox="0 0 22 18" fill="none">
              <path d="M7.18418 8.03751C9.31543 8.03751 11.7949 8.03751 14.0078 8.03751C14.2891 8.03751 14.5703 7.89063 14.7188 7.64688C14.8672 7.40313 14.8672 7.12656 14.7188 6.88281L13.5 5.02344C13.3516 4.77969 13.0703 4.63281 12.7891 4.63281H11.5234C10.8281 4.63281 10.0469 3.98438 9.78906 3.25L8.5625 0.046875C8.30469 -0.6875 7.52344 -1.33594 6.82813 -1.33594H1.125C0.507812 -1.33594 0 -0.828125 0 -0.210938V3.25C0 3.86719 0.507812 4.375 1.125 4.375H2.25V14.5C2.25 15.9453 3.42188 17.1172 4.86719 17.1172H17.1328C18.5781 17.1172 19.75 15.9453 19.75 14.5V8.03751C19.75 7.42032 19.2422 6.91251 18.625 6.91251H7.18418Z" />
            </svg>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-md font-bold text-slate-900">
                {categories.length > 0 ? Math.round(categories.length / 2) : 0}
              </h4>
              <span className="text-body-sm font-semibold text-accent-700">Active Categories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Table */}
      <CategoryTable
        categories={categories}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
        isLoading={isLoading}
      />

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCategory}
        category={editingCategory}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={confirmDeleteCategory}
        onClose={() => {
          setShowDeleteDialog(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
}