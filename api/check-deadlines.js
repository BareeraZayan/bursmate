import { MongoClient } from 'mongodb';
import webpush from 'web-push';

const client = new MongoClient(process.env.MONGODB_URI);

webpush.setVapidDetails(
  'mailto:bareerazayan62@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  try {
    await client.connect();
    const db = client.db('bursmate');

    const subscriptions = await db.collection('subscriptions').find({}).toArray();
    const scholarships = await db.collection('scholarships').find({}).toArray();

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const closingSoon = scholarships.filter(s => {
      const deadlineDate = new Date(s.deadline); // confirmed field name
      return deadlineDate > now && deadlineDate <= sevenDaysFromNow;
    });

    if (closingSoon.length === 0) {
      return res.status(200).json({ message: 'No scholarships closing soon' });
    }

    const names = closingSoon.map(s => s.name).join(', ');

    const payload = JSON.stringify({
      title: 'Deadline Coming Soon',
      body: `Closing within 7 days: ${names} — check BursMate now.`
    });

    const results = await Promise.allSettled(
      subscriptions.map(sub => webpush.sendNotification(sub, payload))
    );

    res.status(200).json({ sent: results.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}