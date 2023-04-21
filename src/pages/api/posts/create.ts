import { NextApiRequest, NextApiResponse } from 'next';
import { init_Db } from '@/components/database';

type Post = {
  title: string;
  content: string;
  user_id: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { title, content } = req.body;
    const api_key = req.query.api_key as string;

    if (!title || !content || !api_key) {
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
      'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)',
      title,
      content,
      user.id
    );

    const post: Post = {
      title,
      content,
      user_id: user.id,
    };

    return res.status(201).json(post);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}