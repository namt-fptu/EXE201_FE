// Firebase Utilities
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadMetadata,
} from "firebase/storage";
import { storage } from "./firebase";

// Storage utility functions
export const uploadFile = async (
  file: File,
  path: string,
  metadata?: UploadMetadata
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Upload image with automatic path generation
export const uploadImage = async (
  file: File,
  folder: string = "images",
  userId?: string
): Promise<string> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `${timestamp}.${extension}`;

    // Create path with optional user folder
    const path = userId
      ? `${folder}/${userId}/${filename}`
      : `${folder}/${filename}`;

    // Set metadata
    const metadata: UploadMetadata = {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
      },
    };

    return await uploadFile(file, path, metadata);
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

// Delete file from Firebase Storage
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// Get all files in a folder
export const listFiles = async (folderPath: string) => {
  try {
    const storageRef = ref(storage, folderPath);
    const result = await listAll(storageRef);

    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const downloadURL = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          downloadURL,
        };
      })
    );

    return files;
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
};

// Get download URL from path
export const getFileURL = async (path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error getting file URL:", error);
    throw error;
  }
};

// Upload avatar image
export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<string> => {
  return await uploadImage(file, "avatars", userId);
};

// Upload product image
export const uploadProductImage = async (
  file: File,
  productId?: string
): Promise<string> => {
  const folder = productId ? `products/${productId}` : "products";
  return await uploadImage(file, folder);
};
