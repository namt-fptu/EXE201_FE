"use client";

import { SearchIcon } from "@/assets/icons";
import Image from "next/image";
import Link from "next/link";
import { useSidebarContext } from "../sidebar/sidebar-context";
import { MenuIcon } from "./icons";
import { UserInfo } from "./user-info";

export function Header() {
  const { toggleSidebar, isMobile } = useSidebarContext();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-primary-100 bg-gradient-to-r from-white to-primary-50/30 px-4 py-5 shadow-lg shadow-primary-100/50 backdrop-blur-sm md:px-5 2xl:px-10">
      <button
        onClick={toggleSidebar}
        className="rounded-lg border border-primary-200 bg-primary-50 px-1.5 py-1 text-primary-600 hover:bg-primary-100 transition-colors lg:hidden"
      >
        <MenuIcon />
        <span className="sr-only">Toggle Sidebar</span>
      </button>

      {isMobile && (
        <Link href={"/admin"} className="ml-2 max-[430px]:hidden min-[375px]:ml-4">
          <Image
            src={"/images/logo/logo-icon.svg"}
            width={32}
            height={32}
            alt=""
            role="presentation"
          />
        </Link>
      )}

      <div className="max-xl:hidden">
        <h1 className="mb-0.5 text-heading-5 font-bold text-primary-700">
          Aidonia Admin
        </h1>
        <p className="font-semibold text-primary-600">Admin Dashboard Management System</p>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2 min-[375px]:gap-4">
        <div className="relative w-full max-w-[300px]">
          <input
            type="search"
            placeholder="Search"
            className="flex w-full items-center gap-3.5 rounded-full border border-primary-200 bg-white/80 py-3 pl-[53px] pr-5 outline-none transition-all focus-visible:border-primary-400 focus-visible:shadow-lg focus-visible:shadow-primary-100/50 hover:bg-white"
          />

          <SearchIcon className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 max-[1015px]:size-5" />
        </div>

        <div className="shrink-0">
          <UserInfo />
        </div>
      </div>
    </header>
  );
}
