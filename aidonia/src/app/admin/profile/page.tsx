"use client";

import Breadcrumb from "@/components/admin/Breadcrumbs/Breadcrumb";
import Image from "next/image";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CameraIcon } from "./_components/icons";
import { SocialAccounts } from "./_components/social-accounts";
import useUserStore from "@/redux/userStore";


export default function Page() {
  const { user, setUser } = useUserStore();
  const [data, setData] = useState({
    name: "",
    profilePhoto: "/images/user/user-03.png",
    coverPhoto: "/images/cover/cover-01.png",
  });

  useEffect(() => {
    if (user) {
      setData({
        name: user.userName || "User",
        profilePhoto: user.avataImage || "/images/user/user-03.png",
        coverPhoto: "/images/cover/cover-01.png",
      });
    }
  }, [user]);

  const handleChange = async (e: any) => {
    if (e.target.name === "profilePhoto" ) {
      const file = e.target?.files[0];
      if (file && user) {
        try {
          // For now, just update the UI preview
          setData({
            ...data,
            profilePhoto: URL.createObjectURL(file),
          });
          toast.success("Avatar preview updated! (Upload functionality to be implemented)");
        } catch (error) {
          console.error("Error processing avatar:", error);
          toast.error("Error processing avatar");
        }
      }
    } else if (e.target.name === "coverPhoto") {
      const file = e.target?.files[0];

      setData({
        ...data,
        coverPhoto: file && URL.createObjectURL(file),
      });
    } else {
      setData({
        ...data,
        [e.target.name]: e.target.value,
      });
    }
  };

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[970px]">
        <Breadcrumb pageName="Profile" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[970px]">
      <Breadcrumb pageName="Profile" />

      <div className="overflow-hidden rounded-xl bg-white shadow-lg border border-primary-200 hover:shadow-xl transition-all duration-300">
        <div className="relative z-20 h-35 md:h-65">
          <Image
            src={data?.coverPhoto}
            alt="profile cover"
            className="h-full w-full rounded-tl-xl rounded-tr-xl object-cover object-center"
            width={970}
            height={260}
            style={{
              width: "auto",
              height: "auto",
            }}
          />
          <div className="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
            <label
              htmlFor="cover"
              className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm font-semibold text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200 hover:scale-105"
            >
              <input
                type="file"
                name="coverPhoto"
                id="coverPhoto"
                className="sr-only"
                onChange={handleChange}
                accept="image/png, image/jpg, image/jpeg"
              />

              <CameraIcon />

              <span>Edit Cover</span>
            </label>
          </div>
        </div>
        <div className="px-6 pb-8 text-center lg:pb-10 xl:pb-12">
          <div className="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-[176px] sm:p-3 border-4 border-primary-200 shadow-xl">
            <div className="relative drop-shadow-2">
              {data?.profilePhoto && (
                <>
                  <Image
                    src={data?.profilePhoto}
                    width={160}
                    height={160}
                    className="overflow-hidden rounded-full border-2 border-white"
                    alt="profile"
                  />

                  <label
                    htmlFor="profilePhoto"
                    className="absolute bottom-0 right-0 flex size-10 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/25 transition-all duration-200 hover:scale-110 sm:bottom-2 sm:right-2"
                  >
                    <CameraIcon />

                    <input
                      type="file"
                      name="profilePhoto"
                      id="profilePhoto"
                      className="sr-only"
                      onChange={handleChange}
                      accept="image/png, image/jpg, image/jpeg"
                    />
                  </label>
                </>
              )}
            </div>
          </div>
          <div className="mt-6">
            <h3 className="mb-2 text-2xl font-bold text-slate-900">
              {data?.name}
            </h3>
            <p className="font-semibold text-primary-600 mb-2">@{user?.userName || 'user'}</p>
            <p className="text-slate-600 text-sm font-medium mb-8">Aidonia Team Member</p>

            <div className="mx-auto max-w-[720px] space-y-6">
              {/* About Me Section */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-primary-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">About Me</h4>
                </div>
                <p className="text-slate-700 font-medium leading-relaxed">
                  Welcome to my profile! I'm passionate about creating amazing user experiences and building innovative solutions with the Aidonia platform.
                </p>
              </div>
              
              {/* User Information Section */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-accent-200 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent-100 rounded-lg">
                    <svg className="w-5 h-5 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">User Information</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-accent-50 rounded-lg">
                    <span className="text-sm font-bold text-slate-800">Username:</span>
                    <span className="text-sm font-medium text-slate-700">{user.userName}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-accent-50 rounded-lg">
                    <span className="text-sm font-bold text-slate-800">Email:</span>
                    <span className="text-sm font-medium text-slate-700">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-accent-50 rounded-lg">
                    <span className="text-sm font-bold text-slate-800">Phone:</span>
                    <span className="text-sm font-medium text-slate-700">{user.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-accent-50 rounded-lg">
                    <span className="text-sm font-bold text-slate-800">Role:</span>
                    <span className="text-sm font-medium text-slate-700 capitalize">{user.role}</span>
                  </div>
                </div>
              </div>
            </div>

            <SocialAccounts />
          </div>
        </div>
      </div>
    </div>
  );
}
