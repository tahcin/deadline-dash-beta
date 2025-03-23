// API endpoint to store push notification subscriptions
const { subscriptionsCollection } = require('../lib/firebase');
const { requireAuth } = require('../lib/auth');

// Handle POST request to save a new subscription
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const subscription = req.body;
      
      if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ 
          success: false, 
          message: 'Subscription data is invalid' 
        });
      }
      
      // Check if subscription already exists
      const existingSubscription = await subscriptionsCollection
        .where('endpoint', '==', subscription.endpoint)
        .limit(1)
        .get();
      
      if (existingSubscription.empty) {
        // Add a new document with subscription data and timestamp
        await subscriptionsCollection.add({
          ...subscription,
          createdAt: new Date().toISOString(),
          active: true
        });
      }
      
      return res.status(201).json({ 
        success: true, 
        message: 'Subscription saved successfully' 
      });
    } catch (error) {
      console.error('Error saving subscription:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to save subscription',
        error: error.message
      });
    }
  } else if (req.method === 'GET') {
    // Only accessible with admin credentials
    // Check authentication
    if (!requireAuth(req, res)) {
      return; // Response is sent by requireAuth
    }
    
    try {
      const subscriptionsSnapshot = await subscriptionsCollection
        .where('active', '==', true)
        .get();
      
      const subscriptions = [];
      subscriptionsSnapshot.forEach(doc => {
        // Don't include the document ID or timestamps in the returned data
        const { createdAt, active, ...subscriptionData } = doc.data();
        subscriptions.push(subscriptionData);
      });
      
      return res.status(200).json({ 
        success: true, 
        count: subscriptions.length,
        subscriptions 
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch subscriptions',
        error: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} Not Allowed` 
    });
  }
} 