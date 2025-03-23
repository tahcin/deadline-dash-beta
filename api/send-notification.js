// API endpoint to send push notifications to subscribers
const webpush = require('web-push');
const { subscriptionsCollection } = require('../lib/firebase');
const { requireAuth } = require('../lib/auth');

// Load environment variables from .env file if needed
// require('dotenv').config();

// VAPID keys should be environment variables in a production environment
// Generate keys using: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BDIQjK1Qkjqq9VThVQgS_fpCJUmEBIlHl7cYRMaVxL2pQQZl9dqcLAoxuANl8wy8ymqhM-8y8a_58MrpV-zgXUk';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'SspzzJAjPuTvfDFXLr7Y-d1q4o-_YN0eQSVqeHyUvWw';

// Set VAPID details
webpush.setVapidDetails(
  'mailto:admin@deadlinedash.com', // Change to your email
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Mark a subscription as inactive
async function markSubscriptionAsInactive(endpoint) {
  try {
    // Find the subscription with the given endpoint
    const subscriptionsRef = await subscriptionsCollection
      .where('endpoint', '==', endpoint)
      .limit(1)
      .get();
    
    if (!subscriptionsRef.empty) {
      // Get the document reference and update it
      const docRef = subscriptionsRef.docs[0].ref;
      await docRef.update({ active: false });
    }
  } catch (error) {
    console.error('Error marking subscription as inactive:', error);
  }
}

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} Not Allowed` 
    });
  }

  // Check authentication - only admins can send notifications
  if (!requireAuth(req, res)) {
    return; // Response is sent by requireAuth
  }

  try {
    const { title, body, icon = '/images/favicon-32x32.png', url = '/' } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ 
        success: false, 
        message: 'Notification title and body are required' 
      });
    }

    // Get all active subscriptions
    const subscriptionsRef = await subscriptionsCollection
      .where('active', '==', true)
      .get();
    
    const subscriptions = [];
    subscriptionsRef.forEach(doc => {
      subscriptions.push(doc.data());
    });
    
    if (subscriptions.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No subscriptions found' 
      });
    }

    // Track failed subscriptions
    const failedSubscriptions = [];
    
    // Send notification to each subscription
    const sendPromises = subscriptions.map(async (subscription) => {
      try {
        const payload = JSON.stringify({
          title,
          body,
          icon,
          url,
          timestamp: new Date().getTime()
        });

        await webpush.sendNotification(subscription, payload);
        return true;
      } catch (error) {
        console.error('Error sending notification to subscription:', error);
        
        // If subscription is no longer valid, add to failed list
        if (error.statusCode === 404 || error.statusCode === 410) {
          failedSubscriptions.push(subscription.endpoint);
        }
        
        return false;
      }
    });

    await Promise.all(sendPromises);
    
    // Mark failed subscriptions as inactive
    const updatePromises = failedSubscriptions.map(endpoint => 
      markSubscriptionAsInactive(endpoint)
    );
    
    await Promise.all(updatePromises);

    // Store notification in history
    await storeNotificationHistory({
      title,
      body,
      url,
      icon,
      sentAt: new Date().toISOString(),
      successCount: subscriptions.length - failedSubscriptions.length,
      failedCount: failedSubscriptions.length
    });

    return res.status(200).json({ 
      success: true, 
      message: `Notifications sent to ${subscriptions.length - failedSubscriptions.length} subscribers`,
      totalCount: subscriptions.length,
      failedCount: failedSubscriptions.length
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to send notifications',
      error: error.message
    });
  }
};

// Store notification history in Firebase
async function storeNotificationHistory(notification) {
  try {
    const { db } = require('../lib/firebase');
    await db.collection('notification-history').add(notification);
  } catch (error) {
    console.error('Error storing notification history:', error);
  }
} 