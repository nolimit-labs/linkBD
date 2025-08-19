import { Hono } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as userModel from '../models/user';
import * as orgModel from '../models/organization';
import { generateDownloadURL } from '../lib/storage';

const searchSchema = z.object({
  q: z.string().min(1),
  type: z.enum(['all', 'user', 'organization']).optional().default('all'),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

const searchRoutes = new Hono<{ Variables: AuthVariables }>()
  // Search users and organizations with optional type filtering
  .get('/', authMiddleware, zValidator('query', searchSchema), async (c) => {
    const { q, type, limit, offset } = c.req.valid('query');

    try {
      let users: any[] = [];
      let organizations: any[] = [];

      // Search based on type parameter
      if (type === 'user') {
        // Search only users
        users = await userModel.searchUsers(q, limit, offset);
      } else if (type === 'organization') {
        // Search only organizations
        organizations = await orgModel.searchOrganizations(q, limit, offset);
      } else {
        // Search both (type === 'all')
        const [userResults, orgResults] = await Promise.all([
          userModel.searchUsers(q, Math.ceil(limit / 2), offset),
          orgModel.searchOrganizations(q, Math.ceil(limit / 2), offset)
        ]);
        users = userResults;
        organizations = orgResults;
      }

      // Add image URLs for users
      const usersWithImages = await Promise.all(
        users.map(async (user) => ({
          ...user,
          imageUrl: await generateDownloadURL(user.image),
          type: 'user' as const
        }))
      );

      // Add image URLs for organizations
      const organizationsWithImages = await Promise.all(
        organizations.map(async (org) => ({
          ...org,
          imageUrl: await generateDownloadURL(org.logo),
          type: 'organization' as const
        }))
      );

      return c.json({ 
        users: usersWithImages,
        organizations: organizationsWithImages 
      });
    } catch (error) {
      console.error('Search error:', error);
      return c.json({ error: 'Search failed' }, 500);
    }
  });

export default searchRoutes;