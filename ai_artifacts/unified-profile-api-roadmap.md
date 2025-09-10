# Unified Profile API & Optional Subscription Enrichment - Implementation Roadmap

> 📝 Living Document - This roadmap is actively updated as phases are executed. Check items off as completed. Update it with any additional work discovered.

## Overview
Unify profile retrieval into a single, clean API that detects whether an ID refers to a user or an organization, returns a normalized profile shape, and optionally enriches the response with the active subscription. Reduce duplication between `profileRoutes` and `userRoutes`, and keep all URL generation and enrichment inside models for consistency.

## Implementation Progress

- [ ] Phase 1: Discovery & API design
- [ ] Phase 2: Profile model (entity detection + unified fetch)
- [ ] Phase 3: User/Org models – optional subscription enrichment
- [ ] Phase 4: Routes refactor (unify profile, delegate user)
- [ ] Phase 5: Frontend hooks (web + mobile)
- [ ] Phase 6: Tests (unit, integration, E2E) and telemetry
- [ ] Phase 7: Rollout & deprecation

## Phase Instructions

### Phase 1: Discovery & API design
- [ ] Inventory uses of `GET /api/profile/:id` and `GET /api/user/:id` in web, mobile, and admin-app.
- [ ] Finalize normalized profile shape (single union):
  ```ts
  type PublicProfile = {
    id: string
    name: string
    imageUrl: string | null
    description: string | null
    isOfficial: boolean
    createdAt: string
    type: 'user' | 'organization'
    // Optional when includeSubscription=true
    subscriptionPlan?: string
  }
  ```
- [ ] Agree on opt-in enrichment: `includeSubscription=true|false` (default false) to avoid extra queries by default.
- [ ] Deprecation plan: keep `GET /api/user/:id` delegating to profile model, mark as deprecated in response header and code comment.

### Phase 2: Profile model (entity detection + unified fetch)
- [ ] Create `apps/server/src/models/profile.ts` with:
  ```ts
  import * as userModel from './user'
  import * as orgModel from './organization'
  import { detectEntityType } from './helper'

  export async function resolveEntityType(id: string): Promise<'user'|'organization'|null> {
    return detectEntityType(id)
  }

  export async function getProfileById(
    id: string,
    opts: { includeSubscription?: boolean } = {}
  ): Promise<PublicProfile | null> {
    const type = await resolveEntityType(id)
    if (!type) return null
    if (type === 'user') {
      const u = await userModel.getUserById(id, { includeSubscription: opts.includeSubscription })
      if (!u) return null
      return {
        id: u.id,
        name: u.name,
        imageUrl: u.imageUrl,
        description: u.description ?? null,
        isOfficial: !!u.isOfficial,
        createdAt: u.createdAt as unknown as string,
        type: 'user',
        ...(opts.includeSubscription ? { subscriptionPlan: (u as any).subscriptionPlan ?? 'free' } : {})
      }
    }
    const o = await orgModel.getOrgById(id, { includeSubscription: opts.includeSubscription })
    if (!o) return null
    return {
      id: o.id,
      name: o.name,
      imageUrl: o.imageUrl,
      description: o.description ?? null,
      isOfficial: !!o.isOfficial,
      createdAt: o.createdAt as unknown as string,
      type: 'organization',
      ...(opts.includeSubscription ? { subscriptionPlan: (o as any).subscriptionPlan ?? 'free' } : {})
    }
  }
  ```
- [ ] Reuse `models/helper.ts` → `detectEntityType(id)` for a single source of truth.

### Phase 3: User/Org models – optional subscription enrichment
- [ ] Extend signatures (keep backward compatible defaults):
  ```ts
  // user.ts
  export async function getUserById(
    userId: string,
    opts: { includeSubscription?: boolean } = {}
  )

  // organization.ts
  export async function getOrgById(
    orgId: string,
    opts: { includeSubscription?: boolean } = {}
  )
  ```
- [ ] When `includeSubscription=true`:
  - Users: query `getUserActiveSubscription(userId)` and add `subscriptionPlan` to the returned object.
  - Orgs: compute via `getOrgOwner(orgId)` then `getUserActiveSubscription(owner.userId)`, add `subscriptionPlan`.
- [ ] Keep URL generation in models (return `imageUrl`); remove route-level `generateDownloadURL` usage.

### Phase 4: Routes refactor (unify profile, delegate user)
- [ ] `routes/profile.ts`
  - `GET /api/profile/:id` → `profileModel.getProfileById(id, { includeSubscription: query.includeSubscription === 'true' })`.
  - `GET /resolve/:id` → `profileModel.resolveEntityType(id)`.
- [ ] `routes/user.ts`
  - `GET /api/user/:id` → delegate to `profileModel.getProfileById`; if `type !== 'user'`, return 404.
  - `GET /api/user/profile` (current user) → `userModel.getUserById(user.id, { includeSubscription: true })`.
- [ ] Remove any route-level `generateDownloadURL` calls.

### Phase 5: Frontend hooks (web + mobile)
- [ ] Add unified hook `useGetProfile(id: string, opts?: { includeSubscription?: boolean })` in both clients.
- [ ] Update screens/components to use single profile hook and union shape.
- [ ] Optional: Keep `useGetUserProfile` as thin wrapper around unified hook (for transitional compatibility).

### Phase 6: Tests (unit, integration, E2E) and telemetry
- [ ] Unit: `profileModel.resolveEntityType` (user/org/none), `getProfileById` (user/org; with/without subscription).
- [ ] Integration: profile route JSON shapes; ensure no route-level URL generation remains.
- [ ] E2E: profile pages in web + mobile still work; orgs show subscription derived from owner when requested.
- [ ] Telemetry/logs: track `includeSubscription=true` usage to gauge cost.

### Phase 7: Rollout & deprecation
- [ ] Ship unified route; keep `GET /api/user/:id` delegating with deprecation header.
- [ ] Update docs and code comments; announce deprecation in changelog.
- [ ] After clients migrate, remove deprecated code.

## Success Criteria
- A single profile endpoint serves both user and organization profiles with a normalized shape.
- Optional subscription enrichment controlled by `includeSubscription` (default false).
- No duplication of profile logic between `profileRoutes` and `userRoutes`.
- All image URLs provided by models; zero route-level URL generation.
- Web and mobile clients use the unified profile hook; type-safe across the stack.

---

## Notes
- Reuse `models/helper.ts` (`detectEntityType`) to avoid duplicated detection logic.
- Keep DB queries minimal; only fetch subscription data on demand.


