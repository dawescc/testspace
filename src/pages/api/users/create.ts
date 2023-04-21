import { NextApiRequest, NextApiResponse } from 'next';
import { init_Db } from '@/components/database';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { name, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ message: 'Missing name or password' });
    }

    try {
      const db = await init_Db();
      const apiKey = uuidv4();
      const passwordHash = await bcrypt.hash(password, 10); // Hash the password

      await db.run(
        'INSERT INTO users (name, password, display_name, api_key) VALUES (?, ?, ?, ?)',
        name,
        passwordHash, // Store the hashed password in the database
        name,
        apiKey
      );

      const user = await db.get('SELECT * FROM users WHERE name = ?', name);

      if (!user) {
        return res.status(500).json({ message: 'Could not create user' });
      }

      return res.status(201).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}