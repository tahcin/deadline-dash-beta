import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "subscriptions.json");

export default async function handler(req, res) {
    if (req.method === "POST") {
        const subscription = req.body;
        let subscriptions = [];

        try {
            const fileData = await fs.readFile(filePath, "utf-8");
            subscriptions = JSON.parse(fileData);
        } catch (err) {
            console.error("Error reading file:", err);
        }

        subscriptions.push(subscription);
        await fs.writeFile(filePath, JSON.stringify(subscriptions));

        res.status(201).json({ message: "Subscribed successfully" });
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
