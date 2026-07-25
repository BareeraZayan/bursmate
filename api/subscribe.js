import { MongoClient } from 'mongodb'

let cachedClient = null

async function getClient() {
  if (cachedClient) return cachedClient
  const client = new MongoClient(process.env.MONGODB_URI)
  await client.connect()
  cachedClient = client
  return client
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const subscription = req.body
    const client = await getClient()
    const db = client.db('bursmate')
    const collection = db.collection('subscriptions')

    await collection.updateOne(
      { endpoint: subscription.endpoint },
      { $set: subscription },
      { upsert: true }
    )

    res.status(201).json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}