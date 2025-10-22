import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product Details",
  description: "View product details on Aidonia",
};

const ShopDetailsPage = () => {
  return (
    <main>
      <ShopDetails />
    </main>
  );
};

export default ShopDetailsPage;
