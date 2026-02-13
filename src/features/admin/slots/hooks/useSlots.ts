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
    queryFn: getAllSlots,
  });

  const createMutation = useMutation({
    mutationFn: createSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      toast.success("Slot created successfully");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Slot> }) =>
      updateSlot(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      toast.success("Slot updated successfully");
    },
  });

  return {
    slots: slotsQuery.data ?? [],
    isLoading: slotsQuery.isLoading,
    createSlot: createMutation.mutateAsync,
    updateSlot: updateMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };
};
