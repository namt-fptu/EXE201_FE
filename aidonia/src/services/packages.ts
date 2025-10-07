import api from "./axios";

export interface Package {
  id?: number;
  packageName: string;
  price: number;
  postLimit: number;
  durationInDays: number;
}

export interface CreatePackageRequest {
  packageName: string;
  price: number;
  postLimit: number;
  durationInDays: number;
}

export interface PackagesResponse {
  isSuccess: boolean;
  data: Package[];
  message: string;
  exception: string | null;
}

export interface PackageResponse {
  isSuccess: boolean;
  data: Package;
  message: string;
  exception: string | null;
}

export const packagesService = {
  // Get all packages
  getAll: async (): Promise<PackagesResponse> => {
    const response = await api.get<PackagesResponse>("/packages");
    return response.data;
  },

  // Create new package
  create: async (
    packageData: CreatePackageRequest
  ): Promise<PackageResponse> => {
    const response = await api.post<PackageResponse>("/packages", packageData);
    return response.data;
  },

  // Update package
  update: async (
    id: number,
    packageData: CreatePackageRequest
  ): Promise<PackageResponse> => {
    if (id === undefined || id === null) {
      throw new Error("Package ID is required for update");
    }
    console.log(`Updating package ${id} with data:`, packageData);
    const response = await api.put<PackageResponse>(
      `/packages/${id}`,
      packageData
    );
    return response.data;
  },

  // Delete package
  delete: async (
    id: number
  ): Promise<{ isSuccess: boolean; message: string }> => {
    if (id === undefined || id === null) {
      throw new Error("Package ID is required for delete");
    }
    console.log(`Deleting package ${id}`);
    const response = await api.delete(`/packages/${id}`);
    return response.data;
  },
};
