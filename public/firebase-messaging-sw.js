// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Your Firebase configuration
// Replace these with your actual Firebase project configuration
firebase.initializeApp({
    apiKey: "AIzaSyDH1eWtsqTRTwhzm2aEXMmVuRJ5GmFDd1A",
    authDomain: "test-c5185.firebaseapp.com",
    projectId: "test-c5185",
    storageBucket: "test-c5185.firebasestorage.app",
    messagingSenderId: "130571767590",
    appId: "1:130571767590:web:0287d510bc5b147f23bbe7",
    measurementId: "G-W9QZDYL7LY"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/images/favicon-32x32.png',
    badge: '/images/favicon-16x16.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 