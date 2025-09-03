import { db } from '../db';
import { followers } from '../db/schema';
import { and, eq, sql, desc, isNotNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Follow a user
export async function followUser(followerId: string, followingId: string) {
  // Prevent self-following
  if (followerId === followingId) {
    throw new Error('Cannot follow yourself');
  }

  // Check if already following
  const existing = await db
    .select()
    .from(followers)
    .where(and(
      eq(followers.followerId, followerId),
      eq(followers.followingId, followingId)
    ));

  if (existing.length > 0) {
    throw new Error('Already following this user');
  }


  // Create follow relationship
  const follow = await db
    .insert(followers)
    .values({
      id: nanoid(),
      followerId,
      followingId,
      followingOrgId: null,
    })
    .returning();

  return follow[0];
}

// Unfollow a user
export async function unfollowUser(followerId: string, followingId: string) {
  const result = await db
    .delete(followers)
    .where(and(
      eq(followers.followerId, followerId),
      eq(followers.followingId, followingId)
    ))
    .returning();

  if (result.length === 0) {
    throw new Error('Not following this user');
  }

  return result[0];
}

// Follow an organization
export async function followOrganization(followerId: string, organizationId: string) {
  // Prevent organization from following itself
  if (followerId === organizationId) {
    throw new Error('A Business cannot follow itself, switch to your personal account to follow your business');
  }

  // Check if already following
  const existing = await db
    .select()
    .from(followers)
    .where(and(
      eq(followers.followerId, followerId),
      eq(followers.followingOrgId, organizationId)
    ));

  if (existing.length > 0) {
    throw new Error('Already following this organization');
  }

  // Create follow relationship
  const follow = await db
    .insert(followers)
    .values({
      id: nanoid(),
      followerId,
      followingId: null,
      followingOrgId: organizationId,
    })
    .returning();

  return follow[0];
}

// Unfollow an organization
export async function unfollowOrganization(followerId: string, organizationId: string) {
  const result = await db
    .delete(followers)
    .where(and(
      eq(followers.followerId, followerId),
      eq(followers.followingOrgId, organizationId)
    ))
    .returning();

  if (result.length === 0) {
    throw new Error('Not following this organization');
  }

  return result[0];
}

// Check if user is following another user
export async function isFollowingUser(followerId: string, followingId: string) {
  const result = await db
    .select()
    .from(followers)
    .where(and(
      eq(followers.followerId, followerId),
      eq(followers.followingId, followingId)
    ));

  return result.length > 0;
}

// Check if user is following an organization
export async function isFollowingOrganization(followerId: string, organizationId: string) {
  const result = await db
    .select()
    .from(followers)
    .where(and(
      eq(followers.followerId, followerId),
      eq(followers.followingOrgId, organizationId)
    ));

  return result.length > 0;
}

// Get user's followers
export async function getUserFollowers(userId: string, limit = 20, offset = 0) {
  const result = await db
    .select({
      follower: followers,
      // TODO: Join with user table to get follower details
    })
    .from(followers)
    .where(eq(followers.followingId, userId))
    .orderBy(desc(followers.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

// Get who a user is following (users)
export async function getUserFollowing(userId: string, limit = 20, offset = 0) {
  const result = await db
    .select({
      following: followers,
      // TODO: Join with user table to get following details
    })
    .from(followers)
    .where(and(
      eq(followers.followerId, userId),
      isNotNull(followers.followingId)
    ))
    .orderBy(desc(followers.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

// Get organizations a user is following
export async function getUserFollowingOrganizations(userId: string, limit = 20, offset = 0) {
  const result = await db
    .select({
      following: followers,
      // TODO: Join with organization table to get org details
    })
    .from(followers)
    .where(and(
      eq(followers.followerId, userId),
      isNotNull(followers.followingOrgId)
    ))
    .orderBy(desc(followers.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

// Get follower counts
export async function getFollowerCounts(userId?: string, organizationId?: string) {
  if (!userId && !organizationId) {
    throw new Error('Must provide either userId or organizationId');
  }

  let followersCount = 0;
  let followingCount = 0;

  if (userId) {
    // Count followers for user
    const followers_result = await db
      .select({ count: sql<number>`count(*)` })
      .from(followers)
      .where(eq(followers.followingId, userId));
    
    followersCount = Number(followers_result[0]?.count || 0);

    // Count who user is following
    const following_result = await db
      .select({ count: sql<number>`count(*)` })
      .from(followers)
      .where(eq(followers.followerId, userId));
    
    followingCount = Number(following_result[0]?.count || 0);
  } else if (organizationId) {
    // Count followers for organization
    const followers_result = await db
      .select({ count: sql<number>`count(*)` })
      .from(followers)
      .where(eq(followers.followingOrgId, organizationId));
    
    followersCount = Number(followers_result[0]?.count || 0);

    // Count who organization is following (both users and other organizations)
    const following_result = await db
      .select({ count: sql<number>`count(*)` })
      .from(followers)
      .where(eq(followers.followerId, organizationId));
    
    followingCount = Number(following_result[0]?.count || 0);
  }

  return { followersCount, followingCount };
}

// Get all users and organizations that a user follows (for feed filtering)
export async function getUserFollowingIds(userId: string) {
  const result = await db
    .select({
      followingId: followers.followingId,
      followingOrgId: followers.followingOrgId,
    })
    .from(followers)
    .where(eq(followers.followerId, userId));

  return {
    userIds: result.filter(r => r.followingId).map(r => r.followingId!),
    organizationIds: result.filter(r => r.followingOrgId).map(r => r.followingOrgId!),
  };
}