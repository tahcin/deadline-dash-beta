const admin = require('firebase-admin');

// Check if Firebase is already initialized
if (!admin.apps.length) {
  // If using environment variables (recommended for production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Initialize with service account from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    // Initialize with application default credentials (for development)
    admin.initializeApp({
      // If you want to use a service account JSON file directly (not recommended for production)
      // credential: admin.credential.cert(require('../path/to/serviceAccountKey.json'))
      
      // For development without credentials (uses Firebase Emulator if running)
      credential: admin.credential.applicationDefault()
    });
  }
}

const db = admin.firestore();
const subscriptionsCollection = db.collection('push-subscriptions');

module.exports = {
  admin,
  db,
  subscriptionsCollection
}; 