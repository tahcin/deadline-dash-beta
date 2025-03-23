document.addEventListener("DOMContentLoaded", function() {
    // Dark mode toggle functionality
    const darkModeSwitch = document.getElementById("darkModeSwitch");
    
    // Check and apply the saved dark mode preference
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        darkModeSwitch.checked = true;
    }
    
    // Toggle dark mode function for switch
    darkModeSwitch.addEventListener("change", function() {
        document.body.classList.toggle("dark-mode");
        if (this.checked) {
            localStorage.setItem("darkMode", "enabled");
        } else {
            localStorage.setItem("darkMode", "disabled");
        }
    });
    
    // Authentication state observer
    firebase.auth().onAuthStateChanged(function(user) {
        const loginScreen = document.getElementById('loginScreen');
        const adminDashboard = document.getElementById('adminDashboard');
        
        if (user) {
            // User is signed in, show admin dashboard
            loginScreen.style.display = 'none';
            adminDashboard.style.display = 'block';
            
            // Load admin dashboard data
            loadDashboardData();
        } else {
            // No user is signed in, show login screen
            loginScreen.style.display = 'flex';
            adminDashboard.style.display = 'none';
        }
    });
    
    // Login form submission
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        const loginAlert = document.getElementById('loginAlert');
        
        // Sign in with email and password
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in 
                loginAlert.style.display = 'none';
            })
            .catch((error) => {
                // Handle errors
                loginAlert.textContent = error.message;
                loginAlert.style.display = 'block';
            });
    });
    
    // Logout button
    document.getElementById('logoutButton').addEventListener('click', function() {
        firebase.auth().signOut().then(() => {
            // Sign-out successful
        }).catch((error) => {
            // An error happened
            console.error('Logout error:', error);
        });
    });
    
    // Send notification form
    document.getElementById('notificationForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('notificationTitle').value;
        const body = document.getElementById('notificationBody').value;
        const url = document.getElementById('notificationURL').value || '/';
        
        const notificationAlert = document.getElementById('notificationAlert');
        
        try {
            // Save notification to Firestore
            const notificationRef = await db.collection('notifications').add({
                title: title,
                body: body,
                url: url,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                sentBy: firebase.auth().currentUser.email
            });
            
            // Send notification to all subscribers using Cloud Function
            const sendNotification = firebase.functions().httpsCallable('sendNotification');
            await sendNotification({
                notification: {
                    title: title,
                    body: body,
                },
                data: {
                    url: url,
                    notificationId: notificationRef.id
                }
            });
            
            // Show success message
            notificationAlert.textContent = 'Notification sent successfully!';
            notificationAlert.className = 'alert alert-success';
            notificationAlert.style.display = 'block';
            
            // Reset form
            document.getElementById('notificationForm').reset();
            
            // Refresh dashboard data
            loadDashboardData();
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                notificationAlert.style.display = 'none';
            }, 3000);
            
        } catch (error) {
            // Show error message
            notificationAlert.textContent = 'Error sending notification: ' + error.message;
            notificationAlert.className = 'alert alert-error';
            notificationAlert.style.display = 'block';
            console.error('Error sending notification:', error);
        }
    });
});

// Load dashboard data
async function loadDashboardData() {
    try {
        // Get subscriber count
        const subscribersSnapshot = await db.collection('notificationTokens')
            .where('subscribed', '==', true)
            .get();
        
        document.getElementById('subscriberCount').textContent = subscribersSnapshot.size;
        
        // Get recent notifications
        const notificationsSnapshot = await db.collection('notifications')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        const historyContainer = document.getElementById('notificationHistory');
        
        if (notificationsSnapshot.empty) {
            historyContainer.innerHTML = '<p>No notifications sent yet.</p>';
            document.getElementById('lastNotification').textContent = 'None';
        } else {
            let historyHTML = '';
            let isFirst = true;
            
            notificationsSnapshot.forEach(doc => {
                const notification = doc.data();
                const date = notification.createdAt ? new Date(notification.createdAt.toDate()) : new Date();
                const formattedDate = date.toLocaleString();
                
                if (isFirst) {
                    document.getElementById('lastNotification').textContent = formattedDate;
                    isFirst = false;
                }
                
                historyHTML += `
                    <div class="history-item">
                        <div>
                            <strong>${notification.title}</strong><br>
                            <small>${notification.body}</small>
                        </div>
                        <div>
                            <small>${formattedDate}</small>
                        </div>
                    </div>
                `;
            });
            
            historyContainer.innerHTML = historyHTML;
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
} 