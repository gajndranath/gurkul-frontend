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

      if (
        data.type === "CHAT_MESSAGE" || 
        data.type === "CALL" ||
        data.type === "INCOMING_CALL"
      ) {
        // Skip toast as these are handled by useChatSync or global overlay
        return;
      }

      if (
        data.type === "OVERDUE_ALERT" || 
        data.type === "DUE_STUDENTS" || 
        data.type === "FEE_OVERDUE_BULK"
      ) {
        queryClient.invalidateQueries({ queryKey: ["reminders"] });
      }

      toast.info(data.title, {
        description: data.message,
      });
    });

    socket.on("announcement:new", (data: { title: string, announcementId: string }) => {
      console.log(`[DEBUG] Signal Received via Socket: id=${data.announcementId}, title="${data.title}"`);
      
      toast.info("🚨 New Official Signal", {
        description: data.title,
        duration: 10000,
        action: {
          label: "Read Signal",
          onClick: () => window.location.href = "/student/announcements"
        }
      });
      
      queryClient.invalidateQueries({ queryKey: ["studentAnnouncements"] });
    });

    // Error Fixed: notificationId is now correctly ignored or you can use it for specific updates
    socket.on("notification_read", () => {
      // Invalidate count and list when any notification is read in another tab
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    return () => {
      socket.off("notification");
      socket.off("notification_read");
      socket.off("announcement:new");
    };
  }, [userId, queryClient]);
}
