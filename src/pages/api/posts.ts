import { NextApiRequest, NextApiResponse } from 'next';
import { init_Db } from '@/components/database';

type Post = {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const apiKey = req.query.api_key as string;

    const db = await init_Db();

    let posts: Post[];
    if (apiKey) {
      // Retrieve all posts by the user with the given API key
      const user = await db.get('SELECT id FROM users WHERE api_key = ?', apiKey);

      if (!user) {
        return res.status(401).json({ message: 'Invalid API key' });
      }

      posts = await db.all<Post[]>(
        'SELECT id, title, content, user_id, created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC',
        user.id
      );
    } else {
      // Retrieve all posts
      posts = await db.all<Post[]>(
        'SELECT id, title, content, user_id, created_at FROM posts ORDER BY created_at DESC'
      );
    }

    return res.status(200).json(posts);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}