## Mobile Navigation Rules (Expo Router)

> Concise standards for the authenticated app navigator structure and headers.

### Structure
- **All authenticated screens** live under `(app)`.
- `(app)` is a **parent Stack**.
- The **Drawer** lives only in `(app)/(drawer)` for top‑level sections (e.g., `feed`, `search`, `businesses`, `settings`).
- **Detail routes** (e.g., `posts/[id]`, `posts/[postId]/comments/[commentId]`, `profile/[id]`) are **Stack screens** registered directly in `(app)` (siblings to `(drawer)`), not inside the Drawer.
- Result: Feed (Drawer) → Post/Thread/Profile (Stack) uses native Stack transitions with default back behavior to return to Feed.

### Header Standard (LinkBD logo everywhere)
- All Stack headers must render the **LinkBD logo**.
- Set once at the `(app)` Stack level via `headerTitle: () => <Logo />`.
- The Drawer can also show the same logo via its `headerTitle` when `headerShown: true`.

### Canonical Config

```tsx
// app/(app)/_layout.tsx — Parent Stack for authenticated area
import React from 'react';
import { Stack } from 'expo-router';
import { Logo } from '~/components/logo';

export default function AppStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,               // hidden by default; enable per detail screen
        headerTitle: () => <Logo />,      // LinkBD logo in all Stack headers
        headerTitleStyle: { fontSize: 20 },
      }}
    >
      {/* Drawer group (top-level sections only) */}
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />

      {/* Detail screens as Stack siblings (show header with logo) */}
      <Stack.Screen name="posts/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="posts/[postId]/comments/[commentId]" options={{ headerShown: true }} />
      <Stack.Screen name="profile/[id]" options={{ headerShown: true }} />
    </Stack>
  );
}
```

```tsx
// app/(app)/(drawer)/_layout.tsx — Drawer for top-level sections
import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Logo } from '~/components/logo';

export default function AppDrawerLayout() {
  return (
    <Drawer
      initialRouteName="feed"
      screenOptions={{
        headerShown: true,
        headerTitle: () => <Logo />,      // Same LinkBD logo in Drawer header
        headerTitleStyle: { fontSize: 20 },
      }}
    >
      <Drawer.Screen name="feed" options={{ title: 'Feed' }} />
      <Drawer.Screen name="search" options={{ title: 'Search' }} />
      <Drawer.Screen name="businesses" options={{ title: 'Businesses' }} />
      <Drawer.Screen name="settings" options={{ title: 'Settings' }} />
      {/* Hide Drawer-only routes with drawerItemStyle if needed */}
    </Drawer>
  );
}
```

### Navigation Rules
- Use `router.push` to go Feed → Post, and Post → Thread (builds history for proper back traversal).
- Do not nest detail screens in the Drawer; keep them as `(app)` Stack screens.
- Avoid custom `headerLeft` on detail screens; rely on the default Stack back button and transitions.

### Outcome
- Back pops Thread → Post → Feed in order with native Stack animations.
- LinkBD logo appears in headers for all Stack-based screens and in the Drawer header.
- Drawer header never appears on detail routes unless explicitly enabled.

