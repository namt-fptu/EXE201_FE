// React Hook for Firebase file uploads
import { useState } from "react";
import {
  uploadFile,
  uploadImage,
  uploadAvatar,
  uploadProductImage,
} from "@/services/firebaseUtils";

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  downloadURL: string | null;
}

export const useFirebaseUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    downloadURL: null,
  });

  const resetState = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      downloadURL: null,
    });
  };

  // Generic file upload
  const uploadFileToFirebase = async (file: File, path: string) => {
    try {
      setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

      const downloadURL = await uploadFile(file, path);

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        downloadURL,
        progress: 100,
      }));

      return downloadURL;
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }));
      throw error;
    }
  };

  // Upload image with automatic path generation
  const uploadImageToFirebase = async (
    file: File,
    folder?: string,
    userId?: string
  ) => {
    try {
      setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

      const downloadURL = await uploadImage(file, folder, userId);

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        downloadURL,
        progress: 100,
      }));

      return downloadURL;
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }));
      throw error;
    }
  };

  // Upload avatar
  const uploadUserAvatar = async (file: File, userId: string) => {
    try {
      setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

      const downloadURL = await uploadAvatar(file, userId);

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        downloadURL,
        progress: 100,
      }));

      return downloadURL;
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }));
      throw error;
    }
  };

  // Upload product image
  const uploadProductImageToFirebase = async (
    file: File,
    productId?: string
  ) => {
    try {
      setUploadState((prev) => ({ ...prev, isUploading: true, error: null }));

      const downloadURL = await uploadProductImage(file, productId);

      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        downloadURL,
        progress: 100,
      }));

      return downloadURL;
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }));
      throw error;
    }
  };

  return {
    ...uploadState,
    uploadFile: uploadFileToFirebase,
    uploadImage: uploadImageToFirebase,
    uploadAvatar: uploadUserAvatar,
    uploadProductImage: uploadProductImageToFirebase,
    resetUpload: resetState,
  };
};
