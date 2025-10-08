"use client";

import { TrendingUpIcon } from "@/assets/icons";
import { compactFormat } from "@/app/admin/lib/format-number";
import { cn } from "@/app/admin/lib/utils";
import { CampaignVisitorsChart } from "./chart";
import { useState, useEffect } from "react";

export function CampaignVisitors({ className }: { className?: string }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Mock data for now - replace with actual API call
        const mockData = {
          total_visitors: 12584,
          performance: 12.5,
          chart: [
            { x: "Jan", y: 2500 },
            { x: "Feb", y: 3200 },
            { x: "Mar", y: 2800 },
            { x: "Apr", y: 3800 },
            { x: "May", y: 4200 },
            { x: "Jun", y: 3900 },
          ]
        };
        setData(mockData);
      } catch (error) {
        console.error("Error fetching campaign visitors data:", error);
        // Set fallback data
        setData({
          total_visitors: 0,
          performance: 0,
          chart: []
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className={cn(
        "rounded-[10px] bg-gradient-to-br from-white to-primary-50/30 shadow-lg shadow-primary-100/25 border border-primary-100 hover:shadow-xl hover:shadow-primary-200/30 transition-all duration-300",
        className,
      )}>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-sm text-gray-600">Loading chart...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn(
        "rounded-[10px] bg-gradient-to-br from-white to-primary-50/30 shadow-lg shadow-primary-100/25 border border-primary-100",
        className,
      )}>
        <div className="p-6 flex items-center justify-center h-64">
          <span className="text-sm text-gray-500">Failed to load chart data</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-[10px] bg-gradient-to-br from-white to-primary-50/30 shadow-lg shadow-primary-100/25 border border-primary-100 hover:shadow-xl hover:shadow-primary-200/30 transition-all duration-300",
        className,
      )}
    >
      <div className="border-b border-primary-200 px-6 py-5.5">
        <div className="flex justify-between">
          <h2 className="mb-1.5 text-2xl font-bold text-primary-700">
            Campaign Visitors
          </h2>

          <div className="mb-0.5 text-2xl font-bold text-primary-700">
            {compactFormat(data.total_visitors)}
          </div>
        </div>

        <div className="flex justify-between">
          <div className="text-sm font-semibold text-primary-600">Last Campaign Performance</div>

          <div
            className={cn(
              "flex items-center gap-1.5",
              data.performance > 0 ? "text-accent-600" : "text-red-600",
            )}
          >
            <TrendingUpIcon
              className={`${data.performance > 0 ? "-rotate-6" : "scale-y-[-1]"}`}
            />

            <span className="text-sm font-medium">{data.performance}%</span>
          </div>
        </div>
      </div>

      <CampaignVisitorsChart data={data.chart} />
    </div>
  );
}
