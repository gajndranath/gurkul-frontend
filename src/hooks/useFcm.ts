import { useEffect } from "react";
import { requestForToken, onMessageListener } from "../config/firebase";
import { useSessionStore } from "../stores/sessionStore";
import axiosInstance from "../api/axiosInstance";
import { toast } from "sonner";

export const useFcm = () => {
  const { role, token, setFcmToken, fcmToken } = useSessionStore();

  useEffect(() => {
    const permission = (window.Notification as any)?.permission;
    console.log("[FCM] useFcm Hook State Check:", { hasToken: !!token, role, hasFcmToken: !!fcmToken, permission });
    
    if (token && role && !fcmToken) {
      if (permission !== "granted") {
        console.warn("[FCM] Permission is NOT granted. Skipping init. Current:", permission);
        return;
      }
      
      const initFcm = async () => {
        try {
            console.log("[FCM] Starting initFcm for role:", role);
            
            // Register SW if not already
            await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
              scope: "/"
            });
            
            // ✅ CRITICAL: Wait for the Service Worker to be fully active
            // This prevents "AbortError: Subscription failed - no active Service Worker"
            console.log("[FCM] Waiting for Service Worker to be ready...");
            const registration = await navigator.serviceWorker.ready;
            console.log("[FCM] Service Worker READY. Status:", registration.active?.state);
            
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            console.log("[FCM] VAPID Key used:", vapidKey ? vapidKey.substring(0, 10) + "..." : "MISSING");

            console.log("[FCM] Requesting token from Firebase...");
            const receivedToken = await requestForToken(registration);
            
            if (receivedToken) {
                console.log("[FCM] Token received successfully.");
                setFcmToken(receivedToken);
                console.log("[FCM] Syncing token with backend...");
                await axiosInstance.post("/notification/subscribe", {
                    subscription: receivedToken,
                    type: "fcm"
                });
                console.log("[FCM] Token sync complete.");
            } else {
                console.warn("[FCM] No token returned from requestForToken.");
            }
        } catch (error) {
            console.error("[FCM] Init error trace:", error);
        }
      };

      initFcm();
    }
  }, [token, role, fcmToken, setFcmToken]);

  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      console.log("Foreground Message:", payload);
      
      // ✅ Play Notification Sound for foreground FCM
      import("../utils/notificationSound").then(({ playNotificationSound }) => {
        playNotificationSound();
      });

      toast.info(payload?.notification?.title || "New Notification", {
        description: payload?.notification?.body,
      });
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    const handleManualSync = () => {
      console.log("[FCM] Manual sync triggered by user event.");
      // Clearing fcmToken in store to force re-init
      setFcmToken(null);
    };
    window.addEventListener("trigger-fcm-sync", handleManualSync);
    return () => window.removeEventListener("trigger-fcm-sync", handleManualSync);
  }, [setFcmToken]);

  return { fcmToken };
};
