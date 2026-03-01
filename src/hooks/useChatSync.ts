import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "../sockets/socket";
import { useSessionStore } from "../stores/sessionStore";
import { useChatStore } from "../stores/chatStore";
import { toast } from "sonner";

export function useChatSync() {
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.admin?._id || s.student?._id);
  const setTotalUnreadCount = useChatStore((s) => s.setTotalUnreadCount);
  const { setIncomingCall, incomingCall, activeCall } = useChatStore();

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !userId) return;

    // --- Message Synchronization ---
    socket.on("chat:unread_count_update", (data: { count: number }) => {
      console.log("[ChatSync] Unread update:", data.count);
      setTotalUnreadCount(data.count);
    });

    socket.on("new_message", (message: any) => {
      const isForMe = String(message.recipientId) === String(userId);
      if (isForMe) {
          // Play sound
          import("../utils/notificationSound").then(({ playNotificationSound }) => {
            playNotificationSound();
          });
          
          // Optionally show a mini toast if not on chat page
          if (!window.location.pathname.includes("/chat")) {
              toast.info(`New signal from ${message.senderName || 'Anonymous'}`, {
                  description: message.contentType === 'IMAGE' ? '📷 Image' : message.content,
                  duration: 4000,
              });
          }
          
          // Invalidate conversations to get fresh unread counts
          queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
      }
    });

    // --- Call Synchronization ---
    socket.on("call:offer", (data: any) => {
      console.log("[ChatSync] Incoming Call:", data);
      setIncomingCall({
        callId: data.callId,
        from: data.from,
        conversationId: data.conversationId,
        isOffer: true
      });
      
      // Play ringing sound
      import("../utils/notificationSound").then(({ playRingingSound }) => {
        playRingingSound();
      });
    });

    socket.on("call:end", (data: { callId: string }) => {
      console.log("[ChatSync] Call Ended by remote:", data.callId);
      if (incomingCall?.callId === data.callId) {
        setIncomingCall(null);
        import("../utils/notificationSound").then(({ stopRingingSound }) => {
          stopRingingSound();
        });
      }
      if (activeCall?.callId === data.callId) useChatStore.getState().setActiveCall(null);
    });

    socket.on("call:timeout", (data: { callId: string }) => {
      console.log("[ChatSync] Call Timeout:", data.callId);
      if (incomingCall?.callId === data.callId) {
        setIncomingCall(null);
        import("../utils/notificationSound").then(({ stopRingingSound }) => {
          stopRingingSound();
        });
      }
    });

    // Request initial count
    socket.emit("chat:get_unread_count");

    return () => {
      socket.off("chat:unread_count_update");
      socket.off("new_message");
      socket.off("call:offer");
      socket.off("call:end");
      socket.off("call:timeout");
    };
  }, [userId, queryClient, setTotalUnreadCount, setIncomingCall, incomingCall?.callId, activeCall?.callId]);
}
