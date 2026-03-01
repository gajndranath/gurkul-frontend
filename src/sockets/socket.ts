import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL as string;

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: false, // connect manually for auth
      withCredentials: true,
    });
  }
  return socket;
};

export const connectSocket = (token: string) => {
  if (!token) return;

  const s = getSocket();
  const auth = s.auth as { token?: string } | undefined;
  const currentToken = auth?.token;

  if (currentToken !== token) {
    console.log("[Socket] Token updated or fresh init. Forcing fresh connection...");
    s.auth = { token };
    
    // Cleanup old listeners if any to prevent duplicates
    s.off("connect_error");
    s.off("disconnect");

    s.on("connect_error", (err) => {
      console.error("[Socket] Connection error:", err.message);
      if (err.message === "jwt expired" || err.message === "Authentication error") {
        s.disconnect();
      }
    });

    s.on("disconnect", (reason) => {
      console.warn("[Socket] Disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server closed the connection (likely auth failure)
        // We don't auto-reconnect here to avoid loops
      }
    });

    s.disconnect().connect();
  } else if (!s.connected) {
    console.log("[Socket] Restoring connection...");
    s.connect();
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};
