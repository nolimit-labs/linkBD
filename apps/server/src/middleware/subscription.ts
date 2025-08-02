import { createMiddleware } from 'hono/factory'
import { auth } from '../auth'
import { db } from '../db'
import { posts } from '../db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { count } from 'drizzle-orm'

// Type for context variables set by subscription middleware
export type SubscriptionVariables = {
  subscription: any
  postCount: number
  postLimit: number
}

// Middleware to check subscription limits before creating todos
export const subscriptionLimitMiddleware = createMiddleware(async (c, next) => {
  try {
    const { activeOrganizationId, userId } = c.get('session')

    // Determine which subscription to check (organization or personal)
    const referenceId = activeOrganizationId || userId

    // Get subscription using Better Auth API
    const subscriptions = await auth.api.listActiveSubscriptions({
      headers: c.req.raw.headers,
      query: { referenceId }
    })

    // Find active subscription
    const activeSubscription = subscriptions?.find(
      (sub: any) => sub.status === 'active' || sub.status === 'trialing'
    )

    // Get todo limit from active subscription or default to free plan
    const postLimit = activeSubscription?.limits?.posts || 5 // Default to free plan limit
    const currentPlan = activeSubscription?.plan || 'free'

    // Get current todo count based on context
    const postCountResult = activeOrganizationId
      ? await db
        .select({ count: count() })
        .from(posts)
        .where(eq(posts.organizationId, activeOrganizationId))
      : await db
        .select({ count: count() })
        .from(posts)
        .where(and(
          eq(posts.userId, userId),
          isNull(posts.organizationId)
        ))

    const currentPostCount = postCountResult[0]?.count || 0

    // Check if user has reached their limit
    if (currentPostCount >= postLimit) {
      return c.json({
        error: 'Post limit reached',
        message: `You have reached your limit of ${postLimit} posts on the ${currentPlan} plan. Please upgrade to create more posts.`,
        currentCount: currentPostCount,
        limit: postLimit,
        plan: currentPlan
      }, 403)
    }

    // Add subscription info to context for potential use in handlers
    c.set('subscription', activeSubscription)
    c.set('postCount', currentPostCount)
    c.set('postLimit', postLimit)

    await next()
  } catch (error) {
    console.error('Subscription middleware error:', error)
    return c.json({ error: 'Failed to check subscription limits' }, 500)
  }
})

// Middleware to get subscription info without blocking (for informational purposes)
export const subscriptionInfoMiddleware = createMiddleware(async (c, next) => {
  try {
    const { activeOrganizationId, userId } = c.get('session')

    // Determine which subscription to check (organization or personal)
    const referenceId = activeOrganizationId || userId

    // Get subscription using Better Auth API
    const subscriptions = await auth.api.listActiveSubscriptions({
      headers: c.req.raw.headers,
      query: { referenceId }
    })

    // Find active subscription
    const activeSubscription = subscriptions?.find(
      (sub: any) => sub.status === 'active' || sub.status === 'trialing'
    )

    // Get todo limit from active subscription or default to free plan
    const postLimit = activeSubscription?.limits?.posts || 5 // Default to free plan limit

    // Get current todo count based on context
    const postCountResult = activeOrganizationId
      ? await db
        .select({ count: count() })
        .from(posts)
        .where(eq(posts.organizationId, activeOrganizationId))
      : await db
        .select({ count: count() })
        .from(posts)
        .where(and(
          eq(posts.userId, userId),
          isNull(posts.organizationId)
        ))

    const currentPostCount = postCountResult[0]?.count || 0

    // Add subscription info to context
    c.set('subscription', activeSubscription)
    c.set('postCount', currentPostCount)
    c.set('postLimit', postLimit)

    await next()
  } catch (error) {
    console.error('Subscription info middleware error:', error)
    // Don't block the request, just continue without subscription info
    await next()
  }
})