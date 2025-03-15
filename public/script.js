document.addEventListener("DOMContentLoaded", function() {
    // Dark mode toggle (existing code - no changes)
    const toggleButton = document.getElementById("darkModeToggle");
    const toggleIcon = document.getElementById("toggleIcon");
    const toggleText = document.getElementById("toggleText");

    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        toggleIcon.textContent = "☀️";
        toggleText.textContent = "Light Mode";
    }

    toggleButton.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("darkMode", "enabled");
            toggleIcon.textContent = "☀️";
            toggleText.textContent = "Light Mode";
        } else {
            localStorage.setItem("darkMode", "disabled");
            toggleIcon.textContent = "🌙";
            toggleText.textContent = "Dark Mode";
        }
    });

    // --- Notification Feature with Service Worker ---

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    } else {
        console.log('Service Workers are not supported in this browser.');
    }


    // Request notification permission on page load (existing code - no changes)
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            } else if (permission === 'denied') {
                console.log('Notification permission denied.');
            } else {
                console.log('Notification permission dismissed.');
            }
        });
    } else {
        console.log('Notifications are not supported in this browser.');
    }


    // Event data (Store event details - no changes)
    const eventsData = [
        { id: "timer1", title: "FBC II Module 4 CLA", deadline: new Date("March 19, 2025 23:30:00").getTime() },
        { id: "timer2", title: "Microeconomics Module 4 CLA", deadline: new Date("March 19, 2025 23:30:00").getTime() },
        { id: "timer3", title: "Rs250 Venture Module 3 CLA", deadline: new Date("March 19, 2025 23:30:00").getTime() },
        { id: "timer4", title: "Advanced Statistics Mid-Term 2", deadline: new Date("March 26, 2025 23:30:00").getTime() },
        { id: "session1", title: "Principles of Microeconomics Live Session", date: new Date("March 17, 2025 17:00:00").getTime() }, // Session 1 Date & Time
        { id: "session2", title: "Venturing on a Budget Live Session", date: new Date("March 20, 2025 00:00:00").getTime() }, // Session 2 - Time TBA, set a placeholder, update later
        { id: "session3", title: "Foundations of Business Communication II SME Live Session", date: new Date("March 21, 2025 17:00:00").getTime() }  // Session 3 Date & Time
    ];

    // Function to update the countdown every second (modified - notification scheduling logic removed)
    function startCountdown(id, eventDate, eventTitle) {
        const countdownElement = document.getElementById(id);
        const reminderButton = document.querySelector(`.event[id="${id}"] .reminder-button`);
        const notificationStatus = document.querySelector(`.event[id="${id}"] .notification-status`);

        let reminderEnabled = localStorage.getItem(`reminder-${id}`) === 'enabled';
        if (reminderButton) {
            reminderButton.classList.toggle('active', reminderEnabled);
        }
        if (notificationStatus) {
            notificationStatus.textContent = reminderEnabled ? 'Reminder Active' : '';
        }


        const interval = setInterval(function() {
            const now = new Date().getTime();
            const distance = eventDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownElement.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            if (distance < 0) {
                clearInterval(interval);
                countdownElement.innerHTML = "EXPIRED";
            }
        }, 1000);


        if (reminderButton) {
            reminderButton.addEventListener('click', function() {
                reminderEnabled = !reminderEnabled;
                reminderButton.classList.toggle('active', reminderEnabled);
                localStorage.setItem(`reminder-${id}`, reminderEnabled ? 'enabled' : 'disabled');
                if (notificationStatus) {
                    notificationStatus.textContent = reminderEnabled ? 'Reminder Active' : '';
                }

                if (reminderEnabled) {
                    scheduleNotificationSW(eventTitle, eventDate, id); // Use Service Worker scheduling
                } else {
                    cancelNotificationSW(id); // Optional cancel - not implemented in this example, but keep function name for consistency
                }
            });
        }
    }

    // Function to schedule a notification using Service Worker
    function scheduleNotificationSW(eventTitle, eventDate, eventId) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) { // Check if SW is active
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    const reminderTime = eventDate - (60 * 60 * 1000); // 1 hour before
                    if (reminderTime > Date.now()) {
                        navigator.serviceWorker.controller.postMessage({ // Send message to SW
                            action: 'schedule-notification',
                            payload: {
                                title: 'Deadline Dash Reminder',
                                body: `Reminder: ${eventTitle} is in 1 hour!`,
                                timestamp: reminderTime,
                                eventId: eventId // Pass eventId as tag
                            }
                        });
                        console.log(`Notification scheduling message sent to Service Worker for ${eventTitle}`);
                    } else {
                        console.log('Reminder time is in the past. Not scheduling notification.');
                    }
                }
            });
        } else {
            console.log('Service worker not active. Cannot schedule notification.'); // Fallback if SW not active
            alert('Notifications require a service worker to be active. Please ensure your browser supports service workers and the site is served over HTTPS.'); // Optional user feedback
        }
    }


    // Optional: Function to cancel a scheduled notification (for Service Worker - placeholder)
    function cancelNotificationSW(eventId) {
        // In a more advanced setup, you might need to manage tags or IDs
        // of notifications scheduled by the service worker to cancel them.
        // For this basic example, we are not implementing cancellation from UI.
        console.log(`Notification cancellation requested for ${eventId} (Service Worker - Not fully implemented in this example)`);
    }


    // Define event dates and start countdowns (no changes)
    const event1Date = eventsData[0].deadline;
    const event2Date = eventsData[1].deadline;
    const event3Date = eventsData[2].deadline;
    const event4Date = eventsData[3].deadline;

    // Start countdowns (modified to pass event titles)
    startCountdown("timer1", event1Date, eventsData[0].title);
    startCountdown("timer2", event2Date, eventsData[1].title);
    startCountdown("timer3", event3Date, eventsData[2].title);
    startCountdown("timer4", event4Date, eventsData[3].title);


    // --- Session Reminder Logic (modified to use scheduleNotificationSW) ---
    function setupSessionReminders() {
        const sessions = document.querySelectorAll(".session");
        sessions.forEach(session => {
            const sessionId = session.id; // Assuming you might add IDs to sessions later if needed
            const sessionTitle = session.querySelector('h2').textContent;
            const sessionDateText = session.querySelector('p strong:nth-of-type(1)').nextSibling.textContent.trim(); // Date from "Date:"
            const sessionTimeText = session.querySelector('p strong:nth-of-type(2)').nextSibling.textContent.trim(); // Time from "Time:"

            // Find the session data from eventsData based on title (or a more robust identifier if available)
            const sessionEventData = eventsData.find(event => event.title === sessionTitle);
            let sessionDateTime = null;

            if (sessionEventData && sessionEventData.date) {
                sessionDateTime = sessionEventData.date; // Use date from eventsData if available
            } else {
                // Fallback to parsing from text if date in eventsData is missing or for dynamic content
                const dateAndTimeStr = `${sessionDateText} ${sessionTimeText}`;
                sessionDateTime = new Date(dateAndTimeStr).getTime(); // Parse date and time strings
            }


            const reminderButtonSession = session.querySelector('.join-button'); // Reusing join-button as reminder for sessions for simplicity, you can add separate button if needed
            if (reminderButtonSession) {
                 // Load reminder preference from localStorage for sessions
                let reminderEnabledSession = localStorage.getItem(`reminder-${sessionId || sessionTitle}`) === 'enabled'; // Use sessionTitle as fallback if no ID
                reminderButtonSession.classList.toggle('active', reminderEnabledSession); // Set initial button state

                reminderButtonSession.addEventListener('click', function(event) {
                    event.preventDefault();
                    reminderEnabledSession = !reminderEnabledSession;
                    reminderButtonSession.classList.toggle('active', reminderEnabledSession);
                    localStorage.setItem(`reminder-${sessionId || sessionTitle}`, reminderEnabledSession ? 'enabled' : 'disabled');

                    if (reminderEnabledSession && sessionDateTime) {
                        scheduleNotificationSW(sessionTitle + " Live Session", sessionDateTime, sessionId || sessionTitle); // Use SW for session reminders
                    } else {
                        cancelNotificationSW(sessionId || sessionTitle); // Optional cancel for sessions
                    }
                });
            }
        });
    }

    setupSessionReminders();


    //buttons (existing code - no changes)
    const buttonLinks = {
        countdown1: "https://apps.iimbx.edu.in/learning/course/course-v1:IIMBx+AE21x+BBA_DBE_B1/block-v1:IIMBx+AE21x+BBA_DBE_B1+type@sequential+block@a30079406b774766945f7df7ba37c95b/block-v1:IIMBx+AE21x+BBA_DBE_B1+type@vertical+block@3d2d25f969b84b3b87395be337ec5300",
        countdown2: "https://apps.iimbx.edu.in/learning/course/course-v1:IIMBx+ES21x+BBA_DBE_B1/block-v1:IIMBx+ES21x+BBA_DBE_B1+type@sequential+block@6af5281590564e63870f26b57b78f841/block-v1:IIMBx+ES21x+BBA_DBE_B1+type@vertical+block@vertical7",
        countdown3: "https://apps.iimbx.edu.in/learning/course/course-v1:IIMBx+PJ21x+BBA_DBE_B1/block-v1:IIMBx+PJ21x+BBA_DBE_B1+type@sequential+block@3f3d99591cb14a9e9a133b3583251766/block-v1:IIMBx+PJ21x+BBA_DBE_B1+type@vertical+block@27405e39773d443288c557c7f97d7822",
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

    document.querySelectorAll(".join-button").forEach(button => {
        if (!button.getAttribute("href") || button.getAttribute("href") === "") {
            button.style.pointerEvents = "none";  // Disable clicks
            button.style.opacity = "0.5";         // Reduce visibility
            button.style.cursor = "not-allowed";  // Change cursor style
            button.textContent = "Link Not Available"; // Update button text
        }
    });
});
