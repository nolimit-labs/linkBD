import { Hono } from 'hono';
import type { AuthVariables } from '../middleware/auth';
import * as followersModel from '../models/followers';
import { authMiddleware } from '../middleware/auth';

const followers = new Hono<{ Variables: AuthVariables }>()
  // Follow a user
  .post('/users/:userId/follow', authMiddleware, async (c) => {
    const { session } = c.get('session');
    const targetUserId = c.req.param('userId');

    // If it's an active org use the org id, otherwise use the user id
    const followerId = session.activeOrganizationId ?? session.userId;

    try {
      const follow = await followersModel.followUser(followerId, targetUserId);
      return c.json({ success: true, follow }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  })

  // Unfollow a user
  .delete('/users/:userId/follow', authMiddleware, async (c) => {
    const { session } = c.get('session');
    const targetUserId = c.req.param('userId');

    // If it's an active org use the org id, otherwise use the user id
    const followerId = session.activeOrganizationId ?? session.userId;

    try {
      await followersModel.unfollowUser(followerId, targetUserId);
      return c.json({ success: true }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  })

  // Follow an organization
  .post('/organizations/:orgId/follow', authMiddleware, async (c) => {
    const { session } = c.get('session');
    const orgId = c.req.param('orgId');

    // If it's an active org use the org id, otherwise use the user id
    const followerId = session.activeOrganizationId ?? session.userId;

    try {
      const follow = await followersModel.followOrganization(followerId, orgId);
      return c.json({ success: true, follow }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  })

  // Unfollow an organization
  .delete('/organizations/:orgId/follow', authMiddleware, async (c) => {
    const { session } = c.get('session');
    const orgId = c.req.param('orgId');

    // If it's an active org use the org id, otherwise use the user id
    const followerId = session.activeOrganizationId ?? session.userId;

    try {
      await followersModel.unfollowOrganization(followerId, orgId);
      return c.json({ success: true }, 200);
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  })

  // Check if following a user
  .get('/users/:userId/follow-status', authMiddleware, async (c) => {
    const { session } = c.get('session');
    const targetUserId = c.req.param('userId');

    // If it's an active org use the org id, otherwise use the user id
    const followerId = session.activeOrganizationId ?? session.userId;

    const isFollowing = await followersModel.isFollowingUser(followerId, targetUserId);
    return c.json({ isFollowing }, 200);
  })

  // Check if following an organization  
  .get('/organizations/:orgId/follow-status', authMiddleware, async (c) => {
    const { session } = c.get('session');
    const orgId = c.req.param('orgId');

    // If it's an active org use the org id, otherwise use the user id
    const followerId = session.activeOrganizationId ?? session.userId;

    const isFollowing = await followersModel.isFollowingOrganization(followerId, orgId);
    return c.json({ isFollowing }, 200);
  })

  // Get a user's followers
  .get('/users/:userId/followers', async (c) => {
    const userId = c.req.param('userId');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    const followers = await followersModel.getUserFollowers(userId, limit, offset);
    return c.json({ followers }, 200);
  })

  // Get who a user is following
  .get('/users/:userId/following', async (c) => {
    const userId = c.req.param('userId');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    const following = await followersModel.getUserFollowing(userId, limit, offset);
    const organizations = await followersModel.getUserFollowingOrganizations(userId, limit, offset);
    
    return c.json({ 
      following,
      organizations
    }, 200);
  })

  // Get follower/following counts
  .get('/users/:userId/counts', async (c) => {
    const userId = c.req.param('userId');
    const counts = await followersModel.getFollowerCounts(userId);
    return c.json(counts, 200);
  })

  // Get who an organization is following
  .get('/organizations/:orgId/following', async (c) => {
    const orgId = c.req.param('orgId');
    const limit = Number(c.req.query('limit')) || 20;
    const offset = Number(c.req.query('offset')) || 0;

    const following = await followersModel.getUserFollowing(orgId, limit, offset);
    const organizations = await followersModel.getUserFollowingOrganizations(orgId, limit, offset);
    
    return c.json({ 
      following,
      organizations
    }, 200);
  })

  // Get organization follower count
  .get('/organizations/:orgId/counts', async (c) => {
    const orgId = c.req.param('orgId');
    const counts = await followersModel.getFollowerCounts(undefined, orgId);
    return c.json(counts, 200);
  });

export default followers;