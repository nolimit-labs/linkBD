import { Hono } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth.js';
import * as userModel from '../models/user.js';
import * as orgModel from '../models/organization.js';
import { generateDownloadURL } from '../lib/storage';

const profileRoutes = new Hono<{ Variables: AuthVariables }>()

  // Get profile by ID (can be user or organization)
  .get('/:id', authMiddleware, async (c) => {
    const profileId = c.req.param('id');
    
    try {
      // Try to fetch as user first
      const userProfile = await userModel.getUserProfile(profileId);
      
      if (userProfile) {
        // Generate avatar URL if user has an image
        const avatarUrl = await generateDownloadURL(userProfile.image);
        
        return c.json({
          type: 'user' as const,
          profile: {
            ...userProfile,
            avatarUrl
          }
        });
      }
      
      // If not a user, try to fetch as organization
      const orgProfile = await orgModel.getOrgProfile(profileId);
      
      if (orgProfile) {
        // Generate logo URL if organization has a logo
        const logoUrl = await generateDownloadURL(orgProfile.logo);
        
        return c.json({
          type: 'organization' as const,
          profile: {
            ...orgProfile,
            logoUrl
          }
        });
      }
      
      // Neither user nor organization found
      return c.json({ error: 'Profile not found' }, 404);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      return c.json({ error: 'Failed to fetch profile' }, 500);
    }
  });

export default profileRoutes;