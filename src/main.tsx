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
        const token = await requestForToken(registration);
        if (token) {
          console.log("[Main] FCM Token:", token);
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
