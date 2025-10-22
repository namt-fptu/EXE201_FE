import React from "react";
import { Wishlist } from "@/components/Wishlist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Your favorite items on Aidonia",
};

const WishlistPage = () => {
  return (
    <main>
      <Wishlist />
    </main>
  );
};

export default WishlistPage;
