// Authentication utilities for API endpoints

/**
 * Verify if a request is authenticated with a valid admin token
 * @param {Object} req - The request object
 * @returns {boolean} - True if authenticated, false otherwise
 */
function isAuthenticated(req) {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return false;
    }
    
    // In a real app, you'd use a JWT library to verify the token
    // and check its expiration, signature, etc.
    // This is a simple implementation for demonstration purposes
    
    // Decode the token (it's just base64 in our simple implementation)
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
    
    // Our simple token format is: timestamp-username
    const parts = decodedToken.split('-');
    
    if (parts.length !== 2) {
      return false;
    }
    
    const timestamp = parseInt(parts[0]);
    const username = parts[1];
    
    // Check if username matches the admin username
    const validUsername = username === (process.env.ADMIN_USERNAME || 'admin');
    
    // Check if token is not expired (24 hour validity in this example)
    const tokenAge = Date.now() - timestamp;
    const isExpired = tokenAge > 24 * 60 * 60 * 1000; // 24 hours
    
    return validUsername && !isExpired;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

/**
 * Middleware to require authentication for API endpoints
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {boolean} - True if authentication passes, false if it fails and response is sent
 */
function requireAuth(req, res) {
  if (!isAuthenticated(req)) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return false;
  }
  return true;
}

module.exports = {
  isAuthenticated,
  requireAuth
}; 