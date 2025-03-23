const CACHE_NAME = "app-cache-v2"; // Increment version when updating files
const ASSETS_TO_CACHE = ["/", "/index.html", "/styles.css", "/script.js", "/firebase-config.js"];

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

// Handle background notifications from Firebase Cloud Messaging
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.notification.title || 'Deadline Dash Notification';
    const options = {
      body: data.notification.body || '',
      icon: '/images/favicon-32x32.png',
      badge: '/images/favicon-16x16.png',
      data: data.data
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // This looks for the data attribute in the notification payload
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      const matchingClient = windowClients.find((client) => {
        return (new URL(client.url).pathname === new URL(urlToOpen, self.location.href).pathname);
      });

      // If a matching window is already open, focus it
      if (matchingClient) {
        return matchingClient.focus();
      }
      
      // Otherwise, open a new window/tab
      return clients.openWindow(urlToOpen);
    })
  );
});

// Listen for message from the FCM
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
