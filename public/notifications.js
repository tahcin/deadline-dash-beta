// Push notification subscription functionality

// Convert a base64 string to a Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Check if push notifications are supported
function arePushNotificationsSupported() {
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window;
}

// Check if user is already subscribed
async function checkSubscription() {
  if (!arePushNotificationsSupported()) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    return !!subscription;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

// Get the VAPID public key from the server
async function getVapidPublicKey() {
  try {
    const response = await fetch('/api/vapid-public-key');
    const data = await response.json();
    
    return data.vapidPublicKey;
  } catch (error) {
    console.error('Error fetching VAPID key:', error);
    return null;
  }
}

// Subscribe to push notifications
async function subscribeToPushNotifications() {
  if (!arePushNotificationsSupported()) {
    alert('Push notifications are not supported in your browser.');
    return false;
  }
  
  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      alert('Notification permission denied. You will not receive notifications.');
      return false;
    }
    
    // Get VAPID public key
    const vapidPublicKey = await getVapidPublicKey();
    
    if (!vapidPublicKey) {
      console.error('Failed to get VAPID public key');
      return false;
    }
    
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;
    
    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    
    // Send subscription to server
    await saveSubscription(subscription);
    
    return true;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    alert('Failed to subscribe to push notifications. Please try again later.');
    return false;
  }
}

// Save subscription to server
async function saveSubscription(subscription) {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
    
    const data = await response.json();
    
    if (!data.success) {
      console.error('Failed to save subscription:', data.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error saving subscription:', error);
    return false;
  }
}

// Unsubscribe from push notifications
async function unsubscribeFromPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      console.log('No subscription to unsubscribe from');
      return false;
    }
    
    await subscription.unsubscribe();
    
    // Ideally, inform the server that this subscription is no longer valid
    // For simplicity, we're not implementing that here
    
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

// Initialize notification functionality
async function initNotifications() {
  const subscribeBtn = document.getElementById('subscribe-btn');
  
  if (!subscribeBtn) {
    return;
  }
  
  // Check if push notifications are supported
  if (!arePushNotificationsSupported()) {
    subscribeBtn.disabled = true;
    subscribeBtn.textContent = 'Notifications Not Supported';
    return;
  }
  
  // Check if service worker is already registered
  if (!navigator.serviceWorker.controller) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }
  
  // Check if already subscribed
  const isSubscribed = await checkSubscription();
  
  // Update button state
  updateSubscribeButton(isSubscribed);
  
  // Add event listener to subscribe button
  subscribeBtn.addEventListener('click', async () => {
    subscribeBtn.disabled = true;
    subscribeBtn.textContent = 'Processing...';
    
    const isCurrentlySubscribed = await checkSubscription();
    
    if (isCurrentlySubscribed) {
      const success = await unsubscribeFromPushNotifications();
      updateSubscribeButton(!success);
    } else {
      const success = await subscribeToPushNotifications();
      updateSubscribeButton(success);
    }
  });
}

// Update subscribe button text and state
function updateSubscribeButton(isSubscribed) {
  const subscribeBtn = document.getElementById('subscribe-btn');
  
  if (!subscribeBtn) {
    return;
  }
  
  subscribeBtn.disabled = false;
  
  if (isSubscribed) {
    subscribeBtn.textContent = 'Unsubscribe from Notifications';
    subscribeBtn.classList.add('unsubscribe');
  } else {
    subscribeBtn.textContent = 'Subscribe to Notifications';
    subscribeBtn.classList.remove('unsubscribe');
  }
}

// Initialize notifications when the DOM is loaded
document.addEventListener('DOMContentLoaded', initNotifications); 