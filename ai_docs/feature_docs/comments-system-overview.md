# Comments System - Architecture and Flow (Living Document)

This document explains how comments work across the stack: database schema, server/API, web client, and mobile app. It also covers replies handling and concise improvements. Update this as implementations evolve.

## Schema (Drizzle / PostgreSQL)
- Table: `comments`
  - Fields: `id`, `postId`, `parentId` (nullable), `userId` (nullable), `organizationId` (nullable), `content`, `isEdited`, `createdAt`, `updatedAt`.
  - Replies are represented by `parentId` → `comments.id` (cascade delete).
- Performance indexes (examples):
  - `idx_comments_post_created_at` on `(postId, createdAt desc)` for top-level comments
  - `idx_comments_parent_created_at` on `(parentId, createdAt desc)` for replies
- Author is polymorphic (user or organization) and resolved on the server.

## Server / API (Hono)
- Models: `apps/server/src/models/comments.ts`
  - `getPostComments(postId, limit, cursor)`: top-level comments (parentId IS NULL) with computed `repliesCount` (subquery). Cursor pagination by `createdAt`.
  - `getCommentReplies(commentId, limit, cursor)`: replies for a comment, cursor pagination by `createdAt`.
  - `getCommentById(commentId)`: single comment with resolved author info.
  - Write ops: `createComment(postId, content, authorId, authorType, parentId?)`, `updateComment`, `deleteComment`.
- Routes: `apps/server/src/routes/posts.ts` (comments section)
  - `GET /api/posts/:id/comments` → top-level comments + `repliesCount`
  - `POST /api/posts/:id/comments` → create comment (optional `parentId` for replies)
  - `GET /api/posts/:postId/comments/:commentId/replies` → replies list
  - `PUT /api/posts/:postId/comments/:commentId`, `DELETE /api/posts/:postId/comments/:commentId`
- Auth: Better Auth; routes determine author (user or active organization) from session.

## Web Client (apps/web-app)
- Hooks: `apps/web-app/src/api/comments.ts`
  - Queries: `usePostComments(postId)` and `useCommentReplies(postId, commentId)` (TanStack Query infinite).
  - Mutations: `useCreateComment`, `useUpdateComment`, `useDeleteComment` with cache invalidations:
    - Top-level creation → invalidate post comments
    - Reply creation → invalidate replies for that `parentId`
    - Update/Delete → update or invalidate post comments
- Threaded UI:
  - `components/comments/comment-list.tsx`: top-level list.
  - `components/comments/comment-thread.tsx`: recursive thread with inline replies, reply editor, show/hide.
  - `components/comments/comment-input.tsx`: composer.

## Mobile App (apps/mobile-app)
- Hooks: `apps/mobile-app/api/comments.ts` mirror web hooks/endpoints.
- Reusable list: `components/comments/comments-list.tsx`
  - Presentational `FlatList` rendering `CommentCard`s, accepts a `header`, supports infinite scroll, and exposes `onItemPress`/`onReplyPress`.
- Comment card: `components/comments/comment-card.tsx`
  - Matches `PostCard` header style; bottom action bar (Like visual + Reply; no Share).
  - For dark mode emphasis, override usage with `border border-border bg-card/80 dark:bg-card/60` if needed.
- Screens:
  - Post detail: `app/(app)/posts/[id].tsx`
    - Renders `PostCard` + `CommentsList` for top-level comments.
    - Tapping a comment or Reply navigates to dedicated comment thread route.
  - Comment thread: `app/(app)/posts/[postId]/comments/[commentId].tsx`
    - Supplies a header (parent `CommentCard` + “Replies (N)”) to `CommentsList`.
    - Sticky bottom `CommentInput` with “Replying to {name}”.
    - To handle deep replies not yet in cache, route accepts a serialized `root` comment param; screen decodes it when needed.

## Replies Handling
- Top-level comments: `parentId IS NULL`.
- Replies: `parentId = <comment.id>`.
- Web: inline recursive rendering (expand/collapse).
- Mobile: always navigates to a dedicated comment thread screen; no inline nesting.
- Server: returns `repliesCount` for top-level; replies are paginated per parent.

## Caching & Invalidation
- TanStack Query infinite queries for both top-level and replies on web and mobile.
- Invalidation summary:
  - Create top-level → invalidate `comments.byPost(postId)`
  - Create reply → invalidate `comments.replies(parentId)`
  - Update/Delete → update/invalidate `comments.byPost(postId)`
- Query keys are scoped by `postId` and `commentId` for stable caching.

## File References ("@comments.ts")
- Server models: `apps/server/src/models/comments.ts`
- Web hooks: `apps/web-app/src/api/comments.ts`
- Mobile hooks: `apps/mobile-app/api/comments.ts`

## Concise Improvements
- Add `GET /api/comments/:id/thread` to return a single comment with ancestor path + initial replies page (removes need to serialize `root`).
- Add `repliesPreview` (first 1–2) to `GET /api/posts/:id/comments` for faster discovery.
- Implement comment reactions/likes with counts + indexes.
- Optimistically increment `repliesCount` on reply create; roll back on error.
- Share query key utilities across web/mobile for consistency.
