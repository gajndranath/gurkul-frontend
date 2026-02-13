import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reminderService } from "../api/reminder.service";
import type { AdminReminder, AdminReminderType } from "../types/reminder.types"; // AdminReminder import karein
import type { ApiErrorResponse } from "../../../types";
import { toast } from "sonner";

// 1. Hook to fetch all reminders
export function useReminders(
  filters: { type?: AdminReminderType; isPaused?: boolean } = {},
) {
  return useQuery<AdminReminder[], ApiErrorResponse>({
    // Data: AdminReminder[], Error: ApiErrorResponse
    queryKey: ["reminders", filters],
    queryFn: () => reminderService.getAll(filters),
    staleTime: 60 * 1000,
  });
}

// 2. Hook to handle Reminder Actions
export function useReminderActions() {
  const queryClient = useQueryClient();

  // Mutation to Pause
  // Generic order: <Data, Error, Variables>
  // Replacing 'any' with 'AdminReminder'
  const pauseMutation = useMutation<
    AdminReminder,
    ApiErrorResponse,
    { id: string; reason: string }
  >({
    mutationFn: ({ id, reason }) => reminderService.pause(id, reason),
    onSuccess: () => {
      toast.success("Reminder paused successfully");
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to pause");
    },
  });

  // Mutation to Resume
  // Replacing 'any' with 'AdminReminder'
  const resumeMutation = useMutation<AdminReminder, ApiErrorResponse, string>({
    mutationFn: (id) => reminderService.resume(id),
    onSuccess: () => {
      toast.success("Reminder resumed");
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to resume");
    },
  });

  // Mutation to Force Send (Trigger)
  // Replacing 'any' with 'AdminReminder'
  const triggerMutation = useMutation<AdminReminder, ApiErrorResponse, string>({
    mutationFn: (id) => reminderService.manualTrigger(id),
    onSuccess: () => {
      toast.success("Manual trigger initiated! Notifications sent.");
    },
    onError: (error) => {
      toast.error(error.message || "Manual trigger failed");
    },
  });

  return {
    pauseReminder: pauseMutation.mutate,
    resumeReminder: resumeMutation.mutate,
    triggerReminder: triggerMutation.mutate,
    isActionLoading:
      pauseMutation.isPending ||
      resumeMutation.isPending ||
      triggerMutation.isPending,
  };
}
