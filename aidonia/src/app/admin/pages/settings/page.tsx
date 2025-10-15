"use client";

import Breadcrumb from "@/components/admin/Breadcrumbs/Breadcrumb";
import PersonalInfoForm from "./_components/personal-info"; // ✅ Đây là default export
import { UploadPhotoForm } from "./_components/upload-photo"; // ✅ Sửa thành named import
import useUserStore from "@/redux/userStore";
import AdminLayout from "@/components/admin/AdminLayout";

export default function SettingsPage() {
  const { user } = useUserStore();

  return (
    <AdminLayout pageTitle="Settings">
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="Settings" />

        {/* Center the settings card horizontally */}
        <div className="flex justify-center">
          <div className="w-full max-w-3xl">
            <PersonalInfoForm />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

