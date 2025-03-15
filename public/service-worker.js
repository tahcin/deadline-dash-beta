// service-worker.js

self.addEventListener('install', event => {
    console.log('Service Worker installed');
    // Perform install steps if needed
});

self.addEventListener('activate', event => {
    console.log('Service Worker activated');
    // Perform activation steps if needed
});

self.addEventListener('message', event => {
    if (event.data.action === 'schedule-notification') {
        const { title, body, timestamp, eventId } = event.data.payload;

        const delay = timestamp - Date.now();
        if (delay > 0) {
            setTimeout(() => {
                self.registration.showNotification('Deadline Dash Reminder', {
                    body: body,
                    icon: '/images/favicon-32x32.png',
                    tag: eventId // Use tag to prevent stacking of notifications for the same event if needed
                });
            }, delay);
            console.log(`Notification scheduled by Service Worker for ${title} in ${delay/1000} seconds`);
        } else {
            console.log('Reminder time is in the past, not scheduling.');
        }
    }
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    // You can add actions here, like opening the website when notification is clicked.
    // For simplicity, let's just close the notification.
});
