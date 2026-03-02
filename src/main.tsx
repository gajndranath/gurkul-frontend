import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

import SessionSyncer from "./components/SessionSyncer";
import { AuthProvider } from "./providers/AuthProvider";
import { requestForToken } from "./config/firebase";

const queryClient = new QueryClient();

import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

// Register service worker for FCM
if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      console.log("[Main] FCM Service Worker registered:", registration);
      // Request FCM token with service worker registration
      const token = await requestForToken(registration);
      if (token) {
        console.log("[Main] FCM Token:", token);
      } else {
        console.warn(
          "[Main] FCM Token not available. Permission may be required.",
        );
      }
    } catch (err) {
      console.error("[Main] FCM Service Worker registration failed:", err);
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionSyncer />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
