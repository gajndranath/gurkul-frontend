// Scripts for firebase messaging service worker
console.log("[firebase-messaging-sw.js] Service Worker Loaded");

self.addEventListener('install', (event) => {
  console.log("[firebase-messaging-sw.js] SW Installing...");
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log("[firebase-messaging-sw.js] SW Activated and Monitoring.");
});

importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

// TODO: Replace with your project's config object
const firebaseConfig = {
  apiKey: "AIzaSyCbKyQS1sppOeWx6mf5mKWRC740AgEgqrM",
  authDomain: "gurukul-library-management.firebaseapp.com",
  projectId: "gurukul-library-management",
  storageBucket: "gurukul-library-management.firebasestorage.app",
  messagingSenderId: "204062876828",
  appId: "1:204062876828:web:702e413d9bd09c10e7b959"
}; 

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] 🔔 Background Message Received!");
  console.log("[firebase-messaging-sw.js] Full Payload Details:", JSON.stringify(payload, null, 2));
  
  const title = payload.notification?.title || payload.data?.title || "New Library Notification";
  const body = payload.notification?.body || payload.data?.body || "Check the app for details";
  
  const notificationOptions = {
    body: body,
    icon: "/icon.png",
    badge: "/icon.png",
    data: payload.data,
    tag: payload.notification?.tag || payload.data?.tag || 'registry-notification',
    renotify: true,
    vibrate: [200, 100, 200]
  };

  console.log("[firebase-messaging-sw.js] Showing notification with title:", title);
  return self.registration.showNotification(title, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log("[firebase-messaging-sw.js] Notification clicked:", event.notification.tag);
  event.notification.close();

  // Try to open the app or focus an existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      console.log("[firebase-messaging-sw.js] Matching clients count:", clientList.length);
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        // Focus the first matching window
        if ('focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open the dashboard
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    }).catch(err => {
      console.error("[firebase-messaging-sw.js] Click handling failed:", err);
    })
  );
});
