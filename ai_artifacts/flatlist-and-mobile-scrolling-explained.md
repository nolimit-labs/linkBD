# FlatList and Mobile Scrolling in React Native - Explained

## What is FlatList?

FlatList is React Native's optimized component for rendering long, scrollable lists of data. It's a "virtualized list" - meaning it only renders the items currently visible on screen (plus a small buffer), rather than rendering all items at once.

Think of it like this:
- **Regular ScrollView**: Renders ALL 1000 items immediately (slow, memory-intensive)
- **FlatList**: Only renders ~10 visible items + buffer, swaps them as you scroll (fast, efficient)

## How FlatList Works in Our Code

### 1. Basic Structure (from `feed.tsx`)
```jsx
<FlatList
  data={posts}                    // Array of items to display
  renderItem={renderPost}         // Function to render each item
  keyExtractor={(item) => item.id} // Unique key for each item
  onEndReached={handleLoadMore}    // Called when scrolling near bottom
  onEndReachedThreshold={0.5}      // Trigger at 50% from bottom
  refreshControl={...}              // Pull-to-refresh functionality
  ListEmptyComponent={...}         // What to show when no data
  ListFooterComponent={...}        // Loading indicator at bottom
/>
```

### 2. Infinite Scrolling Implementation

Our `InfinitePostsView` component handles infinite scrolling:

```jsx
// When user scrolls near the bottom
const onEndReached = useCallback(() => {
  if (hasNextPage && !isFetchingNextPage) {
    fetchNextPage(); // Load more posts
  }
}, [hasNextPage, isFetchingNextPage, fetchNextPage]);
```

**Flow:**
1. User scrolls down → reaches threshold (50% from bottom)
2. `onEndReached` fires → checks if more pages exist
3. Calls `fetchNextPage()` → loads next batch from API
4. New posts append to list → user continues scrolling

### 3. Pull-to-Refresh

```jsx
<RefreshControl
  refreshing={refreshing}
  onRefresh={onRefresh}  // Refetch all data from beginning
/>
```

User pulls down → triggers refresh → reloads first page of data

## The Duplicate Key Warning - What Happened?

```
ERROR: Encountered two children with the same key
```

### Why it happened:
1. Backend might return same post in multiple pages (pagination overlap)
2. When flattening pages: `[page1, page2, page3]` → single array
3. Duplicate posts = duplicate keys = React warning

### Our Fix:
```jsx
// Deduplicate posts by ID
const posts = React.useMemo(() => {
  const allPosts = data?.pages.flatMap((page) => page.posts) || [];
  // Create Map with post.id as key - automatically removes duplicates
  const uniquePosts = Array.from(
    new Map(allPosts.map(post => [post.id, post])).values()
  );
  return uniquePosts;
}, [data]);
```

## The Nested VirtualizedList Warning - What Happened?

```
ERROR: VirtualizedLists should never be nested inside plain ScrollViews
```

### Why this is bad:
```jsx
// ❌ BAD - Nested virtualized lists
<ScrollView>
  <ProfileHeader />
  <FlatList data={posts} />  // FlatList inside ScrollView!
</ScrollView>
```

**Problems:**
1. **Broken virtualization**: FlatList can't calculate visible items correctly
2. **Performance issues**: Might render ALL items, defeating the purpose
3. **Scroll conflicts**: Two scrollable containers fight for control

### Our Fix:
```jsx
// ✅ GOOD - Single FlatList with header
<FlatList
  data={posts}
  ListHeaderComponent={<ProfileHeader />}  // Header as part of FlatList
  // ... other props
/>
```

Now everything is ONE scrollable list - header scrolls with content!

## Key Concepts Summary

### FlatList Props We Use:

| Prop | Purpose | Example |
|------|---------|---------|
| `data` | Array of items to render | `posts` array |
| `renderItem` | Function to render each item | `({ item }) => <PostCard post={item} />` |
| `keyExtractor` | Unique key for each item | `(item) => item.id` |
| `onEndReached` | Infinite scroll trigger | Load more posts |
| `onEndReachedThreshold` | When to trigger (0-1) | `0.5` = 50% from bottom |
| `ListHeaderComponent` | Fixed header in list | Profile info |
| `ListFooterComponent` | Footer (loading indicator) | Activity spinner |
| `ListEmptyComponent` | Empty state | "No posts yet" |
| `refreshControl` | Pull-to-refresh | Reload data |

### Performance Benefits:

1. **Memory efficient**: Only ~10-20 items in memory vs 1000s
2. **Fast initial render**: Instant display vs waiting for all items
3. **Smooth scrolling**: Native optimization for 60fps
4. **Lazy loading**: Load more data as needed

### Rules to Remember:

1. **Never nest FlatList inside ScrollView** - Use `ListHeaderComponent` instead
2. **Always provide unique keys** - Prevents React warnings and bugs
3. **Deduplicate data when needed** - Avoid duplicate key errors
4. **Use `onEndReachedThreshold` wisely** - Too low = late loading, too high = too eager

## Our Implementation Files:

- **`components/posts/infinite-posts-view.tsx`**: Reusable infinite scroll component
- **`app/(app)/feed.tsx`**: Feed using FlatList directly
- **`app/(app)/profile/index.tsx`**: Profile with posts using InfinitePostsView
- **`api/posts.ts`**: Infinite query hooks for pagination

This architecture ensures smooth, performant scrolling across the entire mobile app!