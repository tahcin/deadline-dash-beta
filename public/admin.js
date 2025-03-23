// Admin panel functionality for managing push notifications

document.addEventListener("DOMContentLoaded", function() {
    const darkModeSwitch = document.getElementById("darkModeSwitch");
    const darkModeSwitchSidebar = document.getElementById("darkModeSwitchSidebar");
    const loginForm = document.getElementById("loginForm");
    const loginPanel = document.getElementById("loginPanel");
    const notificationPanel = document.getElementById("notificationPanel");
    const notificationForm = document.getElementById("notificationForm");
    const logoutBtn = document.getElementById("logoutBtn");
    const loginError = document.getElementById("loginError");
    const notificationResult = document.getElementById("notificationResult");
    const subscriberStats = document.getElementById("subscriberStats");
    const historyItems = document.getElementById("historyItems");

    // Check and apply the saved dark mode preference
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeSwitch.checked = true;
        if (darkModeSwitchSidebar) {
            darkModeSwitchSidebar.checked = true;
        }
    }

    // Toggle dark mode function for switches
    darkModeSwitch.addEventListener("change", function() {
        document.body.classList.toggle("dark-mode");
        if (darkModeSwitchSidebar) {
            darkModeSwitchSidebar.checked = this.checked;
        }
        if (this.checked) {
            localStorage.setItem("darkMode", "enabled");
        } else {
            localStorage.setItem("darkMode", "disabled");
        }
    });

    if (darkModeSwitchSidebar) {
        darkModeSwitchSidebar.addEventListener("change", function() {
            document.body.classList.toggle("dark-mode");
            darkModeSwitch.checked = this.checked;
            if (this.checked) {
                localStorage.setItem("darkMode", "enabled");
            } else {
                localStorage.setItem("darkMode", "disabled");
            }
        });
    }

    // Check if user is already logged in
    checkAuthStatus();

    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username || !password) {
            showLoginError('Please enter both username and password');
            return;
        }
        
        login(username, password);
    });

    // Handle notification form submission
    notificationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('notificationTitle').value.trim();
        const body = document.getElementById('notificationBody').value.trim();
        const url = document.getElementById('notificationUrl').value.trim();
        
        if (!title || !body) {
            showNotificationResult('Please enter both title and body for the notification', false);
            return;
        }
        
        sendNotification(title, body, url);
    });

    // Handle logout button click
    logoutBtn.addEventListener('click', function() {
        logout();
    });

    // Authentication-related functions
    async function login(username, password) {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store token in localStorage
                localStorage.setItem('authToken', data.token);
                
                // Show the notification panel
                loginPanel.style.display = 'none';
                notificationPanel.style.display = 'block';
                
                // Clear the login form
                loginForm.reset();
                
                // Hide any previous errors
                loginError.style.display = 'none';
                
                // Update subscriber stats
                fetchSubscriberStats();
                
                // Update notification history
                fetchNotificationHistory();
            } else {
                showLoginError(data.message || 'Invalid credentials');
            }
        } catch (error) {
            showLoginError('An error occurred. Please try again later.');
            console.error('Login error:', error);
        }
    }

    function logout() {
        // Remove token from localStorage
        localStorage.removeItem('authToken');
        
        // Show the login panel
        loginPanel.style.display = 'block';
        notificationPanel.style.display = 'none';
    }

    function checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        
        if (token) {
            // Show the notification panel
            loginPanel.style.display = 'none';
            notificationPanel.style.display = 'block';
            
            // Update subscriber stats
            fetchSubscriberStats();
            
            // Update notification history
            fetchNotificationHistory();
        } else {
            // Show the login panel
            loginPanel.style.display = 'block';
            notificationPanel.style.display = 'none';
        }
    }

    function showLoginError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }

    // Notification-related functions
    async function fetchSubscriberStats() {
        try {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                subscriberStats.textContent = 'Not authorized to view stats';
                return;
            }
            
            const response = await fetch('/api/subscriptions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                subscriberStats.innerHTML = `
                    <p><strong>Total Subscribers:</strong> ${data.count}</p>
                `;
            } else {
                subscriberStats.textContent = 'Failed to load subscriber stats';
            }
        } catch (error) {
            subscriberStats.textContent = 'Error loading subscriber stats';
            console.error('Error fetching subscriber stats:', error);
        }
    }

    async function sendNotification(title, body, url = '/') {
        try {
            // Disable the send button during the request
            const sendBtn = document.getElementById('sendBtn');
            sendBtn.disabled = true;
            sendBtn.textContent = 'Sending...';
            
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                showNotificationResult('Not authorized to send notifications', false);
                sendBtn.disabled = false;
                sendBtn.textContent = 'Send Notification';
                return;
            }
            
            const notificationData = {
                title,
                body,
                url: url || '/'
            };
            
            const response = await fetch('/api/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(notificationData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Reset the form
                notificationForm.reset();
                
                // Show success message
                showNotificationResult(data.message, true);
                
                // Update notification history display
                fetchNotificationHistory();
                
                // Update subscriber stats (to reflect any removed invalid subscriptions)
                fetchSubscriberStats();
            } else {
                showNotificationResult(data.message || 'Failed to send notification', false);
            }
            
            // Re-enable the send button
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send Notification';
        } catch (error) {
            showNotificationResult('An error occurred while sending the notification', false);
            console.error('Error sending notification:', error);
            
            // Re-enable the send button
            const sendBtn = document.getElementById('sendBtn');
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send Notification';
        }
    }

    function showNotificationResult(message, isSuccess) {
        notificationResult.textContent = message;
        notificationResult.style.display = 'block';
        notificationResult.style.color = isSuccess ? '#28a745' : '#dc3545';
        
        // Hide the message after 5 seconds
        setTimeout(() => {
            notificationResult.style.display = 'none';
        }, 5000);
    }

    // Fetch notification history from Firebase
    async function fetchNotificationHistory() {
        try {
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                historyItems.innerHTML = 'Not authorized to view notification history';
                return;
            }
            
            const response = await fetch('/api/notification-history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success && data.history.length > 0) {
                historyItems.innerHTML = '';
                
                data.history.forEach(item => {
                    const date = new Date(item.sentAt).toLocaleString();
                    
                    const notificationItem = document.createElement('div');
                    notificationItem.className = 'notification-item';
                    notificationItem.innerHTML = `
                        <p><strong>${item.title}</strong></p>
                        <p>${item.body}</p>
                        <p><small>URL: ${item.url}</small></p>
                        <p><small>Sent: ${date}</small></p>
                        <p><small>Delivered: ${item.successCount} / Failed: ${item.failedCount}</small></p>
                    `;
                    
                    historyItems.appendChild(notificationItem);
                });
            } else {
                historyItems.innerHTML = 'No notifications sent yet.';
            }
        } catch (error) {
            historyItems.innerHTML = 'Error loading notification history';
            console.error('Error fetching notification history:', error);
        }
    }
});

// Toggle sidebar for mobile view
function toggleSidebar() {
    const sidebar = document.getElementById('mobileSidebar');
    sidebar.classList.toggle('show');
} 