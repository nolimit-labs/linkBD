# Comments System Implementation Roadmap

## ✅ V1 COMPLETE - Production Ready

### Implementation Summary
Full-featured commenting system with threaded discussions for linkBD posts. Users and organizations can create, edit, delete comments with single-level nesting (comment + replies).

### API Endpoints
```
GET    /api/posts/:id/comments                    // List comments with pagination
POST   /api/posts/:id/comments                    // Create comment/reply
GET    /api/posts/:postId/comments/:commentId/replies  // Get replies with pagination
PUT    /api/posts/:postId/comments/:commentId          // Update comment
DELETE /api/posts/:postId/comments/:commentId          // Delete comment
```

### Frontend Usage
```tsx
import { CommentsSection } from '@/components/comments'

<CommentsSection postId={postId} />
```

### V1 Phases Completed
- [x] **Phase 1:** Database schema with polymorphic authors
- [x] **Phase 2:** Model layer with CRUD operations & permissions  
- [x] **Phase 3:** RESTful API with auth & validation
- [x] **Phase 4:** React Query hooks with optimistic updates
- [x] **Phase 5:** Comment display components with infinite scroll
- [x] **Phase 6:** Comment creation/editing UI with keyboard shortcuts
- [x] **Phase 6.1:** Post detail route (`/posts/:id`) for viewing & commenting

### Phase 6.5: Mobile App Parity (React Native / Expo)
Bring the mobile app to parity with the web comments feature using existing backend endpoints. Focus is frontend-only (hooks, navigation, components), reusing the centralized RPC client and React Query setup that already exist in `apps/mobile-app`.

- [ ] API hooks: create `apps/mobile-app/api/comments.ts`
  - `usePostComments(postId, limit?)` (Infinite Query): calls `GET /api/posts/:id/comments` with cursor pagination, returns `{ comments, hasMore, nextCursor }`.
  - `useCommentReplies(postId, commentId, limit?)` (Infinite Query): calls `GET /api/posts/:postId/comments/:commentId/replies`.
  - `useCreateComment()` (Mutation): `POST /api/posts/:id/comments` with `{ content, parentId? }`; optimistic insert to caches, rollback on error.
  - `useUpdateComment()` (Mutation): `PUT /api/posts/:postId/comments/:commentId`; update cached comment.
  - `useDeleteComment()` (Mutation): `DELETE /api/posts/:postId/comments/:commentId`; remove from cached pages.
  - Query keys: `['comments','post',postId]` and `['comments','replies',commentId]`. Use same shapes as web for consistency.

- [ ] Navigation & route
  - Add screen `apps/mobile-app/app/(app)/posts/[id].tsx` that fetches the targeted post and renders a `PostDetail` view with `CommentsSection` below it.
  - Wire the "Comment" button in `apps/mobile-app/components/posts/post-card.tsx` to `router.push('/posts/' + post.id)`.

- [ ] Components (NativeWind + RN primitives in `apps/mobile-app/components/comments/`)
  - `comments-section.tsx`: container that shows `CommentInput` (if authenticated) and `CommentList`.
  - `comment-list.tsx`: top-level comments `FlatList` with:
    - `onEndReached`/`onEndReachedThreshold` for infinite scroll
    - `ListEmptyComponent`, `ListFooterComponent` for loading/skeletons
    - `keyExtractor={(c) => c.id}`; `initialNumToRender`, `windowSize`, `removeClippedSubviews`
  - `comment-card.tsx`: renders author (uses `author.imageUrl`, `name`, `isOfficial`), content, createdAt, edited flag, and actions (Reply, Show/Hide replies, Edit, Delete if owner).
  - `comment-thread.tsx`: expands/collapses replies using `useCommentReplies`; show replies if either `repliesCount > 0` or loaded `replies.length > 0` (matches web fix).
  - `comment-input.tsx`: TextInput + Send; supports both new comments (no `parentId`) and replies (`parentId` provided). Auto-clear, optional autoFocus, and keyboard handling (KeyboardAvoidingView). 

- [ ] Optimistic UX & caching
  - On create: optimistic append to the top-level or replies list and scroll to it; rollback on error; toast message on failure.
  - On update: optimistic content change with `isEdited: true`.
  - On delete: optimistic removal from cache; invalidate parent queries.
  - Invalidate `['posts','single',postId]` if you also surface comment counts on post detail in mobile later.

- [ ] Styling & UX parity
  - Match web semantics: single-level nesting (comment + replies); limit depth to 2 visually.
  - Badges: show Official and Pro (already available badge components exist in mobile as `BadgeText`).
  - Empty, loading, and error states.

- [ ] Performance (mobile specifics)
  - Use `FlatList` for top-level comments (virtualized), avoid wrapping it with a scrollable parent.
  - For replies, either:
    - Map replies inline when small (<= 50) with `scrollEnabled={false}` on nested lists; or
    - Use a nested `FlatList` with `nestedScrollEnabled` and `scrollEnabled={false}`. Keep item heights compact and stable.
  - Provide `getItemLayout` for the top-level list when possible (optional; improves scroll perf on long threads).

- [ ] Auth & access
  - Use `authClient.useSession()` in mobile to gate comment creation/editing and determine ownership (user vs active organization).
  - Reuse the same RPC cookie forwarding in `api/rpc-client.ts` (already implemented).

- [ ] Acceptance criteria
  - Create, edit, delete, and reply work end-to-end on mobile.
  - Infinite scroll for top-level comments; load-more for replies.
  - Reply toggle shows replies even when `repliesCount` is stale (loaded results render).
  - UI parity with web for author display, edited indicator, and action affordances.
  - No crashes or severe frame drops with 200+ comments (virtualized).

Example hook (mobile parity with web):
```ts
// apps/mobile-app/api/comments.ts
export const usePostComments = (postId: string, limit = 20) => {
  return useInfiniteQuery({
    queryKey: ['comments','post',postId, limit],
    queryFn: async ({ pageParam }) => {
      const res = await rpcClient.api.posts[':id'].comments.$get({
        param: { id: postId },
        query: { cursor: pageParam, limit: String(limit) },
      })
      if (!res.ok) throw new Error('Failed to fetch comments')
      return res.json()
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
  })
}
```

## 📋 V2 ROADMAP - Future Enhancements

### Phase 7: Comment Likes & Reactions
- [ ] Add `commentLikes` table and `likesCount` to comments
- [ ] Create like/unlike API endpoints and hooks
- [ ] Add like button to CommentCard with heart animation
- [ ] Implement optimistic like updates

### Phase 8: Rich Text & Formatting  
- [ ] Basic markdown support (bold, italic, links)
- [ ] Auto-link detection and preview
- [ ] Emoji picker integration
- [ ] Character count and content warnings

### Phase 9: Real-time Features
- [ ] WebSocket integration for live comment updates
- [ ] Real-time comment count updates on post cards
- [ ] Live typing indicators for active commenters
- [ ] Push notifications for comment replies

### Phase 10: Advanced Moderation
- [ ] Comment reporting system
- [ ] Auto-moderation with content filters
- [ ] Post author comment management (pin, hide, delete)
- [ ] Comment thread locking/unlocking

### Phase 11: Performance & Analytics
- [ ] Virtual scrolling for large comment threads
- [ ] Comment search and filtering
- [ ] Analytics dashboard for comment engagement
- [ ] Performance monitoring and optimization

### Phase 12: Social Features
- [ ] @mentions with autocomplete and notifications
- [ ] Comment sharing (copy link, social media)
- [ ] Comment bookmarking/saving
- [ ] Comment threads export (PDF, CSV)

---

## 🚀 Getting Started

### 1. Database Setup
```bash
cd apps/server
npm run db:generate  # Generate migration
npm run db:migrate   # Apply to database
```

### 2. Usage in Your App
```tsx
// In any post detail page
import { CommentsSection } from '@/components/comments'

<CommentsSection postId={post.id} />
```

### 3. Navigation Setup
- Comment button on PostCard now links to `/posts/:id`
- Full post detail page with integrated commenting
- Back navigation and responsive design included

**Status:** ✅ V1 Production Ready | 📋 V2 Planning Phase