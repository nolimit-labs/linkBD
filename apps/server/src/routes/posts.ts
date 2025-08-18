import { Hono } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth';
import { subscriptionLimitMiddleware, subscriptionInfoMiddleware, type SubscriptionVariables } from '../middleware/subscription';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator'
import * as postModel from '../models/posts';
import { generateDownloadURL } from '../lib/storage';
// import { Session } from 'better-auth';

const postSchema = z.object({
  content: z.string(),
  imageKey: z.string().optional(),
  visibility: z.enum(['public', 'organization', 'private']).optional(),
});


const postsRoute = new Hono<{ Variables: AuthVariables & SubscriptionVariables }>()
  // Get feed (public posts for discovery)
  .get('/feed', authMiddleware, async (c) => {
    const { userId } = c.get('session');

    // Get public feed
    const postList = await postModel.getPublicPosts();

    // Map download URLs for posts that have images and check likes
    const postsWithDetails = await Promise.all(
      postList.map(async (post) => ({
        ...post,
        imageUrl: await generateDownloadURL(post.imageKey),
        hasLiked: await postModel.hasUserLikedPost(post.id, userId)
      }))
    );

    return c.json(postsWithDetails);
  })

  // Get posts for specific user or organization
  .get('/', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const { userId: targetUserId, organizationId } = c.req.query();

    let postList;
    if (targetUserId) {
      // Get specific user's posts
      postList = await postModel.getPostsByUserId(targetUserId);
    } else if (organizationId) {
      // Get specific organization posts
      postList = await postModel.getOrgPosts(organizationId);
    } else if (activeOrganizationId) {
      // Get current organization posts
      postList = await postModel.getOrgPosts(activeOrganizationId);
    } else {
      // Get user's own posts
      postList = await postModel.getUserPosts(userId);
    }

    // Map download URLs for posts that have images and check likes
    const postsWithDetails = await Promise.all(
      postList.map(async (post) => ({
        ...post,
        imageUrl: await generateDownloadURL(post.imageKey),
        hasLiked: await postModel.hasUserLikedPost(post.id, userId)
      }))
    );

    return c.json(postsWithDetails);
  })

  // Create a new post (with subscription limit check)
  .post('/', authMiddleware, subscriptionLimitMiddleware, zValidator('json', postSchema), async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const body = await c.req.json();

    const created = await postModel.createPost({
      userId,
      content: body.content,
      imageKey: body.imageKey,
      organizationId: activeOrganizationId,
      visibility: body.visibility,
    });

    return c.json(created, 201);
  })

  // Get a specific post by ID
  .get('/:id', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const postId = c.req.param('id');

    const post = await postModel.getPostById(postId, userId, activeOrganizationId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Add download URL and like status
    const postWithDetails = {
      ...post,
      imageUrl: await generateDownloadURL(post.imageKey),
      hasLiked: await postModel.hasUserLikedPost(post.id, userId)
    };

    return c.json(postWithDetails);
  })

  // Update a post
  .put('/:id', authMiddleware, zValidator('json', postSchema), async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const postId = c.req.param('id');
    const body = await c.req.json();

    const updated = await postModel.updatePost(postId, userId, body, activeOrganizationId);

    if (!updated) {
      return c.json({ error: 'Post not found or unauthorized' }, 404);
    }

    // Add download URL and like status
    const updatedWithDetails = {
      ...updated,
      imageUrl: await generateDownloadURL(updated.imageKey),
      hasLiked: await postModel.hasUserLikedPost(updated.id, userId)
    };

    return c.json(updatedWithDetails);
  })

  // Toggle post like
  .patch('/:id/like', authMiddleware, async (c) => {
    const { userId } = c.get('session');
    const postId = c.req.param('id');

    const liked = await postModel.togglePostLike(postId, userId);

    return c.json({ liked });
  })

  // Delete a post
  .delete('/:id', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const postId = c.req.param('id');

    const deleted = await postModel.deletePost(postId, userId, activeOrganizationId);

    if (!deleted) {
      return c.json({ error: 'Post not found or unauthorized' }, 404);
    }

    return c.json({ message: 'Post deleted successfully' });
  })

  // Update post image
  .patch('/:id/image', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const postId = c.req.param('id');
    const { imageKey } = await c.req.json();

    const updated = await postModel.updatePostImage(postId, userId, imageKey, activeOrganizationId);

    if (!updated) {
      return c.json({ error: 'Post not found or unauthorized' }, 404);
    }

    // Add download URL and like status
    const updatedWithDetails = {
      ...updated,
      imageUrl: await generateDownloadURL(updated.imageKey),
      hasLiked: await postModel.hasUserLikedPost(updated.id, userId)
    };

    return c.json(updatedWithDetails);
  })

  // Remove post image
  .delete('/:id/image', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const postId = c.req.param('id');

    const updated = await postModel.updatePostImage(postId, userId, null, activeOrganizationId);

    if (!updated) {
      return c.json({ error: 'Post not found or unauthorized' }, 404);
    }

    return c.json(updated);
  })

  // Get subscription limits info
  .get('/limits', authMiddleware, subscriptionInfoMiddleware, async (c) => {
    const postCount = c.get('postCount');
    const postLimit = c.get('postLimit');
    const subscription = c.get('subscription');

    return c.json({
      currentCount: postCount,
      limit: postLimit,
      plan: subscription?.plan || 'free',
      remaining: postLimit - postCount,
      hasReachedLimit: postCount >= postLimit
    });
  });

export default postsRoute;