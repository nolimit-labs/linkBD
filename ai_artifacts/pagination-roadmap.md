# Pagination Implementation Roadmap
**Feature:** Implement pagination for posts feed  
**Priority:** High  
**Estimated Timeline:** 1-2 weeks  

## Overview
Implement efficient pagination for the posts feed to improve performance and user experience with large datasets.

## Current State Analysis

### ✅ What We Have
- `getPublicPosts(limit, offset)` function with basic pagination parameters
- Organization imageKey now included in author data for proper URLs
- Frontend posts feed component displaying all posts

### ❌ What's Missing
- Frontend pagination controls (next/prev buttons, page numbers)
- Cursor-based pagination for better performance
- Loading states during pagination
- URL state management for page navigation
- "Load more" infinite scroll option

## Phase 1: Backend Pagination Enhancement (Week 1)

### 1.1 Improve getPublicPosts Function
- [ ] Add total count return for pagination metadata
- [ ] Implement cursor-based pagination option
- [ ] Add sort options (newest, oldest, most liked)
- [ ] Optimize query performance with proper indexing

### 1.2 Backend API Updates
```typescript
// Enhanced response format
{
  posts: Post[],
  pagination: {
    total: number,
    page: number,
    limit: number,
    hasNext: boolean,
    hasPrev: boolean,
    totalPages: number
  }
}
```

### 1.3 Database Optimization
- [ ] Add database indexes for `createdAt` and `visibility` columns
- [ ] Consider composite indexes for better query performance
- [ ] Analyze query execution plans

## Phase 2: Frontend Pagination Components (Week 2)

### 2.1 Pagination Hook
- [ ] Create `usePaginatedPosts` hook
- [ ] Handle loading states and error handling
- [ ] Implement caching for previously loaded pages
- [ ] Add optimistic updates for better UX

### 2.2 UI Components
- [ ] Create `PaginationControls` component
- [ ] Add "Load More" button for infinite scroll
- [ ] Implement page number navigation
- [ ] Add loading skeletons for posts

### 2.3 URL State Management
- [ ] Sync pagination state with URL parameters
- [ ] Handle browser back/forward navigation
- [ ] Preserve page state on refresh

## Implementation Options

### Option A: Traditional Page-Based Pagination
```typescript
// URL: /feed?page=2&limit=20
interface PaginationState {
  page: number;
  limit: number;
  total: number;
}
```

**Pros:**
- Simple to implement
- Users can jump to any page
- Easy to bookmark specific pages

**Cons:**
- Performance degrades with high offset values
- Data consistency issues with new posts

### Option B: Cursor-Based Pagination
```typescript
// URL: /feed?cursor=2024-01-15T10:30:00Z&limit=20
interface CursorPaginationState {
  cursor: string; // timestamp or ID
  limit: number;
  hasNext: boolean;
}
```

**Pros:**
- Better performance for large datasets
- Consistent results (no duplicates/gaps)
- Scales well

**Cons:**
- Can't jump to arbitrary pages
- More complex implementation

### Option C: Infinite Scroll
```typescript
// Load more posts as user scrolls
interface InfiniteScrollState {
  posts: Post[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}
```

**Pros:**
- Great mobile UX
- Continuous browsing experience
- No pagination controls needed

**Cons:**
- Harder to find specific posts
- Performance issues with many loaded posts
- No URL state for deep linking

## Recommended Approach: Hybrid Solution

Implement both cursor-based pagination (for performance) with page-like UX:

```typescript
// Backend: Cursor-based for efficiency
export async function getPublicPosts(options: {
  limit?: number;
  cursor?: string; // timestamp
  direction?: 'before' | 'after';
}) {
  // Implementation details...
}

// Frontend: Page-like UX with cursor under the hood
const usePaginatedPosts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [cursors, setCursors] = useState<Map<number, string>>();
  // Implementation details...
}
```

## Technical Implementation

### Backend Changes

#### 1. Enhanced getPublicPosts Function
```typescript
export async function getPublicPosts(options: {
  limit?: number;
  cursor?: string;
  direction?: 'before' | 'after';
}) {
  const limit = options.limit || 20;
  
  let query = db
    .select({
      // ... existing fields
    })
    .from(posts)
    .leftJoin(user, eq(posts.userId, user.id))
    .leftJoin(organization, eq(posts.organizationId, organization.id))
    .where(eq(posts.visibility, 'public'));
  
  if (options.cursor) {
    const cursorDate = new Date(options.cursor);
    if (options.direction === 'before') {
      query = query.where(gt(posts.createdAt, cursorDate));
    } else {
      query = query.where(lt(posts.createdAt, cursorDate));
    }
  }
  
  const results = await query
    .orderBy(desc(posts.createdAt))
    .limit(limit + 1); // +1 to check if there are more
    
  const posts = results.slice(0, limit);
  const hasMore = results.length > limit;
  
  return {
    posts,
    hasMore,
    nextCursor: posts.length > 0 ? posts[posts.length - 1].createdAt : null
  };
}
```

#### 2. Updated API Route
```typescript
// GET /api/posts?cursor=2024-01-15T10:30:00Z&limit=20
.get('/', authMiddleware, zValidator('query', z.object({
  cursor: z.string().optional(),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
})), async (c) => {
  const { cursor, limit } = c.req.valid('query');
  
  const result = await postModel.getPublicPosts({
    cursor,
    limit,
    direction: 'after'
  });
  
  return c.json(result);
});
```

### Frontend Changes

#### 1. Pagination Hook
```typescript
export const usePaginatedPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursors, setCursors] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadPage = async (pageIndex: number) => {
    setIsLoading(true);
    try {
      const cursor = cursors[pageIndex];
      const response = await rpcClient.api.posts.$get({
        query: { cursor, limit: '20' }
      });
      
      const data = await response.json();
      
      // Update state...
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    posts,
    currentPage,
    isLoading,
    hasNext: cursors.length > currentPage + 1,
    hasPrev: currentPage > 0,
    nextPage: () => loadPage(currentPage + 1),
    prevPage: () => loadPage(currentPage - 1),
    goToPage: (page: number) => loadPage(page)
  };
};
```

#### 2. Pagination Components
```tsx
export function PaginationControls({ 
  currentPage, 
  hasNext, 
  hasPrev, 
  onNext, 
  onPrev,
  isLoading 
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <Button 
        variant="outline" 
        onClick={onPrev} 
        disabled={!hasPrev || isLoading}
      >
        Previous
      </Button>
      
      <span className="text-sm text-muted-foreground">
        Page {currentPage + 1}
      </span>
      
      <Button 
        variant="outline" 
        onClick={onNext} 
        disabled={!hasNext || isLoading}
      >
        Next
      </Button>
    </div>
  );
}
```

## Performance Considerations

### Database Indexes
```sql
-- Essential indexes for pagination
CREATE INDEX idx_posts_visibility_created_at ON posts(visibility, created_at DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Composite index for filtered queries
CREATE INDEX idx_posts_visibility_user_created_at ON posts(visibility, user_id, created_at DESC);
```

### Caching Strategy
- Cache paginated results for 5-10 minutes
- Invalidate cache on new post creation
- Use cursor-based cache keys for consistency

### Bundle Size Optimization
- Lazy load pagination components
- Use virtual scrolling for large lists
- Implement image lazy loading

## Testing Strategy

### Backend Tests
- [ ] Test pagination with various cursor values
- [ ] Test edge cases (empty results, invalid cursors)
- [ ] Performance tests with large datasets
- [ ] Test concurrent post creation scenarios

### Frontend Tests
- [ ] Test pagination navigation
- [ ] Test URL state synchronization
- [ ] Test loading states and error handling
- [ ] Test infinite scroll behavior

## Success Metrics
- [ ] Page load time < 1 second
- [ ] Database query time < 100ms
- [ ] User engagement with paginated content
- [ ] Reduced server load from inefficient queries

## Migration Plan

### Phase 1: Backend Only
1. Deploy enhanced `getPublicPosts` function
2. Maintain backward compatibility
3. Add new cursor-based endpoints

### Phase 2: Frontend Migration
1. Replace existing posts hook with paginated version
2. Add pagination controls
3. Test thoroughly before rollout

### Phase 3: Optimization
1. Remove old pagination code
2. Add performance monitoring
3. Optimize based on usage patterns

## Future Enhancements
- [ ] Real-time updates with WebSocket
- [ ] Infinite scroll option toggle
- [ ] Advanced filtering (by author, date range)
- [ ] Search within paginated results
- [ ] Export pagination utilities for other lists