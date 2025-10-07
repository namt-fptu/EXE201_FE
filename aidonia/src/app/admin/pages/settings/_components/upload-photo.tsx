"use client";

import { ShowcaseSection } from "@/components/admin/Layouts/showcase-section";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import useUserStore from "@/redux/userStore";

const UploadIcon = () => (
  <svg
    className="h-6 w-6 text-primary"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

export function UploadPhotoForm() {
  const { user, setUser } = useUserStore();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Create preview URL
    const previewURL = URL.createObjectURL(file);
    setPreviewUrl(previewURL);

    try {
      setIsUploading(true);
      
      // Simulate upload delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user avatar in store
      const updatedUser = { ...user, avataImage: previewURL };
      setUser(updatedUser);
      
      toast.success("Avatar updated successfully!", {
        duration: 3000,
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Error uploading avatar");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user) return;

    try {
      // Clear the avatar URL
      const updatedUser = { ...user, avataImage: null };
      setUser(updatedUser);
      setPreviewUrl(null);
      toast.success("Avatar removed successfully!");
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast.error("Error removing avatar");
    }
  };

  const currentAvatarUrl = previewUrl || user?.avataImage || "/images/user/user-03.png";

  return (
    <ShowcaseSection title="Your Photo" className="!p-7">
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div className="relative">
            <Image
              src={currentAvatarUrl}
              width={55}
              height={55}
              alt="User"
              className={`size-14 rounded-full object-cover ${isUploading ? 'opacity-50' : ''}`}
              quality={90}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          <div>
            <span className="mb-1.5 font-medium text-dark dark:text-white">
              Edit your photo
            </span>
            <span className="flex gap-3">
              <button 
                type="button" 
                className="text-body-sm hover:text-red disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDeleteAvatar}
                disabled={isUploading || !user?.avataImage}
              >
                {isUploading ? 'Processing...' : 'Delete'}
              </button>
              <label className={`text-body-sm hover:text-primary ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                {isUploading ? 'Uploading...' : 'Update'}
                <input
                  type="file"
                  name="profilePhoto"
                  accept="image/png,image/jpg,image/jpeg,image/webp"
                  hidden
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            </span>
          </div>
        </div>

        <div className="relative mb-5.5 block w-full rounded-xl border border-dashed border-gray-4 bg-gray-2 hover:border-primary dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary">
          <input
            type="file"
            name="profilePhotoUpload"
            id="profilePhotoUpload"
            accept="image/png, image/jpg, image/jpeg"
            hidden
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label
            htmlFor="profilePhotoUpload"
            className={`flex cursor-pointer flex-col items-center justify-center p-4 sm:py-7.5 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex size-13.5 items-center justify-center rounded-full border border-stroke bg-white dark:border-dark-3 dark:bg-gray-dark">
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              ) : (
                <UploadIcon />
              )}
            </div>

            <p className="mt-2.5 text-body-sm font-medium">
              {isUploading ? (
                <span className="text-primary">Uploading...</span>
              ) : (
                <>
                  <span className="text-primary">Click to upload</span> or drag and drop
                </>
              )}
            </p>

            <p className="mt-1 text-body-xs">
              PNG, JPG, JPEG or WEBP (max 5MB, 800 x 800px recommended)
            </p>
          </label>
        </div>

        {isUploading && (
          <div className="mb-4 text-center">
            <p className="text-body-sm text-primary">Uploading...</p>
          </div>
        )}
      </div>
    </ShowcaseSection>
  );
}
