import React from "react";
import Error from "@/components/Error";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Error",
  description: "An error occurred",
};

const ErrorPage = () => {
  return (
    <main>
      <Error />
    </main>
  );
};

export default ErrorPage;
