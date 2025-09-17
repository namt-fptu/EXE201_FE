import Breadcrumb from "@/components/admin/Breadcrumbs/Breadcrumb";
import { InvoiceTable } from "@/components/admin/Tables/invoice-table";
import { TopChannels } from "@/components/admin/Tables/top-channels";
import { TopChannelsSkeleton } from "@/components/admin/Tables/top-channels/skeleton";
import { TopProducts } from "@/components/admin/Tables/top-products";
import { TopProductsSkeleton } from "@/components/admin/Tables/top-products/skeleton";

import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Tables",
};

const TablesPage = () => {
  return (
    <>
      <Breadcrumb pageName="Tables" />

      <div className="space-y-10">
        <Suspense fallback={<TopChannelsSkeleton />}>
          <TopChannels />
        </Suspense>
        
        <Suspense fallback={<TopProductsSkeleton />}>
          <TopProducts />
        </Suspense>

        <InvoiceTable />
      </div>
    </>
  );
};

export default TablesPage;
