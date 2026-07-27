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
      const deadlineDate = new Date(s.deadline);
      return deadlineDate > now && deadlineDate <= sevenDaysFromNow;
    });

    if (closingSoon.length === 0) {
      return res.status(200).json({ message: 'No scholarships closing soon' });
    }

    let sentCount = 0;

    for (const sub of subscriptions) {
      const alreadyNotified = sub.notifiedScholarshipIds || [];

      // Sirf woh scholarships jo is subscription ko pehle notify nahi hui
      const newOnes = closingSoon.filter(
        s => !alreadyNotified.includes(s._id.toString())
      );

      if (newOnes.length === 0) continue; // is subscriber ko sab already mil chuka hai

      const names = newOnes.map(s => s.name).join(', ');
      const payload = JSON.stringify({
        title: 'Deadline Coming Soon',
        body: `Closing within 7 days: ${names} — check BursMate now.`
      });

      try {
        await webpush.sendNotification(sub, payload);
        sentCount++;

        // Ab in scholarship IDs ko "already notified" list mein save kar do
        const updatedIds = [
          ...alreadyNotified,
          ...newOnes.map(s => s._id.toString())
        ];

        await db.collection('subscriptions').updateOne(
          { endpoint: sub.endpoint },
          { $set: { notifiedScholarshipIds: updatedIds } }
        );
      } catch (err) {
        console.error('Failed for one subscriber:', err.message);
      }
    }

    res.status(200).json({ sent: sentCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
}