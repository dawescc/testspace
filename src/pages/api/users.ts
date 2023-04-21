import { NextApiRequest, NextApiResponse } from 'next';
import { init_Db } from '@/components/database';

type User = {
  id: number;
  name: string;
  display_name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const db = await init_Db();

    const users = await db.all<User[]>('SELECT id, name, display_name, api_key FROM users');

    return res.status(200).json(users);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}