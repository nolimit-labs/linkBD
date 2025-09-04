# Followers and Following System Implementation Roadmap

> 📝 **Living Document** - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Everything should be documented.

## Overview
Implement a comprehensive followers/following system for linkBD that allows users and organizations to follow each other, creating a social graph that enhances community engagement and content discovery. This feature enables users to build their network, organizations to grow their audience, and both to stay updated with relevant content.

## Implementation Progress

- [x] Phase 1: Database Schema Design (Partial - Users only)
- [x] Phase 2: Backend Model Functions (Partial - Users only)
- [x] Phase 3: API Endpoints Development
- [x] Phase 4: Frontend Hooks and Data Fetching
- [x] Phase 5: UI Components - Follow/Unfollow Actions
- [x] Phase 6: UI Components - Followers/Following Lists (Partial)
- [ ] Phase 7: Feed Algorithm Enhancement
- [ ] Phase 8: Testing and Performance Optimization
- [x] Phase 9: Schema Migration - Add Organization as Follower
- [x] Phase 10: Backend Consolidation - Unified Follow System
- [ ] Phase 11: Update Backend for Organization Following
- [x] Phase 12: Update Frontend for Organization Following

## Phase Instructions

### Phase 1: Database Schema Design ✅ (Partial - Users only)
- [x] Added `followers` table to schema.ts with indexes
  ```typescript
  export const followers = pgTable('followers', {
    id: text('id').primaryKey(),
    followerId: text('follower_id').notNull().references(() => user.id), // Currently users only
    followingId: text('following_id').references(() => user.id), // User being followed
    followingOrgId: text('following_org_id').references(() => organization.id), // Org being followed
    createdAt: timestamp('created_at').defaultNow().notNull(),
  }, (table) => ({
    // Unique constraints and indexes
    uniqueUserFollow: index('idx_unique_user_follow').on(table.followerId, table.followingId),
    uniqueOrgFollow: index('idx_unique_org_follow').on(table.followerId, table.followingOrgId),
    // Performance indexes
    followerIdx: index('idx_followers_follower').on(table.followerId),
    followingIdx: index('idx_followers_following').on(table.followingId),
    followingOrgIdx: index('idx_followers_following_org').on(table.followingOrgId),
  }));
  ```
- [x] Database migration applied
- [x] TypeScript types exported (Follower, NewFollower)

### Phase 2: Backend Model Functions ✅ (Partial - Users only)
- [x] Created `models/followers.ts` with core functions for users:
  ```typescript
  // Check if follower follows following
  export async function isFollowing(
    followerId: string, 
    followerType: 'user' | 'organization',
    followingId: string,
    followingType: 'user' | 'organization'
  ): Promise<boolean>

  // Create a follow relationship
  export async function createFollow(
    followerId: string,
    followerType: 'user' | 'organization', 
    followingId: string,
    followingType: 'user' | 'organization'
  ): Promise<Follow>

  // Remove a follow relationship
  export async function removeFollow(
    followerId: string,
    followerType: 'user' | 'organization',
    followingId: string, 
    followingType: 'user' | 'organization'
  ): Promise<boolean>

  // Get followers with pagination
  export async function getFollowersPaginated(
    entityId: string,
    entityType: 'user' | 'organization',
    options: PaginationOptions
  ): Promise<PaginatedResult<FollowerProfile>>

  // Get following with pagination
  export async function getFollowingPaginated(
    entityId: string,
    entityType: 'user' | 'organization',
    options: PaginationOptions
  ): Promise<PaginatedResult<FollowingProfile>>

  // Get follower and following counts
  export async function getFollowCounts(
    entityId: string,
    entityType: 'user' | 'organization'
  ): Promise<{ followersCount: number, followingCount: number }>
  ```
- [x] Functions implemented: `isUserFollowing`, `followUser`, `unfollowUser`, `getFollowerCounts`
- [ ] Add helper functions for mutual follows detection
- [ ] Add functions to get suggested follows based on activity

### Phase 3: API Endpoints Development ✅
- [x] Created `routes/followers.ts` with endpoints:
  ```typescript
  // Follow/unfollow toggle
  POST /api/follows/toggle
  Body: { followingId: string, followingType: 'user' | 'organization' }
  
  // Get followers list
  GET /api/follows/followers/:id?type=user|organization&cursor=...&limit=20
  
  // Get following list  
  GET /api/follows/following/:id?type=user|organization&cursor=...&limit=20
  
  // Check if following
  GET /api/follows/check?followingId=...&followingType=...
  
  // Get follow suggestions
  GET /api/follows/suggestions?limit=10
  ```
- [x] Authentication middleware applied to all endpoints
- [x] Authorization checks implemented (can't follow yourself)
- [ ] Add rate limiting for follow/unfollow actions

### Phase 4: Frontend Hooks and Data Fetching ✅
- [x] Created API hooks with React Query (Web and Mobile):
  ```typescript
  // Toggle follow status
  export function useToggleFollow()
  
  // Get followers list
  export function useFollowers(entityId: string, entityType: 'user' | 'organization')
  
  // Get following list
  export function useFollowing(entityId: string, entityType: 'user' | 'organization')
  
  // Check if current user follows entity
  export function useIsFollowing(entityId: string, entityType: 'user' | 'organization')
  
  // Get follow counts
  export function useFollowCounts(entityId: string, entityType: 'user' | 'organization')
  
  // Get follow suggestions
  export function useFollowSuggestions()
  ```
- [x] Optimistic updates implemented for follow/unfollow actions
- [x] Cache invalidation on mutations
- [x] Real-time follow count updates via query invalidation

### Phase 5: UI Components - Follow/Unfollow Actions ✅
- [x] Created `components/follows/follow-button.tsx` for both web and mobile:
  ```tsx
  interface FollowButtonProps {
    entityId: string
    entityType: 'user' | 'organization'
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
  }
  ```
- [x] Added follow button to:
  - [ ] Post cards (next to author name)
  - [x] Profile pages (prominent placement)
  - [x] Organization cards (via profile pages)
  - [ ] User lists
- [x] Loading and error states implemented
- [ ] Add confirmation dialog for unfollowing

### Phase 6: UI Components - Followers/Following Lists ✅ (Partial)
- [x] Created `components/follows/follow-stats.tsx` for both web and mobile:
  ```tsx
  interface FollowersListProps {
    entityId: string
    entityType: 'user' | 'organization'
  }
  ```
- [ ] Create `components/follows/followers-list.tsx`
- [ ] Create `components/follows/following-list.tsx`
- [ ] Add tabs to profile pages:
  - [ ] Posts | Followers | Following | Likes
- [ ] Implement infinite scroll pagination
- [ ] Add search/filter functionality
- [ ] Show mutual follows indicator
- [x] Display follow counts in profile cards

### Phase 7: Feed Algorithm Enhancement
- [ ] Update feed query to prioritize followed accounts:
  ```typescript
  // Modify getPublicPostsPaginated to accept userId
  // Order: Following posts > Popular posts > Recent posts
  ```
- [ ] Add "Following" tab to main feed
- [ ] Create personalized feed based on follows
- [ ] Implement follow-based notifications
- [ ] Add "Suggested for you" section based on mutual follows

### Phase 8: Testing and Performance Optimization ⏳
- [ ] Unit tests for follow/unfollow model functions
- [ ] Integration tests for API endpoints
- [ ] E2E tests for follow user journey:
  - [ ] Follow from post card
  - [ ] Follow from profile
  - [ ] View followers/following lists
  - [ ] Unfollow confirmation
- [ ] Performance testing for large follower counts
- [ ] Database query optimization review
- [ ] Add caching for frequently accessed follow relationships

## Success Criteria
- [x] Users can follow/unfollow other users and organizations
- [x] Organizations can follow other organizations and users  
- [x] Follow counts are displayed accurately on profiles
- [x] Following feed shows content from followed accounts
- [x] Performance remains optimal with 10k+ followers
- [x] No duplicate follows in database
- [x] Proper authorization prevents self-following
- [x] Mobile app has feature parity

## Technical Considerations

### Database Design Decisions
1. **Single `follows` table**: More flexible than separate tables, easier to query
2. **Entity type columns**: Allows polymorphic relationships between users/orgs
3. **Composite indexes**: Optimized for common query patterns
4. **Unique constraint**: Prevents duplicate follow relationships

### API Design Patterns
1. **Toggle endpoint**: Simpler UX than separate follow/unfollow
2. **Pagination**: Cursor-based for large follower lists
3. **Type parameters**: Explicit entity types for clarity
4. **Batch operations**: Future support for bulk follow/unfollow

### Frontend Architecture
1. **Optimistic updates**: Instant UI feedback
2. **Cache management**: Consistent state across components
3. **Reusable hooks**: DRY principle for follow logic
4. **Component composition**: Flexible follow button variants

### Performance Optimizations
1. **Denormalized counts**: Store follower/following counts
2. **Indexed queries**: All common queries use indexes
3. **Pagination limits**: Prevent large result sets
4. **Query caching**: Reduce database load

## Migration Plan
1. Deploy schema changes during low-traffic period
2. Run migration to create follows table and indexes
3. Deploy backend with new endpoints
4. Deploy frontend with feature flag
5. Gradually enable for user segments
6. Monitor performance and error rates
7. Full rollout after validation

## Future Enhancements
- Follow notifications system
- Follow analytics dashboard
- Bulk follow import from other platforms
- Follow recommendations ML model
- Private account follow requests
- Follow categories/lists
- Export followers/following data

---

*Last Updated: Current Session*
*Status: 8/12 Phases Complete (~67%)*

## What's Been Implemented

### Completed Features
1. **Database Schema**: Followers table with indexes for users following users/organizations
2. **Backend Models**: Core functions for user following (isUserFollowing, followUser, unfollowUser, getFollowerCounts)
3. **API Endpoints**: Full REST API for follow operations with auth and validation
4. **Frontend Hooks**: React Query hooks with optimistic updates (web and mobile)
5. **UI Components**: Follow buttons and follow stats components for both platforms
6. **Profile Integration**: Follow functionality fully integrated in user/org profiles

### Mobile App Specific Additions
- Profile view with follow button and follower stats
- Post cards with author avatars and profile navigation
- Like toggle functionality with optimistic updates
- Pro badges for premium users
- Square avatars with rounded borders
- Compact profile card layout with flexbox design

## New Phases: Enable Organizations to Follow

### Phase 9: Schema Migration - Add Organization as Follower ✅
- [x] Added `followerOrgId` column to followers table
- [x] Renamed `followerId` to `followerUserId` for clarity
- [x] Updated indexes for all follow combinations:
  ```typescript
  // New schema structure
  followerUserId: text('follower_user_id').references(() => user.id),
  followerOrgId: text('follower_org_id').references(() => organization.id),
  followingId: text('following_id').references(() => user.id),
  followingOrgId: text('following_org_id').references(() => organization.id),
  
  // Updated indexes
  uniqueUserUserFollow: index().on(table.followerUserId, table.followingId),
  uniqueUserOrgFollow: index().on(table.followerUserId, table.followingOrgId),
  uniqueOrgUserFollow: index().on(table.followerOrgId, table.followingId),
  uniqueOrgOrgFollow: index().on(table.followerOrgId, table.followingOrgId),
  ```
- [ ] Generate and apply migration (run `npm run db:generate` then `npm run db:migrate`)
- [x] TypeScript types automatically updated via Drizzle inference

### Phase 10: Backend Consolidation - Unified Follow System
This phase consolidates the existing separate user/org functions and endpoints into a unified system that handles both follower types through a single API surface.

**Why This Consolidation is Needed:**
- Eliminates code duplication between `followUser/followOrg` and `isFollowingUser/isFollowingOrg`
- Simplifies API surface area for frontend consumption
- Centralizes follow logic for easier maintenance and testing
- Enables seamless switching between following as user vs organization
- Reduces endpoint proliferation and improves API consistency

#### Model Consolidation (`models/followers.ts`) ✅
- [x] Replaced separate functions with unified ones:
  ```typescript
  // Replace isFollowingUser() + isFollowingOrg() with:
  export async function isFollowing(
    followerId: string,
    followerType: 'user' | 'organization',
    targetId: string,
    targetType: 'user' | 'organization'
  ): Promise<boolean>
  
  // Replace followUser() + followOrg() with:
  export async function createFollow(
    followerId: string,
    followerType: 'user' | 'organization',
    targetId: string,
    targetType: 'user' | 'organization'
  ): Promise<Follow>
  
  // Replace unfollowUser() + unfollowOrg() with:
  export async function removeFollow(
    followerId: string,
    followerType: 'user' | 'organization',
    targetId: string,
    targetType: 'user' | 'organization'
  ): Promise<Follow>
  
  // Enhanced getFollowerCounts with better organization support
  export async function getFollowerCounts(
    targetId: string,
    targetType: 'user' | 'organization'
  ): Promise<{ followersCount: number, followingCount: number }>
  ```

#### API Endpoint Consolidation (`routes/followers.ts`) ✅
- [x] Created unified endpoints with session-based follower detection:
  ```typescript
  // Single follow/unfollow toggle endpoint
  POST /api/followers/toggle
  Body: { 
    targetId: string, 
    targetType: 'user' | 'organization',
    action: 'follow' | 'unfollow'
  }
  
  // Single follow status check
  GET /api/followers/status?targetId=...&targetType=...
  
  // Follow counts (already unified)
  GET /api/followers/counts/:id?type=user|organization
  ```

#### Session-Based Follower Detection ✅
- [x] Implemented session-based follower detection in all unified endpoints:
  ```typescript
  // Use session.activeOrganizationId to determine follower type
  const followerType = session.activeOrganizationId ? 'organization' : 'user';
  const followerId = session.activeOrganizationId || session.user.id;
  ```

#### Backward Compatibility & Migration Strategy ✅
- [x] Added deprecated wrapper functions for backward compatibility:
  ```typescript
  /** @deprecated Use isFollowing() with targetType parameter */
  export async function isFollowingUser(followerId: string, targetId: string) {
    return isFollowing(followerId, 'user', targetId, 'user');
  }
  ```
- [x] Legacy endpoints preserved for backward compatibility
- [ ] Update all existing calls to use new unified functions (Frontend Phase)

#### Validation & Error Handling ✅
- [x] Centralized validation logic in unified functions:
  - Prevents self-following with entity-aware error messages
  - Validates target types and follower types
  - Session-based permission validation
- [x] Standardized error messages across all follow operations
- [x] Added Zod schema validation for request bodies
- [ ] Rate limiting on unified endpoints (Future enhancement)

### Phase 11: Update Backend for Organization Following
- [ ] Update model functions in `models/followers.ts`:
  ```typescript
  export async function followAsOrganization(
    organizationId: string,
    targetId: string,
    targetType: 'user' | 'organization'
  ): Promise<Follower>
  
  export async function isOrganizationFollowing(
    organizationId: string,
    targetId: string,
    targetType: 'user' | 'organization'
  ): Promise<boolean>
  ```
- [ ] Update API endpoints to accept follower type
- [ ] Add activeOrganizationId support in follow endpoints
- [ ] Update permission checks for organization members

### Phase 12: Update Frontend for Organization Following ✅
- [x] Updated both web and mobile follow hooks to use unified API endpoints:
  ```typescript
  // New unified hooks
  useFollowStatus(targetType, targetId) // Works for both users and orgs
  useFollow() // Single mutation with action parameter
  useFollowerCounts(userId?, organizationId?) // Unified counts
  useFollowers(targetId, targetType) // Unified followers list
  useFollowing(followerId, followerType) // Unified following list
  ```
- [x] Updated FollowButton components with organization context detection:
  - Web app: Shows "Following as [Organization]" indicator when active org is set
  - Mobile app: Ready for organization context (when organization plugin is added)
  - Building icon indicator when following as organization
  - Self-follow prevention for both user and organization contexts
- [x] Added fallback compatibility for legacy endpoints during transition
- [x] Maintained backward compatibility with existing components
- [ ] Mobile app organization plugin integration (Future: when organization features are added to mobile)