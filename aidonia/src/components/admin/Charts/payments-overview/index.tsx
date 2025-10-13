import { PeriodPicker } from "@/app/admin/period-picker";
import { standardFormat } from "@/app/admin/lib/format-number";
import { cn } from "@/app/admin/lib/utils";
import { getPaymentsOverviewData } from "@/services/charts.services";
import { PaymentsOverviewChart } from "./chart";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export async function PaymentsOverview({
  timeFrame = "monthly",
  className,
}: PropsType) {
  const data = await getPaymentsOverviewData(timeFrame);

  return (
    <div
      className={cn(
        "grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-slate-900">
          Payments Overview
        </h2>

        <PeriodPicker defaultValue={timeFrame} sectionKey="payments_overview" />
      </div>

      <PaymentsOverviewChart data={data} />

      <dl className="grid divide-stroke text-center sm:grid-cols-2 sm:divide-x [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1">
        <div className="max-sm:mb-3 max-sm:border-b max-sm:pb-3">
          <dt className="text-xl font-bold text-slate-900">
            ${standardFormat(data.received.reduce((acc, { y }) => acc + y, 0))}
          </dt>
          <dd className="font-medium text-slate-600">Received Amount</dd>
        </div>

        <div>
          <dt className="text-xl font-bold text-slate-900">
            ${standardFormat(data.due.reduce((acc, { y }) => acc + y, 0))}
          </dt>
          <dd className="font-medium text-slate-600">Due Amount</dd>
        </div>
      </dl>
    </div>
  );
}
