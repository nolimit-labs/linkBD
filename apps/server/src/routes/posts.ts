import { Hono } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth';
import { subscriptionLimitMiddleware, subscriptionInfoMiddleware, type SubscriptionVariables } from '../middleware/subscription';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator'
import * as postModel from '../models/posts';
import * as userModel from '../models/user';
import * as orgModel from '../models/organization';
import * as subscriptionModel from '../models/subscriptions';
import * as commentModel from '../models/comments';
import { generateDownloadURL } from '../lib/storage';
// import { Session } from 'better-auth';

const postSchema = z.object({
  content: z.string(),
  imageKey: z.string().optional(),
  visibility: z.enum(['public', 'organization', 'private']).optional(),
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

const updateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  direction: z.enum(['after', 'before']).optional().default('after'),
  sortBy: z.enum(['newest', 'oldest', 'popular']).optional().default('newest'),
  filter: z.enum(['all', 'following']).optional().default('all'),
});

const commentPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
});

const postsRoute = new Hono<{ Variables: AuthVariables & SubscriptionVariables }>()

  // ===============================
  // Queries
  // ===============================

  // Get feed (public posts for discovery or following feed) with pagination
  .get('/feed', authMiddleware, zValidator('query', paginationSchema), async (c) => {
    const { session: { activeOrganizationId, userId} } = c.get('session');
    const { cursor, limit, direction, sortBy, filter } = c.req.valid('query');

    const currentAccountId = activeOrganizationId ? activeOrganizationId : userId;

    // Get appropriate feed based on filter
    const result = await postModel.getPostsPaginated(
      filter === 'following' ? 'following' : 'public',
      {
        cursor,
        limit,
        direction,
        sortBy,
        currentAccountId,
      }
    );

    // Map download URLs for posts that have images, check likes, and add subscription data
    const postsWithDetails = await Promise.all(
      result.posts.map(async (post) => {
        let subscriptionPlan = 'free';

        // Get subscription data based on author type
        if (post.author.type === 'user') {
          // For user posts, get the user's subscription directly
          const authorSubscription = await subscriptionModel.getUserActiveSubscription(post.author.id);
          subscriptionPlan = authorSubscription?.plan || 'free';
        } else if (post.author.type === 'organization') {
          // For organization posts, get the owner's subscription
          const orgOwner = await orgModel.getOrgOwner(post.author.id);
          if (orgOwner) {
            const ownerSubscription = await subscriptionModel.getUserActiveSubscription(orgOwner.userId);
            subscriptionPlan = ownerSubscription?.plan || 'free';
          }
        }

        return {
          ...post,
          author: {
            ...post.author,
            image: await generateDownloadURL(post.author.image),
            subscriptionPlan
          },
          imageUrl: await generateDownloadURL(post.imageKey),
          hasLiked: await postModel.hasUserLikedPost(post.id, userId)
        };
      })
    );

    return c.json({
      posts: postsWithDetails,
      pagination: result.pagination
    });
  })

  // Get posts for specific user or organization with pagination
  .get('/', authMiddleware, zValidator('query', paginationSchema.extend({
    authorId: z.string()
  })), async (c) => {
    const { session, user } = c.get('session');
    const { authorId, cursor, limit, direction, sortBy } = c.req.valid('query');

    let result;
    let author;

    // Handle authorId - determine if it's a user or organization
    const userProfile = await userModel.getUserProfileById(authorId);

    if (userProfile) {
      // It's a user ID
      result = await postModel.getUserPostsPaginated(authorId, {
        cursor,
        limit,
        direction,
        sortBy
      });

      author = {
        ...userProfile,
      };
    } else {
      // Check if it's an organization ID
      const orgProfile = await orgModel.getOrgProfileById(authorId);

      if (orgProfile) {
        // It's an organization ID
        result = await postModel.getOrgPostsPaginated(authorId, {
          cursor,
          limit,
          direction,
          sortBy
        });

        author = {
          ...orgProfile,
        };
      } else {
        // Author not found
        return c.json({ error: 'Author not found' }, 404);
      }
    }

    // Map download URLs for posts that have images and check likes
    const postsWithDetails = await Promise.all(
      result.posts.map(async (post) => ({
        ...post,
        author,
        imageUrl: await generateDownloadURL(post.imageKey),
        hasLiked: await postModel.hasUserLikedPost(post.id, user.id)
      }))
    );

    return c.json({
      posts: postsWithDetails,
      pagination: result.pagination
    });
  })

  // Get subscription limits info
  .get('/limits', authMiddleware, subscriptionInfoMiddleware, async (c) => {
    const dailyPostCount = c.get('dailyPostCount');
    const dailyPostLimit = c.get('dailyPostLimit');
    const subscription = c.get('subscription');

    // Calculate hours until midnight UTC reset
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setUTCHours(24, 0, 0, 0); // Next midnight UTC
    const hoursUntilReset = Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));

    return c.json({
      todaysCount: dailyPostCount,
      dailyLimit: dailyPostLimit,
      plan: subscription?.plan || 'free',
      remainingToday: dailyPostLimit - dailyPostCount,
      hasReachedDailyLimit: dailyPostCount >= dailyPostLimit,
      hoursUntilReset,
      resetTimeUTC: tomorrow.toISOString()
    });
  })



  // Get a specific post by ID
  .get('/:id', authMiddleware, async (c) => {
    const { session, user } = c.get('session');
    const postId = c.req.param('id');

    const post = await postModel.getPostById(postId, user.id, session.activeOrganizationId);

    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Get author information
    let author;
    
    if (post.userId) {
      // It's a user post
      const userProfile = await userModel.getUserProfileById(post.userId);
      if (userProfile) {
        author = {
          ...userProfile,
        };
      }
    } else if (post.organizationId) {
      // It's an organization post
      const orgProfile = await orgModel.getOrgProfileById(post.organizationId);
      if (orgProfile) {
        author = {
          ...orgProfile,
        };
      }
    }

    // Add download URL, like status, and author info
    const postWithDetails = {
      ...post,
      author,
      imageUrl: await generateDownloadURL(post.imageKey),
      hasLiked: await postModel.hasUserLikedPost(post.id, user.id)
    };

    return c.json(postWithDetails);
  })


  // ===============================
  // Mutations
  // ===============================

  // Create a new post (with subscription limit check)
  .post('/', authMiddleware, subscriptionLimitMiddleware, zValidator('json', postSchema), async (c) => {
    const { session, user } = c.get('session');
    const body = await c.req.json();

    let createdPost = session.activeOrganizationId ? await postModel.createOrgPost({
      organizationId: session.activeOrganizationId!,
      createdBy: user.id,
      content: body.content,
      imageKey: body.imageKey,
      visibility: body.visibility,
    }) : await postModel.createUserPost({
      userId: user.id,
      content: body.content,
      imageKey: body.imageKey,
      visibility: body.visibility,
    });



    return c.json(createdPost, 201);
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

  // ===============================
  // Comments endpoints
  // ===============================

  // Get comments for a post with pagination
  .get('/:id/comments', authMiddleware, zValidator('query', commentPaginationSchema), async (c) => {
    const postId = c.req.param('id');
    const { cursor, limit } = c.req.valid('query');
    const { user } = c.get('session');

    // Verify post exists (this also checks visibility permissions)
    const post = await postModel.getPostById(postId, user.id);
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    const result = await commentModel.getPostComments(postId, limit, cursor);
    return c.json(result);
  })

  // Create a new comment on a post
  .post('/:id/comments', authMiddleware, zValidator('json', createCommentSchema), async (c) => {
    const postId = c.req.param('id');
    const { content, parentId } = c.req.valid('json');
    const { session, user } = c.get('session');

    // Verify post exists
    const post = await postModel.getPostById(postId, user.id);
    if (!post) {
      return c.json({ error: 'Post not found' }, 404);
    }

    // Verify parent comment exists if parentId is provided
    if (parentId) {
      const parentComment = await commentModel.getCommentById(parentId);
      if (!parentComment) {
        return c.json({ error: 'Parent comment not found' }, 404);
      }
      // Ensure parent comment belongs to the same post
      if (parentComment.postId !== postId) {
        return c.json({ error: 'Parent comment does not belong to this post' }, 400);
      }
    }

    // Determine author type and ID
    let authorId: string;
    let authorType: 'user' | 'organization';

    if (session.activeOrganizationId) {
      // Posting as organization
      authorId = session.activeOrganizationId;
      authorType = 'organization';
    } else {
      // Posting as user
      authorId = user.id;
      authorType = 'user';
    }

    const comment = await commentModel.createComment(
      postId,
      content,
      authorId,
      authorType,
      parentId
    );

    // Get author info for response
    const commentWithAuthor = await commentModel.getCommentById(comment.id);
    
    return c.json(commentWithAuthor, 201);
  })

  // Get replies for a comment with pagination
  .get('/:postId/comments/:commentId/replies', authMiddleware, zValidator('query', commentPaginationSchema), async (c) => {
    const postId = c.req.param('postId');
    const commentId = c.req.param('commentId');
    const { cursor, limit } = c.req.valid('query');

    // Verify comment exists and belongs to the post
    const comment = await commentModel.getCommentById(commentId);
    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }
    if (comment.postId !== postId) {
      return c.json({ error: 'Comment does not belong to this post' }, 400);
    }

    const result = await commentModel.getCommentReplies(commentId, limit, cursor);
    return c.json(result);
  })

  // Update a comment
  .put('/:postId/comments/:commentId', authMiddleware, zValidator('json', updateCommentSchema), async (c) => {
    const postId = c.req.param('postId');
    const commentId = c.req.param('commentId');
    const { content } = c.req.valid('json');
    const { session, user } = c.get('session');

    // Verify comment exists and belongs to the post
    const existingComment = await commentModel.getCommentById(commentId);
    if (!existingComment) {
      return c.json({ error: 'Comment not found' }, 404);
    }
    if (existingComment.postId !== postId) {
      return c.json({ error: 'Comment does not belong to this post' }, 400);
    }

    // Determine author type and ID
    let authorId: string;
    let authorType: 'user' | 'organization';

    if (session.activeOrganizationId) {
      // Updating as organization
      authorId = session.activeOrganizationId;
      authorType = 'organization';
    } else {
      // Updating as user
      authorId = user.id;
      authorType = 'user';
    }

    try {
      const updatedComment = await commentModel.updateComment(
        commentId,
        content,
        authorId,
        authorType
      );

      if (!updatedComment) {
        return c.json({ error: 'Comment not found' }, 404);
      }

      // Get author info for response
      const commentWithAuthor = await commentModel.getCommentById(updatedComment.id);
      
      return c.json(commentWithAuthor);
    } catch (error: any) {
      if (error.message === 'Unauthorized to edit this comment') {
        return c.json({ error: 'Unauthorized to edit this comment' }, 403);
      }
      throw error;
    }
  })

  // Delete a comment
  .delete('/:postId/comments/:commentId', authMiddleware, async (c) => {
    const postId = c.req.param('postId');
    const commentId = c.req.param('commentId');
    const { session, user } = c.get('session');

    // Verify comment exists and belongs to the post
    const existingComment = await commentModel.getCommentById(commentId);
    if (!existingComment) {
      return c.json({ error: 'Comment not found' }, 404);
    }
    if (existingComment.postId !== postId) {
      return c.json({ error: 'Comment does not belong to this post' }, 400);
    }

    // Determine author type and ID
    let authorId: string;
    let authorType: 'user' | 'organization';

    if (session.activeOrganizationId) {
      // Deleting as organization
      authorId = session.activeOrganizationId;
      authorType = 'organization';
    } else {
      // Deleting as user
      authorId = user.id;
      authorType = 'user';
    }

    try {
      const deleted = await commentModel.deleteComment(
        commentId,
        authorId,
        authorType
      );

      if (!deleted) {
        return c.json({ error: 'Comment not found' }, 404);
      }

      return c.json({ success: true });
    } catch (error: any) {
      if (error.message === 'Unauthorized to delete this comment') {
        return c.json({ error: 'Unauthorized to delete this comment' }, 403);
      }
      throw error;
    }
  })

export default postsRoute;