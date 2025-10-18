import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import ErrorBoundary from "@/components/Common/ErrorBoundary";
import ChatBubble from "@/components/Chat/ChatBubble";
import { Toaster } from "sonner";
import fs from "fs";
import path from "path";

// Import clear auth utility for debugging
import "@/utils/clear-auth";

// Attempt to read the SVG from the source assets folder and embed as a data URL.
// This lets us reference the exact file at build time: src/assets/logos/aidonia logo.svg
let logoUrl = "/images/logo/logo.svg"; // fallback to public URL
try {
  const svgPath = path.join(
    process.cwd(),
    "src",
    "assets",
    "logos",
    "aidonia logo.svg"
  );
  if (fs.existsSync(svgPath)) {
    const svg = fs.readFileSync(svgPath, "utf8");
    // Use utf8 data URL; encode to be safe
    logoUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
} catch {
  // If anything goes wrong, keep the fallback logoUrl
}

export const metadata: Metadata = {
  title: "EXE201_FE",
  description: "EXE201 Frontend App",
  icons: {
    icon: [
      { url: logoUrl, type: "image/svg+xml" },
      { url: logoUrl, sizes: "any" },
    ],
    shortcut: logoUrl,
    apple: logoUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <ChatBubble />
          </AuthProvider>
        </ErrorBoundary>
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
          duration={4000}
        />
      </body>
    </html>
  );
}
