# Organization-Only Posts Implementation Roadmap

> 📝 **Living Document** - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Everything should be documented.

## Overview

Enable business accounts (organizations) to create posts without requiring a specific user ID. This allows organizations to post content that is attributed to the organization itself rather than an individual user, creating true organizational branding and content ownership. This feature supports better business account functionality and clearer content attribution in the platform.

## Implementation Progress

- [ ] Phase 1: Database Schema Updates
- [ ] Phase 2: Backend API & Logic Updates  
- [ ] Phase 3: Frontend Component Updates
- [ ] Phase 4: Permissions & Role Management
- [ ] Phase 5: Testing & Migration

## Phase Instructions

### Phase 1: Database Schema Updates
- [ ] Make `userId` nullable in posts table schema
  ```typescript
  userId: text('user_id')
    .references(() => user.id, { onDelete: 'cascade' }),
  ```
- [ ] Add `createdBy` field to track which user created organization posts
  ```typescript
  createdBy: text('created_by')
    .references(() => user.id, { onDelete: 'set null' }),
  ```
- [ ] Add database constraint ensuring either `userId` OR `organizationId` is present
  ```sql
  ALTER TABLE posts ADD CONSTRAINT posts_author_check 
  CHECK (user_id IS NOT NULL OR organization_id IS NOT NULL);
  ```
- [ ] Update database indexes to handle nullable userId
- [ ] Create migration script to populate `createdBy` field for existing posts
- [ ] Update TypeScript types for posts schema

### Phase 2: Backend API & Logic Updates
- [ ] Update `createPost` function to handle organization-only posts
  ```typescript
  // Allow userId to be null for organization posts
  export async function createPost(data: {
    userId?: string | null;
    organizationId?: string | null;
    createdBy?: string;
    // ... other fields
  })
  ```
- [ ] Update post retrieval queries to handle null userId
- [ ] Modify `getPostById` to work with organization-only posts
- [ ] Update post permission validation logic
- [ ] Add organization member role checks for post creation
- [ ] Update post ownership validation (organization members can edit org posts)
- [ ] Modify posts API endpoints to support organization posting
- [ ] Update post deletion logic for organization posts

### Phase 3: Frontend Component Updates
- [ ] Create new `useAuthor` hook that fetches user OR organization data
  ```typescript
  export const useAuthor = (userId?: string, organizationId?: string) => {
    // Logic to fetch either user or organization data
  }
  ```
- [ ] Update `PostCard` component to handle organization-only posts
- [ ] Show organization name/logo instead of user info for org posts
- [ ] Update profile links to go to organization profile for org posts
- [ ] Add "Post as Organization" toggle in new post dialog
- [ ] Update post creation form to handle organization posting
- [ ] Modify post author display logic throughout the app
- [ ] Update post ownership checks in UI (edit/delete buttons)

### Phase 4: Permissions & Role Management
- [ ] Define organization roles that can post as organization (admin, editor, etc.)
- [ ] Add role-based permission checks in post creation middleware
- [ ] Update frontend to show/hide org posting option based on user role
- [ ] Implement organization post moderation permissions
- [ ] Add audit trail for organization posts (who created what)
- [ ] Update post analytics to track organization vs personal posts
- [ ] Add organization post management UI for admins

### Phase 5: Testing & Migration
- [ ] Write unit tests for organization post creation
- [ ] Test post retrieval with mixed user/organization posts
- [ ] Test permission scenarios (who can edit/delete org posts)
- [ ] Create integration tests for organization posting workflow
- [ ] Test frontend components with organization-only posts
- [ ] Run migration on staging environment
- [ ] Validate backward compatibility with existing posts
- [ ] Performance test with large datasets
- [ ] Create rollback plan for database changes
- [ ] Document new organization posting features

## Success Criteria
- Organizations can create posts without individual user attribution
- Posts clearly show whether they're from a user or organization
- Proper permission controls prevent unauthorized organization posting
- All existing posts continue to work without issues
- UI clearly distinguishes between personal and organization posts
- Organization members with appropriate roles can manage org posts
- Analytics can differentiate between user and organization content
- Database migration completes successfully without data loss

---

## Technical Notes

### Database Constraint Strategy
The constraint `CHECK (user_id IS NOT NULL OR organization_id IS NOT NULL)` ensures every post has an author (either user or organization) while allowing pure organization posts.

### Permission Model
- Personal posts: Owned by the user who created them
- Organization posts: Owned by the organization, manageable by members with appropriate roles
- Mixed posts: Posts by users on behalf of organizations (both userId and organizationId set)

### Backward Compatibility
All existing posts have `userId` set, so they will continue to work exactly as before. The changes are purely additive for new organization-only posting capabilities.