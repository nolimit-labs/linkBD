import { db } from '../db';
import { posts, likes, user, organization } from '../db/schema';
import { eq, and, desc, isNull, sql } from 'drizzle-orm';


// ===============================
// Queries
// ===============================

// Get all public posts for the feed with author information
export async function getPublicPosts(limit = 50, offset = 0) {
  return await db
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
        image: sql<string | null>`COALESCE(${organization.imageKey}, ${organization.logo}, ${user.image})`.as('author_image'),
        type: sql<'user' | 'organization'>`CASE 
          WHEN ${posts.userId} IS NULL THEN 'organization'
          ELSE 'user'
        END`.as('author_type')
      }
    })
    .from(posts)
    .leftJoin(user, eq(posts.userId, user.id))
    .leftJoin(organization, eq(posts.organizationId, organization.id))
    .where(eq(posts.visibility, 'public'))
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getPostsByUserId(userId: string) {
  return await db
    .select()
    .from(posts)
    .where(eq(posts.userId, userId))
    .orderBy(desc(posts.createdAt));
}

export async function getUserPosts(userId: string) {
  // Get personal posts (where organizationId is null)
  return await db
    .select()
    .from(posts)
    .where(and(
      eq(posts.userId, userId),
      isNull(posts.organizationId)
    ))
    .orderBy(desc(posts.createdAt));
}

export async function getOrgPosts(organizationId: string) {
  // Get organization posts
  return await db
    .select()
    .from(posts)
    .where(eq(posts.organizationId, organizationId))
    .orderBy(desc(posts.createdAt));
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
// Mutations
// ===============================

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