/* 
  Firebase Messaging Service Worker Placeholder
  This file is required to prevent SecurityError and MIME type issues on mobile.
*/
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// This is just a placeholder to resolve 404 errors. 
// Real initialization happens in the main bundle.
firebase.initializeApp({
  apiKey: "placeholder",
  projectId: "gurkul-library-management",
  messagingSenderId: "204062876828",
  appId: "placeholder"
});

const messaging = firebase.messaging();
