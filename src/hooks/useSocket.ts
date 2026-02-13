import { useEffect } from "react";
import { getSocket, connectSocket, disconnectSocket } from "../sockets/socket";
import { useSessionStore } from "../stores/sessionStore";

export const useSocket = () => {
  const token = useSessionStore((state) => state.token);

  useEffect(() => {
    if (token) {
      connectSocket(token);
    } else {
      disconnectSocket();
    }
    return () => {
      disconnectSocket();
    };
  }, [token]);

  return getSocket();
};
