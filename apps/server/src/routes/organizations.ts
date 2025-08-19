import { Hono } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as orgModel from '../models/organization';
import { generateDownloadURL } from '../lib/storage';

const listSchema = z.object({
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  offset: z.string().optional().transform(val => val ? parseInt(val) : 0),
});

const organizationsRoutes = new Hono<{ Variables: AuthVariables }>()
  // Get list of organizations
  .get('/', authMiddleware, zValidator('query', listSchema), async (c) => {
    const { limit, offset } = c.req.valid('query');

    try {
      // Get all organizations (no search query)
      const organizations = await orgModel.searchOrganizations('', limit, offset);

      // Add image URLs
      const organizationsWithImages = await Promise.all(
        organizations.map(async (org) => ({
          ...org,
          imageUrl: await generateDownloadURL(org.logo),
        }))
      );

      return c.json({ 
        organizations: organizationsWithImages 
      });
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      return c.json({ error: 'Failed to fetch organizations' }, 500);
    }
  });

export default organizationsRoutes;