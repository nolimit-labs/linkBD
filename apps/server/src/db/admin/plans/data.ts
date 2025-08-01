import type { StripePlan } from '@better-auth/stripe/*';
import type { PlanLimits } from '../../schema';

// Extend StripePlan to include id and isActive for managing legacy plans
export interface ExtendedStripePlan extends StripePlan {
  id?: string; // Optional - can be auto-generated from name if not provided
  isActive?: boolean;
}

// Define the subscription plans using extended StripePlan type
export const SUBSCRIPTION_PLANS: ExtendedStripePlan[] = [
  {
    name: 'free',
    limits: {
      todos: 5,
      files: 5,
    },
    isActive: true,
  },
  {
    name: 'pro',
    priceId: 'price_1RoyS1AozJl34ksQZ7qAZY5J',
    limits: {
      todos: 20,
      files: 20,
    },
    isActive: true,
  },
  // Example legacy plan (disabled) with custom ID
  // {
  //   id: 'legacy_starter_2023', // Optional custom ID
  //   name: 'starter',
  //   priceId: 'price_legacy_starter',
  //   limits: {
  //     todos: 10,
  //     files: 10,
  //   },
  //   isActive: false, // Legacy plan - won't be offered to new users
  // },
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
    todos: plan.limits.todos,
    files: plan.limits.files,
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