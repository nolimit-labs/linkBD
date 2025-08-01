import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // your drizzle instance
import { anonymous, organization } from "better-auth/plugins"
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { createAuthMiddleware } from "better-auth/api";
import { SUBSCRIPTION_PLANS, DEFAULT_PLAN_NAME } from "./db/admin/plans/data";
import { assignDefaultSubscription, assignDefaultSubscriptionForOrganization, hasActiveSubscription } from "./models/subscriptions";

import dotenv from "dotenv";
dotenv.config();

// const basicPlan
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
})
 
const trustedOrigins = process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3001', 'http://localhost:3000'];

// Use subscription plans directly from constants
const activePlans = SUBSCRIPTION_PLANS.filter(plan => plan.isActive !== false);

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3002',
    database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
    }),
    emailAndPassword: {  
        enabled: true
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    try {
                        // Check if user already has a subscription (in case of multiple auth methods)
                        const hasSubscription = await hasActiveSubscription(user.id);
                        if (!hasSubscription) {
                            await assignDefaultSubscription(user.id);
                        }
                    } catch (error) {
                        console.error('Failed to assign default subscription:', error);
                        // Don't throw error to avoid blocking user creation
                    }
                },
            },
        },
    },
    plugins: [
        anonymous(),
        organization({
            organizationCreation: {
                afterCreate: async ({ organization /*, member, user */ }) => {
                    if (!(await hasActiveSubscription(organization.id))) {
                        await assignDefaultSubscriptionForOrganization(organization.id);
                    }
                },
            },
        }),
        stripe({
            stripeClient,
            stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
            createCustomerOnSignUp: true,
            createSubscriptionOnSignUp: false,
            subscription: {
                enabled: true,
                plans: activePlans,
            },
        }),
    ],
    logger: {
        level: "debug",
        log: (level, msg, ...args) => {
          console.log(`[better-auth] [${level}] ${msg}`, ...args)
        },
    },
    trustedOrigins: ["*"],
});

export type Session = typeof auth.$Infer.Session.session;
