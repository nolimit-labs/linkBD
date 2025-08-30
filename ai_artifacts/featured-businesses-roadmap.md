# Featured Businesses Implementation Roadmap

> 📝 Living Document - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Everything should be documented.

## Overview
Add a lightweight, scalable way to feature organizations (businesses) in linkBD. On the Businesses page, show a capped list of featured businesses by default. When users start typing in the search box, switch to search results. Admins can toggle featured status from the Admin app. Enforce a server-side maximum for how many featured businesses can be returned to ensure predictable UI and performance.

## Implementation Progress

- [ ] Phase 1: Database schema and migration for featured businesses
- [ ] Phase 2: Backend API and RPC types for featured queries
- [ ] Phase 3: Web Businesses page UX: show featured by default, search overrides
- [ ] Phase 4: Admin app management UI to toggle featured status
- [ ] Phase 5: Testing (unit + e2e) and QA
- [ ] Phase 6: Documentation and rollout

## Phase Instructions

### Phase 1: Database schema and migration for featured businesses
- [ ] Add fields to `organizations` table: `is_featured boolean not null default false`, `featured_at timestamp with time zone null`
- [ ] Create composite index for efficient querying: `(is_featured, featured_at desc)`
- [ ] Update Drizzle schema in `apps/server/src/db/schema.ts` and generate migration in `apps/server/drizzle/`
- [ ] Backfill (no-op default false); ensure nullability rules align

Example SQL (illustrative):
```sql
ALTER TABLE organizations
  ADD COLUMN is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN featured_at timestamp with time zone;

CREATE INDEX organizations_featured_idx
  ON organizations (is_featured, featured_at DESC);
```

Example Drizzle snippet (illustrative):
```ts
export const organizations = pgTable('organizations', {
  // existing columns...
  isFeatured: boolean('is_featured').notNull().default(false),
  featuredAt: timestamp('featured_at', { withTimezone: true }),
});
```

Toggling recommendation: when `is_featured` is set to true, set `featured_at = now()`. When set to false, set `featured_at = null`.

### Phase 2: Backend API and RPC types for featured queries
- [ ] Add query support to list organizations by `isFeatured` with `limit` parameter; default e.g. 6; clamp to a server maximum (e.g., 12)
- [ ] Add safe input validation for `limit` and ensure server-side enforcement of max featured count
- [ ] Sort featured results by `featured_at desc` for deterministic ordering
- [ ] Update Hono routes and shared types so RPC client is fully typed
- [ ] Add unit tests for featured queries and limit enforcement

Illustrative handler behavior:
```ts
// GET /organizations?isFeatured=true&limit=6
// Clamp: limit = Math.min(req.limit ?? DEFAULT, MAX_FEATURED_LIMIT)
// Order: ORDER BY featured_at DESC
```

### Phase 3: Web Businesses page UX: show featured by default, search overrides
- [ ] Create `useFeaturedOrganizations(limit)` hook in `apps/web-app/src/api/organizations.ts` using the centralized RPC client (2.1_frontend_best_practices)
- [ ] Update `apps/web-app/src/routes/(app)/businesses.tsx`:
  - When the search query is empty, display featured businesses grid
  - When typing begins and debounced query is non-empty, show search results (current behavior) instead
  - Keep a small “Browse all businesses” link to navigate to full listing (optional)
- [ ] Add subtle "Featured" badge in each card; maintain existing `Avatar`, `Card` pattern
- [ ] Handle loading with skeletons and fallback states
- [ ] Ensure no hardcoded colors; use UI primitives from `components/ui`

Display logic summary:
```ts
const { data: featured, isLoading: loadingFeatured } = useFeaturedOrganizations(6);
const { data: results, isLoading: loadingSearch } = useSearch(q, 'organization');

const showingSearch = !!q;
const items = showingSearch ? results?.organizations ?? [] : featured?.organizations ?? [];
```

### Phase 4: Admin app management UI to toggle featured status
- [ ] Add Admin route/screen to manage organizations with a TanStack Table (see 2.4_tanstack-table-basics)
- [ ] Include a "Featured" column with a `Switch` to toggle `isFeatured`
- [ ] Create mutation hook `useUpdateOrganization` (RPC client) to toggle featured and set `featuredAt` server-side
- [ ] Optimistic updates with rollback on failure; toast notifications
- [ ] Enforce auth/role check via Better Auth in Admin app route guard
- [ ] Optional: bulk actions for select-all → set featured/un-featured

API interaction:
```ts
await rpcClient.api.organizations[':id'].$patch({ json: { isFeatured: true } });
```

### Phase 5: Testing (unit + e2e) and QA
- [ ] Server unit tests: toggle featured, limit enforcement, ordering by `featured_at desc`
- [ ] Web e2e: Businesses page shows featured on initial load; switches to search results when typing
- [ ] Admin e2e: Toggle featured on/off; verify changes reflected on Businesses page
- [ ] Accessibility pass (landmarks, focus states, labels on the Switch in admin)

### Phase 6: Documentation and rollout
- [ ] Update `README.md` sections for Admin instructions on featuring businesses
- [ ] Add screenshots/gifs of Businesses page and Admin toggle flow
- [ ] Add an ops runbook note: environment variable for `MAX_FEATURED_LIMIT` (if applicable)
- [ ] Announce the feature in release notes

## Success Criteria
- Featured businesses render by default on `/(app)/businesses` up to the configured limit
- Search results replace featured view when a query is present; clearing the query restores featured view
- Admins can toggle featured status; toggling updates `featured_at` accordingly
- Server enforces a max featured limit and returns deterministically ordered results
- All tests pass (unit + e2e); no regressions in existing businesses/search flows

