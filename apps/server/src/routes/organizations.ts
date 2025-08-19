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

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  imageKey: z.string().optional(),
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
          imageUrl: await generateDownloadURL(org.imageKey || org.logo),
        }))
      );

      return c.json({ 
        organizations: organizationsWithImages 
      });
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      return c.json({ error: 'Failed to fetch organizations' }, 500);
    }
  })
  
  // Get organization by ID
  .get('/:id', authMiddleware, async (c) => {
    const organizationId = c.req.param('id');

    try {
      const org = await orgModel.getOrgById(organizationId);
      
      if (!org) {
        return c.json({ error: 'Organization not found' }, 404);
      }

      // Generate image URL if imageKey exists
      const imageUrl = org.imageKey 
        ? await generateDownloadURL(org.imageKey)
        : null;

      return c.json({ 
        ...org,
        imageUrl 
      });
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      return c.json({ error: 'Failed to fetch organization' }, 500);
    }
  })
  
  // Update organization
  .patch('/:id', authMiddleware, zValidator('json', updateSchema), async (c) => {
    const { userId } = c.get('session');
    const organizationId = c.req.param('id');
    const updateData = c.req.valid('json');

    try {
      // Check if user is admin of the organization
      const userRole = await orgModel.getUserRoleInOrganization(userId, organizationId);
      
      if (userRole !== 'admin' && userRole !== 'owner') {
        return c.json({ error: 'You do not have permission to update this organization' }, 403);
      }

      // Update the organization
      const updatedOrg = await orgModel.updateOrg(organizationId, updateData);
      
      if (!updatedOrg) {
        return c.json({ error: 'Organization not found' }, 404);
      }

      // Generate image URL if imageKey exists
      const imageUrl = updatedOrg.imageKey 
        ? await generateDownloadURL(updatedOrg.imageKey)
        : null;

      return c.json({ 
        ...updatedOrg,
        imageUrl 
      });
    } catch (error) {
      console.error('Failed to update organization:', error);
      return c.json({ error: 'Failed to update organization' }, 500);
    }
  });

export default organizationsRoutes;