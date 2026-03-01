import React, { useEffect } from "react";
import { useSessionStore } from "../../../stores/sessionStore";
import { useChatStore } from "../../../stores/chatStore";

/**
 * ChatKeyInitializer - Silently ensures that the logged-in user
 * has their encryption keys generated and synced with the server.
 * This runs in the background on every login/refresh.
 */
export const ChatKeyInitializer: React.FC = () => {
  const { userId, token } = useSessionStore();
  const { generateKeys, _hasHydrated } = useChatStore();

  useEffect(() => {
    // Wait for BOTH auth and chat store to be hydrated
    if (token && userId && _hasHydrated) {
      console.log("[ChatKeyInitializer] Store ready, verifying keys for:", userId);
      // WhatsApp Style: Initialize keys silently if they don't exist
      // This ensures the user is "Chat Ready" for others immediately.
      generateKeys(userId).catch((err) => {
        console.error("[ChatKeyInitializer] Silent key sync failed:", err);
      });
    }
  }, [userId, token, _hasHydrated, generateKeys]);

  // This component doesn't render anything
  return null;
};
