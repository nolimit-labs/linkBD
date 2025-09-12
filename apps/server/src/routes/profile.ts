import { Hono } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth.js';
import * as userModel from '../models/user.js';
import * as orgModel from '../models/organization.js';
import * as followersModel from '../models/followers.js';

const profileRoutes = new Hono<{ Variables: AuthVariables }>()

  // Get profile by ID (can be user or organization)
  .get('/:id', authMiddleware, async (c) => {
    const { session: { activeOrganizationId, userId } } = c.get('session');
    const profileId = c.req.param('id');

    const followerType = activeOrganizationId ? 'organization' : 'user';
    const followerId = activeOrganizationId ?? userId;
    
    try {
      // Try to fetch as user first with subscription data
      const userProfile = await userModel.getUserProfileById(profileId);
      
      if (userProfile) {
        const followerCounts = await followersModel.getFollowerCounts(profileId);
        // If authenticated, compute following status relative to current context
        let isFollowing: boolean | undefined = undefined;
        try {
          isFollowing = await followersModel.isFollowing(followerId, followerType, profileId);
        } catch {}
        return c.json({ ...userProfile, followerCounts, isFollowing });
      }
      
      // If not a user, try to fetch as organization with subscription data
      const orgProfile = await orgModel.getOrgProfileById(profileId);
      
      if (orgProfile) {
        const followerCounts = await followersModel.getFollowerCounts(profileId);
        let isFollowing: boolean | undefined = undefined;
        try {
          isFollowing = await followersModel.isFollowing(followerId, followerType, profileId);
        } catch {}
        return c.json({ ...orgProfile, followerCounts, isFollowing });
      }
      
      // Neither user nor organization found
      return c.json({ error: 'Profile not found' }, 404);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      return c.json({ error: 'Failed to fetch profile' }, 500);
    }
  });

export default profileRoutes;