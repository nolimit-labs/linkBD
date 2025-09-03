## TanStack DB Posts Feed Implementation Roadmap

> 📝 Living Document — Update this as phases complete. Check items off and add notes as you iterate.

### Overview
Implement a minimal, testable TanStack DB integration to render the posts feed using a single `QueryCollection` backed by the feed endpoint (`/api/posts/feed`). Start with read-only live query for the feed, then optionally add optimistic mutations.

### Implementation Progress
- [ ] Phase 1: Dependencies and environment prep
- [ ] Phase 2: Define `postsCollection` with Query adapter
- [ ] Phase 3: Render feed with `useLiveQuery`
- [ ] Phase 4: (Optional) Add optimistic mutations for like/create/delete
- [ ] Phase 5: Feature-flag toggle and testing

### Phase Instructions

#### Phase 1: Dependencies and environment prep
- [ ] Install packages in `apps/web-app` (do not run automatically):
```bash
pnpm --filter web-app add @tanstack/react-db @tanstack/query-db-collection
# Ensure TanStack Query is present (likely already):
pnpm --filter web-app add @tanstack/react-query
```
- [ ] Confirm `QueryClientProvider` is already configured in `apps/web-app/src/main.tsx`.
- [ ] No backend changes required; we’ll reuse existing posts endpoints via the RPC client.

#### Phase 2: Define `postsCollection` with Query adapter
- [ ] Create `apps/web-app/src/db/collections/posts-collection.ts` (or `apps/admin-app/src/db/collections/posts-collection.ts`) with a minimal collection using the TanStack Query adapter. Use the centralized RPC client per project standards.
```ts
// apps/web-app (or apps/admin-app)/src/db/collections/posts-collection.ts
import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { rpcClient } from '@/api/rpc-client'
import { getContext } from '@/providers/QueryProvider'

// If you have a shared Post type, import it as `type`
// import type { Post } from '@/types'

export const postsCollection = createCollection(
  queryCollectionOptions<unknown /* replace with type Post when available */>({
    id: 'posts-feed',
    // Treat as the full feed snapshot for this simple test
    queryKey: ['posts', 'feed'],
    queryClient: getContext().queryClient,
    queryFn: async () => {
      const res = await rpcClient.api.posts.feed.$get({
        query: { cursor: undefined, limit: '10', sortBy: 'newest' },
      })
      if (!res.ok) throw new Error('Failed to fetch posts')
      const data = await res.json()
      return data.posts
    },
    getKey: (post: any) => post.id,
    // Keep mutations out for first test. Add in Phase 4 if desired.
  })
)
```

Key notes:
- Use the feed endpoint (`rpcClient.api.posts.feed.$get`) and return `data.posts` (array).
- Provide `queryClient` to the Query adapter (via `getContext().queryClient`).
- The Query adapter interprets `queryFn` as the complete state for the collection. Returning an empty array will clear the collection. This is fine for a simple feed test.
- Use the `rpcClient` to keep type safety and follow project best practices.

#### Phase 3: Render feed with `useLiveQuery`
- [ ] Create a minimal component that uses `useLiveQuery` to read from `postsCollection`.
```tsx
// apps/web-app/src/components/posts/tanstack-db-feed.tsx
import { useLiveQuery } from '@tanstack/react-db'
import { postsCollection } from '@/db/collections/posts-collection'

export function TanstackDbFeed() {
  const { data: posts, isLoading, isError } = useLiveQuery((q) =>
    q.from({ post: postsCollection }).select(({ post }) => ({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      // Add more fields as needed
    }))
  )

  if (isLoading) return <div>Loading…</div>
  if (isError) return <div>Error loading feed</div>

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <div key={p.id} className="rounded border p-4">
          <div className="text-sm opacity-60">{new Date(p.createdAt).toLocaleString()}</div>
          <div>{p.content}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] Render this component on the feed page behind a feature flag to avoid disrupting the current implementation. Example toggle:
```tsx
// apps/web-app/src/routes/(app)/feed.tsx (or the appropriate feed route)
import { TanstackDbFeed } from '@/components/posts/tanstack-db-feed'
import { PostsFeed as ExistingFeed } from '@/components/posts/posts-feed' // existing

const useTanstackDb = import.meta.env.VITE_EXPERIMENT_TANSTACK_DB === '1'

export default function FeedRoute() {
  return useTanstackDb ? <TanstackDbFeed /> : <ExistingFeed />
}
```

#### Phase 4: (Optional) Add optimistic mutations for like/create/delete
Add mutation handlers to the collection using the Query adapter’s mutation hooks. Keep it minimal for testing (e.g., like/unlike):
```ts
// apps/web-app (or apps/admin-app)/src/db/collections/posts-collection.ts
export const postsCollection = createCollection(
  queryCollectionOptions<any>({
    id: 'posts-feed',
    queryKey: ['posts', 'feed'],
    queryClient: getContext().queryClient,
    queryFn: async () => {
      const res = await rpcClient.api.posts.feed.$get({
        query: { cursor: undefined, limit: '10', sortBy: 'newest' },
      })
      if (!res.ok) throw new Error('Failed to fetch posts')
      const data = await res.json()
      return data.posts
    },
    getKey: (post) => post.id,
    onUpdate: async ({ transaction, collection }) => {
      const mutation = transaction.mutations[0]
      const { id, ...changes } = mutation.modified
      const res = await rpcClient.api.posts[':id'].$put({
        param: { id },
        json: changes,
      })
      if (!res.ok) throw new Error('Failed to update post')
      // Optionally refetch to reconcile server state
      await collection.utils.refetch()
      return { refetch: false }
    },
  })
)
```

Example UI usage (toggling a like count optimistically):
```tsx
function LikeButton({ id, liked, likesCount }: { id: string; liked: boolean; likesCount: number }) {
  const { collection } = useLiveQuery((q) => q.from({ post: postsCollection }))
  return (
    <button
      onClick={() => {
        collection.update(id, (draft: any) => {
          draft.liked = !liked
          draft.likesCount = (likesCount ?? 0) + (liked ? -1 : 1)
        })
      }}
    >
      {liked ? 'Unlike' : 'Like'} ({likesCount ?? 0})
    </button>
  )
}
```

#### Phase 5: Feature-flag toggle and testing
- [ ] Add an env flag in `apps/web-app` (e.g., `VITE_EXPERIMENT_TANSTACK_DB=1`) and restart dev server when toggling.
- [ ] Verify basic rendering, loading, and error states.
- [ ] Confirm the full-state semantics: repeated `queryFn` responses replace collection items.
- [ ] If you enable mutations, verify optimistic UI and final reconciliation with server (refetch).

### Success Criteria
- **Feed renders** using `useLiveQuery` from `postsCollection` on the web app feed route when the feature flag is enabled.
- **No backend changes** required; all calls go through the existing `rpcClient`.
- **Project standards respected**: centralized RPC client, type-safe calls, no ad-hoc clients.
- **Optional mutations** demonstrate optimistic updates without breaking the existing feed.

### Notes and Next Steps (beyond the simple test)
- Pagination/infinite scrolling: For production, plan for paginated collections or windowed merging instead of replacing the entire state each time.
- Indexes: Use DB indexes and query-side filtering/sorting for performance once you scale.
- Cross-collection joins: You can join posts with users/organizations via live queries when needed.


