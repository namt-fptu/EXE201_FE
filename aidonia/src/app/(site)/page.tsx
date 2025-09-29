import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aidonia - Website Mua Bán, Trao Đổi Đồ Dùng Cũ Dành Cho Sinh Viên",
  description: "This is Home for Aidonia Website",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
