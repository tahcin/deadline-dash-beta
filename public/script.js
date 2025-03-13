document.addEventListener("DOMContentLoaded", function() {
    const toggleButton = document.getElementById("darkModeToggle");
    const toggleText = document.getElementById("toggleText");

    // Check and apply the saved dark mode preference
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        toggleText.textContent = "Light Mode";
    }

    // Toggle dark mode function
    toggleButton.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
            toggleText.textContent = "Light Mode";
        } else {
            localStorage.setItem("darkMode", "disabled");
            toggleText.textContent = "Dark Mode";
        }
    });

    // Button to enable notifications
    const enableNotificationsButton = document.getElementById("enableNotifications");
    enableNotificationsButton.addEventListener("click", function() {
        requestNotificationPermission();
    });
});

// Request permission for notifications
function requestNotificationPermission() {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                // Register the service worker
                registerServiceWorker();
            } else {
                console.log('Notification permission denied.');
            }
        });
    } else {
        console.log('Browser does not support notifications.');
    }
}

// Register the service worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
            subscribeUser(registration);
        }).catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    }
}

// Subscribe user for push notifications
function subscribeUser(registration) {
    if ('PushManager' in window) {
        registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
        }).then(subscription => {
            console.log('User is subscribed:', subscription);
            // Send subscription to the server
            sendSubscriptionToServer(subscription);
        }).catch(error => {
            console.log('Failed to subscribe the user:', error);
        });
    }
}

// Send subscription to the server
function sendSubscriptionToServer(subscription) {
    fetch('/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to send subscription to server');
        }
        console.log('Subscription sent to server');
    }).catch(error => {
        console.log('Error sending subscription to server:', error);
    });
}

// Function to update the countdown every second
function startCountdown(id, eventDate) {
    const countdownElement = document.getElementById(id);

    const interval = setInterval(function() {
        const now = new Date().getTime();
        const distance = eventDate - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        // Send notification an hour before the event
        if (distance > 0 && distance <= 3600000) {
            sendNotification(id);
        }

        if (distance < 0) {
            clearInterval(interval);
            countdownElement.innerHTML = "EXPIRED";
        }
    }, 1000);
}

// Function to send a notification
function sendNotification(id) {
    if ('Notification' in window && navigator.serviceWorker) {
        navigator.serviceWorker.ready.then(function(registration) {
            registration.showNotification("Event Reminder", {
                body: `An event is starting in 1 hour!`,
                icon: '/images/favicon-32x32.png'
            });
        });
    }
}

// Define event dates
const event1Date = new Date("March 19, 2025 23:30:00").getTime();
const event2Date = new Date("March 19, 2025 23:30:00").getTime();
const event3Date = new Date("March 19, 2025 23:30:00").getTime();
const event4Date = new Date("March 26, 2025 23:30:00").getTime();

// Start countdowns
startCountdown("timer1", event1Date);
startCountdown("timer2", event2Date);
startCountdown("timer3", event3Date);
startCountdown("timer4", event4Date);

//buttons
document.addEventListener("DOMContentLoaded", function () {
    const buttonLinks = {
        countdown1: "https://apps.iimbx.edu.in/learning/course/course-v1:IIMBx+AE21x+BBA_DBE_B1/block-v1:IIMBx+AE21x+BBA_DBE_B1+type@sequential+block@a30079406b774766945f7df7ba37c95b/block-v1:IIMBx+AE[...]
        countdown2: "https://apps.iimbx.edu.in/learning/course/course-v1:IIMBx+ES21x+BBA_DBE_B1/block-v1:IIMBx+ES21x+BBA_DBE_B1+type@sequential+block@6af5281590564e63870f26b57b78f841/block-v1:IIMBx+ES[...]
        countdown3: "https://apps.iimbx.edu.in/learning/course/course-v1:IIMBx+PJ21x+BBA_DBE_B1/block-v1:IIMBx+PJ21x+BBA_DBE_B1+type@sequential+block@3f3d99591cb14a9e9a133b3583251766/block-v1:IIMBx+PJ[...]
        countdown4: ""
    };

    document.querySelectorAll(".event").forEach(eventBox => {
        eventBox.style.cursor = "pointer"; // Make it clear it's clickable

        eventBox.addEventListener("click", function () {
            const eventId = this.id;
            if (buttonLinks[eventId]) {
                window.open(buttonLinks[eventId], "_blank"); // Open in new tab
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".join-button").forEach(button => {
        if (!button.getAttribute("href") || button.getAttribute("href") === "") {
            button.style.pointerEvents = "none";  // Disable clicks
            button.style.opacity = "0.5";         // Reduce visibility
            button.style.cursor = "not-allowed";  // Change cursor style
            button.textContent = "Link Not Available"; // Update button text
        }
    });
});
