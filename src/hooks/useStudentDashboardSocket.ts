import { useEffect } from "react";
import { getSocket, connectSocket, disconnectSocket } from "../sockets/socket";
import { useSessionStore } from "../stores/sessionStore";

// --- ADD THESE DEFINITIONS HERE ---
export interface StudentNotification {
  id: string;
  message: string;
  type: string;
  createdAt?: string;
}

export interface StudentReminder {
  id: string;
  title: string;
  dueDate: string;
  amount?: number;
}
// ----------------------------------

export function useStudentDashboardSocket(
  onNotification?: (data: StudentNotification) => void,
  onReminder?: (data: StudentReminder) => void,
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
      // Use the same callbacks to remove listeners
      if (onNotification) socket.off("student:notification", onNotification);
      if (onReminder) socket.off("student:reminder", onReminder);
      disconnectSocket();
    };
    // If you prefer keeping the linter quiet about the callbacks:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
}
