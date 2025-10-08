/**
 * User utility functions for handling API inconsistencies
 */

export interface NormalizedUser {
  id: number;
  userName: string;
  email: string;
  phoneNumber?: string;
  location?: string;
  role?: string;
  reputationScore?: number;
  avatarImage?: string;
  phoneVerified?: boolean;
  mailVerified?: boolean;
  token?: string;
  refreshToken?: string;
  fullName?: string;
  bio?: string;
  followerCount?: number;
  followingCount?: number;
  postCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Normalizes user object to handle API field inconsistencies
 * Maps API fields to consistent internal format
 */
export const normalizeUser = (user: any): NormalizedUser | null => {
  if (!user) return null;

  return {
    id: user.id,
    userName: user.userName || user.username || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber,
    location: user.location,
    role: user.role,
    reputationScore: user.reputationScore,
    avatarImage: user.avataImage || user.avatarImage, // Handle API typo
    phoneVerified: user.phoneVerified,
    mailVerified: user.mailVerified,
    token: user.token,
    refreshToken: user.refreshToken,
    fullName: user.fullName,
    bio: user.bio,
    followerCount: user.followerCount,
    followingCount: user.followingCount,
    postCount: user.postCount,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Gets user display name with fallback options
 */
export const getUserDisplayName = (user: any): string => {
  if (!user) return 'User';
  
  return user.userName || user.username || user.fullName || user.email?.split('@')[0] || 'User';
};

/**
 * Gets user avatar URL with fallback
 */
export const getUserAvatarUrl = (user: any): string | null => {
  if (!user) return null;
  
  return user.avataImage || user.avatarImage || null;
};

/**
 * Gets user initials for avatar placeholder
 */
export const getUserInitials = (user: any): string => {
  if (!user) return 'U';
  
  const displayName = getUserDisplayName(user);
  
  // Split by space and get first letter of each word
  const words = displayName.split(' ').filter(word => word.length > 0);
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  
  // Single word - return first letter
  return displayName.charAt(0).toUpperCase() || 'U';
};