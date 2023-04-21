import { NextApiRequest, NextApiResponse } from 'next';
import { init_Db } from '@/components/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = req.query.id as string;
  const apiKey = req.query.api_key as string;

  if (!userId || !apiKey) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  try {
    const db = await init_Db();

    const user = await db.get('SELECT api_key FROM users WHERE id = ?', userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.api_key !== apiKey) {
      const admin = await db.get('SELECT api_key FROM users WHERE name = ?', 'admin');
      if (apiKey !== admin.api_key) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }

    await db.run('DELETE FROM users WHERE id = ?', userId);

    return res.status(200).end();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}