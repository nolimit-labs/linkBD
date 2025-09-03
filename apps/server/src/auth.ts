import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // your drizzle instance
import { organization, admin } from "better-auth/plugins"
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { SUBSCRIPTION_PLANS, DEFAULT_PLAN_NAME } from "./db/admin/plans/data";
import { assignDefaultSubscriptionForUser, assignDefaultSubscriptionForOrg, hasActiveSubscription } from "./models/subscriptions";
import * as organizationModel from "./models/organization";
import { expo } from "@better-auth/expo";
import dotenv from "dotenv";
dotenv.config();

// Environment variables
const isDevelopment = process.env.NODE_ENV === 'development';
const isStaging = process.env.NODE_ENV === 'staging';
const isProduction = process.env.NODE_ENV === 'production';

// Enable features based on environment
const enableEmailAndPassword = isDevelopment || isStaging;
const enableCrossSubDomainCookies = isProduction || isStaging;


const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;
if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set');
}

const stripeClient = new Stripe(stripeSecretKey)

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
        enabled: enableEmailAndPassword
    },
    socialProviders: {
        google: {
            enabled: true,
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    try {
                        // Check if user already has a subscription (in case of multiple auth methods)
                        const hasSubscription = await hasActiveSubscription(user.id);
                        if (!hasSubscription) {
                            await assignDefaultSubscriptionForUser(user.id);
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
        admin(),
        expo(),
        organization({
            organizationLimit: 1,
            schema: {
                organization: {
                    additionalFields: {
                        imageKey: {
                            type: "string",
                            required: false,
                        },
                        description: {
                            type: "string",
                            required: false,
                        },
                    },
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
                requireEmailVerification: isProduction,
                onSubscriptionCancel: async ({ event, subscription }) => {
                    // Called when a subscription is canceled since better auth just changes status to canceled but doesn't delete the subscription we need to reassign the default free subscription
                    await assignDefaultSubscriptionForUser(subscription.referenceId);
                },
            },
            
        }),
    ],
    logger: {
        level: isProduction ? 'error' : 'debug',
        log: (level, msg, ...args) => {
            console.log(`[better-auth] [${level}] ${msg}`, ...args)
        },
    },
    trustedOrigins: trustedOrigins,
    advanced: {
        // names simplified; use the cookie option block your version exposes
        crossSubDomainCookies: {
          enabled: enableCrossSubDomainCookies,
          domain: ".linkbd.io"  // note the leading dot
        }
    }
});

export type Session = typeof auth.$Infer.Session;
