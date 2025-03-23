// Your Firebase configuration
// Replace these with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDH1eWtsqTRTwhzm2aEXMmVuRJ5GmFDd1A",
    authDomain: "test-c5185.firebaseapp.com",
    projectId: "test-c5185",
    storageBucket: "test-c5185.firebasestorage.app",
    messagingSenderId: "130571767590",
    appId: "1:130571767590:web:0287d510bc5b147f23bbe7",
    measurementId: "G-W9QZDYL7LY"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const db = firebase.firestore();
const messaging = firebase.messaging();

// Check if the browser supports notifications
function checkNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  return true;
}

// Request permission for notifications
async function requestNotificationPermission() {
  if (!checkNotificationPermission()) return;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      getMessagingToken();
    } else {
      console.log('Notification permission denied.');
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
}

// Get messaging token
async function getMessagingToken() {
  try {
    // Get registration token
    const currentToken = await messaging.getToken({
      vapidKey: 'BG8083amh9wfQVHqBwImtpEHx_AQta3_Fpm4jypWGriKZKZFaj1Fuir5yrTFYNat52_x015lfSq52xWIWwmps1s' // Replace with your actual VAPID key
    });
    
    if (currentToken) {
      // Save the token to Firestore
      saveTokenToFirestore(currentToken);
    } else {
      console.log('No registration token available.');
    }
  } catch (error) {
    console.error('Error getting messaging token:', error);
  }
}

// Save token to Firestore
async function saveTokenToFirestore(token) {
  if (!firebase.auth().currentUser) {
    // If user is not authenticated, generate a unique ID for them
    const anonymousId = localStorage.getItem('anonymousUserId') || 
                         generateUniqueId();
    
    // Save the ID for future reference
    localStorage.setItem('anonymousUserId', anonymousId);
    
    // Save token with anonymous ID
    await db.collection('notificationTokens').doc(anonymousId).set({
      token: token,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      subscribed: true
    });
  } else {
    // If user is authenticated, use their UID
    const uid = firebase.auth().currentUser.uid;
    await db.collection('notificationTokens').doc(uid).set({
      token: token,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      subscribed: true
    });
  }
}

// Generate a unique ID for anonymous users
function generateUniqueId() {
  return 'user_' + Math.random().toString(36).substr(2, 9);
}

// Set up a listener for token changes
messaging.onTokenRefresh(() => {
  getMessagingToken();
});

// Handle incoming messages when the app is in the foreground
messaging.onMessage((payload) => {
  console.log('Message received:', payload);
  
  // Create and show notification
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/images/favicon-32x32.png',
    badge: '/images/favicon-16x16.png',
    data: payload.data
  };
  
  // Show notification manually in foreground
  if (Notification.permission === 'granted') {
    navigator.serviceWorker.getRegistration().then((registration) => {
      registration.showNotification(notificationTitle, notificationOptions);
    });
  }
});

// Export functions to be called from other scripts
window.requestNotificationPermission = requestNotificationPermission; 