import { db } from '../db/index.js';
import { user, posts, member, organization, subscription } from '../db/schema.js';
import { eq, ilike, or, sql, desc, inArray, count, gt, and } from 'drizzle-orm';

// ================================
// Read Functions
// ================================


// Get all users with cursor-based pagination
export async function getAllUsersPaginated(options: {
  limit?: number;
  cursor?: string; // User ID to start after
} = {}) {
  const { 
    limit = 20, 
    cursor
  } = options;

  // Build the where clause for cursor pagination
  const whereClause = cursor 
    ? gt(user.createdAt, 
        db.select({ createdAt: user.createdAt })
          .from(user)
          .where(eq(user.id, cursor))
      )
    : undefined;

  // Get users with cursor pagination
  const users = await db
    .select()
    .from(user)
    .where(whereClause)
    .orderBy(desc(user.createdAt))
    .limit(limit + 1); // Fetch one extra to determine if there's a next page

  // Check if there's a next page
  const hasNextPage = users.length > limit;
  const usersToReturn = hasNextPage ? users.slice(0, -1) : users;

  // Get total count
  const [{ totalCount }] = await db
    .select({ totalCount: count() })
    .from(user);

  return {
    users: usersToReturn,
    pagination: {
      hasNextPage,
      nextCursor: hasNextPage ? usersToReturn[usersToReturn.length - 1].id : null,
      total: totalCount,
    }
  };
}

export async function getUserById(userId: string) {
  const users = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return users[0] || null;
}


// Get user profile with post count
export async function getUserProfile(userId: string) {
  const userInfo = await getUserById(userId);
  if (!userInfo) return null;

  const postCount = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(posts)
    .where(eq(posts.userId, userId));
  
  return {
    ...userInfo,
    postCount: postCount[0]?.count || 0,
  };
}

// Search users by name only
export async function searchUsers(query: string, limit = 20, offset = 0) {
  const searchPattern = `%${query}%`;
  
  return await db
    .select({
      id: user.id,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(ilike(user.name, searchPattern))
    .orderBy(user.name)
    .limit(limit)
    .offset(offset);
}

// Get user's subscription information
export async function getUserSubscriptions(userIds: string[]) {
  if (userIds.length === 0) return [];
  
  const subscriptions = await db
    .select({
      referenceId: subscription.referenceId,
      plan: subscription.plan,
      status: subscription.status,
      periodStart: subscription.periodStart,
      periodEnd: subscription.periodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    })
    .from(subscription)
    .where(inArray(subscription.referenceId, userIds));
  
  return subscriptions;
}

/**
 * Get the active subscription for a user
 * @param referenceId - The user ID to check
 * @returns The active subscription or null if no active subscription is found
 */
export async function getUserActiveSubscription(userId: string) {
  const subscriptions = await db
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.referenceId, userId),
        or(
          eq(subscription.status, 'active'),
          eq(subscription.status, 'trialing')
        )
      )
    )
    .limit(1);

  return subscriptions[0] || null;
}


// Get user's organization memberships
export async function getUserMemberships(userIds: string[]) {
  if (userIds.length === 0) return [];
  
  const memberships = await db
    .select({
      userId: member.userId,
      organizationId: member.organizationId,
      role: member.role,
      organizationName: organization.name,
    })
    .from(member)
    .leftJoin(organization, eq(member.organizationId, organization.id))
    .where(inArray(member.userId, userIds));
  
  return memberships;
}

// Get single user's organization memberships
export async function getUserMembershipsByUserId(userId: string) {
  const memberships = await db
    .select({
      organizationId: member.organizationId,
      role: member.role,
      organizationName: organization.name,
    })
    .from(member)
    .leftJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId));
  
  return memberships;
}

// ================================
// Write Functions
// ================================

export async function updateUser(userId: string, data: { name?: string; image?: string | null; description?: string }) {
  const updatedUsers = await db
    .update(user)
    .set({ 
      ...data,
      updatedAt: new Date()
    })
    .where(eq(user.id, userId))
    .returning();

  return updatedUsers[0] || null;
}

/**
 * Update a user's subscription plan
 * @param subscriptionId - The subscription ID to update
 * @param userId - The user ID (for verification)
 * @param plan - The new plan to assign
 * @returns The updated subscription or null if failed
 */
export async function updateUserSubscription(
  subscriptionId: string,
  userId: string,
  plan: string
) {
  const updatedSubscription = await db
    .update(subscription)
    .set({
      plan: plan,
    })
    .where(
      and(
        eq(subscription.id, subscriptionId),
        eq(subscription.referenceId, userId)
      )
    )
    .returning();

  return updatedSubscription[0] || null;
}

/**
 * Create a new subscription for a user
 * @param userId - The user ID to create subscription for
 * @param plan - The plan to assign
 * @param stripeCustomerId - Optional Stripe customer ID
 * @returns The created subscription
 */
export async function createUserSubscription(
  userId: string,
  plan: string,
  stripeCustomerId?: string
) {
  const newSubscription = await db
    .insert(subscription)
    .values({
      id: `sub_${userId}_${Date.now()}`,
      plan: plan,
      referenceId: userId,
      stripeCustomerId: stripeCustomerId,
      status: 'active',
    })
    .returning();

  return newSubscription[0];
}
