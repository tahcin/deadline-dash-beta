// service-worker.js

self.addEventListener('push', function(event) {
    let notificationData = {};
    try {
        notificationData = event.data.json(); // Try to parse as JSON
    } catch (e) {
        notificationData = {  // Fallback if not valid JSON
            title: 'Deadline Reminder',
            body: 'Check Deadline Dash for updates!',
            click_action: '/'
        };
    }

    const title = notificationData.title || 'Deadline Reminder';
    const options = {
        body: notificationData.body || 'You have an upcoming deadline!',
        icon: '/images/notification-icon.png', // TODO: Path to your notification icon (optional)
        badge: '/images/notification-badge.png', // TODO: Path to your notification badge (optional - for Android)
        click_action: notificationData.click_action || '/' // URL to open on notification click
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.options.click_action || '/') // Open URL from notification options or default to root
    );
});
