import { useEffect } from "react";
import { getSocket, connectSocket, disconnectSocket } from "../sockets/socket";
import { useSessionStore } from "../stores/sessionStore";

export function useStudentDashboardSocket(
  onNotification?: (data: any) => void,
  onReminder?: (data: any) => void,
) {
  const token = useSessionStore((s) => s.token);
  useEffect(() => {
    if (!token) return;
    connectSocket(token);
    const socket = getSocket();
    if (onNotification) {
      socket.on("student:notification", onNotification);
    }
    if (onReminder) {
      socket.on("student:reminder", onReminder);
    }
    return () => {
      if (onNotification) socket.off("student:notification", onNotification);
      if (onReminder) socket.off("student:reminder", onReminder);
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
}
