import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage, type MessagePayload } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

console.log("[Firebase] Config Initialized for Project:", firebaseConfig.projectId);
console.log("[Firebase] API Key present:", !!firebaseConfig.apiKey);
console.log("[Firebase] Sender ID:", firebaseConfig.messagingSenderId);

export const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export const requestForToken = async (serviceWorkerRegistration?: ServiceWorkerRegistration) => {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "denied") {
      console.warn("[Firebase] Permission denied. Skipping token request.");
      return null;
    }
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  console.log("[Firebase] requestForToken called with VAPID:", vapidKey ? vapidKey.substring(0, 10) + "..." : "MISSING");

  const fetchToken = async () => {
    return await getToken(messaging, {
      vapidKey: vapidKey || "YOUR_VAPID_KEY",
      serviceWorkerRegistration,
    });
  };

  try {
    let currentToken = await fetchToken();
    
    if (currentToken) {
      console.log("[Firebase] Token retrieved successfully.");
      return currentToken;
    } else {
      console.log("[Firebase] No token available. User needs to re-grant permission.");
      return null;
    }
  } catch (err: any) {
    if (err?.code === "messaging/token-subscribe-failed" || err?.name === "InvalidStateError") {
      console.warn("[Firebase] Retrying token fetch due to IDB/Network error...");
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const retryToken = await fetchToken();
        return retryToken;
      } catch (retryErr) {
        console.error("[Firebase] Retry failed:", retryErr);
      }
    }
    console.error("[Firebase] getToken Error:", err);
    return null;
  }
};

// Listener for foreground messages
export const onMessageListener = (callback: (payload: MessagePayload) => void) => {
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};
