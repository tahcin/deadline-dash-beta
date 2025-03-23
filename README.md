# Deadline Dash

A deadline tracking application with push notification capabilities. Built to help students keep track of important deadlines for assignments, exams, and live sessions.

## Features

- Countdown timers for important deadlines
- Web push notifications for reminders
- Admin panel to send custom notifications
- Firebase integration for data storage
- Dark mode support
- Mobile-responsive design

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account
- Vercel account (for deployment)

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/deadline-dash.git
   cd deadline-dash
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up Firebase:
   - Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Add a web app to your project
   - Enable Firestore Database
   - Create a service account and download the private key JSON file

4. Create environment variables:
   - Copy `.env.example` to `.env.local`
   - Generate VAPID keys for Web Push: `npx web-push generate-vapid-keys`
   - Add your VAPID keys, admin credentials, and Firebase service account details to `.env.local`

5. Run the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment to Vercel

1. Push your code to a Git repository (GitHub, GitLab, etc.)

2. Connect to Vercel:
   - Sign up or log in to [Vercel](https://vercel.com)
   - Import your Git repository
   - Add environment variables in the Vercel dashboard (same as in `.env.local`)

3. Deploy:
   - Vercel will automatically deploy your app
   - You can also deploy manually with the Vercel CLI:
     ```
     npm run deploy
     ```

## Using the Admin Panel

1. Access the admin panel at `/admin.html`
2. Log in with your admin credentials (set in environment variables)
3. View subscription statistics
4. Send notifications to all subscribers
5. View notification history

## Firebase Collections

The application uses the following Firestore collections:

- `push-subscriptions`: Stores user push notification subscriptions
- `notification-history`: Logs of sent notifications

## Web Push Notification Flow

1. User subscribes to notifications from the main page
2. Subscription is stored in Firebase
3. Admin sends notification through the admin panel
4. Firebase Cloud Functions deliver notifications to all subscribers
5. Service worker displays notifications on the user's device

## License

MIT 