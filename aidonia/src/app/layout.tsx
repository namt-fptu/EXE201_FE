
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EXE201_FE",
  description: "EXE201 Frontend App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
