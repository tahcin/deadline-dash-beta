import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL,
});

await redis.connect();

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const subscription = req.body;

      // Store subscription in Redis
      await redis.sAdd("subscriptions", JSON.stringify(subscription));

      res.status(201).json({ message: "Subscription saved successfully" });
    } catch (error) {
      console.error("Error saving subscription:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
