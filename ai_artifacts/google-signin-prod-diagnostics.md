### Mobile Google Sign‑In: works in dev, stalls in production

This documents why Google sign‑in shows a loading state and then “nothing” in the production build, while it works in development, plus exact checks and fixes.

---

## What I inspected (key references)

```5:21:apps/mobile-app/lib/auth-client.ts
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3005';
// ...
export const authClient = createAuthClient({
    baseURL: `${baseURL}/api/auth`,
    // ...
});
```

```6:16:apps/mobile-app/api/rpc-client.ts
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3005';
// ...
headers: () => ({
  Cookie: authClient.getCookie(),
}),
```

```77:89:apps/mobile-app/app/index.tsx
await authClient.signIn.social({
  provider: 'google',
  callbackURL: 'linkbd://(app)/feed',
});
```

```2:10:apps/mobile-app/app.json
"scheme": "linkbd",
```

---

## Most likely root cause (production-only)

- **Missing `EXPO_PUBLIC_API_URL` during EAS build** → `baseURL` falls back to `http://localhost:3005` in production. On a device, `localhost` is unreachable, so the Better Auth social flow cannot complete (cookie cannot be set, redirect may go nowhere), resulting in a noop after loading.

### Fix
- Set `EXPO_PUBLIC_API_URL` to your public backend origin (HTTPS) for all EAS profiles (development/preview/production) and rebuild.
  - Example: `https://api.your-domain.com` (no trailing slash)
  - EAS: Project → Build → Environment Variables → add `EXPO_PUBLIC_API_URL`
- Ensure the backend is reachable from devices and runs over **HTTPS** in production.

---

## Other probable production pitfalls to check

- **Auth session completion handler not called**
  - In Expo apps using AuthSession, you typically need to call `WebBrowser.maybeCompleteAuthSession()` at app startup.
  - Add near the root (e.g., `app/_layout.tsx` top-level):

```ts
import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession();
```

- **Deep link scheme & route**
  - `app.json` sets `scheme: "linkbd"` which matches your callback `linkbd://(app)/feed`.
  - Verify the deep link resolves on device:
    - iOS: `npx uri-scheme open "linkbd://(app)/feed" --ios`
    - Android: `npx uri-scheme open "linkbd://(app)/feed" --android`
  - If it doesn’t open the app or navigate to the feed screen, double‑check scheme config and Android intent filters (Expo adds them from `scheme`, but confirm in a built app).

- **Better Auth redirect/callback behavior**
  - The client passes `callbackURL: 'linkbd://(app)/feed'`. The server must 302‑redirect to this URL after setting cookies. Confirm your server allows/uses this callback and doesn’t strip it in production.

- **Cookies and security attributes**
  - For the session to be usable on device, the Better Auth server should set cookies compatible with native clients (often `SameSite=None; Secure; Path=/`).
  - If your production backend is on HTTP or with mismatched domain, cookies won’t be set. Use HTTPS and correct domain.

---

## Quick verification steps

1) Log the resolved API URL in production
   - Temporarily add a log in `lib/auth-client.ts`:
     - `console.log('Auth baseURL:', baseURL)`
   - If it prints `http://localhost:3005` in a production build, the env var isn’t set.

2) Test deep link routing in a built app
   - Use the `uri-scheme` commands above to ensure `linkbd://(app)/feed` opens and routes correctly.

3) Confirm backend reachability & cookies
   - Manually open `<EXPO_PUBLIC_API_URL>/api/auth/signin/google` in the device’s browser (if exposed) and finish the flow; verify the server redirects back to `linkbd://(app)/feed`.

---

## Production checklist

- Set `EXPO_PUBLIC_API_URL` to the public HTTPS backend and rebuild with EAS.
- Ensure backend CORS allows credentials and responds with proper cookie attributes (Secure, SameSite=None) for your domain.
- Add `WebBrowser.maybeCompleteAuthSession()` at app startup (recommended).
- Verify `linkbd://(app)/feed` deep link works on iOS and Android.
- Ensure the server accepts and uses the `callbackURL` parameter in prod.

---

## Why dev can work while prod fails

- In dev, you might have a correctly set `EXPO_PUBLIC_API_URL` or be using a proxy/tunnel that makes your local backend reachable; in production, the build environment lacks that variable, causing `localhost` to be baked into the app.
- Dev clients sometimes mask missing `maybeCompleteAuthSession()`; in standalone production, the redirect/web browser handoff is stricter.

---

## If issues persist

- Share the production device logs for the moment you press “Sign in with Google”.
- Confirm the exact value of `EXPO_PUBLIC_API_URL` injected into the production build.
- If the server is behind a CDN/proxy, ensure `Set-Cookie` headers aren’t stripped and include `Secure`.



