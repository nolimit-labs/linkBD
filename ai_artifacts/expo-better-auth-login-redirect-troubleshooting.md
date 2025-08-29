## Expo + Better Auth: Post‑login redirect not happening (mobile)

### Symptom
- After sign-in, the in-app browser (for social login) closes, but navigation does not move to the to-dos screen. On app relaunch, you are logged in (session persisted), confirming auth succeeded but the post-login redirect didn’t fire.

### What’s in this repo today
- Native deep link scheme is set: `app.json` → `scheme: "linkbd"`.
- Auth client uses Expo plugin + SecureStore:
  - `apps/mobile-app/lib/auth-client.ts` uses `expoClient({ scheme: "linkbd", storagePrefix: "linkbd", storage: SecureStore })`.
- Sign-in screen:
  - Email/password: calls `authClient.signIn.email(...)` then `router.replace('/todos')`.
  - Google: calls `authClient.signIn.social({ provider: 'google', callbackURL: Linking.createURL('/todos') })` and relies on the deep link to return.
  - There’s a session watcher: `useEffect` redirects to `/todos` when `session?.data` exists.
- App guard: `(app)/_layout.tsx` redirects to `/(auth)/sign-in` when no session is present; it waits for `isPending === false` to avoid flicker.
- Backend Better Auth config (`apps/server/src/auth.ts`): `trustedOrigins` currently pulled from `CORS_ORIGINS`, which are HTTP(S) origins only; no native schemes like `linkbd://`.

### Likely root causes
1) Deep link/trusted origin mismatch
   - Better Auth validates redirect origins. Native schemes like `linkbd://` must be trusted, or the callback flow may be rejected or not completed as expected.

2) Overriding the callback URL unnecessarily
   - The `@better-auth/expo` plugin can handle redirect URIs automatically. Passing a custom `callbackURL` (e.g., `Linking.createURL('/todos')`) sometimes bypasses the plugin’s built-in flow, leading to no navigation.

3) Session query not refetching after deep link
   - `useSession` uses React Query and may not refetch on the same screen after the browser closes, so the `useEffect` that watches `session?.data` never re-runs without an explicit invalidation/refetch triggered by the deep-link event.

4) Timing/race conditions
   - Navigating immediately after `signIn.email` or right as the browser closes can race with SecureStore updates. A short wait for `authClient.getSession()` (or explicit React Query invalidation) stabilizes navigation.

5) Android intent handling (edge)
   - Expo sets up intent filters from `scheme`, but device settings (“Open supported links”) or emulator quirks can still block delivery of the callback.

---

### Solution A — Let the Expo plugin own the redirect (recommended)
Goal: Remove custom `callbackURL`, trust the plugin to close the browser and complete the session, and force a session refetch on deep-link return.

Steps:
1) Remove `callbackURL` from the social sign-in call:
```ts
await authClient.signIn.social({ provider: 'google' });
```

2) Listen for the deep-link return and refetch session, then route:
```ts
import * as Linking from 'expo-linking';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export function useAuthRedirect() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const sub = Linking.addEventListener('url', async () => {
      // Ensure React Query sees the new session
      await queryClient.invalidateQueries({ queryKey: ['session'] });
      // Optionally, verify directly:
      // const s = await authClient.getSession(); if (s?.data) router.replace('/todos');
    });
    return () => sub.remove();
  }, [queryClient, router]);
}
```
Use this hook in `sign-in.tsx` (or a shared provider) so when the browser returns, the session refetches and your existing `useEffect` that checks `session?.data` will trigger `router.replace('/todos')`.

3) Ensure backend trusts native schemes (see Solution C).

Pros:
- Minimal changes; aligns with Better Auth’s Expo flow.
- Robust across providers.

---

### Solution B — Keep an explicit callback, but generate a correct URI and handle return
If you prefer controlling the path after login:

1) Build the callback with Expo’s redirect helpers (ensures proper scheme/host across dev/standalone):
```ts
import * as AuthSession from 'expo-auth-session';

const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'linkbd',
  path: 'todos', // maps to /todos in Expo Router
});

await authClient.signIn.social({
  provider: 'google',
  callbackURL: redirectUri,
});
```

2) Same as A(2), add a deep-link listener to invalidate `['session']` so the session watcher redirects.

3) Ensure backend trusts the `linkbd://` origin (Solution C).

Note: With Expo Router, a file at `app/(app)/todos.tsx` resolves to URL path `/todos`, so the `path: 'todos'` mapping is correct.

---

### Solution C — Add native schemes to Better Auth `trustedOrigins`
Your server currently loads `trustedOrigins` from `CORS_ORIGINS` (HTTP origins only). For native redirects, add scheme origins:

Options:
- Quick hardcode (non-production):
```ts
trustedOrigins: [
  'http://localhost:3000',
  'http://localhost:3001',
  'linkbd://',        // iOS/Android native scheme
  'exp+linkbd://',    // Expo Go/dev client sometimes uses exp+{scheme}
]
```

- Via env (recommended): set `CORS_ORIGINS` to include the schemes, e.g.:
```
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,linkbd://,exp+linkbd://
```

Why: Better Auth validates callback origins; without the native schemes, the plugin-driven redirect/callback may be ignored or fail CSRF checks.

---

### Solution D — Stabilize navigation after email/password login
For the non-browser flow, ensure the session is persisted before navigating:
```ts
const result = await authClient.signIn.email({ email, password });
// Optional: check for errors, then force a session read
await authClient.getSession();
// Or: invalidate React Query
await queryClient.invalidateQueries({ queryKey: ['session'] });
router.replace('/todos');
```

If you still see rare races, wait for the session watcher (`useSession`) to flip truthy and only then call `router.replace`.

---

### Solution E — Android-specific checks
- Confirm the device allows the app to open supported links for the `linkbd` scheme.
- Test on physical hardware; emulators sometimes mishandle intent delivery during fast auth flows.
- Ensure only one app on the device claims the `linkbd://` scheme.

---

### Verification checklist
- Sign in with Google:
  - Browser opens and closes; app receives a deep-link event.
  - `['session']` query invalidates and `authClient.getSession()` returns a valid session.
  - You land on `/todos` without relaunching the app.
- Sign in with email/password:
  - No browser involved; after login, `authClient.getSession()` is non-null and `router.replace('/todos')` works.
- Cold-start check:
  - App launches to `(app)` routes automatically if a session already exists.

### References
- Better Auth — Expo integration: [better-auth Expo docs](https://www.better-auth.com/docs/integrations/expo)
- Expo Router — Deep linking & groups: [Expo Router deep linking](https://docs.expo.dev/router/reference/linking/)
- Expo AuthSession redirect helpers: [AuthSession.makeRedirectUri](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- React Query invalidation: [TanStack Query Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/invalidations)

---

### TL;DR
- Add `linkbd://` (and `exp+linkbd://` in dev) to Better Auth `trustedOrigins` on the server.
- Don’t pass a `callbackURL` unless necessary; let the Expo plugin handle it.
- On deep-link return, invalidate `['session']` so the session watcher redirects to `/todos`.
- For email/password, validate the session before navigating to avoid races.


