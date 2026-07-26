import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

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
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' })
    }
const passwordRules = /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/
    if (!passwordRules.test(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters, with at least 1 capital letter and 1 number.' })
    }
    

    const client = await getClient()
    const db = client.db('bursmate')
    const users = db.collection('users')

    const existing = await users.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await users.insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
    })

    res.status(201).json({ success: true, message: 'Account created successfully.' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}