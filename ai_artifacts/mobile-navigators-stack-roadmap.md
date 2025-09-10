# Mobile Navigators & Threaded Stack Roadmap

> 📝 Living Document — Tracks the plan to fix back behavior for posts and threaded comments by nesting a Stack under the Drawer and using push semantics for deep replies.

## Overview
The app currently wraps most routes in a Drawer navigator (`app/(app)/_layout.tsx`). Post detail (`posts/[id]`) and thread routes (`posts/[postId]/comments/[commentId]`) are registered as Drawer screens (hidden), so deep navigation uses Drawer history rather than a proper Stack. Combined with using `router.navigate` for reply → reply transitions, the back button can pop to the feed instead of stepping back through the thread chain.

**Goal:** Nest a `Stack` navigator for detail flows (posts and comment threads) under the Drawer, and ensure all thread navigations use `router.push` so each step is added to history. This will give you the expected Stack header/back behavior: Feed → Post → Comment → Reply → Reply ... and back traverses in reverse.

## Implementation Progress

- [ ] Phase 1: Quick fixes (history semantics)
- [ ] Phase 2: Navigator restructuring (Stack-in-Drawer)
- [ ] Phase 3: Header/UX polish
- [ ] Phase 4: Deep linking & QA

## Phase 1: Quick fixes (history semantics)

- [ ] Switch thread navigation to `router.push` (not `router.navigate`). This ensures each reply navigation pushes a new entry on the history stack.
  - Target: `app/(app)/posts/[postId]/comments/[commentId].tsx`
  - Replace calls like:
    ```tsx
    // BAD: Does not always create a new history entry
    router.navigate({ pathname: '/posts/[postId]/comments/[commentId]', params: { postId, commentId: reply.id, root: nextRoot } })
    ```
    with:
    ```tsx
    // GOOD: Pushes a new entry, enabling proper back traversal
    router.push({ pathname: '/posts/[postId]/comments/[commentId]', params: { postId, commentId: reply.id, root: nextRoot } })
    ```
- [ ] Ensure all entry points into threads (from post detail) also use `router.push` (already true in `posts/[id].tsx`).

## Phase 2: Navigator restructuring (Stack-in-Drawer)

Keep the Drawer for top-level sections only (feed, search, businesses, settings, profile). Move detail flows (post detail and comment threads) into a nested `Stack` so they render with the default stack header/back and maintain a proper push/pop history.

### Target structure

```
app/
  _layout.tsx                  // Theme/Providers
  (app)/
    _layout.tsx               // Drawer (top-level sections only)
    feed.tsx                  // Feed screen (as Drawer screen)
    search.tsx
    businesses.tsx
    settings.tsx
    profile/
      _layout.tsx             // Optional: its own Stack if needed
      [id].tsx
    posts/
      _layout.tsx             // Stack for post + threads
      [id].tsx                // Post detail
      comments/
        [commentId].tsx       // Thread screen (nested replies reuse same route)
```

### Drawer layout: only register top-level sections

Remove the hidden Drawer screens for `posts/[id]` and `posts/[postId]/comments/[commentId]`. Let the `posts/` stack take over those routes.

```tsx
// app/(app)/_layout.tsx — Drawer only for top-level sections
import React, { useEffect } from 'react';
import { Drawer } from 'expo-router/drawer';

export default function AppLayout() {
  return (
    // @ts-ignore types mismatch with React 19
    <Drawer initialRouteName="feed" screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="feed" options={{ title: 'Feed' }} />
      <Drawer.Screen name="search" options={{ title: 'Search' }} />
      <Drawer.Screen name="businesses" options={{ title: 'Businesses' }} />
      <Drawer.Screen name="settings" options={{ title: 'Settings' }} />
      {/* Optional: profile remains accessible as a top-level item or moved under its own Stack */}
      <Drawer.Screen name="profile/[id]" options={{ drawerItemStyle: { display: 'none' } }} />
    </Drawer>
  );
}
```

### Posts stack layout: own stack for post + thread flows

```tsx
// app/(app)/posts/_layout.tsx — Dedicated Stack for detail flows
import { Stack } from 'expo-router';

export default function PostsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontSize: 20 },
      }}
    >
      {/* Screens will be auto-registered from files: [id].tsx and comments/[commentId].tsx */}
    </Stack>
  );
}
```

Now, navigating from feed → post (`/posts/[id]`) or from post → thread (`/posts/[postId]/comments/[commentId]`) will occur inside this `Stack`, giving you the expected push transitions and a working back arrow that steps back one level at a time.

## Phase 3: Header/UX polish

- [ ] Rely on the Stack’s default back button for detail screens (remove custom `headerLeft` overrides on post/thread that call `router.back()` from the Drawer layer).
- [ ] Optional: Set contextual titles per screen
  - In `posts/[id].tsx`: `Stack.Screen options={{ title: 'Post' }}` via `useNavigationOptions` or static `export const options` if preferred.
  - In thread screen: title like `Thread` or `Replies`.
- [ ] Keep the Drawer accessible via gesture or a menu button only on top-level screens, not on detail screens.

## Phase 4: Deep linking & QA

- [ ] Test deep reply navigation (3–5 levels): each reply should be a new stack entry; back pops to the previous reply, then to the parent comment, then to the post, then to the feed.
- [ ] Android hardware back should mirror the stack behavior.
- [ ] Verify incoming deep links open inside the Posts Stack correctly (e.g., `linkbd://posts/123/comments/456`).
- [ ] Ensure links and buttons use `router.push` or `<Link push>` for forward navigation; use `router.replace` only when you truly do not want a back entry.

## Why this works

- **Drawer vs Stack**: Drawer is best for top-level app sections. Stack is best for drill-down flows with hierarchical back behavior. Nesting a Stack under the Drawer aligns with React Navigation best practices and Expo Router’s file-based nested layouts.
- **push vs navigate**: `router.push` appends to history; `router.navigate` can reuse an existing route entry (especially for the same pattern), which breaks sequential back pops for threads.

## Code touchpoints (references in your repo)

- Drawer layout: `apps/mobile-app/app/(app)/_layout.tsx` (currently registers `posts/[id]` and `posts/[postId]/comments/[commentId]` as hidden Drawer screens — remove these in Phase 2)
- Post detail: `apps/mobile-app/app/(app)/posts/[id].tsx` (already using `router.push`)
- Thread screen: `apps/mobile-app/app/(app)/posts/[postId]/comments/[commentId].tsx` (replace `router.navigate` with `router.push`)
- Comments list press handlers: `apps/mobile-app/components/comments/comments-list.tsx` consumers already pass handlers; no change needed there.

## Success Criteria

- Back from a reply takes you to the previous reply, then to its parent, then to the post, then to the feed — in order.
- Default Stack header/back is shown on post/thread screens with smooth Stack transitions.
- Drawer remains available for top-level navigation; detail screens are not Drawer screens.
- Deep links and Android hardware back behave consistently.

---

### Appendix: Minimal code examples

```tsx
// Navigate from a comment to its thread (ensures stack push)
import { useRouter } from 'expo-router';

const router = useRouter();
router.push({
  pathname: '/posts/[postId]/comments/[commentId]',
  params: { postId, commentId: reply.id, root: encodedRoot },
});
```

```tsx
// app/(app)/posts/_layout.tsx
import { Stack } from 'expo-router';

export default function PostsLayout() {
  return <Stack screenOptions={{ headerShown: true }} />;
}
```


