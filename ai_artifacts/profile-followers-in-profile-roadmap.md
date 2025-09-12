# Profile Followers in Profile Endpoint - Implementation Roadmap

> 📝 Living Document - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Everything should be documented.

## Overview
Add follower and following counts directly in the `GET /api/profile/:id` response so mobile and web can render profile pages with a single API call, removing the need for a separate followers-counts fetch.

## Implementation Progress
- [ ] Phase 1: Backend profile endpoint returns follower/following counts
- [ ] Phase 2: Mobile app adopts counts from profile and removes extra call
- [ ] Phase 3: Web app adopts counts from profile and removes extra call
- [ ] Phase 4: Cleanup, docs, and regression checks

## Phase Instructions

### Phase 1: Backend profile endpoint returns follower/following counts
- [ ] Update `apps/server/src/models/user.ts` and `apps/server/src/models/organization.ts` profile getters to include follower counts from `followersModel.getFollowerCounts(id)`
- [ ] Or (preferred) adjust `apps/server/src/routes/profile.ts` to compose counts after fetching user/org model data without breaking model layering
- [ ] Ensure response shape includes: `{ followersCount: number, followingCount: number }` at top-level alongside existing profile fields; maintain current fields for backward compatibility
- [ ] Add lightweight JSDoc above the `.get('/:id')` route describing the enriched response
- [ ] Add request-level integration test (or manual validation) confirming counts match `GET /api/followers/counts/:id`

Example edit area (conceptual; implement in codebase):
```12:34:apps/server/src/routes/profile.ts
  // After resolving userProfile or orgProfile
  const counts = await followersModel.getFollowerCounts(profileId)
  return c.json({ ...resolvedProfile, followersCount: counts.followersCount, followingCount: counts.followingCount })
```

### Phase 2: Mobile app adopts counts from profile and removes extra call
- [ ] Update `apps/mobile-app/api/profile.ts` consumer logic to expect `followersCount` and `followingCount`
- [ ] Replace usages of `useFollowerCounts(userId, organizationId)` on profile views with the counts from `useGetProfile` result
- [ ] Likely impacted files:
  - `apps/mobile-app/components/follows/follow-stats.tsx` (accept counts via props or profile object instead of querying)
  - Any profile header components (e.g., `profile/[id]` screen) that currently use `useFollowerCounts`
  - `apps/mobile-app/components/layout/drawer-account-header.tsx` (ensure it has a user id, then source counts from profile if applicable)
- [ ] Keep `useFollowerCounts` for non-profile contexts (lists, tooltips) but avoid it on profile screens to prevent double fetch

Suggested component API direction:
- `FollowStats` accepts either `counts` prop or `profile` prop; if provided, skip network request

### Phase 3: Web app adopts counts from profile and removes extra call
- [ ] Update `apps/web-app/src/api/profile.ts` consumers to read `followersCount` and `followingCount`
- [ ] Replace `useFollowerCounts` on profile page components with counts from `useGetProfile`
- [ ] Likely impacted files:
  - `apps/web-app/src/routes/(app)/profile/$id.tsx` (pass counts to sub-views)
  - `apps/web-app/src/components/posts/follow-stats.tsx` (accept counts prop to skip fetching when already available)
  - Any profile header components under `components/profile/*` that display counts
- [ ] Keep `useFollowerCounts` where profile data isn’t already loaded

### Phase 4: Cleanup, docs, and regression checks
- [ ] Remove redundant double-fetch in both clients on profile screens
- [ ] Update API docs or inline comments to reflect enriched profile payload
- [ ] QA: Verify counts stay consistent with `GET /api/followers/counts/:id`
- [ ] Ensure caching keys remain stable; invalidate profile queries upon follow/unfollow mutation if needed

## Success Criteria
- Profile screens on mobile and web load follower/following counts from `GET /api/profile/:id` without an additional call
- No regressions in components that still rely on `useFollowerCounts` outside profile views
- Follow/unfollow action updates profile counts via cache invalidation or optimistic update
