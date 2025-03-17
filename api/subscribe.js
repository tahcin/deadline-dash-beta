import redis from '@redis/client';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ error: 'Subscription object is required' });
    }

    // Redis setup (ensure your Redis connection is properly configured)
    const client = redis.createClient({
      url: process.env.REDIS_URL, // Check if this environment variable is set
    });

    client.on('error', (err) => console.error('Redis Client Error', err));
    await client.connect();

    await client.set(`subscription:${subscription.endpoint}`, JSON.stringify(subscription));

    res.status(200).json({ message: 'Subscription saved' });

    await client.quit(); // Ensure the connection is closed properly
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
