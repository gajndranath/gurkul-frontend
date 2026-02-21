import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../../../api/axiosInstance";
import type { Room, RoomFormData } from "../types/room.types";
import { useToast } from "@/hooks/useToast";

const API_URL = "/rooms";

export const useRooms = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: rooms, isLoading, error } = useQuery<Room[]>({
    queryKey: ["rooms"],
    queryFn: async () => {
      const response = await axiosInstance.get(API_URL);
      return response.data.data;
    },
  });

  const createRoomMutation = useMutation({
    mutationFn: async (data: RoomFormData) => {
      const response = await axiosInstance.post(API_URL, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room created successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create room");
    },
  });

  const updateRoomMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RoomFormData> }) => {
      const response = await axiosInstance.patch(`${API_URL}/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update room");
    },
  });

  const deleteRoomMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await axiosInstance.delete(`${API_URL}/${id}`);
      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Room deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete room");
    },
  });

  return {
    rooms,
    isLoading,
    error,
    createRoom: createRoomMutation.mutateAsync,
    updateRoom: updateRoomMutation.mutateAsync,
    deleteRoom: deleteRoomMutation.mutateAsync,
    isCreating: createRoomMutation.isPending,
    isUpdating: updateRoomMutation.isPending,
    isDeleting: deleteRoomMutation.isPending,
  };
};
