# Deadline Dash - Push Notification Feature

This project has been updated to include push notifications using Firebase. Here's how to set it up:

## Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com/)

2. Enable Firestore Database, Cloud Messaging, and Authentication (Email/Password) services

3. Create an admin user in Firebase Authentication

4. Generate a Firebase configuration by going to Project Settings > General > Your apps > Web app

5. Update the Firebase config in these files:
   - `public/firebase-config.js`
   - `public/firebase-messaging-sw.js`

6. Generate a VAPID key for web push notifications:
   - Go to Project Settings > Cloud Messaging > Web Push certificates
   - Add a new web push certificate
   - Copy the key pair and replace `YOUR_VAPID_KEY` in `public/firebase-config.js`

## Deploy Firebase Functions

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project (if not already done):
   ```bash
   firebase init
   ```
   - Select Firestore, Functions, and Hosting
   - Choose your Firebase project
   - Accept defaults for other options

4. Deploy the functions:
   ```bash
   firebase deploy --only functions
   ```

## Vercel Deployment

1. Make sure your Vercel project has the updated code

2. Deploy to Vercel:
   ```bash
   vercel
   ```

## Usage

### For Users:
1. Visit the site
2. Click "Enable Notifications" in the navigation
3. Accept the browser permission request
4. They will now receive notifications

### For Admins:
1. Visit `/admin.html`
2. Log in with your Firebase admin credentials
3. Use the dashboard to send notifications to all subscribers

## Firestore Data Structure

The project uses the following Firestore collections:

- `notificationTokens`: Stores user FCM tokens
- `notifications`: Stores all notifications sent
- `notificationLogs`: Logs notification sending results

## Security Rules

Make sure to set up appropriate security rules in Firebase to protect your data.

Example Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can subscribe to notifications
    match /notificationTokens/{tokenId} {
      allow read, write: if true;
    }
    
    // Only authenticated admins can read notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null;
    }
    
    // Only authenticated admins can read logs
    match /notificationLogs/{logId} {
      allow read, write: if request.auth != null;
    }
  }
}
``` 