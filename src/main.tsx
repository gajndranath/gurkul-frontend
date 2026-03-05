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
  async onRegistered(registration) {
    if (registration) {
      console.log("[Main] Unified Service Worker registered:", registration);
      try {
        if (Notification.permission === "granted") {
          const token = await requestForToken(registration);
          if (token) {
            console.log("[Main] FCM Token:", token);
          }
        } else {
          console.log("[Main] Skipping FCM token request: Permission is", Notification.permission);
        }
      } catch (err) {
        console.error("[Main] FCM Token request failed:", err);
      }
    }
  },
  onNeedRefresh() {
    if (confirm("New content available. Reload?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline");
  },
});

import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <SessionSyncer />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
