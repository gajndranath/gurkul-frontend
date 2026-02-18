// frontend/src/features/admin/slots/hooks/useSlots.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllSlots, createSlot, updateSlot } from "../../../../api/slotApi";
import { useToast } from "../../../../hooks/useToast";
import type { Slot } from "../types/slot.types";

export const useSlots = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const slotsQuery = useQuery<Slot[]>({
    queryKey: ["slots"],
    queryFn: async () => {
      const data = await getAllSlots();
      return data ?? [];
    },
    retry: 1,
    // ✅ Yeh rakh sakte ho - thoda optimization ke liye
    staleTime: 30 * 1000, // 30 seconds - not 5 minutes
    // refetchInterval: 30 * 1000, // Har 30 second mein background mein refetch
  });

  const createMutation = useMutation({
    mutationFn: createSlot,
    onSuccess: () => {
      // ✅ Force refetch immediately
      queryClient.invalidateQueries({
        queryKey: ["slots"],
        exact: true,
        refetchType: "active", // Active queries ko turant refetch karo
      });
      toast.success("Slot created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create slot", error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Slot> }) =>
      updateSlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["slots"],
        refetchType: "active",
      });
      toast.success("Slot updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update slot", error.message);
    },
  });

  return {
    slots: slotsQuery.data ?? [],
    isLoading: slotsQuery.isLoading,
    isError: slotsQuery.isError,
    error: slotsQuery.error,
    createSlot: createMutation.mutateAsync,
    updateSlot: updateMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
    refetch: slotsQuery.refetch,
  };
};
