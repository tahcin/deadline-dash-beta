import webpush from "web-push";
import { promises as fs } from "fs";
import path from "path";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

webpush.setVapidDetails("mailto:your@email.com", publicKey, privateKey);

const filePath = path.join(process.cwd(), "subscriptions.json");

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { title, body } = req.body;
        const fileData = await fs.readFile(filePath, "utf-8");
        const subscriptions = JSON.parse(fileData);

        subscriptions.forEach((subscription) => {
            webpush.sendNotification(subscription, JSON.stringify({ title, body }))
                .catch((err) => console.error("Push failed:", err));
        });

        res.status(200).json({ message: "Notifications sent" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
