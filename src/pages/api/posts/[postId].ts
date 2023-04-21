import { NextApiRequest, NextApiResponse } from 'next';
import { init_Db } from '@/components/database';

type Post = {
  id: number;
  title: string;
  content: string;
  user_id: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    const id = parseInt(req.query.postId as string);

    if (!id) {
      return res.status(400).json({ message: 'Missing post ID' });
    }

    const db = await init_Db();

    const post = await db.get(
      'SELECT id, title, content, user_id FROM posts WHERE id = ?',
      id
    );

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    return res.status(200).json(post);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}