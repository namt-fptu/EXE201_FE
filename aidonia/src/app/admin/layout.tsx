import "@/app/admin/css/satoshi.css";
import "@/app/admin/css/style.css";

import { Sidebar } from "@/components/admin/Layouts/sidebar";

import "flatpickr/dist/flatpickr.min.css";
import "jsvectormap/dist/jsvectormap.css";

import { Header } from "@/components/admin/Layouts/header";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import type { PropsWithChildren } from "react";
import Providers from "./providers";

export const metadata: Metadata = {
  title: {
    template: "%s | Aidonia Admin Dashboard",
    default: "Aidonia Admin Dashboard",
  },
  description:
    "Aidonia admin dashboard for managing users, packages, and system operations.",
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <body>
      <Providers>
        <NextTopLoader color="#5750F1" showSpinner={false} />

        <div className="flex min-h-screen">
          <Sidebar />

          <div className="w-full bg-gray-2">
            <Header />

            <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
              {children}
            </main>
          </div>
        </div>
      </Providers>
    </body>
  );
}
