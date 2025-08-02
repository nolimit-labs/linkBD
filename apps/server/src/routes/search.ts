import { Hono } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as userModel from '../models/user';
import * as postModel from '../models/posts';
import { generateDownloadURL } from '../lib/storage';

const searchSchema = z.object({
  q: z.string().min(1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

const searchRoutes = new Hono<{ Variables: AuthVariables }>()
  // User search endpoint
  .get('/', authMiddleware, zValidator('query', searchSchema), async (c) => {
    const { q, limit, offset } = c.req.valid('query');

    try {
      // Search users only
      const users = await userModel.searchUsers(q, limit, offset);

      // Add avatar URLs
      const usersWithAvatars = await Promise.all(
        users.map(async (user) => ({
          ...user,
          avatarUrl: await generateDownloadURL(user.image),
        }))
      );

      return c.json({ users: usersWithAvatars });
    } catch (error) {
      console.error('Search error:', error);
      return c.json({ error: 'Search failed' }, 500);
    }
  });

export default searchRoutes;