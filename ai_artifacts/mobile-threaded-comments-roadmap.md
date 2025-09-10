# Threaded Comments (Mobile) Implementation Roadmap

> 📝 Living Document - This roadmap is actively updated as phases are executed. Check items off as completed and adjust scope as we ship.

## Overview
Build threaded comments in the mobile app to mirror the web-app behavior without adding new backend endpoints. Reuse existing APIs already implemented in the server and consumed by the web client:
- Top-level comments: `GET /api/posts/:id/comments` (includes `repliesCount`)
- Replies for a comment: `GET /api/posts/:postId/comments/:commentId/replies`
- Mutations: create/update/delete comment with optional `parentId`

Mobile should provide:
- Inline “View N replies” expanders and recursive rendering with indentation
- Inline reply composer under a comment
- Optional dedicated Thread screen for deep conversations
- Consistent top-left Back button on post and thread screens

## Implementation Progress
- [ ] Phase 1: Align mobile data layer to web-app patterns
- [ ] Phase 2: CommentThread component for mobile (nested, recursive)
- [ ] Phase 3: Integrate into Post Detail screen (replace flat CommentCard list)
- [ ] Phase 4: Optional Thread screen with top-left Back button
- [ ] Phase 5: UX polish, performance, caching, optimistic updates
- [ ] Phase 6: QA, analytics, and instrumentation

## Phase Instructions

### Phase 1: Align mobile data layer to web-app patterns
- [ ] Reuse existing hooks in `apps/mobile-app/api/comments.ts`:
  - `usePostComments(postId)` for top-level comments
  - `useCommentReplies(postId, commentId)` for replies
- [ ] Confirm server responses contain `repliesCount` for top-level comments (already implemented on server)
- [ ] Ensure query keys are stable and scoped:
  - Top-level: `['comments','post', postId]`
  - Replies: `['comments','replies', commentId]`
- [ ] Verify mutations already support `parentId` (mobile has `useCreateComment` with `parentId`)
- [ ] Keep using the centralized RPC client (Hono RPC) for all API calls

### Phase 2: CommentThread component for mobile (nested, recursive)
- [ ] Create `apps/mobile-app/components/comments/comment-thread.tsx`
  - Props: `{ comment, postId, depth = 0, maxDepth = 2, onCommentUpdate? }`
  - Local state: `showReplies`, `showReplyInput`
  - Data: `useCommentReplies(postId, comment.id)` for child replies
  - Actions:
    - “View N replies” / “Hide replies” toggles
    - “Reply” toggles inline composer
    - Optional edit/delete if author is current user (reuse existing mutations)
  - Rendering:
    - Render current comment (use existing `CommentCard`), pass callbacks: `onReply`, `onShowReplies`, `repliesCountDisplay`
    - If replying, render inline `CommentInput` with `parentId=comment.id`
    - If expanded, map child replies and recursively render `CommentThread` with `depth+1`
  - Indentation: apply left padding/margin for nested depth (`ml-6`/`ml-10` equivalents in NativeWind)
- [ ] Update `apps/mobile-app/components/comments/comment-card.tsx`
  - Support optional action row: Reply, View/Hide replies, replies count
  - Keep visuals compact for mobile

### Phase 3: Integrate into Post Detail screen
- [ ] File: `apps/mobile-app/app/(app)/posts/[id].tsx`
  - Replace `renderItem={({ item }) => <CommentCard ... />}` with `CommentThread`
  - Top-level `FlatList` remains the source; each top-level comment controls its own replies
  - Keep existing pagination via `usePostComments`; infinite scroll for top-level only
  - `onCommentUpdate` should call `refetch()` to refresh counts after edits/deletes
  - Maintain `KeyboardAvoidingView` and bottom `CommentInput` for top-level comments

### Phase 4: Optional Thread screen with Back button
- [ ] Route: `apps/mobile-app/app/(app)/posts/[postId]/comments/[commentId].tsx`
  - Purpose: focused view for a single comment thread (deep linking later)
  - Data: use `useCommentReplies(postId, commentId)` for replies; fetch the parent comment via post or cached list
  - Header Back: add `headerLeft` with a back arrow using `router.back()` (match existing pattern used for `posts/[id]`)
- [ ] Navigator configuration:
  - Add a hidden drawer/stack entry for `posts/[postId]/comments/[commentId]`
  - Ensure `headerLeft` is consistent with `posts/[id]`

### Phase 5: UX polish, performance, caching, optimistic updates
- [ ] Replies pagination: show “Load more replies” sentinel under a thread
- [ ] Loading states: tiny inline spinner when expanding a thread
- [ ] Optimistic reply post:
  - Inject the new reply into the replies cache and increment parent `repliesCount`
  - Roll back on error
- [ ] Image/avatar caching: use `expo-image` with `cachePolicy="disk"`
- [ ] Performance: if needed, consider flattening into a single virtualized list or migrating to FlashList (optional)

### Phase 6: QA, analytics, and instrumentation
- [ ] QA cover: long threads, deep nesting, rapid expand/collapse, slow networks
- [ ] Track events: expand thread, reply create, load more replies
- [ ] Accessibility: larger tap targets for actions, semantic roles where possible

## Success Criteria
- [ ] Post Detail shows top-level comments with accurate `repliesCount`
- [ ] Tapping “View N replies” loads and shows child replies under the parent
- [ ] Inline reply composer works for both top-level and nested replies
- [ ] Back button is present at top-left on post and thread screens and navigates back reliably
- [ ] Infinite scroll for top-level comments; paginated loading for replies
- [ ] No additional backend endpoints required; all calls use existing RPC routes

## References (Web App)
- `apps/web-app/src/components/comments/comment-list.tsx` (top-level list)
- `apps/web-app/src/components/comments/comment-thread.tsx` (recursive threading)
- `apps/web-app/src/api/comments.ts` (hooks powering comments and replies)
