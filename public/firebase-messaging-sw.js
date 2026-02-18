// Scripts for firebase messaging service worker

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
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png", // Ensure you have an icon in public folder
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
