import { db } from '../db';
import { subscription, user } from '../db/schema';
import { DEFAULT_PLAN_NAME } from '../db/admin/plans/data';
import { eq, and, or } from 'drizzle-orm';
import * as organizationModel from "./organization";


/**
 * Assign default free plan to a user
 * @param userId - The user ID to assign the default subscription to
 * @returns The new subscription
 */
export async function assignDefaultSubscriptionForUser(userId: string) {
  try {
    console.log(`🎁 Assigning default subscription to user: ${userId}`);
    
    // Get the user to retrieve their Stripe customer ID
    const userRecord = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    
    if (userRecord.length === 0) {
      throw new Error(`User ${userId} not found`);
    }
    
    const stripeCustomerId = userRecord[0].stripeCustomerId;
    console.log(`📄 User ${userId} has Stripe customer ID: ${stripeCustomerId || 'none'}`);
    
    // Create a free plan subscription for the new user/org
    const newSubscription = await db
      .insert(subscription)
      .values({
        id: `sub_${userId}_${Date.now()}`, // Generate unique subscription ID
        plan: DEFAULT_PLAN_NAME,
        referenceId: userId, // Link to user
        stripeCustomerId: stripeCustomerId, // Include Stripe customer ID if available
        status: 'active', // Free plan is immediately active
        // Note: stripeSubscriptionId will be null for free plans (no Stripe subscription)
        // periodStart and periodEnd can be null for free plans (no billing periods)
      })
      .returning();
    
    console.log(`✅ Assigned ${DEFAULT_PLAN_NAME} plan to user ${userId} with Stripe customer ${stripeCustomerId || 'none'}`);
    return newSubscription[0];
  } catch (error) {
    console.error(`❌ Failed to assign default subscription to user ${userId}:`, error);
    throw error;
  }
} 

/**
 * Assign default free plan to a organization
 * @param organizationId - The organization ID to assign the default subscription to
 * @returns The new subscription
 */
export async function assignDefaultSubscriptionForOrg(organizationId: string) {
  try {
    console.log(`🎁 Assigning default subscription to organization: ${organizationId}`);

    const org = await organizationModel.getOrgById(organizationId);

    console.log("Org", org);

    // Create a free plan subscription for the new organization
    const newSubscription = await db
      .insert(subscription)
      .values({
        id: `sub_${organizationId}_${Date.now()}`, // Generate unique subscription ID
        plan: DEFAULT_PLAN_NAME,
        referenceId: organizationId, // Link to organization
        status: 'active', // Free plan is immediately active
        stripeCustomerId: org.stripeCustomerId, // Include Stripe customer ID if available
        // Note: stripeSubscriptionId will be null for free plans (no Stripe subscription)
        // periodStart and periodEnd can be null for free plans (no billing periods)
      })
      .returning();

    console.log(`✅ Assigned ${DEFAULT_PLAN_NAME} plan to organization ${organizationId}`);
    return newSubscription[0];
  } catch (error) {
    console.error(`❌ Failed to assign default subscription to organization ${organizationId}:`, error);
    throw error;
  }
}

/**
 * Check if a user or organization already has an active subscription
 * @param referenceId - The user ID or organization ID to check
 * @returns True if the user or organization has an active subscription, false otherwise
 */
export async function hasActiveSubscription(referenceId: string): Promise<boolean> {
  const existingSubscription = await db
    .select()
    .from(subscription)
    .where(eq(subscription.referenceId, referenceId))
    .limit(1);
  
  return existingSubscription.length > 0;
}

/**
 * Get the active subscription for a user or organization
 * @param referenceId - The user ID or organization ID to check
 * @returns The active subscription or null if no active subscription is found
 */
export async function getUserActiveSubscription(referenceId: string) {
  const subscriptions = await db
    .select()
    .from(subscription)
    .where(
      and(
        eq(subscription.referenceId, referenceId),
        or(
          eq(subscription.status, 'active'),
          eq(subscription.status, 'trialing')
        )
      )
    )
    .limit(1);
  
  return subscriptions[0] || null;
}

// Get all subscriptions for a user
export async function getUserSubscriptions(userId: string) {
  return await db
    .select()
    .from(subscription)
    .where(eq(subscription.referenceId, userId))
    .orderBy(subscription.periodStart);
}

// Update subscription status
export async function updateSubscriptionStatus(
  subscriptionId: string, 
  status: string
) {
  return await db
    .update(subscription)
    .set({ status })
    .where(eq(subscription.id, subscriptionId))
    .returning();
}

// Cancel subscription
export async function cancelSubscription(subscriptionId: string) {
  return await updateSubscriptionStatus(subscriptionId, 'canceled');
}