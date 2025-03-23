// API endpoint to fetch notification history
const { db } = require('../lib/firebase');
const { requireAuth } = require('../lib/auth');

module.exports = async (req, res) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} Not Allowed` 
    });
  }

  // Check authentication - only admins can access history
  if (!requireAuth(req, res)) {
    return; // Response is sent by requireAuth
  }

  try {
    // Get the 10 most recent notifications
    const historySnapshot = await db.collection('notification-history')
      .orderBy('sentAt', 'desc')
      .limit(10)
      .get();
    
    const history = [];
    historySnapshot.forEach(doc => {
      history.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return res.status(200).json({ 
      success: true, 
      history 
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notification history',
      error: error.message
    });
  }
}; 