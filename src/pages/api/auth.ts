import { NextApiRequest, NextApiResponse } from 'next';
import { init_Db } from '@/components/database';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import sqlite3 from 'sqlite3';

interface AuthRequestBody {
  username: string;
  password: string;
}

class DatabaseError extends Error {}

export default async function handler(
  req: NextApiRequest & { body: AuthRequestBody },
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const db = await init_Db();

    try {
      // Find the user in the database using the provided username
      const user = await db.get(
        'SELECT * FROM users WHERE name = ?',
        username
      );

      // Return an error if the user is not found or the password is incorrect
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate a unique session ID for the user
      const sessionId = crypto.randomBytes(16).toString('hex');

      // Store the session ID along with the user ID in the database
      await db.run(
        'INSERT INTO sessions (sessionId, userId) VALUES (?, ?)',
        sessionId,
        user.id
      );

      // Set an HTTP-only cookie containing the session ID with a max age of 24 hours
      res.setHeader(
        'Set-Cookie',
        `sessionId=${sessionId}; HttpOnly; Path=/; Max-Age=86400`
      );

      // Return a success message
      return res.status(200).json({ message: 'User signed in successfully' });
    } catch (err) {
      if (err instanceof DatabaseError) {
        return res.status(500).json({ message: 'Database error' });
      }
      console.error('Error in authentication endpoint:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}