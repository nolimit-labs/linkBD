import { createAuthClient } from 'better-auth/react';
import {
  adminClient, 
  inferAdditionalFields,
} from 'better-auth/client/plugins';
// import { auth }  from '@repo/server';


const authClient = createAuthClient({
  plugins: [
    adminClient(),
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
  admin,
} = authClient;

