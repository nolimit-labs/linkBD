# Dynamic Profile Route in Mobile App

## Overview
The dynamic profile route (`[userId].tsx`) allows users to view any user or organization profile by navigating to `/profile/{userId}`.

## Key Features

### 1. Dynamic Route Parameter
```tsx
// Get the userId from the URL
const { userId } = useLocalSearchParams<{ userId: string }>();
```
- Expo Router automatically extracts the `userId` from the URL
- Example: `/profile/user-123` → `userId = "user-123"`

### 2. Navigation to Profiles
Users can navigate to profiles from anywhere in the app:

```tsx
// In PostCard component
const handleAuthorPress = () => {
  router.push(`/profile/${post.author.id}`);
};
```

### 3. Profile Types
The route handles both user and organization profiles:
- **Users**: Shows personal profile with posts
- **Organizations**: Shows business profile with updates, includes description field

### 4. Infinite Scrolling
Uses the same `InfinitePostsView` component for consistent scrolling experience:
- Profile header as `ListHeaderComponent`
- Posts load as user scrolls
- No nested ScrollView issues

### 5. Visual Badges
Profile displays various badges:
- **Business Badge**: For organization accounts
- **Official Badge**: For verified accounts
- **Subscription Badge**: Shows plan (Pro, etc.)

## File Structure

```
app/(app)/profile/
├── index.tsx        # Current user's own profile
└── [userId].tsx     # Dynamic route for viewing other profiles
```

## Navigation Flow

1. **From Feed**: Tap on post author → Navigate to their profile
2. **From Search**: (Future) Search results → Navigate to profile
3. **From Comments**: (Future) Tap commenter → Navigate to profile

## Key Differences from Own Profile

| Feature | Own Profile (`index.tsx`) | Other Profile (`[userId].tsx`) |
|---------|---------------------------|--------------------------------|
| Sign Out Button | ✅ Available | ❌ Not shown |
| Edit Profile | ✅ (Future) | ❌ Not available |
| Follow Button | ❌ Not needed | ✅ (TODO: Add) |
| Profile Data | From session | From API by ID |

## Implementation Details

### Conditional Rendering
```tsx
// Show description only for organizations
{isOrganization && 'description' in profile && profile.description && (
  <Text>{profile.description}</Text>
)}
```

### Post Author Display
```tsx
// Hide author in profile view (since all posts are by the same author)
<InfinitePostsView
  showAuthor={false}  // Don't show author on each post
  // ... other props
/>
```

### Error Handling
- Loading state while fetching profile
- "Profile not found" for invalid IDs
- Empty state for users with no posts

## Future Enhancements

1. **Follow/Unfollow**: Add follow button functionality
2. **Share Profile**: Share profile link
3. **Block/Report**: User safety features
4. **View Followers/Following**: Navigate to lists
5. **Direct Message**: Start conversation (if following)

## Usage Example

```tsx
// Navigate from anywhere in the app
import { useRouter } from 'expo-router';

const router = useRouter();

// Navigate to a user profile
router.push(`/profile/${userId}`);

// Navigate with params (future)
router.push({
  pathname: '/profile/[userId]',
  params: { userId: 'user-123' }
});
```

This dynamic route pattern makes the app feel more connected and allows users to discover new profiles easily!