# linkBD Posts & User Profiles Implementation Roadmap

> 📝 **Living Document** - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Everything should be documented.

## Overview
Transform the existing todo functionality into a social posts feature and add user profile viewing with search capabilities. This creates the foundation for linkBD's social networking features for the Bangladeshi diaspora community.

## Implementation Progress

- [x] Phase 1: Database Migration (Todos → Posts)
- [x] Phase 2: Backend API Updates  
- [x] Phase 3: Frontend Posts Implementation
- [x] Phase 4: User Profiles & Search
- [ ] Phase 5: Testing & Cleanup

## Phase Instructions

### Phase 1: Database Migration (Todos → Posts)
- [ ] Update database schema to rename todos table to posts
  ```typescript
  // apps/server/src/db/schema.ts
  export const posts = pgTable("posts", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  });
  ```
- [ ] Add new fields for social features (likes count, visibility)
- [ ] Create migration script to preserve existing data
- [ ] Update database indexes for efficient querying

### Phase 2: Backend API Updates
- [ ] Rename todo models to post models in `apps/server/src/models/`
  - [ ] Update `todos.ts` → `posts.ts`
  - [ ] Change all function names from `getTodos` → `getPosts`, etc.
- [ ] Update routes in `apps/server/src/routes/`
  - [ ] Rename `todos.ts` → `posts.ts`
  - [ ] Update endpoints from `/api/todos` → `/api/posts`
- [ ] Add user profile endpoints
  - [ ] Create `GET /api/users/:id` for profile viewing
- [ ] Add general search endpoint
  - [ ] Create `GET /api/search` with type and query parameters
  - [ ] Support searching users, posts, and future entities (organizations)
- [ ] Update route registration in `apps/server/src/index.ts`

### Phase 3: Frontend Posts Implementation
- [ ] Update API hooks in `apps/web-app/src/api/`
  - [ ] Rename `todos.ts` → `posts.ts`
  - [ ] Update all hook names (useTodos → usePosts)
  - [ ] Update query keys from `todos.*` to `posts.*`
- [ ] Update components in `apps/web-app/src/components/`
  - [ ] Rename `todos/` directory to `posts/`
  - [ ] Update component names and props
  - [ ] Modify UI to show posts instead of todos
- [ ] Update routes
  - [ ] Change `/todos` route to `/feed`
  - [ ] Update navigation links

### Phase 4: User Profiles & Search
- [x] Create user profile components
  - [x] `components/users/user-profile.tsx`
  - [x] `components/users/user-list-item.tsx`
  - [x] `components/posts/post-card.tsx`
- [x] Add API hooks for users
  - [x] `api/users.ts` with useUser, useSearchUsers, useSearch hooks
  - [x] `hooks/use-debounce.ts` for search optimization
- [x] Create new routes
  - [x] `/users/$userId` for profile viewing
  - [x] `/search` for comprehensive search
- [x] Add search UI in app header
- [x] Implement user profile page with posts list
- [x] Update navigation to use Feed instead of Todos
- [x] Update landing page branding for linkBD
- [x] Create PostsFeedView with feed type switching

### Phase 5: Testing & Cleanup
- [ ] Update all imports and references
- [ ] Remove any remaining todo-related code
- [ ] Test post creation, viewing, and deletion
- [ ] Test user search functionality
- [ ] Test user profile viewing
- [ ] Update documentation and comments
- [ ] Run linting and type checking

## Success Criteria
- All existing todo data successfully migrated to posts
- Users can create, view, and delete posts
- Users can search for other users by name or email
- Users can view other users' profiles and their posts
- No breaking changes for existing users
- All tests passing and no type errors