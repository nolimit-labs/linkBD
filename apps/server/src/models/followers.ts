import { db } from '../db';
import { followers, user, organization } from '../db/schema';
import { and, eq, sql, desc, isNotNull } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { detectEntityType } from './helper';

// ===============================
// Read Functions
// ===============================

// Auto-detection version of isFollowing
export async function isFollowing(
  followerId: string,
  followerType: 'user' | 'organization',
  targetId: string
): Promise<boolean> {
  const targetType = await detectEntityType(targetId);
  
  if (!targetType) {
    return false;
  }

  const whereConditions = [
    // Set follower conditions based on type
    followerType === 'user' 
      ? eq(followers.followerUserId, followerId)
      : eq(followers.followerOrgId, followerId),
    
    // Set target conditions based on type
    targetType === 'user'
      ? eq(followers.followingId, targetId)
      : eq(followers.followingOrgId, targetId)
  ];

  const result = await db
    .select()
    .from(followers)
    .where(and(...whereConditions));

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
      eq(followers.followerUserId, userId),
      isNotNull(followers.followingId)
    ))
    .orderBy(desc(followers.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

// Get organizations a user is following
export async function getOrgFollowing(userId: string, limit = 20, offset = 0) {
  const result = await db
    .select({
      following: followers,
      // TODO: Join with organization table to get org details
    })
    .from(followers)
    .where(and(
      eq(followers.followerUserId, userId),
      isNotNull(followers.followingOrgId)
    ))
    .orderBy(desc(followers.createdAt))
    .limit(limit)
    .offset(offset);

  return result;
}

// Unified follower counts function with auto-detection
export async function getFollowerCounts(
  targetId: string
): Promise<{ followersCount: number, followingCount: number }> {
  // Auto-detect entity type
  const targetType = await detectEntityType(targetId);
  
  if (!targetType) {
    return { followersCount: 0, followingCount: 0 };
  }

  // Count followers (who follows this target)
  const followersQuery = targetType === 'user'
    ? eq(followers.followingId, targetId)
    : eq(followers.followingOrgId, targetId);
  
  const followers_result = await db
    .select({ count: sql<number>`count(*)` })
    .from(followers)
    .where(followersQuery);
  
  const followersCount = Number(followers_result[0]?.count || 0);

  // Count following (who this target follows)
  let followingCount = 0;
  
  if (targetType === 'user') {
    // For users, count all follows (users + organizations)
    const following_result = await db
      .select({ count: sql<number>`count(*)` })
      .from(followers)
      .where(eq(followers.followerUserId, targetId));
    
    followingCount = Number(following_result[0]?.count || 0);
  } else {
    // For organizations, count all follows (users + organizations)
    const following_result = await db
      .select({ count: sql<number>`count(*)` })
      .from(followers)
      .where(eq(followers.followerOrgId, targetId));
    
    followingCount = Number(following_result[0]?.count || 0);
  }

  return { followersCount, followingCount };
}


// Get followers for any entity (auto-detect type)
export async function getFollowersList(targetId: string, limit = 20, offset = 0) {
  const targetType = await detectEntityType(targetId);
  
  if (!targetType) {
    return [];
  }

  if (targetType === 'user') {
    return getUserFollowers(targetId, limit, offset);
  } else {
    // For organizations, we need to implement this
    // For now return empty array
    return [];
  }
}

// Get following for any entity (auto-detect type)
export async function getFollowingList(followerId: string, limit = 20, offset = 0) {
  const followerType = await detectEntityType(followerId);
  
  if (!followerType) {
    return { following: [], organizations: [] };
  }

  if (followerType === 'user') {
    const following = await getUserFollowing(followerId, limit, offset);
    const organizations = await getOrgFollowing(followerId, limit, offset);
    return { following, organizations };
  } else {
    // For organizations, we need to implement this in a future phase
    return { following: [], organizations: [] };
  }
}

// Get all users and organizations that a follower follows (for feed filtering)
export async function getFollowingIds(
  followerId: string,
  followerType: 'user' | 'organization'
) {
  const followerCondition = followerType === 'user'
    ? eq(followers.followerUserId, followerId)
    : eq(followers.followerOrgId, followerId);

  const result = await db
    .select({
      followingId: followers.followingId,
      followingOrgId: followers.followingOrgId,
    })
    .from(followers)
    .where(followerCondition);

  return {
    userIds: result.filter(r => r.followingId).map(r => r.followingId!),
    organizationIds: result.filter(r => r.followingOrgId).map(r => r.followingOrgId!),
  };
}


// ===============================
// Write Functions
// ===============================

// Unified function to create a follow relationship
export async function createFollow(
  followerId: string,
  followerType: 'user' | 'organization',
  targetId: string,
  targetType: 'user' | 'organization'
) {
  // Validation: Prevent self-following
  if (followerId === targetId && followerType === targetType) {
    const entityName = followerType === 'user' ? 'yourself' : 'itself';
    throw new Error(`Cannot follow ${entityName}`);
  }

  // Check if already following
  const alreadyFollowing = await isFollowing(followerId, followerType, targetId);
  if (alreadyFollowing) {
    const targetName = targetType === 'user' ? 'user' : 'organization';
    throw new Error(`Already following this ${targetName}`);
  }

  // Create follow relationship with proper column assignments
  const followData = {
    id: nanoid(),
    followerUserId: followerType === 'user' ? followerId : null,
    followerOrgId: followerType === 'organization' ? followerId : null,
    followingId: targetType === 'user' ? targetId : null,
    followingOrgId: targetType === 'organization' ? targetId : null,
  };

  const follow = await db
    .insert(followers)
    .values(followData)
    .returning();

  return follow[0];
}

// Unified function to remove a follow relationship
export async function removeFollow(
  followerId: string,
  followerType: 'user' | 'organization',
  targetId: string,
  targetType: 'user' | 'organization'
) {
  const whereConditions = [
    // Set follower conditions based on type
    followerType === 'user' 
      ? eq(followers.followerUserId, followerId)
      : eq(followers.followerOrgId, followerId),
    
    // Set target conditions based on type
    targetType === 'user'
      ? eq(followers.followingId, targetId)
      : eq(followers.followingOrgId, targetId)
  ];

  const result = await db
    .delete(followers)
    .where(and(...whereConditions))
    .returning();

  if (result.length === 0) {
    const targetName = targetType === 'user' ? 'user' : 'organization';
    throw new Error(`Not following this ${targetName}`);
  }

  return result[0];
}

