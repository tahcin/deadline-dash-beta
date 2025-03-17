import webpush from "web-push";
import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
});

await redis.connect();

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const payload = JSON.stringify({ title: "New Notification", body: "This is a test message" });

      // Retrieve all subscriptions from Redis
      const subscriptions = await redis.sMembers("subscriptions");

      if (subscriptions.length === 0) {
        return res.status(400).json({ error: "No subscribers found" });
      }

      // Send notifications to all subscribers
      const sendPromises = subscriptions.map(sub =>
        webpush.sendNotification(JSON.parse(sub), payload)
      );

      await Promise.all(sendPromises);

      res.status(200).json({ message: "Notification sent successfully" });
    } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
