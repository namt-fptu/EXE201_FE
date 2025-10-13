import { Skeleton } from "../../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";

export function TopProductsSkeleton() {
  return (
    <div className="rounded-[10px] bg-white shadow-1">
      <h2 className="px-4 py-6 text-2xl font-bold text-slate-900 md:px-6 xl:px-9">
        Top Products
      </h2>

      <div className="border-t border-stroke">
        {/* Table header skeleton */}
        <div className="grid grid-cols-5 gap-4 bg-[#F7F9FC] px-4 py-4 md:px-6 xl:px-9">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Table rows skeleton */}
        <div className="divide-y divide-stroke">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 items-center px-4 py-5 md:px-6 xl:px-9">
              {/* Product column with image and name */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
              
              {/* Category */}
              <div className="flex justify-center">
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
              
              {/* Price */}
              <div className="flex justify-center">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              {/* Sold */}
              <div className="flex justify-center">
                <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              {/* Profit */}
              <div className="flex justify-end">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer skeleton */}
        <div className="border-t border-stroke px-4 py-4 md:px-6 xl:px-9">
          <div className="flex justify-center">
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
