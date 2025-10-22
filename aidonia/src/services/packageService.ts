import api from "./axios";
import { AxiosResponse } from "axios";

export interface ActivePackage {
  userPackageId: number; // Maps to userPackagePackageId in create-post form
  packageId: number;
  remainingPosts: number;
  status: string;
}

export interface ApiResponse<T> {
  isSuccess: boolean;
  data: T;
  message: string;
  exception: string | null;
}

export const packageService = {
  /**
   * Get all available packages
   * @returns Promise with list of all packages
   */
  async getAllPackages() {
    try {
      console.log("PackageService: Fetching all packages");
      const response = await api.get("packages");
      console.log("PackageService: All packages response:", response.data);
      return response.data;
    } catch (error) {
      console.error("PackageService: Error loading packages:", error);
      throw error;
    }
  },

  /**
   * Get active package for a user
   * @param userId - The user ID to get the active package for
   * @returns Promise with active package data or null
   */
  async getActiveUserPackage(
    userId: string | number
  ): Promise<ActivePackage | null> {
    try {
      console.log(
        "PackageService: Loading active package for user ID:",
        userId
      );

      const response: AxiosResponse<ApiResponse<ActivePackage>> = await api.get(
        `user_packages/package/active/${userId}`
      );

      console.log("PackageService: Raw response:", response);
      console.log("PackageService: Response data:", response.data);
      console.log("PackageService: Response status:", response.status);
      console.log(
        "PackageService: Is response.data.data an array?",
        Array.isArray(response.data?.data)
      );
      console.log("PackageService: response.data.data:", response.data?.data);

      // Handle different possible response structures
      let packageData = null;

      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data) &&
        response.data.data.length > 0
      ) {
        // Structure: { data: [{ userPackageId: ..., ... }] }
        packageData = response.data.data[0];
        console.log(
          "PackageService: Using response.data.data[0] array structure"
        );
      } else if (response.data && response.data.data) {
        // Structure: { data: { userPackageId: ..., ... } }
        packageData = response.data.data;
        console.log(
          "PackageService: Using response.data.data object structure"
        );
      } else if (
        response.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        // Structure: [{ userPackageId: ..., ... }]
        packageData = response.data[0];
        console.log("PackageService: Using direct array[0] structure");
      } else if (response.data && typeof response.data === "object") {
        // Check if response.data directly contains the package data
        const directData = response.data as unknown as Record<string, unknown>;
        if (directData.userPackageId !== undefined) {
          // Structure: { userPackageId: ..., ... }
          packageData = directData as unknown as ActivePackage;
          console.log("PackageService: Using direct response.data structure");
        }
      }

      if (packageData) {
        console.log("PackageService: Final package data:", packageData);
        console.log(
          "PackageService: Package data keys:",
          Object.keys(packageData)
        );
        console.log(
          "PackageService: userPackageId value:",
          packageData.userPackageId
        );
        return packageData;
      }

      return null;
    } catch (error) {
      console.error(
        "PackageService: Error loading active user package:",
        error
      );

      // Don't throw - let the calling component handle the null return
      return null;
    }
  },

  /**
   * Check if user has sufficient posts remaining
   * @param userId - The user ID to check
   * @returns Promise with boolean indicating if user can create posts
   */
  async canUserCreatePosts(userId: string | number): Promise<boolean> {
    const activePackage = await this.getActiveUserPackage(userId);
    return activePackage !== null && activePackage.remainingPosts > 0;
  },
};

export default packageService;
