// Placeholder SVG as a data URL for fallback images
export const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='70' viewBox='0 0 80 70' fill='%23f3f4f6'%3E%3Crect width='80' height='70' fill='%23e5e7eb'/%3E%3Cpath d='M28 25h24v4H28zm0 8h16v4H28zm0 8h20v4H28z' fill='%239ca3af'/%3E%3C/svg%3E";

// Function to validate if URL is accessible
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:")
    );
  } catch {
    return false;
  }
};

// Function to process Firebase URLs for better compatibility
const processFirebaseUrl = (url: string): string => {
  // If it's already a Firebase Storage URL, ensure it has proper token parameters
  if (url.includes("firebasestorage.googleapis.com")) {
    try {
      const urlObj = new URL(url);

      // Add alt=media parameter if missing (helps with CORS)
      if (!urlObj.searchParams.has("alt")) {
        urlObj.searchParams.set("alt", "media");
      }

      // Ensure token parameter is present for authenticated access
      if (
        !urlObj.searchParams.has("token") &&
        !urlObj.pathname.includes("/o/")
      ) {
        // This might be an older Firebase URL format, try to convert
        return url;
      }

      return urlObj.toString();
    } catch (error) {
      console.warn("Failed to process Firebase URL:", error);
      return url;
    }
  }
  return url;
};

// Function to get image URL with Firebase fallback
export const getImageUrl = (item: {
  imageUrl?: string;
  image?: string;
  imgs?: {
    thumbnails?: string[];
  };
  postImages?: Array<string | { url: string }>; // Added support for postImages
}): string => {
  // Priority order:
  // 1. imageUrl (Firebase)
  // 2. image
  // 3. First postImage (either string or object with url)
  // 4. thumbnails
  // 5. placeholder

  // Check imageUrl (Firebase URLs)
  if (item.imageUrl && isValidUrl(item.imageUrl)) {
    return processFirebaseUrl(item.imageUrl);
  }

  // Check image field
  if (item.image && isValidUrl(item.image)) {
    return processFirebaseUrl(item.image);
  }

  // Check postImages array (for API data)
  if (
    item.postImages &&
    Array.isArray(item.postImages) &&
    item.postImages.length > 0
  ) {
    const firstImage = item.postImages[0];
    let imageUrl = "";

    if (typeof firstImage === "string") {
      imageUrl = firstImage;
    } else if (firstImage && typeof firstImage === "object" && firstImage.url) {
      imageUrl = firstImage.url;
    }

    if (imageUrl && isValidUrl(imageUrl)) {
      return processFirebaseUrl(imageUrl);
    }
  }

  // Check thumbnails
  if (item.imgs?.thumbnails?.[0] && isValidUrl(item.imgs.thumbnails[0])) {
    return processFirebaseUrl(item.imgs.thumbnails[0]);
  }

  // Return placeholder if nothing else works
  return placeholderImage;
};

// Function to check if image URL is accessible (for debugging)
export const checkImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch (error) {
    console.error("Image URL check failed:", error);
    return false;
  }
};
