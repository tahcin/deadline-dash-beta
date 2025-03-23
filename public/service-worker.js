const CACHE_NAME = "app-cache-v2"; // Increment version when updating files
const ASSETS_TO_CACHE = ["/", "/index.html", "/styles.css", "/script.js"];

// Install event - Caches assets and forces update
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - Deletes old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME) // Remove old cache versions
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim(); // Take control of clients immediately
});

// Fetch event - Tries network first, falls back to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone()); // Update cache
          return response;
        });
      })
      .catch(() => caches.match(event.request)) // Use cache if offline
  );
});

// Push notification event handler
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  try {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New notification from Deadline Dash',
      icon: data.icon || '/images/android-chrome-192x192.png',
      badge: '/images/favicon-32x32.png',
      data: {
        url: data.url || '/',
        timestamp: data.timestamp || Date.now()
      },
      actions: [
        {
          action: 'view',
          title: 'View'
        }
      ],
      vibrate: [100, 50, 100],
      timestamp: data.timestamp || Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Deadline Dash', options)
    );
  } catch (error) {
    console.error('Error showing notification:', error);
  }
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  notification.close();

  let url = '/';
  
  if (notification.data && notification.data.url) {
    url = notification.data.url;
  }

  // Check if the action button was clicked
  if (event.action === 'view') {
    // This is the same as clicking the notification body
    // Handle any special logic here if needed
  }

  // This will open the specified URL or fall back to root
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
