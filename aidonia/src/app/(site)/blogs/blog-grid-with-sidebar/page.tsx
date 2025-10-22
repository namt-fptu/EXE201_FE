import React from "react";
import BlogGridWithSidebar from "@/components/BlogGridWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog",
  description: "Read the latest articles on Aidonia",
};

const BlogGridWithSidebarPage = () => {
  return (
    <>
      <BlogGridWithSidebar />
    </>
  );
};

export default BlogGridWithSidebarPage;
