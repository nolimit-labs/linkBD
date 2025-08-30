import { Hono } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth';
import { subscriptionLimitMiddleware, subscriptionInfoMiddleware, type SubscriptionVariables } from '../middleware/subscription';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator'
import * as postModel from '../models/posts';
import * as userModel from '../models/user';
import * as orgModel from '../models/organization';
import * as subscriptionModel from '../models/subscriptions';
import { generateDownloadURL } from '../lib/storage';
// import { Session } from 'better-auth';

const postSchema = z.object({
  content: z.string(),
  imageKey: z.string().optional(),
  visibility: z.enum(['public', 'organization', 'private']).optional(),
});


const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  direction: z.enum(['after', 'before']).optional().default('after'),
  sortBy: z.enum(['newest', 'oldest', 'popular']).optional().default('newest'),
});

const postsRoute = new Hono<{ Variables: AuthVariables & SubscriptionVariables }>()

  // Get feed (public posts for discovery) with pagination
  .get('/feed', authMiddleware, zValidator('query', paginationSchema), async (c) => {
    const { user } = c.get('session');
    const { cursor, limit, direction, sortBy } = c.req.valid('query');

    // Get paginated public feed
    const result = await postModel.getPublicPostsPaginated({
      cursor,
      limit,
      direction,
      sortBy
    });

    // Map download URLs for posts that have images, check likes, and add subscription data
    const postsWithDetails = await Promise.all(
      result.posts.map(async (post) => {
        // Get subscription data for the author
        const authorSubscription = await subscriptionModel.getUserActiveSubscription(post.author.id);
        
        return {
          ...post,
          author: {
            ...post.author,
            image: await generateDownloadURL(post.author.image),
            subscriptionPlan: authorSubscription?.plan || 'free'
          },
          imageUrl: await generateDownloadURL(post.imageKey),
          hasLiked: await postModel.hasUserLikedPost(post.id, user.id)
        };
      })
    );

    return c.json({
      posts: postsWithDetails,
      pagination: result.pagination
    });
  })

  // Get posts for specific user or organization
  .get('/', authMiddleware, async (c) => {
    const { session, user } = c.get('session');
    const { authorId } = c.req.query();

    let postList;

    // Handle authorId - determine if it's a user or organization
    const userInfo = await userModel.getUserById(authorId);

    if (userInfo) {
      // It's a user ID
      postList = await postModel.getPostsByUserId(authorId);
      const authorSubscription = await subscriptionModel.getUserActiveSubscription(userInfo.id);
      const author = {
        id: userInfo.id,
        name: userInfo.name,
        image: userInfo.image,
        type: 'user' as const,
        isOfficial: userInfo.isOfficial || false,
        subscriptionPlan: authorSubscription?.plan || 'free'
      };
      postList = postList.map(post => ({ ...post, author }));
    } else {
      // Check if it's an organization ID
      const orgInfo = await orgModel.getOrgById(authorId);

      if (orgInfo) {
        // It's an organization ID
        postList = await postModel.getOrgPosts(authorId);
        const orgSubscription = await subscriptionModel.getUserActiveSubscription(orgInfo.id);
        const author = {
          id: orgInfo.id,
          name: orgInfo.name,
          image: orgInfo.logo,
          type: 'organization' as const,
          isOfficial: orgInfo.isOfficial || false,
          subscriptionPlan: orgSubscription?.plan || 'free'
        };
        postList = postList.map(post => ({ ...post, author }));
      } else {
        // Author not found
        return c.json({ error: 'Author not found' }, 404);
      }
    }


    // Map download URLs for posts that have images and check likes
    const postsWithDetails = await Promise.all(
      postList.map(async (post) => ({
        ...post,
        imageUrl: await generateDownloadURL(post.imageKey),
        hasLiked: await postModel.hasUserLikedPost(post.id, user.id)
      }))
    );

    return c.json(postsWithDetails);
  })

  // Create a new post (with subscription limit check)
  .post('/', authMiddleware, subscriptionLimitMiddleware, zValidator('json', postSchema), async (c) => {
    const { session, user } = c.get('session');
    const body = await c.req.json();

    const created = await postModel.createPost({
      userId: user.id,
      content: body.content,
      imageKey: body.imageKey,
      organizationId: session.activeOrganizationId,
      visibility: body.visibility,
    });

    return c.json(created, 201);
  })

  // Get a specific post by ID
  .get('/:id', authMiddleware, async (c) => {
    const { session, user } = c.get('session');
    const postId = c.req.param('id');

    const post = await postModel.getPostById(postId, user.id, session.activeOrganizationId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Add download URL and like status
    const postWithDetails = {
      ...post,
      imageUrl: await generateDownloadURL(post.imageKey),
      hasLiked: await postModel.hasUserLikedPost(post.id, user.id)
    };

    return c.json(postWithDetails);
  })

  // Update a post
  .put('/:id', authMiddleware, zValidator('json', postSchema), async (c) => {
    const { session, user } = c.get('session');
    const postId = c.req.param('id');
    const body = await c.req.json();

    const updated = await postModel.updatePost(postId, user.id, body, session.activeOrganizationId);

    if (!updated) {
      return c.json({ error: 'Post not found or unauthorized' }, 404);
    }

    // Add download URL and like status
    const updatedWithDetails = {
      ...updated,
      imageUrl: await generateDownloadURL(updated.imageKey),
      hasLiked: await postModel.hasUserLikedPost(updated.id, user.id)
    };

    return c.json(updatedWithDetails);
  })

  // Toggle post like
  .patch('/:id/like', authMiddleware, async (c) => {
    const { user } = c.get('session');
    const postId = c.req.param('id');

    const liked = await postModel.togglePostLike(postId, user.id);

    return c.json({ liked });
  })

  // Delete a post
  .delete('/:id', authMiddleware, async (c) => {
    const { session, user } = c.get('session');
    const postId = c.req.param('id');

    const deleted = await postModel.deletePost(postId, user.id, session.activeOrganizationId);

    if (!deleted) {
      return c.json({ error: 'Post not found or unauthorized' }, 404);
    }

    return c.json({ message: 'Post deleted successfully' });
  })

  // Update post image
  .patch('/:id/image', authMiddleware, async (c) => {
    const { session, user } = c.get('session');
    const postId = c.req.param('id');
    const { imageKey } = await c.req.json();

    const updated = await postModel.updatePostImage(postId, user.id, imageKey, session.activeOrganizationId);

    if (!updated) {
      return c.json({ error: 'Post not found or unauthorized' }, 404);
    }

    // Add download URL and like status
    const updatedWithDetails = {
      ...updated,
      imageUrl: await generateDownloadURL(updated.imageKey),
      hasLiked: await postModel.hasUserLikedPost(updated.id, user.id)
    };

    return c.json(updatedWithDetails);
  })

  // Remove post image
  .delete('/:id/image', authMiddleware, async (c) => {
    const { session, user } = c.get('session');
    const postId = c.req.param('id');

    const updated = await postModel.updatePostImage(postId, user.id, null, session.activeOrganizationId);

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