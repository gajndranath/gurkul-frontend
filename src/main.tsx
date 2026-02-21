import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

import SessionSyncer from "./components/SessionSyncer";
import { AuthProvider } from "./providers/AuthProvider";
import { FcmDebugger } from "./components/FcmDebugger";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionSyncer />
      <AuthProvider>
        <AppRoutes />
        <FcmDebugger />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
