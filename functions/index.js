const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Cloud Function to send notifications to all subscribers
exports.sendNotification = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'You must be logged in to send notifications.'
    );
  }
  
  try {
    // Get all notification tokens from Firestore
    const tokensSnapshot = await admin.firestore()
      .collection('notificationTokens')
      .where('subscribed', '==', true)
      .get();
    
    if (tokensSnapshot.empty) {
      console.log('No subscribers found.');
      return { success: false, message: 'No subscribers found.' };
    }
    
    // Extract tokens
    const tokens = [];
    tokensSnapshot.forEach(doc => {
      const tokenData = doc.data();
      if (tokenData.token) {
        tokens.push(tokenData.token);
      }
    });
    
    if (tokens.length === 0) {
      console.log('No valid tokens found.');
      return { success: false, message: 'No valid tokens found.' };
    }
    
    // Create the notification message
    const message = {
      notification: {
        title: data.notification.title,
        body: data.notification.body
      },
      data: data.data || {},
      tokens: tokens
    };
    
    // Send the notification
    const response = await admin.messaging().sendMulticast(message);
    
    // Log results
    console.log(`${response.successCount} messages were sent successfully`);
    
    // Save results to Firestore
    await admin.firestore().collection('notificationLogs').add({
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sentBy: context.auth.token.email,
      totalTokens: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
      notification: data.notification,
      data: data.data || {}
    });
    
    return {
      success: true,
      message: `${response.successCount} messages were sent successfully.`
    };
    
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error sending notification: ' + error.message
    );
  }
});

// Clean up invalid tokens when notifications fail
exports.cleanupTokens = functions.firestore
  .document('notificationLogs/{logId}')
  .onCreate(async (snapshot, context) => {
    const logData = snapshot.data();
    
    if (!logData.failureCount || logData.failureCount === 0) {
      return null; // No failures, nothing to clean up
    }
    
    try {
      const tokensSnapshot = await admin.firestore()
        .collection('notificationTokens')
        .get();
      
      const promises = [];
      tokensSnapshot.forEach(doc => {
        const tokenData = doc.data();
        
        // Check if token is valid
        admin.messaging().send({
          token: tokenData.token,
          notification: { title: 'Token Validation', body: 'Validating your token.' }
        }, true) // dryRun: true - doesn't actually send message
          .catch(error => {
            // Token is invalid, remove it
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
              promises.push(doc.ref.delete());
            }
          });
      });
      
      await Promise.all(promises);
      console.log(`Cleaned up ${promises.length} invalid tokens.`);
      return null;
      
    } catch (error) {
      console.error('Error cleaning up tokens:', error);
      return null;
    }
  }); 