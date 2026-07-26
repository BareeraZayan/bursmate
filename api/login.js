import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' })
    }

    const client = await getClient()
    const db = client.db('bursmate')
    const users = db.collection('users')

    const user = await users.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email.' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password.' })
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.status(200).json({ success: true, token, name: user.name, email: user.email })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}