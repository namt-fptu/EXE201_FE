"use client";

import Breadcrumb from "@/components/admin/Breadcrumbs/Breadcrumb";
import { CampaignVisitors } from "@/components/admin/Charts/campaign-visitors";
import { UsedDevices } from "@/components/admin/Charts/used-devices";
import AdminLayout from "@/components/admin/AdminLayout";

export default function Page() {
  return (
    <AdminLayout pageTitle="Basic Chart">
      <Breadcrumb pageName="Basic Chart" />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <UsedDevices
          timeFrame="6months"
          className="col-span-12 xl:col-span-5"
        />

        <div className="col-span-12 xl:col-span-5">
          <CampaignVisitors />
        </div>
      </div>
    </AdminLayout>
  );
}
