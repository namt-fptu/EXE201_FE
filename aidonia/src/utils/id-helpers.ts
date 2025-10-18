/**
 * Utility function to safely convert user ID to number
 * Handles cases where user.id might be string or number
 */
export const getUserIdAsNumber = (
  userId: string | number | undefined
): number => {
  if (typeof userId === "number") {
    return userId;
  }

  if (typeof userId === "string") {
    const parsed = parseInt(userId, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }

  throw new Error(`Invalid user ID: ${userId}`);
};

/**
 * Utility function to safely convert any ID field to number
 * Used for postId, sellerId, etc.
 */
export const getIdAsNumber = (
  id: string | number | undefined | null
): number => {
  if (typeof id === "number" && id > 0) {
    return id;
  }

  if (typeof id === "string") {
    const parsed = parseInt(id, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  throw new Error(`Invalid ID: ${id}`);
};
