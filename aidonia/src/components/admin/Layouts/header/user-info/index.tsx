"use client";

import { ChevronUpIcon } from "@/assets/icons";
import {
  Dropdown,
  DropdownContent,
  DropdownTrigger,
} from "@/components/admin/ui/dropdown";
import { cn } from "@/app/admin/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { LogOutIcon, SettingsIcon, UserIcon } from "./icons";
import useUserStore from "@/redux/userStore";

export function UserInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useUserStore();

  const displayUser = {
    name: user?.userName || "User",
    email: user?.email || "user@example.com",
    img: user?.avataImage || "/images/user/user-03.png",
  };

  return (
    <Dropdown isOpen={isOpen} setIsOpen={setIsOpen}>
      <DropdownTrigger className="rounded-lg align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-2 transition-all duration-200 hover:bg-slate-50 px-3 py-2">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-900 font-bold shadow-md border-2 border-slate-200">
            {displayUser.name.charAt(0).toUpperCase()}
          </div>
          <figcaption className="flex items-center gap-2 font-semibold text-slate-800">
            <span className="text-sm">{displayUser.name}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform duration-300 w-4 h-4",
                isOpen && "rotate-0",
              )}
              strokeWidth={2}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-slate-200 bg-white shadow-xl rounded-xl min-[230px]:min-w-[18rem] overflow-hidden"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-slate-200">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-900 font-bold shadow-lg text-lg border-2 border-slate-200">
            {displayUser.name.charAt(0).toUpperCase()}
          </div>
          <figcaption className="space-y-1 text-base font-medium flex-1">
            <div className="mb-1 leading-none text-slate-900 font-bold text-base">
              {displayUser.name}
            </div>

            <div className="leading-none text-slate-600 text-sm truncate">{displayUser.email}</div>
          </figcaption>
        </figure>

        <div className="p-2 text-base text-slate-700 [&>*]:cursor-pointer">
          <Link
            href={"/admin/profile"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 group"
          >
            <div className="p-1.5 rounded-md bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
              <UserIcon />
            </div>
            <span className="mr-auto text-sm font-semibold">View Profile</span>
          </Link>

          <Link
            href={"/admin/pages/settings"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 group"
          >
            <div className="p-1.5 rounded-md bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-all duration-200">
              <SettingsIcon />
            </div>
            <span className="mr-auto text-sm font-semibold">Account Settings</span>
          </Link>
        </div>

        <hr className="border-slate-200 my-1" />

        <div className="p-2 text-base text-slate-700">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all duration-200 group"
            onClick={() => {
              setIsOpen(false);
              logout();
              window.location.href = "/signin";
            }}
          >
            <div className="p-1.5 rounded-md bg-red-100 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all duration-200">
              <LogOutIcon />
            </div>
            <span className="text-sm font-semibold">Log Out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
