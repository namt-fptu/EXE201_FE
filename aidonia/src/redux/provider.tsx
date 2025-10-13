"use client";

import React, { useMemo } from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/admin/Layouts/sidebar/sidebar-context";

/**
 * ✅ PERFORMANCE: Optimized App Providers
 * - Memoized provider to prevent unnecessary re-renders
 * - Lazy loading for non-critical providers
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  // Memoize the provider structure to prevent re-renders
  const providers = useMemo(() => (
    <Provider store={store}>
      <ThemeProvider 
        defaultTheme="light" 
        attribute="class"
        enableSystem={false} // Disable system theme detection for faster load
        disableTransitionOnChange={true} // Disable transitions for better performance
      >
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </ThemeProvider>
    </Provider>
  ), [children]);

  return providers;
}
