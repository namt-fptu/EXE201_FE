"use client";

import { PeriodPicker } from "@/app/admin/period-picker";
import { cn } from "@/app/admin/lib/utils";
import { DonutChart } from "./chart";
import { useState, useEffect } from "react";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export function UsedDevices({
  timeFrame = "monthly",
  className,
}: PropsType) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Mock data for now - replace with actual API call
        const mockData = [
          { name: "Desktop", value: 45.2, color: "#5750F1" },
          { name: "Mobile", value: 38.8, color: "#0ABEF9" },
          { name: "Tablet", value: 16.0, color: "#06D6A0" },
        ];
        setData(mockData);
      } catch (error) {
        console.error("Error fetching devices data:", error);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeFrame]);

  if (isLoading) {
    return (
      <div className={cn(
        "grid grid-cols-1 grid-rows-[auto_1fr] gap-9 rounded-[10px] bg-white p-7.5 shadow-1",
        className,
      )}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-body-2xlg font-bold text-slate-900">
            Used Devices
          </h2>
          <PeriodPicker defaultValue={timeFrame} sectionKey="used_devices" />
        </div>
        <div className="grid place-items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-sm text-gray-600">Loading chart...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 grid-rows-[auto_1fr] gap-9 rounded-[10px] bg-white p-7.5 shadow-1",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-slate-900">
          Used Devices
        </h2>

        <PeriodPicker defaultValue={timeFrame} sectionKey="used_devices" />
      </div>

      <div className="grid place-items-center">
        {data && data.length > 0 ? (
          <DonutChart data={data} />
        ) : (
          <div className="text-sm text-gray-500">No data available</div>
        )}
      </div>
    </div>
  );
}
