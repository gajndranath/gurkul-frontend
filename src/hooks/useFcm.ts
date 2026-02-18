import { useEffect, useState } from "react";
import { requestForToken, onMessageListener } from "../config/firebase";
import { useSessionStore } from "../stores/sessionStore";
import axiosInstance from "../api/axiosInstance";
import { toast } from "sonner";

export const useFcm = () => {
  const { role, token } = useSessionStore();
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    if (token && role) {
      const initFcm = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
                const token = await requestForToken();
                if (token) {
                    setFcmToken(token);
                    // Send token to backend
                    await axiosInstance.post("/notification/subscribe", {
                        subscription: token,
                        type: "fcm"
                    });
                }
            }
        } catch (error) {
            console.error("FCM Init Error:", error);
        }
      };

      initFcm();
    }
  }, [token, role]);

  useEffect(() => {
    const unsubscribe = onMessageListener((payload) => {
      console.log("Foreground Message:", payload);
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

  return { fcmToken };
};
