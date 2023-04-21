import { NextApiRequest, NextApiResponse } from 'next';
import { init_Db } from '@/components/database';
import bcrypt from 'bcrypt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const db = await init_Db();

    const user = await db.get('SELECT * FROM users WHERE name = ?', username);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.status(200).json({ message: 'User signed in successfully' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}