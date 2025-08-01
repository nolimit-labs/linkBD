import { createAuthClient } from 'better-auth/react';
import {
  anonymousClient,
} from 'better-auth/client/plugins';
import { organizationClient } from 'better-auth/client/plugins';
import { stripeClient } from "@better-auth/stripe/client"

const authClient = createAuthClient({
  plugins: [
    anonymousClient(), 
    organizationClient(),
    stripeClient({
      subscription: true,
    }),
  ],
  fetchOptions: {
    credentials: 'include', // This ensures cookies are sent with requests
  },
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  accountInfo,
  subscription,
  organization,
  useActiveOrganization,
  useListOrganizations,
} = authClient;

