"use client";

import { Package } from "@/services/packages";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { cn } from "../../../app/admin/lib/utils";
import { TrashIcon } from "@/assets/icons";

interface PackageTableProps {
  packages: Package[];
  onEdit: (pkg: Package) => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
}

export default function PackageTable({
  packages,
  onEdit,
  onDelete,
  isLoading,
}: PackageTableProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDuration = (days: number) => {
    if (days === 1) return "1 day";
    if (days < 30) return `${days} days`;
    if (days === 30) return "1 month";
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  if (isLoading) {
    return (
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 sm:p-7.5">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (packages.length === 0) {
    return (
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 sm:p-7.5">
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-dark mb-2">No packages found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first package.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 sm:p-7.5">
      <Table>
        <TableHeader>
          <TableRow className="border-none bg-[#F7F9FC] [&>th]:py-4 [&>th]:text-base [&>th]:text-dark">
            <TableHead className="min-w-[220px] xl:pl-7.5">Package</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Post Limit</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right xl:pr-7.5">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {packages.map((pkg, index) => (
            <TableRow key={index} className="border-[#eee]">
              <TableCell className="min-w-[220px] xl:pl-7.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12.5 w-12.5 items-center justify-center rounded-full bg-[#3C50E0]/[0.08]">
                    <svg
                      className="w-6 h-6 text-[#3C50E0]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-slate-900 font-semibold">
                      {pkg.packageName}
                    </h5>
                    <p className="text-body-sm font-medium text-slate-500">
                      Package ID: #{pkg.id}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                <p className="text-emerald-600 font-semibold">
                  {formatPrice(pkg.price)}
                </p>
              </TableCell>

              <TableCell>
                <p className="text-slate-700 font-medium">
                  {pkg.postLimit} {pkg.postLimit === 1 ? 'post' : 'posts'}
                </p>
              </TableCell>

              <TableCell>
                <div className="max-w-fit rounded-full bg-[#219653]/[0.08] px-3.5 py-1 text-sm font-medium text-[#219653]">
                  {formatDuration(pkg.durationInDays)}
                </div>
              </TableCell>

              <TableCell className="xl:pr-7.5">
                <div className="flex items-center justify-end gap-x-3.5">
                  <button 
                    className="text-gray-600 hover:text-primary"
                    onClick={() => onEdit(pkg)}
                    title="Edit Package"
                  >
                    <span className="sr-only">Edit Package</span>
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>

                  <button 
                    className="text-gray-600 hover:text-red"
                    onClick={() => pkg.id !== undefined && onDelete(pkg.id)}
                    title="Delete Package"
                  >
                    <span className="sr-only">Delete Package</span>
                    <TrashIcon />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
