// Example Firebase Upload Component
"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useFirebaseUpload } from "@/hooks/useFirebaseUpload";

interface FileUploadProps {
  onUploadComplete?: (url: string) => void;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  folder?: string;
  userId?: string;
}

const FirebaseFileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  acceptedTypes = "image/*",
  maxSize = 5, // 5MB default
  folder = "uploads",
  userId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { isUploading, error, downloadURL, uploadImage, resetUpload } =
    useFirebaseUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    resetUpload();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const url = await uploadImage(selectedFile, folder, userId);
      console.log("Upload successful:", url);

      if (onUploadComplete) {
        onUploadComplete(url);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    resetUpload();
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload File</h3>

      {/* File Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Choose File
        </label>
        <input
          type="file"
          accept={acceptedTypes}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
        {selectedFile && (
          <p className="text-xs text-gray-600 mt-1">
            Selected: {selectedFile.name} (
            {(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
          </p>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>

        <button
          onClick={handleReset}
          disabled={isUploading}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          Reset
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Success Display */}
      {downloadURL && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600 mb-2">Upload successful!</p>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-500">Download URL:</p>
              <p className="text-xs text-blue-600 break-all">{downloadURL}</p>
            </div>
            {acceptedTypes.includes("image") && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                <Image
                  src={downloadURL}
                  alt="Uploaded file"
                  width={200}
                  height={128}
                  className="max-w-full h-auto max-h-32 rounded border object-cover"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FirebaseFileUpload;
