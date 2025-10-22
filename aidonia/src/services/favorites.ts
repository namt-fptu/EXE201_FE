import api from "./axios";

// Add item to favorites
export const addToFavorites = async (userId: number, postId: number) => {
  try {
    const response = await api.post("favorites", {
      userId,
      postId,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    throw error;
  }
};

// Get user's favorite posts with pagination
export const getUserFavorites = async (
  userId: number,
  pageNumber: number = 1,
  pageSize: number = 100,
  searchTerm: string = "",
  status: string = ""
) => {
  try {
    const response = await api.post(`posts/paged-favorite/${userId}`, {
      pageNumber,
      pageSize,
      searchTerm,
      status,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting user favorites:", error);
    throw error;
  }
};

// Check if a specific post is favorited by user
export const checkIfPostFavorited = async (userId: number, postId: number) => {
  try {
    // Get a small page to check if this specific post is favorited
    const response = await api.post(`posts/paged-favorite/${userId}`, {
      pageNumber: 1,
      pageSize: 100, // Get enough to check
      searchTerm: "",
      status: "",
    });

    // Handle different possible response structures
    let items = [];

    if (response.data?.success && response.data?.data?.items) {
      items = response.data.data.items;
    } else if (response.data?.data?.items) {
      items = response.data.data.items;
    } else if (response.data?.items) {
      items = response.data.items;
    } else if (Array.isArray(response.data)) {
      items = response.data;
    }

    const favoriteItem = items.find(
      (fav: { id: number; postId: number; userId: number }) =>
        fav.postId === postId
    );

    return favoriteItem
      ? { isFavorited: true, favoriteId: favoriteItem.id }
      : { isFavorited: false, favoriteId: null };
  } catch (error) {
    console.error("Error checking if post is favorited:", error);
    return { isFavorited: false, favoriteId: null };
  }
};

// Get all user favorites for wishlist page with pagination
export const getWishlistPosts = async (
  userId: number,
  pageNumber: number = 1,
  pageSize: number = 12,
  searchTerm: string = "",
  status: string = ""
) => {
  try {
    console.log(
      "Fetching wishlist posts for userId:",
      userId,
      "page:",
      pageNumber
    );

    const response = await api.post(`posts/paged-favorite/${userId}`, {
      pageNumber,
      pageSize,
      searchTerm,
      status,
    });

    console.log("Raw API response:", response);
    console.log("Response data:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error getting wishlist posts:", error);
    console.error("Error details:", error.response?.data || error.message);
    throw error;
  }
};

// Get raw favorites list (returns list of favorite posts with full Post data)
// This is the GET /api/favorites/user/{userId} endpoint shown in Swagger
export const getUserFavoritesRaw = async (userId: number) => {
  try {
    console.log("Fetching raw favorites for userId:", userId);
    const response = await api.get(`favorites/user/${userId}`);
    console.log("Raw favorites response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error getting raw favorites:", error);
    throw error;
  }
};

// Remove item from favorites using userId and postId
// Uses the DELETE /api/favorites/user/{userId}/post/{postId} endpoint from Swagger
export const removeFromFavorites = async (userId: number, postId: number) => {
  try {
    console.log("DELETE Request - User ID:", userId, "Post ID:", postId);
    console.log("DELETE URL:", `favorites/user/${userId}/post/${postId}`);

    const response = await api.delete(
      `favorites/user/${userId}/post/${postId}`
    );

    console.log("DELETE Response:", response);
    console.log("DELETE Response data:", response.data);

    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown } };
    console.error("Error removing from favorites:", error);
    console.error("Error response:", err?.response);
    console.error("Error status:", err?.response?.status);
    console.error("Error data:", err?.response?.data);
    throw error;
  }
};

const favoritesService = {
  addToFavorites,
  getUserFavorites,
  getUserFavoritesRaw,
  checkIfPostFavorited,
  getWishlistPosts,
  removeFromFavorites,
};

export default favoritesService;
