import { PaymentsOverview } from "@/components/admin/Charts/payments-overview";
import { UsedDevices } from "@/components/admin/Charts/used-devices";
import { WeeksProfit } from "@/components/admin/Charts/weeks-profit";
// import { TopChannels } from "@/components/Tables/top-channels";
// import { TopChannelsSkeleton } from "@/components/Tables/top-channels/skeleton";
import { Suspense } from "react";
// import { ChatsCard } from "./_components/chats-card";
// import { OverviewCardsGroup } from "./_components/overview-cards";
// import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
// import { RegionLabels } from "./_components/region-labels";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Temporary fallback skeletons for missing components
function OverviewCardsGroup() {
  return <div>OverviewCardsGroup (placeholder)</div>;
}
function OverviewCardsSkeleton() {
  return <div>Loading...</div>;
}
function TopChannels() {
  return <div>TopChannels (placeholder)</div>;
}
function TopChannelsSkeleton() {
  return <div>Loading...</div>;
}
function ChatsCard() {
  return <div>ChatsCard (placeholder)</div>;
}
function RegionLabels() {
  return <div>RegionLabels (placeholder)</div>;
}

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

function AdminPageContent({
  selectedTimeFrame,
}: {
  selectedTimeFrame?: string;
}) {
  const { isChecking, canAccess } = useAuthGuard("/signin", {
    requireAuth: true,
    requiredRoles: ["admin"],
    message: "You do not have permission to access the admin page.",
  });

  const router = useRouter();

  useEffect(() => {
    if (!isChecking && !canAccess) {
      router.replace("/signin");
    }
  }, [isChecking, canAccess, router]);

  if (isChecking) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Suspense fallback={<OverviewCardsSkeleton />}>
        <OverviewCardsGroup />
      </Suspense>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-9 2xl:gap-7.5">
        <PaymentsOverview
          className="col-span-12 xl:col-span-7"
          key={selectedTimeFrame}
          timeFrame={selectedTimeFrame}
        />

        <WeeksProfit
          key={selectedTimeFrame}
          timeFrame={selectedTimeFrame}
          className="col-span-12 xl:col-span-5"
        />

        <UsedDevices
          className="col-span-12 xl:col-span-5"
          key={selectedTimeFrame}
          timeFrame={selectedTimeFrame}
        />

        <RegionLabels />

        <div className="col-span-12 grid xl:col-span-8">
          <Suspense fallback={<TopChannelsSkeleton />}>
            <TopChannels />
          </Suspense>
        </div>

        <Suspense fallback={null}>
          <ChatsCard />
        </Suspense>
      </div>
    </>
  );
}

export default function Home({ searchParams }: PropsType) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    searchParams.then((params) => {
      setSelectedTimeFrame(params.selected_time_frame);
    });
  }, [searchParams]);

  return <AdminPageContent selectedTimeFrame={selectedTimeFrame} />;
}
