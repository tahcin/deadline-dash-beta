// Simple authentication API for the admin panel
module.exports = (req, res) => {
  // Only allow POST requests for login
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} Not Allowed` 
    });
  }

  try {
    const { username, password } = req.body;
    
    // In a real app, you would use environment variables and a secure password hashing method
    // This is just for demo purposes
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'deadlinedash123';
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Simple token authentication (in a real app, use JWT with proper signing)
      // The token is just the current timestamp encrypted in base64 for demo purposes
      const token = Buffer.from(`${Date.now()}-${ADMIN_USERNAME}`).toString('base64');
      
      return res.status(200).json({ 
        success: true, 
        message: 'Authentication successful',
        token
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication failed',
      error: error.message
    });
  }
}; 