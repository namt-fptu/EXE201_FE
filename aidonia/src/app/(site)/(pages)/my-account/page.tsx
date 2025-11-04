import MyAccount from "@/components/MyAccount";
import React, { Suspense } from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your Aidonia account",
};

const MyAccountPage = () => {
  return (
    <main>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      }>
        <MyAccount />
      </Suspense>
    </main>
  );
};

export default MyAccountPage;
