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
  try {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
    console.log("[Firebase] requestForToken called with VAPID:", vapidKey ? vapidKey.substring(0, 10) + "..." : "MISSING");
    
    const currentToken = await getToken(messaging, {
      vapidKey: vapidKey || "YOUR_VAPID_KEY",
      serviceWorkerRegistration,
    });
    
    if (currentToken) {
      console.log("[Firebase] Token retrieved from Google:", currentToken.substring(0, 10) + "...");
      return currentToken;
    } else {
      console.log("[Firebase] No token available. User needs to re-grant permission.");
      return null;
    }
  } catch (err) {
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
