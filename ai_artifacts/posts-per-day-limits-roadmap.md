## Posts-Per-Day Limits Implementation Roadmap

> Living Document - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Everything should be documented.

### 🎉 Latest Update
**3 of 7 phases completed!** Backend now enforces daily post limits:
- ✅ Free plan: 1 post/day
- ✅ Pro plan: 20 posts/day  
- ✅ UTC timezone consistency
- ✅ API endpoint ready: GET `/api/posts/limits`

## Overview
Move subscription limits from a total posts count to a per-day post limit (postsPerDay). Enforce the daily limit in the backend (middleware + endpoint), reflect correct limits in the frontend, and optimize with proper DB indexes.

## Quick Start - Next Actions

✅ **Phases 1-3 Complete!** Backend daily limits are now enforced. Next priorities:

1. 🗄️ **IMMEDIATE**: Run database migrations to apply new indexes:
   ```bash
   pnpm db:generate  # Generate migration file
   pnpm db:migrate   # Apply to database
   ```

2. 🎨 **HIGH**: Implement Phase 4 - Frontend UX
   - Add `usePostLimits()` hook to fetch daily limits
   - Update new post dialog to show remaining posts
   - Display "posts/day" in billing settings

3. 🧪 **MEDIUM**: Add tests for daily limit enforcement
   - Test UTC midnight boundary reset
   - Test organization vs personal limits

## Implementation Progress

- [x] Phase 1: Constants and Types Update (plans/data.ts) ✅ **COMPLETED**
- [x] Phase 2: Backend Enforcement (subscription middleware + limits endpoint) ✅ **COMPLETED**
- [x] Phase 3: Schema Indexes for Performance ✅ **COMPLETED**
- [ ] Phase 4: Frontend UX and Messaging
- [ ] Phase 5: Mobile App Parity
- [ ] Phase 6: Testing (Unit, Integration, E2E)
- [ ] Phase 7: Documentation and Monitoring

## Phase Instructions

### Phase 1: Constants and Types Update (plans/data.ts) ✅ **COMPLETED**
- [x] ✅ `PlanLimits` interface updated to use `postsPerDay`
- [x] ✅ `SUBSCRIPTION_PLANS` updated to use `limits.postsPerDay`  
- [x] ✅ `getPlanLimits` return shape updated

### Phase 2: Backend Enforcement (subscription middleware + limits endpoint) ✅ **COMPLETED**

**What was implemented**:
- ✅ Updated both middleware functions to use `getPlanLimits()` helper from `plans/data.ts` 
- ✅ Changed from counting total posts to counting today's posts only (UTC timezone)
- ✅ Added missing imports: `gte, lt` from drizzle-orm for date range queries
- ✅ Updated context variables: `dailyPostCount`, `dailyPostLimit` 
- ✅ Uncommented and fixed `/api/posts/limits` endpoint with proper daily semantics
- ✅ Updated error messages to clearly state "daily limit" instead of generic limit

**Technical Details**:
- **File**: `apps/server/src/middleware/subscription.ts`
- **UTC Timezone**: Posts created between `00:00:00 UTC` and `23:59:59 UTC` count toward today's limit
- **Error Response**: Returns 403 with message: `"You have reached your daily limit of X posts on the Y plan. Try again tomorrow."`
- **Context Variables**: Now properly typed as `dailyPostCount` and `dailyPostLimit` in `SubscriptionVariables` type

**Example Query** (what's running under the hood):
```sql
-- For user posts (no organization)
SELECT COUNT(*) FROM posts 
WHERE user_id = ? 
  AND organization_id IS NULL
  AND created_at >= '2024-01-15 00:00:00' 
  AND created_at < '2024-01-16 00:00:00'
```

**New API Endpoint** (`/api/posts/limits`):
```json
// GET /api/posts/limits response
{
  "todaysCount": 3,
  "dailyLimit": 20,
  "plan": "pro",
  "remainingToday": 17,
  "hasReachedDailyLimit": false
}
```

### Phase 3: Schema Indexes for Performance ✅ **COMPLETED**

**What was implemented**:
- ✅ Added `userCreatedAtIdx` composite index for user daily post queries
- ✅ Added `orgCreatedAtIdx` composite index for organization daily post queries

**Technical Details**:
- **File**: `apps/server/src/db/schema.ts` 
- **Location**: Added to posts table index definitions (lines 192-195)
- **Purpose**: Optimizes the daily counting queries by creating composite indexes on (userId/orgId + createdAt)

**New Indexes Added**:
```typescript
// Daily posting limit performance indexes
userCreatedAtIdx: index('idx_posts_user_created_at')
  .on(table.userId, table.createdAt.desc()),
orgCreatedAtIdx: index('idx_posts_org_created_at')
  .on(table.organizationId, table.createdAt.desc()),
```

**Performance Impact**:
- **Before**: Full table scan filtering by userId/orgId then date range
- **After**: Direct index lookup using composite key, much faster for daily counts
- **Expected improvement**: Query time reduced from O(n) to O(log n) where n = total posts

**Next Steps Required** (manual):
- [ ] Run `pnpm db:generate` to create migration file
- [ ] Review generated migration in `drizzle/` folder  
- [ ] Run `pnpm db:migrate` to apply indexes to database

### Phase 4: Frontend UX and Messaging

- [ ] Add `usePostLimits()` hook in `posts.ts` 
- [ ] Update `new-post-dialog.tsx` to show remaining posts and disable when limit reached
- [ ] Update `billing-settings.tsx` to display "posts/day" instead of raw key names
- [ ] Enhance error handling in `useCreatePost` for daily limit errors

### Phase 5: Mobile App Parity
- [ ] Mirror frontend changes in `apps/mobile-app` (post creation flows and messaging).
- [ ] Add optional badge or notice showing remaining daily posts.

### Phase 6: Testing (Unit, Integration, E2E)

- [ ] Unit tests for `subscriptionLimitMiddleware` daily boundary logic
- [ ] Integration test for `/api/posts/limits` endpoint returning daily counts
- [ ] E2E test: reach daily limit, verify UI blocks posting with proper messaging

### Phase 7: Documentation and Monitoring
- [ ] Update developer docs to clarify “posts per day” semantics and timezone handling.
- [ ] Add structured logs/metrics for limit checks (counts, rejections) to monitor usage.
- [ ] Optional cron: only for maintenance (e.g., backfill/repair, archiving usage rows). Not required for correctness.

## Success Criteria
- [ ] Daily limit is enforced consistently across org and personal posts.
- [ ] UI and API messaging clearly state "per day" limits with remaining counts.
- [ ] No significant performance regressions (queries use indexes; p95 acceptable).
- [ ] Tests pass: unit, integration, and E2E scenarios for daily limits.

## Implementation Notes

### Recently Resolved Issues ✅
1. **✅ FIXED**: `middleware/subscription.ts` now uses `limits.postsPerDay` with `getPlanLimits()` helper
2. **✅ FIXED**: Both middleware functions now count daily posts in UTC timezone
3. **✅ FIXED**: `/limits` endpoint is active and returns daily limit data
4. **📝 TODO**: Frontend still needs daily limits checking (Phase 4)

### Key Technical Details
- **Timezone**: Use UTC for consistent daily boundaries
- **Context Variables**: Update to `dailyPostCount`, `dailyPostLimit` 
- **Performance**: Existing indexes are good, add composite `userCreatedAtIdx` for optimization


