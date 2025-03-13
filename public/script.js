document.addEventListener("DOMContentLoaded", function() {
    const toggleButton = document.getElementById("darkModeToggle");
    const toggleIcon = document.getElementById("toggleIcon");
    const toggleText = document.getElementById("toggleText");
    const notifyButton = document.getElementById("enableNotifications");

    // Check and apply the saved dark mode preference
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        toggleIcon.textContent = "☀️";
        toggleText.textContent = "Light Mode";
    }

    // Toggle dark mode function
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

    // Request notification permission on button click
    notifyButton.addEventListener("click", function() {
        if ("Notification" in window) {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    alert("Notifications enabled! You will receive reminders for deadlines.");
                } else {
                    alert("Notifications are blocked. Enable them in your browser settings if you change your mind.");
                }
            });
        }
    });
});

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

        if (distance < 0) {
            clearInterval(interval);
            countdownElement.innerHTML = "EXPIRED";
        }
    }, 1000);
}

// Function to schedule notifications
function scheduleNotification(eventName, eventDate) {
    const oneHourBefore = eventDate - 60 * 60 * 1000;
    const now = new Date().getTime();
    
    if (oneHourBefore > now) {
        const timeout = oneHourBefore - now;
        setTimeout(() => {
            new Notification("Deadline Reminder", {
                body: `Reminder: ${eventName} deadline in 1 hour!`,
                icon: "/images/notification-icon.png"
            });
        }, timeout);
    }
}

// Define event dates
const deadlines = [
    { id: "timer1", name: "Foundations of Business Communication II - Module 4 CLA", date: new Date("March 19, 2025 23:30:00").getTime() },
    { id: "timer2", name: "Principles of Microeconomics - Module 4 CLA", date: new Date("March 19, 2025 23:30:00").getTime() },
    { id: "timer3", name: "Venturing on a Budget: Rs250 Venture - Module 3 CLA", date: new Date("March 19, 2025 23:30:00").getTime() },
    { id: "timer4", name: "Advanced Statistics for Business - Mid-Term 2", date: new Date("March 26, 2025 23:30:00").getTime() }
];

// Start countdowns and schedule notifications
deadlines.forEach(event => {
    startCountdown(event.id, event.date);
    if ("Notification" in window && Notification.permission === "granted") {
        scheduleNotification(event.name, event.date);
    }
});


// Clickable event boxes
document.addEventListener("DOMContentLoaded", function () {
    const buttonLinks = {
        countdown1: "https://apps.iimbx.edu.in/learning/course/course-v1:IIMBx+AE21x+BBA_DBE_B1/block-v1:IIMBx+AE21x+BBA_DBE_B1+type@sequential+block@a30079406b774766945f7df7ba37c95b/block-v1:IIMBx+AE21x+BBA_DBE_B1+type@vertical+block@3d2d25f969b84b3b87395be337ec5300",  
        countdown2: "https://apps.iimbx.edu.in/learning/course/course-v1:IIMBx+ES21x+BBA_DBE_B1/block-v1:IIMBx+ES21x+BBA_DBE_B1+type@sequential+block@6af5281590564e63870f26b57b78f841/block-v1:IIMBx+ES21x+BBA_DBE_B1+type@vertical+block@vertical7",
        countdown3: "https://apps.iimbx.edu.in/learning/course/course-v1:IIMBx+PJ21x+BBA_DBE_B1/block-v1:IIMBx+PJ21x+BBA_DBE_B1+type@sequential+block@3f3d99591cb14a9e9a133b3583251766/block-v1:IIMBx+PJ21x+BBA_DBE_B1+type@vertical+block@27405e39773d443288c557c7f97d7822",
        countdown4: ""
    };

    document.querySelectorAll(".event").forEach(eventBox => {
        eventBox.style.cursor = "pointer";
        eventBox.addEventListener("click", function () {
            const eventId = this.id;
            if (buttonLinks[eventId]) {
                window.open(buttonLinks[eventId], "_blank");
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".join-button").forEach(button => {
        if (!button.getAttribute("href") || button.getAttribute("href") === "") {
            button.style.pointerEvents = "none";
            button.style.opacity = "0.5";
            button.style.cursor = "not-allowed";
            button.textContent = "Link Not Available";
        }
    });
});
