import { NextApiRequest, NextApiResponse } from 'next';
import { init_Db } from '@/components/database';

type User = {
  id: number;
  name: string;
  display_name: string;
  api_key: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const userId = parseInt(req.query.userId as string);

    if (!userId) {
      return res.status(400).json({ message: 'Missing user ID' });
    }

    const db = await init_Db();

    const user = await db.get(
      'SELECT id, name, display_name, api_key FROM users WHERE id = ?',
      userId
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
}