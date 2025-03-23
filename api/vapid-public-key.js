// API endpoint to retrieve the VAPID public key
module.exports = (req, res) => {
  // VAPID keys should be environment variables in a production environment
  const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BDIQjK1Qkjqq9VThVQgS_fpCJUmEBIlHl7cYRMaVxL2pQQZl9dqcLAoxuANl8wy8ymqhM-8y8a_58MrpV-zgXUk';

  return res.status(200).json({ 
    vapidPublicKey: VAPID_PUBLIC_KEY 
  });
}; 