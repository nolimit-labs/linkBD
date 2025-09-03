# Subscriptions and Usage Features Roadmap

> 📝 **Living Document** - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Everything should be documented.

## 🎉 Latest Update
**6 of 9 phases completed!** Full subscription system with usage limits and billing features:
- ✅ Daily post limits enforced (1 post/day free, 20 posts/day pro)
- ✅ UTC timezone consistency across the system
- ✅ Complete billing settings with upgrade flows
- ✅ Reusable badge components for Premium/Official status
- ✅ Environment-based pricing configuration
- ✅ Self-contained dialog components for better UX

## Overview
Complete subscription and usage management system for linkBD platform, including daily post limits, billing management, upgrade flows, and premium features. This system provides a foundation for monetization while maintaining great user experience.

## Implementation Progress

- [x] Phase 1: Plan Constants and Types ✅ **COMPLETED**
- [x] Phase 2: Backend Usage Enforcement ✅ **COMPLETED**
- [x] Phase 3: Database Performance Optimization ✅ **COMPLETED**
- [x] Phase 4: Frontend Usage Display ✅ **COMPLETED**
- [x] Phase 5: Billing Settings & Upgrade Flows ✅ **COMPLETED**
- [x] Phase 6: Badge Components Refactor ✅ **COMPLETED**
- [ ] Phase 7: Mobile App Implementation
- [ ] Phase 8: Testing Coverage
- [ ] Phase 9: Documentation & Monitoring

## Phase Instructions

### Phase 1: Plan Constants and Types ✅ **COMPLETED**
- [x] ✅ Updated `PlanLimits` interface to use `postsPerDay`
- [x] ✅ Modified `SUBSCRIPTION_PLANS` with daily limits structure
- [x] ✅ Updated `getPlanLimits` helper function
- [x] ✅ Added proper TypeScript types for subscription plans

**Location**: `apps/server/src/features/subscriptions/plans/data.ts`

### Phase 2: Backend Usage Enforcement ✅ **COMPLETED**
- [x] ✅ Implemented daily post counting with UTC boundaries
- [x] ✅ Added subscription middleware for post creation
- [x] ✅ Created `/api/posts/limits` endpoint for limit checking
- [x] ✅ Error responses with clear daily limit messaging
- [x] ✅ Context variables: `dailyPostCount`, `dailyPostLimit`

**Technical Details**:
- Query counts posts between `00:00:00 UTC` and `23:59:59 UTC`
- Returns 403 with message: "You have reached your daily limit of X posts on the Y plan"
- Endpoint response includes: `todaysCount`, `dailyLimit`, `remainingToday`, `hasReachedDailyLimit`

### Phase 3: Database Performance Optimization ✅ **COMPLETED**
- [x] ✅ Added `userCreatedAtIdx` composite index
- [x] ✅ Added `orgCreatedAtIdx` composite index
- [x] ✅ Optimized daily post counting queries

**Indexes Added**:
```typescript
userCreatedAtIdx: index('idx_posts_user_created_at')
  .on(table.userId, table.createdAt.desc()),
orgCreatedAtIdx: index('idx_posts_org_created_at')
  .on(table.organizationId, table.createdAt.desc()),
```

### Phase 4: Frontend Usage Display ✅ **COMPLETED**
- [x] ✅ Created `usePostLimits()` hook with auto-refresh
- [x] ✅ Updated new post dialog with remaining posts display
- [x] ✅ Added limit reached state with reset timing
- [x] ✅ Toast notifications for limit errors
- [x] ✅ Disabled post button when limit reached

**Files Modified**:
- `apps/web-app/src/api/posts.ts`
- `apps/web-app/src/components/posts/new-post-dialog.tsx`

### Phase 5: Billing Settings & Upgrade Flows ✅ **COMPLETED**
- [x] ✅ Redesigned billing settings with card layouts
- [x] ✅ Created `CurrentPlanCard` component (no status display)
- [x] ✅ Created `UpgradePlanCard` for pro plan display
- [x] ✅ Created `UpgradeLearnMoreCard` with dialog trigger
- [x] ✅ Added upgrade dialog with proper width (95vw)
- [x] ✅ Environment variable for pricing (`VITE_PRO_PLAN_PRICE`)
- [x] ✅ "Pro Complementary" formatting with space
- [x] ✅ Conditional "Manage Billing" (only for paid pro)
- [x] ✅ Removed "Most Popular" badge from pro plan

**Components Created**:
- `apps/web-app/src/components/billing/current-plan-card.tsx`
- `apps/web-app/src/components/billing/upgrade-plan-card.tsx`
- `apps/web-app/src/components/billing/upgrade-learn-more-card.tsx`
- `apps/web-app/src/components/billing/upgrade-user-dialog.tsx`

### Phase 6: Badge Components Refactor ✅ **COMPLETED**
- [x] ✅ Created `OfficialBadge` component
- [x] ✅ Created `ProBadge` component (renamed from PremiumBadge)
- [x] ✅ Updated all 5 usage locations to use new components
- [x] ✅ Centralized badge styling and behavior

**Components Created**:
- `apps/web-app/src/components/profile/official-badge.tsx`
- `apps/web-app/src/components/profile/premium-badge.tsx`

**Files Updated**:
- `post-card.tsx`
- `featured-business-card.tsx`
- `profile-card.tsx`

### Phase 7: Mobile App Implementation
- [ ] Mirror usage limits display in React Native
- [ ] Add remaining posts badge in mobile UI
- [ ] Implement upgrade flow in mobile app
- [ ] Add billing management for mobile users
- [ ] Display Pro/Official badges consistently

**Target Files**:
- `apps/mobile-app/src/components/posts/`
- `apps/mobile-app/src/screens/billing/`
- `apps/mobile-app/src/hooks/`

### Phase 8: Testing Coverage
- [ ] Unit tests for daily limit boundary logic
- [ ] Integration tests for `/api/posts/limits` endpoint
- [ ] E2E test: reach daily limit scenario
- [ ] E2E test: upgrade flow from free to pro
- [ ] E2E test: UTC midnight reset behavior
- [ ] Subscription cancelation and reactivation tests
- [ ] Test organization vs personal post limits

**Test Categories**:
- Backend middleware tests
- API endpoint tests
- Frontend component tests
- Full user journey tests

### Phase 9: Documentation & Monitoring
- [ ] Developer documentation for subscription system

## Success Criteria
- [x] Daily limits enforced consistently (backend + frontend) ✅
- [x] Clear UX messaging about limits and upgrades ✅
- [x] No performance regressions with indexes ✅
- [x] Billing settings provide clear upgrade path ✅
- [x] Badge components are reusable and consistent ✅
- [ ] Mobile app has feature parity
- [ ] 80%+ test coverage for critical paths
- [ ] Documentation covers all subscription features
- [ ] Monitoring shows usage patterns and bottlenecks

## Technical Architecture

### Key Design Decisions
1. **UTC Timezone**: All daily limits reset at UTC midnight for consistency
2. **Environment Variables**: Pricing configured via `VITE_PRO_PLAN_PRICE`
3. **Component Architecture**: Self-contained dialogs with triggers
4. **Badge System**: Centralized badge components for consistency
5. **Error Handling**: Toast notifications with actionable messages

### API Endpoints
- `GET /api/posts/limits` - Get current usage and limits
- `POST /api/posts` - Create post (enforces limits)
- Billing portal via Better Auth integration

### Database Schema
- Posts table with composite indexes for performance
- Subscription data managed by Better Auth
- Daily counting optimized with (userId, createdAt) indexes


## Next Priority Actions

1. **Database Migration** (if not done):
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

2. **Mobile App Updates**:
   - Start with usage display hooks
   - Add upgrade UI components
   - Test on iOS and Android

3. **Testing Suite**:
   - Write unit tests for limit logic
   - Add E2E tests for upgrade flow
   - Test edge cases (timezone boundaries)

## Notes for Developers

### Adding New Plan Features
1. Update `PlanLimits` interface in `plans/data.ts`
2. Add enforcement in subscription middleware
3. Update frontend display components
4. Add tests for new limits

### Modifying Pricing
1. Set `VITE_PRO_PLAN_PRICE` environment variable
2. Pricing automatically updates in all UI components
3. Ensure Stripe product pricing matches

### Badge System Usage
```tsx
import { OfficialBadge } from '@/components/profile/official-badge'
import { ProBadge } from '@/components/profile/premium-badge'

// Usage
{user.isOfficial && <OfficialBadge className="text-xs" />}
{user.isPro && <ProBadge className="text-xs" />}
```

---

*Last Updated: Current Session*
*Status: 6/9 Phases Complete (67%)*