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
      <DropdownTrigger className="rounded align-middle outline-none ring-primary ring-offset-2 focus-visible:ring-1">
        <span className="sr-only">My Account</span>

        <figure className="flex items-center gap-3">
          <Image
            src={displayUser.img}
            className="size-12"
            alt={"Avatar of " + displayUser.name}
            role="presentation"
            width={200}
            height={200}
          />
          <figcaption className="flex items-center gap-1 font-medium text-slate-800 max-[1024px]:sr-only">
            <span>{displayUser.name}</span>

            <ChevronUpIcon
              aria-hidden
              className={cn(
                "rotate-180 transition-transform",
                isOpen && "rotate-0",
              )}
              strokeWidth={1.5}
            />
          </figcaption>
        </figure>
      </DropdownTrigger>

      <DropdownContent
        className="border border-stroke bg-white shadow-md min-[230px]:min-w-[17.5rem]"
        align="end"
      >
        <h2 className="sr-only">User information</h2>

        <figure className="flex items-center gap-2.5 px-5 py-3.5">
          <Image
            src={displayUser.img}
            className="size-12"
            alt={"Avatar for " + displayUser.name}
            role="presentation"
            width={200}
            height={200}
          />

          <figcaption className="space-y-1 text-base font-medium">
            <div className="mb-2 leading-none text-slate-900 font-semibold">
              {displayUser.name}
            </div>

            <div className="leading-none text-slate-600">{displayUser.email}</div>
          </figcaption>
        </figure>

        <hr className="border-[#E8E8E8]" />

        <div className="p-2 text-base text-[#4B5563] [&>*]:cursor-pointer">
          <Link
            href={"/admin/profile"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark"
          >
            <UserIcon />
            <span className="mr-auto text-base font-medium">View profile</span>
          </Link>

          <Link
            href={"/admin/pages/settings"}
            onClick={() => setIsOpen(false)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark"
          >
            <SettingsIcon />
            <span className="mr-auto text-base font-medium">Account Settings</span>
          </Link>
        </div>

        <hr className="border-[#E8E8E8]" />

        <div className="p-2 text-base text-[#4B5563]">
          <button
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] hover:bg-gray-2 hover:text-dark"
            onClick={() => {
              setIsOpen(false);
              logout();
              window.location.href = "/signin";
            }}
          >
            <LogOutIcon />
            <span className="text-base font-medium">Log out</span>
          </button>
        </div>
      </DropdownContent>
    </Dropdown>
  );
}
