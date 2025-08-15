import { hc } from 'hono/client';
import type { AppType } from '@repo/server';
import { authClient } from '~/lib/auth-client';


const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3005';

// IMPORTANT: Fetch the Better Auth cookie dynamically for each request so we never send a stale cookie.
export const rpcClient = hc<AppType>(
    baseURL,
    {
        headers: () => ({
            Cookie: authClient.getCookie(),
        }),
    }
);