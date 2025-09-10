import { Hono } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth.js';
import * as userModel from '../models/user.js';
import * as orgModel from '../models/organization.js';

const profileRoutes = new Hono<{ Variables: AuthVariables }>()

  // Get profile by ID (can be user or organization)
  .get('/:id', authMiddleware, async (c) => {
    const profileId = c.req.param('id');
    
    try {
      // Try to fetch as user first with subscription data
      const userProfile = await userModel.getUserProfileById(profileId);
      
      if (userProfile) {
        return c.json(userProfile);
      }
      
      // If not a user, try to fetch as organization with subscription data
      const orgProfile = await orgModel.getOrgProfileById(profileId);
      
      if (orgProfile) {
        return c.json(orgProfile);
      }
      
      // Neither user nor organization found
      return c.json({ error: 'Profile not found' }, 404);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      return c.json({ error: 'Failed to fetch profile' }, 500);
    }
  });

export default profileRoutes;