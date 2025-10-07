import { Skeleton } from "../../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";

export function TopChannelsSkeleton() {
  return (
    <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1">
      <h2 className="mb-5.5 text-body-2xlg font-bold text-dark">
        Top Channels
      </h2>

      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="grid grid-cols-5 gap-4 border-b border-stroke pb-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Row skeletons */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="grid grid-cols-5 gap-4 items-center py-3">
            {/* Source column with avatar and name */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            
            {/* Visitors */}
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            
            {/* Revenues */}
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            
            {/* Sales */}
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            
            {/* Conversion */}
            <div className="h-4 w-14 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="mt-6 pt-4 border-t border-stroke">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto"></div>
      </div>
    </div>
  );
}
