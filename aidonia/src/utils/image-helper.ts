// Placeholder SVG as a data URL for fallback images
export const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='70' viewBox='0 0 80 70' fill='%23f3f4f6'%3E%3Crect width='80' height='70' fill='%23e5e7eb'/%3E%3Cpath d='M28 25h24v4H28zm0 8h16v4H28zm0 8h20v4H28z' fill='%239ca3af'/%3E%3C/svg%3E";

// Function to get image URL with Firebase fallback
export const getImageUrl = (item: {
  imageUrl?: string;
  image?: string;
  imgs?: {
    thumbnails?: string[];
  };
}): string => {
  // Priority order: imageUrl (Firebase) -> image -> thumbnails -> placeholder
  return (
    item.imageUrl ||
    item.image ||
    item.imgs?.thumbnails?.[0] ||
    placeholderImage
  );
};
