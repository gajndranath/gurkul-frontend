import axiosInstance from "../../../../api/axiosInstance";
import type { ApiResponse } from "../../../../features/auth/types/auth.types";

export interface LibrarySettings {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logoUrl?: string;
  settings?: {
    gracePeriodDays: number;
    lateFeePerDay: number;
    currency: string;
    timezone: string;
  };
}

export const fetchLibraryProfile = async (): Promise<LibrarySettings> => {
  const response = await axiosInstance.get<ApiResponse<LibrarySettings>>("/library");
  return response.data.data;
};

export const updateLibraryProfile = async (
  data: Partial<LibrarySettings>
): Promise<LibrarySettings> => {
  const response = await axiosInstance.put<ApiResponse<LibrarySettings>>("/library", data);
  return response.data.data;
};
