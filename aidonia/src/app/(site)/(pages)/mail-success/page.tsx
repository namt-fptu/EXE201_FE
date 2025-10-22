import React from "react";
import MailSuccess from "@/components/MailSuccess";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Email Sent Successfully",
  description: "Your message has been sent",
};

const MailSuccessPage = () => {
  return (
    <main>
      <MailSuccess />
    </main>
  );
};

export default MailSuccessPage;
