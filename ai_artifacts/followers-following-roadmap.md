# Followers and Following System Implementation Roadmap

> 📝 **Living Document** - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Everything should be documented.

## Overview
Implement a comprehensive followers/following system for linkBD that allows users and organizations to follow each other, creating a social graph that enhances community engagement and content discovery. This feature enables users to build their network, organizations to grow their audience, and both to stay updated with relevant content.

## Implementation Progress

- [ ] Phase 1: Database Schema Design
- [ ] Phase 2: Backend Model Functions  
- [ ] Phase 3: API Endpoints Development
- [ ] Phase 4: Frontend Hooks and Data Fetching
- [ ] Phase 5: UI Components - Follow/Unfollow Actions
- [ ] Phase 6: UI Components - Followers/Following Lists
- [ ] Phase 7: Feed Algorithm Enhancement
- [ ] Phase 8: Testing and Performance Optimization

## Phase Instructions

### Phase 1: Database Schema Design
- [ ] Add `follows` table to schema.ts with proper indexes
  ```typescript
  export const follows = pgTable('follows', {
    id: text('id').primaryKey(),
    followerId: text('follower_id').notNull(), // user.id or organization.id
    followerType: text('follower_type').notNull(), // 'user' or 'organization'
    followingId: text('following_id').notNull(), // user.id or organization.id
    followingType: text('following_type').notNull(), // 'user' or 'organization'
    createdAt: timestamp('created_at').defaultNow().notNull(),
  }, (table) => ({
    // Unique constraint to prevent duplicate follows
    uniqueFollow: unique().on(table.followerId, table.followerType, table.followingId, table.followingType),
    // Performance indexes
    followerIdx: index('idx_follows_follower').on(table.followerId, table.followerType),
    followingIdx: index('idx_follows_following').on(table.followingId, table.followingType),
    createdAtIdx: index('idx_follows_created_at').on(table.createdAt.desc()),
  }));
  ```
- [ ] Add follower/following counts to user and organization profile queries
- [ ] Generate and apply database migration
- [ ] Export TypeScript types for Follow, NewFollow

### Phase 2: Backend Model Functions
- [ ] Create `models/follows.ts` with core functions:
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
- [ ] Add helper functions for mutual follows detection
- [ ] Add functions to get suggested follows based on activity

### Phase 3: API Endpoints Development
- [ ] Create `routes/follows.ts` with endpoints:
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
- [ ] Add authentication middleware to all endpoints
- [ ] Implement proper authorization (can't follow yourself/your own org)
- [ ] Add rate limiting for follow/unfollow actions

### Phase 4: Frontend Hooks and Data Fetching
- [ ] Create `api/follows.ts` with React Query hooks:
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
- [ ] Add optimistic updates for follow/unfollow actions
- [ ] Implement proper cache invalidation
- [ ] Add real-time follow count updates

### Phase 5: UI Components - Follow/Unfollow Actions
- [ ] Create `components/follows/follow-button.tsx`:
  ```tsx
  interface FollowButtonProps {
    entityId: string
    entityType: 'user' | 'organization'
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
  }
  ```
- [ ] Add follow button to:
  - [ ] Post cards (next to author name)
  - [ ] Profile pages (prominent placement)
  - [ ] Organization cards
  - [ ] User lists
- [ ] Implement loading and error states
- [ ] Add confirmation dialog for unfollowing

### Phase 6: UI Components - Followers/Following Lists
- [ ] Create `components/follows/followers-list.tsx`:
  ```tsx
  interface FollowersListProps {
    entityId: string
    entityType: 'user' | 'organization'
  }
  ```
- [ ] Create `components/follows/following-list.tsx`
- [ ] Add tabs to profile pages:
  - [ ] Posts | Followers | Following | Likes
- [ ] Implement infinite scroll pagination
- [ ] Add search/filter functionality
- [ ] Show mutual follows indicator
- [ ] Display follow counts in profile card

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

### Phase 8: Testing and Performance Optimization
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
*Status: 0/8 Phases Complete (0%)*