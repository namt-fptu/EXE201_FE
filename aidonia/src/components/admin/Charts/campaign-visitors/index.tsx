import { TrendingUpIcon } from "@/assets/icons";
import { compactFormat } from "@/app/admin/lib/format-number";
import { cn } from "@/app/admin/lib/utils";
import { getCampaignVisitorsData } from "@/services/charts.services";
import { CampaignVisitorsChart } from "./chart";

export async function CampaignVisitors({ className }: { className?: string }) {
  const data = await getCampaignVisitorsData();

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
