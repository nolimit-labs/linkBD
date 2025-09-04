import { Hono } from 'hono';
import { z } from 'zod';
import type { AuthVariables } from '../middleware/auth';
import * as followersModel from '../models/followers';
import { authMiddleware } from '../middleware/auth';

// Validation schemas
const toggleFollowSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(['user', 'organization']),
  action: z.enum(['follow', 'unfollow'])
});

const followersRoute = new Hono<{ Variables: AuthVariables }>()
  // Unified follow/unfollow toggle endpoint
  .post('/toggle', authMiddleware, async (c) => {
    const { session } = c.get('session');
    
    try {
      const body = await c.req.json();
      const { targetId, targetType, action } = toggleFollowSchema.parse(body);
      
      // Determine follower context from session
      const followerType = session.activeOrganizationId ? 'organization' : 'user';
      const followerId = session.activeOrganizationId ?? session.userId;
      
      if (action === 'follow') {
        const follow = await followersModel.createFollow(followerId, followerType, targetId, targetType);
        return c.json({ success: true, follow }, 200);
      } else {
        const unfollowed = await followersModel.removeFollow(followerId, followerType, targetId, targetType);
        return c.json({ success: true, unfollowed }, 200);
      }
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  })

  // Unified follow status check
  .get('/status/:id', authMiddleware, async (c) => {
    const { session } = c.get('session');
    const targetId = c.req.param('id');
    
    if (!targetId) {
      return c.json({ error: 'Missing targetId parameter' }, 400);
    }
    
    // Determine follower context from session
    const followerType = session.activeOrganizationId ? 'organization' : 'user';
    const followerId = session.activeOrganizationId ?? session.userId;
    
    try {
      const isFollowing = await followersModel.isFollowing(followerId, followerType, targetId);
      return c.json({ isFollowing }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  })

  // Unified follower/following counts
  .get('/counts/:id', async (c) => {
    const targetId = c.req.param('id');
    
    try {
      const counts = await followersModel.getFollowerCounts(targetId);
      return c.json(counts, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  })

  // Get followers list for a target (auto-detects entity type)
  .get('/followers/:id', async (c) => {
    const targetId = c.req.param('id');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;
    
    try {
      const followers = await followersModel.getFollowersList(targetId, limit, offset);
      return c.json({ followers }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  })

  // Get following list for a follower (auto-detects entity type)
  .get('/following/:id', async (c) => {
    const followerId = c.req.param('id');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;
    
    try {
      const result = await followersModel.getFollowingList(followerId, limit, offset);
      return c.json(result, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  })


export default followersRoute;