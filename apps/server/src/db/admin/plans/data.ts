import type { StripePlan } from '@better-auth/stripe/*';
import dotenv from 'dotenv'

dotenv.config()

const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID

if (!STRIPE_PRO_PRICE_ID) {
  throw new Error('STRIPE_PRO_PRICE_ID is not set');
}

// Extend StripePlan to include id and isActive for managing legacy plans
export interface ExtendedStripePlan extends StripePlan {
  id?: string; // Optional - can be auto-generated from name if not provided
  isActive?: boolean;
}


// Strongly typed plan limits interface
export interface PlanLimits {
  postsPerDay: number;
}


// Define the subscription plans using extended StripePlan type
export const SUBSCRIPTION_PLANS: ExtendedStripePlan[] = [
  {
    name: 'free',
    limits: {
      postsPerDay: 1,
    },
    isActive: true,
  },
  {
    name: 'pro',
    priceId: STRIPE_PRO_PRICE_ID,
    limits: {
      postsPerDay: 20,
    },
    isActive: true,
  },
  {
    name: 'pro_complementary',
    limits: {
      postsPerDay: 20,
    },
    isActive: true,
  },
];

export const DEFAULT_PLAN_NAME = 'free';

// Helper functions for working with plans

// Get plan by name
export function getPlanByName(planName: string): ExtendedStripePlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.name === planName);
}

// Get plan limits by name
export function getPlanLimits(planName: string): PlanLimits | null {
  const plan = getPlanByName(planName);

  if (!plan || !plan.limits) return null;

  return {
    postsPerDay: plan.limits.postsPerDay,
  };
}

// Get all active plans
export function getActivePlans(): ExtendedStripePlan[] {
  return SUBSCRIPTION_PLANS.filter(plan => plan.isActive !== false);
}

// Get default plan
export function getDefaultPlan(): ExtendedStripePlan | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.name === DEFAULT_PLAN_NAME);
}