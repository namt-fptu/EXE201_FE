import MyAccount from "@/components/MyAccount";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your Aidonia account",
};

const MyAccountPage = () => {
  return (
    <main>
      <MyAccount />
    </main>
  );
};

export default MyAccountPage;
