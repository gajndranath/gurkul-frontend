import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../api/notification.service";
import { toast } from "sonner";

export function useNotifications(page = 1, limit = 20, unreadOnly = false) {
  return useQuery({
    queryKey: ["notifications", { page, limit, unreadOnly }],
    queryFn: () => notificationService.getHistory(page, limit, unreadOnly),
    staleTime: 60000, // 1 minute stability
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData, 
  });
}

export function useNotificationActions() {
  const queryClient = useQueryClient();

  // Mark all as read mutation
  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      // Background mein count update karne ke liye
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  // Mark single as read (Optimistic Update)
  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return {
    markAllRead: markAllRead.mutate,
    markAsRead: markAsRead.mutate,
    isProcessing: markAllRead.isPending || markAsRead.isPending,
  };
}
