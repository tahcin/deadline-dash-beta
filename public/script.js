document.addEventListener("DOMContentLoaded", function() {
    // Dark mode toggle (existing code)
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

    // --- Notification Feature with Service Worker and Universal Button ---

    // Register service worker (existing code)
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

    // Request notification permission on page load (existing code)
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

    // Event data (Store event details - MODIFIED to include isSession flag)
    const eventsData = [
        { id: "timer1", title: "FBC II Module 4 CLA", deadline: new Date("March 15, 2025 9:16:00").getTime(), isSession: false },
        { id: "timer2", title: "Microeconomics Module 4 CLA", deadline: new Date("March 19, 2025 23:30:00").getTime(), isSession: false },
        { id: "timer3", title: "Rs250 Venture Module 3 CLA", deadline: new Date("March 19, 2025 23:30:00").getTime(), isSession: false },
        { id: "timer4", title: "Advanced Statistics Mid-Term 2", deadline: new Date("March 26, 2025 23:30:00").getTime(), isSession: false },
        { id: "session1", title: "Principles of Microeconomics Live Session", date: new Date("March 17, 2025 17:00:00").getTime(), isSession: true }, // Session 1 Date & Time
        { id: "session2", title: "Venturing on a Budget Live Session", date: new Date("March 20, 2025 00:00:00").getTime(), isSession: true }, // Session 2 - Time TBA, set a placeholder, update later
        { id: "session3", title: "Foundations of Business Communication II SME Live Session", date: new Date("March 21, 2025 17:00:00").getTime(), isSession: true }  // Session 3 Date & Time
    ];

    // --- Reminder Manager Modal Logic ---
    const reminderManagerToggle = document.getElementById('reminderManagerToggle');
    const reminderManagerModal = document.getElementById('reminderManager');
    const closeReminderManagerButton = document.getElementById('closeReminderManager');
    const reminderListElement = document.getElementById('reminderList');

    // Function to populate the reminder list in the modal
    function populateReminderList() {
        reminderListElement.innerHTML = ''; // Clear existing list
        eventsData.forEach(event => {
            const listItem = document.createElement('li');
            const label = document.createElement('label');
            label.classList.add('reminder-toggle-label');
            label.textContent = event.title;

            const switchContainer = document.createElement('label');
            switchContainer.classList.add('reminder-switch');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `reminderToggle-${event.id}`; // Unique ID for each checkbox
            checkbox.checked = localStorage.getItem(`reminder-${event.id}`) === 'enabled'; // Load saved state
            const slider = document.createElement('span');
            slider.classList.add('reminder-slider', 'round');

            switchContainer.appendChild(checkbox);
            switchContainer.appendChild(slider);

            listItem.appendChild(label);
            listItem.appendChild(switchContainer);
            reminderListElement.appendChild(listItem);

            // Event listener for each checkbox change
            checkbox.addEventListener('change', function() {
                const reminderEnabled = checkbox.checked;
                localStorage.setItem(`reminder-${event.id}`, reminderEnabled ? 'enabled' : 'disabled');
                if (reminderEnabled) {
                    scheduleNotificationSW(event.title, event.isSession ? event.date : event.deadline, event.id);
                } else {
                    cancelNotificationSW(event.id); // Optional cancel
                }
            });
        });
    }

    // Open modal
    reminderManagerToggle.addEventListener('click', function() {
        populateReminderList(); // Populate list each time modal is opened to reflect current state
        reminderManagerModal.style.display = "block";
    });

    // Close modal
    closeReminderManagerButton.addEventListener('click', function() {
        reminderManagerModal.style.display = "none";
    });

    // Close modal if clicked outside
    window.addEventListener('click', function(event) {
        if (event.target == reminderManagerModal) {
            reminderManagerModal.style.display = "none";
        }
    });


    // Function to update the countdown every second
    function startCountdown(id, eventDate, eventTitle) {
        console.log(`startCountdown called for id: ${id}, eventTitle: ${eventTitle}`); // DEBUG: Function call

        const countdownElement = document.getElementById(id);
        console.log(`countdownElement for ${id}:`, countdownElement); // DEBUG: Check if element is found

        if (!countdownElement) {
            console.error(`Countdown element with id "${id}" not found!`); // DEBUG: Error if element not found
            return; // Exit if element is not found
        }

        const interval = setInterval(function() {
            const now = new Date().getTime();
            const distance = eventDate - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const timerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
            console.log(`Updating timer ${id} with text: "${timerText}"`); // DEBUG: Timer text before update
            console.log(`countdownElement.innerHTML before update:`, countdownElement.innerHTML); // DEBUG: InnerHTML before update

            countdownElement.innerHTML = timerText; // Update timer

            console.log(`countdownElement.innerHTML after update:`, countdownElement.innerHTML); // DEBUG: InnerHTML after update


            if (distance < 0) {
                clearInterval(interval);
                countdownElement.innerHTML = "EXPIRED";
                console.log(`Countdown ${id} expired, set text to EXPIRED`); // DEBUG: Expiry message
            }
        }, 1000);
    }

    // Function to schedule a notification using Service Worker (no changes needed)
    function scheduleNotificationSW(eventTitle, eventDate, eventId) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    const reminderTime = eventDate - (60 * 60 * 1000); // 1 hour before
                    if (reminderTime > Date.now()) {
                        navigator.serviceWorker.controller.postMessage({
                            action: 'schedule-notification',
                            payload: {
                                title: 'Deadline Dash Reminder',
                                body: `Reminder: ${eventTitle} is in 1 hour!`,
                                timestamp: reminderTime,
                                eventId: eventId
                            }
                        });
                        console.log(`Notification scheduling message sent to Service Worker for ${eventTitle}`);
                    } else {
                        console.log('Reminder time is in the past. Not scheduling notification.');
                    }
                }
            });
        } else {
            console.log('Service worker not active. Cannot schedule notification.');
            alert('Notifications require a service worker to be active. Please ensure your browser supports service workers and the site is served over HTTPS.');
        }
    }

    // Optional: Function to cancel a scheduled notification (for Service Worker - placeholder) (no changes needed)
    function cancelNotificationSW(eventId) {
        console.log(`Notification cancellation requested for ${eventId} (Service Worker - Not fully implemented in this example)`);
    }

    // Define event dates and start countdowns (no changes)
    const event1Date = eventsData[0].deadline;
    const event2Date = eventsData[1].deadline;
    const event3Date = eventsData[2].deadline;
    const event4Date = eventsData[3].deadline;
    const session1Date = eventsData[4].date;
    const session2Date = eventsData[5].date;
    const session3Date = eventsData[6].date;


    // Start countdowns (modified to pass event titles) (no changes)
    startCountdown("timer1", event1Date, eventsData[0].title);
    startCountdown("timer2", event2Date, eventsData[1].title);
    startCountdown("timer3", event3Date, eventsData[2].title);
    startCountdown("timer4", event4Date, eventsData[3].title);


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
