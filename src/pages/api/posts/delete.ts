import { NextApiRequest, NextApiResponse } from 'next';
import { init_Db } from '@/components/database';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'DELETE') {
    const id = parseInt(req.query.id as string);
    const api_key = req.query.api_key as string;

    if (!id || !api_key) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const db = await init_Db();

    const user = await db.get(
      'SELECT id FROM users WHERE api_key = ?',
      api_key
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid API key' });
    }

    const result = await db.run(
      'DELETE FROM posts WHERE id = ? AND user_id = ?',
      id,
      user.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(204).end();
  }

  return res.status(405).json({ message: 'Method not allowed' });
}