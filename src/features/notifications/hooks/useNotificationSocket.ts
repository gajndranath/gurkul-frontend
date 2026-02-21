import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../../../sockets/socket";
import { useSessionStore } from "../../../stores/sessionStore";
import { toast } from "sonner";

export function useNotificationSocket() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.admin?._id || s.student?._id);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !userId) return;

    socket.on("notification", (data) => {
      console.log("Real-time Notification Received:", data);

      // ✅ Play Notification Sound
      import("../../../utils/notificationSound").then(({ playNotificationSound }) => {
        playNotificationSound();
      });

      // Refresh notifications list in background
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      if (data.type === "OVERDUE_ALERT" || data.type === "DUE_STUDENTS") {
        queryClient.invalidateQueries({ queryKey: ["reminders"] });
      }

      toast.info(data.title, {
        description: data.message,
      });
    });

    // Error Fixed: notificationId is now correctly ignored or you can use it for specific updates
    socket.on("notification_read", () => {
      // Invalidate count and list when any notification is read in another tab
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      socket.off("notification");
      socket.off("notification_read");
    };
  }, [userId, queryClient]);
}
