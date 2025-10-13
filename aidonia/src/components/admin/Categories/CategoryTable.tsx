"use client";

import { Category } from "@/services/categories";

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export default function CategoryTable({
  categories,
  onEdit,
  onDelete,
  isLoading,
}: CategoryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-[10px] border border-gray-200 bg-white px-7.5 py-6 shadow-lg shadow-gray-100/25">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-1/4 rounded-md bg-gray-200"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-4 border-b border-gray-100 py-3"
              >
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-[10px] border border-gray-200 bg-white px-7.5 py-16 text-center shadow-lg shadow-gray-100/25">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-8 w-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No categories found
          </h3>
          <p className="text-gray-500">
            Get started by creating your first category.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-stroke bg-white px-7.5 py-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="mb-6 flex items-center justify-between">
        <h4 className="text-title-lg font-bold text-dark dark:text-white">
          Category List ({categories.length})
        </h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-dark-2">
              <th className="min-w-[220px] px-4 py-4 font-semibold text-dark dark:text-white xl:pl-7.5">
                Category Name
              </th>
              <th className="min-w-[150px] px-4 py-4 font-semibold text-dark dark:text-white">
                Category ID
              </th>
              <th className="min-w-[120px] px-4 py-4 font-semibold text-dark dark:text-white">
                Created Date
              </th>
              <th className="px-4 py-4 text-center font-semibold text-dark dark:text-white xl:pr-7.5">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, key) => (
              <tr
                key={category.id}
                className={`${
                  key === categories.length - 1
                    ? ""
                    : "border-b border-stroke dark:border-dark-3"
                } hover:bg-gray-50 dark:hover:bg-dark-3`}
              >
                <td className="px-4 py-4 xl:pl-7.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                    </div>
                    <div>
                      <h5 className="font-semibold text-dark dark:text-white">
                        {category.categoryName}
                      </h5>
                      <p className="text-body-sm text-gray-500">
                        ID: {category.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="text-dark dark:text-white">
                    Category #{category.id}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="text-dark dark:text-white">
                    {new Date().toLocaleDateString("vi-VN")}
                  </p>
                </td>
                <td className="px-4 py-4 text-center xl:pr-7.5">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(category)}
                      className="inline-flex items-center justify-center rounded-md bg-blue-100 px-3 py-1.5 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/25 dark:text-blue-400 dark:hover:bg-blue-900/50"
                      title="Edit category"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(category.id)}
                      className="inline-flex items-center justify-center rounded-md bg-red-100 px-3 py-1.5 text-red-600 hover:bg-red-200 dark:bg-red-900/25 dark:text-red-400 dark:hover:bg-red-900/50"
                      title="Delete category"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}