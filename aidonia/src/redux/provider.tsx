"use client";

import React from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/admin/Layouts/sidebar/sidebar-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" attribute="class">
        <SidebarProvider>{children}</SidebarProvider>
      </ThemeProvider>
    </Provider>
  );
}
