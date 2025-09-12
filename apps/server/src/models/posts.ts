import { db } from '../db';
import { posts, likes, user, organization, followers } from '../db/schema';
import { eq, and, desc, sql, lt, gt, asc, or, inArray, isNull, count } from 'drizzle-orm';


// ===============================
// Read Functions
// ===============================

// Enhanced pagination options for posts
export interface PaginationOptions {
  limit?: number;
  cursor?: string; // ISO timestamp for cursor-based pagination
  direction?: 'after' | 'before';
  sortBy?: 'newest' | 'oldest' | 'popular';
}

export type FeedMode = 'public' | 'following';

// Build orderBy clause for feeds
export function buildOrderBy(sortBy: PaginationOptions['sortBy'] = 'newest') {
  switch (sortBy) {
    case 'oldest':
      return [asc(posts.createdAt)];
    case 'popular':
      return [desc(posts.likesCount), desc(posts.createdAt)];
    case 'newest':
    default:
      return [desc(posts.createdAt)];
  }
}

// Build where/order for feed based on mode
export function getPublicPostsQuery(args: PaginationOptions = {}) {
  const { cursor, direction = 'after', sortBy = 'newest' } = args;
  const orderBy = buildOrderBy(sortBy);
  const where: any[] = [eq(posts.visibility, 'public')];
  if (cursor) {
    const cursorDate = new Date(cursor);
    if (direction === 'after') where.push(lt(posts.createdAt, cursorDate));
    else where.push(gt(posts.createdAt, cursorDate));
  }
  return { where, orderBy };
}

export async function getFollowingPostsQuery(
  currentAccountId: string,
  args: PaginationOptions = {}
): Promise<{ where: any[]; orderBy: any[]; isEmpty: boolean }> {
  const { cursor, direction = 'after', sortBy = 'newest' } = args;
  const orderBy = buildOrderBy(sortBy);

  const following = await db
    .select({
      followingUserId: followers.followingId,
      followingOrgId: followers.followingOrgId,
    })
    .from(followers)
    .where(eq(followers.followerUserId, currentAccountId));

  const followingUserIds = following.filter(f => f.followingUserId).map(f => f.followingUserId!);
  const followingOrgIds = following.filter(f => f.followingOrgId).map(f => f.followingOrgId!);

  if (followingUserIds.length === 0 && followingOrgIds.length === 0) {
    return { where: [], orderBy, isEmpty: true };
  }

  const orParts: any[] = [];
  if (followingUserIds.length > 0) orParts.push(inArray(posts.userId, followingUserIds));
  if (followingOrgIds.length > 0) orParts.push(inArray(posts.organizationId, followingOrgIds));

  const where: any[] = [or(...orParts), eq(posts.visibility, 'public')];
  if (cursor) {
    const cursorDate = new Date(cursor);
    if (direction === 'after') where.push(lt(posts.createdAt, cursorDate));
    else where.push(gt(posts.createdAt, cursorDate));
  }

  return { where, orderBy, isEmpty: false };
}


/**
 * Unified posts pagination for feed-style queries.
 * mode 'public' returns public posts.
 * mode 'following' returns public posts authored by followed users/organizations.
 */
async function executePostsPaginated(args: { where: any[]; orderBy: any[]; options?: PaginationOptions }) {
  const { where, orderBy, options } = args;
  const limit = options?.limit ?? 20;

  // Execute unified select (author composed via COALESCE/CASE)
  const results = await db
    .select({
      // Post fields
      id: posts.id,
      userId: posts.userId,
      organizationId: posts.organizationId,
      content: posts.content,
      imageKey: posts.imageKey,
      likesCount: posts.likesCount,
      visibility: posts.visibility,
      createdBy: posts.createdBy,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,

      // Author fields - organization when userId is null, user when organizationId is null
      author: {
        id: sql<string>`COALESCE(${organization.id}, ${user.id})`.as('author_id'),
        name: sql<string>`COALESCE(${organization.name}, ${user.name})`.as('author_name'),
        image: sql<string | null>`COALESCE(${organization.imageKey}, ${user.image})`.as('author_image'),
        type: sql<'user' | 'organization'>`CASE 
          WHEN ${posts.userId} IS NULL THEN 'organization'
          ELSE 'user'
        END`.as('author_type'),
        isOfficial: sql<boolean>`COALESCE(${organization.isOfficial}, ${user.isOfficial}, false)`.as('author_is_official')
      }
    })
    .from(posts)
    .leftJoin(user, eq(posts.userId, user.id))
    .leftJoin(organization, eq(posts.organizationId, organization.id))
    .where(and(...where))
    .orderBy(...orderBy)
    .limit(limit + 1);

  const hasMore = results.length > limit;
  const posts_data = results.slice(0, limit);
  const nextCursor = posts_data.length > 0 ? posts_data[posts_data.length - 1].createdAt.toISOString() : null;

  return {
    posts: posts_data,
    pagination: {
      hasMore,
      nextCursor,
      limit,
      count: posts_data.length
    }
  };
}

export async function getPostsPaginated(
  mode: FeedMode,
  options: PaginationOptions & { currentAccountId: string } = { currentAccountId: '' }
) {
  switch (mode) {
    case 'public': {
      const { where, orderBy } = getPublicPostsQuery(options);
      return executePostsPaginated({ where, orderBy, options });
    }
    case 'following': {
      const { currentAccountId } = options;
      const { where, orderBy, isEmpty } = await getFollowingPostsQuery(currentAccountId, options);
      if (isEmpty) {
        return {
          posts: [],
          pagination: {
            hasMore: false,
            nextCursor: null,
            limit: options.limit ?? 20,
            count: 0
          }
        };
      }
      return executePostsPaginated({ where, orderBy, options });
    }
    default: {
      const _exhaustive: never = mode;
      return {
        posts: [],
        pagination: {
          hasMore: false,
          nextCursor: null,
          limit: options.limit ?? 20,
          count: 0
        }
      };
    }
  }
}

export async function getUserPostsPaginated(userId: string, options: PaginationOptions = {}) {
  const { 
    limit = 20, 
    cursor, 
    direction = 'after',
    sortBy = 'newest'
  } = options;

  // Build where conditions
  let whereConditions = [eq(posts.userId, userId)];
  
  // Add cursor-based filtering
  if (cursor) {
    const cursorDate = new Date(cursor);
    if (direction === 'after') {
      whereConditions.push(lt(posts.createdAt, cursorDate));
    } else {
      whereConditions.push(gt(posts.createdAt, cursorDate));
    }
  }

  // Build sorting
  let orderByClause;
  switch (sortBy) {
    case 'newest':
      orderByClause = [desc(posts.createdAt)];
      break;
    case 'oldest':
      orderByClause = [asc(posts.createdAt)];
      break;
    case 'popular':
      orderByClause = [desc(posts.likesCount), desc(posts.createdAt)];
      break;
    default:
      orderByClause = [desc(posts.createdAt)];
  }

  // Fetch one extra to determine if there are more results
  const results = await db
    .select({
      id: posts.id,
      userId: posts.userId,
      organizationId: posts.organizationId,
      content: posts.content,
      imageKey: posts.imageKey,
      likesCount: posts.likesCount,
      visibility: posts.visibility,
      createdBy: posts.createdBy,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt
    })
    .from(posts)
    .where(and(...whereConditions))
    .orderBy(...orderByClause)
    .limit(limit + 1);
  
  const hasMore = results.length > limit;
  const posts_data = results.slice(0, limit);
  
  // Generate next cursor from last post
  const nextCursor = posts_data.length > 0 ? 
    posts_data[posts_data.length - 1].createdAt.toISOString() : null;

  return {
    posts: posts_data,
    pagination: {
      hasMore,
      nextCursor,
      limit,
      count: posts_data.length
    }
  };
}

export async function getOrgPostsPaginated(organizationId: string, options: PaginationOptions = {}) {
  const { 
    limit = 20, 
    cursor, 
    direction = 'after',
    sortBy = 'newest'
  } = options;

  // Build where conditions
  let whereConditions = [eq(posts.organizationId, organizationId)];
  
  // Add cursor-based filtering
  if (cursor) {
    const cursorDate = new Date(cursor);
    if (direction === 'after') {
      whereConditions.push(lt(posts.createdAt, cursorDate));
    } else {
      whereConditions.push(gt(posts.createdAt, cursorDate));
    }
  }

  // Build sorting
  let orderByClause;
  switch (sortBy) {
    case 'newest':
      orderByClause = [desc(posts.createdAt)];
      break;
    case 'oldest':
      orderByClause = [asc(posts.createdAt)];
      break;
    case 'popular':
      orderByClause = [desc(posts.likesCount), desc(posts.createdAt)];
      break;
    default:
      orderByClause = [desc(posts.createdAt)];
  }

  // Fetch one extra to determine if there are more results
  const results = await db
    .select({
      id: posts.id,
      userId: posts.userId,
      organizationId: posts.organizationId,
      content: posts.content,
      imageKey: posts.imageKey,
      likesCount: posts.likesCount,
      visibility: posts.visibility,
      createdBy: posts.createdBy,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt
    })
    .from(posts)
    .where(and(...whereConditions))
    .orderBy(...orderByClause)
    .limit(limit + 1);
  
  const hasMore = results.length > limit;
  const posts_data = results.slice(0, limit);
  
  // Generate next cursor from last post
  const nextCursor = posts_data.length > 0 ? 
    posts_data[posts_data.length - 1].createdAt.toISOString() : null;

  return {
    posts: posts_data,
    pagination: {
      hasMore,
      nextCursor,
      limit,
      count: posts_data.length
    }
  };
}

export async function getPostById(postId: string, userId: string, organizationId?: string | null) {
  const results = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId));
  
  const post = results[0];
  if (!post) return null;
  
  // Validate access based on visibility
  if (post.visibility === 'public') {
    return post; // Public posts are accessible to all
  } else if (post.visibility === 'organization' && organizationId && post.organizationId === organizationId) {
    return post; // Organization posts for members
  } else if (post.visibility === 'private' && post.userId === userId) {
    return post; // Private posts only for owner
  }
  
  return null; // No access
}

// ===============================
// Write Functions
// ===============================

export async function createUserPost(data: {
  userId: string;
  content: string;
  imageKey?: string;
  visibility?: 'public' | 'organization' | 'private';
}) {
  const newPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    organizationId: null,
    content: data.content,
    imageKey: data.imageKey,
    visibility: data.visibility || 'public',
    likesCount: 0,
  };
  
  const [created] = await db.insert(posts).values(newPost).returning();
  return created;
}

export async function createOrgPost(data: {
  organizationId: string;
  createdBy: string;
  content: string;
  imageKey?: string;
  visibility?: 'public' | 'organization' | 'private';
}) {
  const newPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: null,
    organizationId: data.organizationId,
    createdBy: data.createdBy,
    content: data.content,
    imageKey: data.imageKey,
    visibility: data.visibility || 'public',
    likesCount: 0,
  };
  
  const [created] = await db.insert(posts).values(newPost).returning();
  return created;
}

// Legacy function for backward compatibility - will be removed
export async function createPost(data: {
  userId: string;
  content: string;
  imageKey?: string;
  organizationId?: string | null;
  visibility?: 'public' | 'organization' | 'private';
}) {
  const newPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: data.userId,
    content: data.content,
    imageKey: data.imageKey,
    organizationId: data.organizationId,
    visibility: data.visibility || 'public',
    likesCount: 0,
  };
  
  const [created] = await db.insert(posts).values(newPost).returning();
  return created;
}

export async function updatePost(postId: string, userId: string, data: {
  content?: string;
  imageKey?: string;
  visibility?: 'public' | 'organization' | 'private';
}, organizationId?: string | null) {
  // Verify ownership first - only post owner can update
  const existing = await getPostById(postId, userId, organizationId);
  if (!existing || existing.userId !== userId) {
    return null;
  }

  const updateData = {
    ...data,
    updatedAt: new Date(),
  };
  
  const [updated] = await db
    .update(posts)
    .set(updateData)
    .where(eq(posts.id, postId))
    .returning();
  
  return updated;
}

export async function togglePostLike(postId: string, userId: string) {
  // Check if user already liked the post
  const existingLike = await db
    .select()
    .from(likes)
    .where(and(
      eq(likes.postId, postId),
      eq(likes.userId, userId)
    ))
    .limit(1);
  
  if (existingLike.length > 0) {
    // Unlike: remove the like and decrement count
    await db.delete(likes).where(eq(likes.id, existingLike[0].id));
    await db
      .update(posts)
      .set({ 
        likesCount: sql`${posts.likesCount} - 1`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
    return false; // Unliked
  } else {
    // Like: add the like and increment count
    await db.insert(likes).values({
      id: `like-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      postId,
      userId,
    });
    await db
      .update(posts)
      .set({ 
        likesCount: sql`${posts.likesCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(posts.id, postId));
    return true; // Liked
  }
}

export async function deletePost(postId: string, userId: string, organizationId?: string | null) {
  // Verify ownership first - only post owner can delete
  const existing = await getPostById(postId, userId, organizationId);
  if (!existing || existing.userId !== userId) {
    return false;
  }
  
  await db.delete(posts).where(eq(posts.id, postId));
  return true;
}

export async function updatePostImage(postId: string, userId: string, imageKey: string | null, organizationId?: string | null) {
  // Verify ownership first - only post owner can update
  const existing = await getPostById(postId, userId, organizationId);
  if (!existing || existing.userId !== userId) {
    return null;
  }

  const [updated] = await db
    .update(posts)
    .set({
      imageKey: imageKey,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning();
  
  return updated;
}


// Check if a user has liked a post
export async function hasUserLikedPost(postId: string, userId: string) {
  const result = await db
    .select()
    .from(likes)
    .where(and(
      eq(likes.postId, postId),
      eq(likes.userId, userId)
    ))
    .limit(1);
  
  return result.length > 0;
}