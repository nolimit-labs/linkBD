# Feed Badge System Roadmap
**Feature:** Display badges for official team members and premium subscribers in feed  
**Priority:** High  
**Estimated Timeline:** 1 week  

## Overview
Add visual badges next to user/organization names in the feed to indicate:
1. **Official Badge** (🔴) - linkBD team members and official organizations (using primary/red color)
2. **Premium Badge** (✓) - Users/organizations on pro or pro_complementary plans

## Phase 1: Backend Implementation (2-3 days)

### 1.1 Database Schema Updates
- [ ] Add `isOfficial` boolean field to users table (for linkBD team members)
- [ ] Add `isOfficial` boolean field to organizations table (for official organizations)
- [ ] Ensure subscription plan information is available in post queries

### 1.2 API Updates
- [ ] Update `/api/posts/feed` to include:
  - Author's `isOfficial` status
  - Author's subscription plan (pro/pro_complementary)
- [ ] Update post author data structure to include badge information
- [ ] Ensure efficient querying with proper joins/includes

### 1.3 Data Structure
```typescript
// Post author structure with badge info
interface PostAuthor {
  id: string;
  name: string;
  image: string | null;
  type: 'user' | 'organization';
  isOfficial?: boolean;  // New field
  subscriptionPlan?: 'free' | 'pro' | 'pro_complementary';  // New field
}
```

## Phase 2: Frontend Implementation (2-3 days)

### 2.1 Badge Components

#### Create Badge Icons
```tsx
// OfficialBadge.tsx - Red diamond for linkBD team (using primary color)
export function OfficialBadge({ size = 16 }) {
  return (
    <span 
      className="text-primary ml-1" 
      title="Official linkBD Team"
    >
      🔴
    </span>
  );
}

// PremiumBadge.tsx - Checkmark for premium users
export function PremiumBadge({ size = 16 }) {
  return (
    <span 
      className="text-green-500 ml-1" 
      title="Premium Member"
    >
      ✓
    </span>
  );
}
```

### 2.2 Update PostCard Component

#### Web App (`apps/web-app/src/components/posts/post-card.tsx`)
- [ ] Import badge components
- [ ] Add logic to display badges based on author data
- [ ] Position badges next to author name

```tsx
// Example implementation
<div className="flex items-center gap-1">
  <h4 className="text-sm font-semibold">
    {author?.name || 'Unknown User'}
  </h4>
  {author?.isOfficial && <OfficialBadge />}
  {author?.subscriptionPlan === 'pro' && <PremiumBadge />}
  {author?.subscriptionPlan === 'pro_complementary' && <PremiumBadge />}
</div>
```

#### Mobile App (`apps/mobile-app/components/posts/post-card.tsx`)
- [ ] Implement same badge logic for React Native
- [ ] Use emoji or react-native-svg for icons
- [ ] Ensure proper styling and spacing

```tsx
// Example React Native implementation
<View className="flex-row items-center">
  <Text className="font-semibold text-foreground">{post.author.name}</Text>
  {post.author.isOfficial && (
    <Text className="ml-1 text-primary">🔴</Text>
  )}
  {(post.author.subscriptionPlan === 'pro' || 
    post.author.subscriptionPlan === 'pro_complementary') && (
    <Text className="ml-1 text-green-500">✓</Text>
  )}
</View>
```

### 2.3 Tooltip/Hover Information
- [ ] Add hover tooltips on web to explain badge meaning
- [ ] Consider press-and-hold tooltip for mobile

## Phase 3: Admin Tools (1-2 days)

### 3.1 Admin Interface
- [ ] Create admin endpoint to toggle `isOfficial` status
- [ ] Add UI in admin panel to manage official status
- [ ] Audit trail for official status changes

### 3.2 Admin Permissions
```typescript
// Only super admins can toggle official status
PATCH /api/admin/users/:id/official
PATCH /api/admin/organizations/:id/official
```

## Implementation Steps

### Step 1: Database Migration
```sql
-- Add official status to users
ALTER TABLE users ADD COLUMN is_official BOOLEAN DEFAULT FALSE;

-- Add official status to organizations  
ALTER TABLE organization ADD COLUMN is_official BOOLEAN DEFAULT FALSE;

-- Index for performance
CREATE INDEX idx_users_is_official ON users(is_official);
CREATE INDEX idx_organization_is_official ON organization(is_official);
```

### Step 2: Update Post Queries
```typescript
// Include badge data in post queries
const posts = await db.query.posts.findMany({
  with: {
    author: {
      columns: {
        id: true,
        name: true,
        image: true,
        isOfficial: true,
      },
    },
    organization: {
      columns: {
        id: true,
        name: true,
        imageUrl: true,
        isOfficial: true,
      },
    },
  },
});

// Add subscription data from Better Auth
const postsWithSubscriptions = await Promise.all(
  posts.map(async (post) => {
    const subscription = await getSubscriptionForUser(post.userId);
    return {
      ...post,
      author: {
        ...post.author,
        subscriptionPlan: subscription?.plan || 'free',
      },
    };
  })
);
```

### Step 3: Testing Checklist
- [ ] Official badge shows for linkBD team members
- [ ] Premium badge shows for pro subscribers
- [ ] Premium badge shows for pro_complementary subscribers
- [ ] No badges show for free users
- [ ] Badges appear correctly in both web and mobile
- [ ] Performance impact is minimal
- [ ] Tooltips work on hover (web)

## Visual Design Specifications

### Badge Placement
- Position: Immediately after name, with 4px spacing
- Size: 16px on desktop, 14px on mobile
- Color: 
  - Official: Primary/Red (using bg-primary class)
  - Premium: Green (#10B981)

### Badge Priority
If user has both official and premium status:
1. Show official badge first
2. Show premium badge second

## Future Enhancements

### Phase 4: Extended Features
- [ ] Different badge levels (Silver, Gold, Platinum)
- [ ] Custom badges for special events or achievements
- [ ] Badge animations on first appearance
- [ ] Badge statistics in user profile
- [ ] Verified organization badges (separate from official)

### Phase 5: Badge Management
- [ ] User badge showcase on profile
- [ ] Badge history and timeline
- [ ] Badge notifications when earned
- [ ] Badge removal/expiration system

## Success Metrics
- [ ] Badge visibility in feed (100% render rate)
- [ ] Correct badge assignment (0% error rate)
- [ ] Page load performance (<50ms added latency)
- [ ] User recognition of badge meanings (survey)

## Technical Considerations

### Performance
- Include badge data in initial query (avoid N+1)
- Cache subscription status for 5 minutes
- Use CSS for badge styling (not images)

### Security
- Official status can only be set by super admins
- Subscription status verified server-side
- No client-side badge manipulation

### Mobile Considerations
- Use system emojis for consistent rendering
- Test on both iOS and Android
- Ensure badges don't wrap to new line

## Rollout Plan
1. **Day 1-2:** Backend implementation and testing
2. **Day 3-4:** Frontend web implementation
3. **Day 5:** Mobile app implementation
4. **Day 6:** Admin tools and documentation
5. **Day 7:** Testing and deployment

## Risk Mitigation
- **Risk:** Performance degradation in feed
  - **Solution:** Optimize queries, add indexes
- **Risk:** Badge confusion
  - **Solution:** Clear tooltips and help documentation
- **Risk:** Badge abuse
  - **Solution:** Server-side validation, admin-only controls