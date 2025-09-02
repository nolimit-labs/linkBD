import { createMiddleware } from 'hono/factory'
import { auth } from '../auth'
import { db } from '../db'
import { posts } from '../db/schema'
import { eq, and, isNull, gte, lt } from 'drizzle-orm'
import { count } from 'drizzle-orm'
import { getPlanLimits } from '../db/admin/plans/data'
import { Session } from '../auth'

// Type for context variables set by subscription middleware
export type SubscriptionVariables = {
  subscription: any
  dailyPostCount: number
  dailyPostLimit: number
}

// Middleware to check subscription limits before creating any new resources
export const subscriptionLimitMiddleware = createMiddleware(async (c, next) => {
  try {
    const { session: { activeOrganizationId, userId } } = c.get('session') as Session

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

    // Get plan limits using helper function
    const currentPlan = activeSubscription?.plan || 'free'
    const planLimits = getPlanLimits(currentPlan)
    const dailyPostLimit = planLimits?.postsPerDay || 1

    // Get today's post count (UTC timezone)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

    const todaysPostCount = activeOrganizationId
      ? await db
        .select({ count: count() })
        .from(posts)
        .where(and(
          eq(posts.organizationId, activeOrganizationId),
          gte(posts.createdAt, today),
          lt(posts.createdAt, tomorrow)
        ))
      : await db
        .select({ count: count() })
        .from(posts)
        .where(and(
          eq(posts.userId, userId),
          isNull(posts.organizationId),
          gte(posts.createdAt, today),
          lt(posts.createdAt, tomorrow)
        ))

    const currentDailyCount = todaysPostCount[0]?.count || 0

    // Check if user has reached their daily post limit
    if (currentDailyCount >= dailyPostLimit) {
      return c.json({
        error: 'Post limit reached',
        message: `You have reached your daily limit of ${dailyPostLimit} posts on the ${currentPlan} plan. Try again tomorrow.`,
        currentCount: currentDailyCount,
        dailyLimit: dailyPostLimit,
        plan: currentPlan
      }, 403)
    }

    // Add subscription info to context for potential use in handlers
    c.set('subscription', activeSubscription)
    c.set('dailyPostCount', currentDailyCount)
    c.set('dailyPostLimit', dailyPostLimit)

    await next()
  } catch (error) {
    console.error('Subscription middleware error:', error)
    return c.json({ error: 'Failed to check subscription limits' }, 500)
  }
})

// Middleware to get subscription info without blocking (for informational purposes)
export const subscriptionInfoMiddleware = createMiddleware(async (c, next) => {
  try {
    const { session: { activeOrganizationId, userId } } = c.get('session') as Session

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

    // Get plan limits using helper function
    const currentPlan = activeSubscription?.plan || 'free'
    const planLimits = getPlanLimits(currentPlan)
    const dailyPostLimit = planLimits?.postsPerDay || 1

    // Get today's post count (UTC timezone)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

    const todaysPostCount = activeOrganizationId
      ? await db
        .select({ count: count() })
        .from(posts)
        .where(and(
          eq(posts.organizationId, activeOrganizationId),
          gte(posts.createdAt, today),
          lt(posts.createdAt, tomorrow)
        ))
      : await db
        .select({ count: count() })
        .from(posts)
        .where(and(
          eq(posts.userId, userId),
          isNull(posts.organizationId),
          gte(posts.createdAt, today),
          lt(posts.createdAt, tomorrow)
        ))

    const currentDailyCount = todaysPostCount[0]?.count || 0

    // Add subscription info to context
    c.set('subscription', activeSubscription)
    c.set('dailyPostCount', currentDailyCount)
    c.set('dailyPostLimit', dailyPostLimit)

    await next()
  } catch (error) {
    console.error('Subscription info middleware error:', error)
    // Don't block the request, just continue without subscription info
    await next()
  }
})