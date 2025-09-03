# Featured Businesses Implementation Roadmap V2

> 📝 **Living Document** - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Everything should be documented.

## Overview
Add a lightweight, scalable way to feature organizations (businesses) in linkBD. On the Businesses page, show featured businesses by default with fallback to all businesses. When users search, switch to search results. Admins can toggle featured status with TanStack Table interface. Enforce server-side limits and use cursor-based pagination for performance.

## Implementation Progress

- [x] Phase 1: Database Schema & Migration (Schema-First Approach)
- [x] Phase 2: Backend Model Functions & API Routes  
- [x] Phase 3: Frontend Hooks & Business Page Integration
- [x] Phase 4: Admin Management Interface
- [ ] Phase 5: Testing & Performance Validation

## Phase Instructions

### Phase 1: Database Schema & Migration (Schema-First Approach) ✅
Following codebase pattern: schema definition FIRST, then generate migration.

- [x] Add fields to `organization` table in `apps/server/src/db/schema.ts`:
  ```typescript
  isFeatured: boolean('is_featured').notNull().default(false),
  featuredAt: timestamp('featured_at', { withTimezone: true }),
  ```
- [x] Add performance index following existing pagination patterns:
  ```typescript
  // In the organization table indexes section
  featuredAtIdx: index('idx_organizations_featured_at')
    .on(table.isFeatured, table.featuredAt.desc()),
  ```
- [x] Run `pnpm db:generate` to create migration
- [x] Review generated migration SQL before applying
- [x] Run `pnpm db:migrate` to apply changes
- [x] Update TypeScript exports in schema.ts (Drizzle will auto-infer)

**Key Design**: When `isFeatured` is set to `true`, set `featuredAt = now()`. When set to `false`, set `featuredAt = null`.

### Phase 2: Backend Model Functions & API Routes ✅
Following existing organization model and route patterns.

**Model Functions (`apps/server/src/models/organization.ts`):**
- [x] Add `getFeaturedOrganizations(limit: number)` function:
  ```typescript
  export async function getFeaturedOrganizations(limit = 6) {
    const maxLimit = Math.min(limit, 12); // Server-side limit enforcement
    
    return await db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        imageKey: organization.imageKey,
        description: organization.description,
        createdAt: organization.createdAt,
        isFeatured: organization.isFeatured,
        featuredAt: organization.featuredAt,
      })
      .from(organization)
      .where(eq(organization.isFeatured, true))
      .orderBy(desc(organization.featuredAt))
      .limit(maxLimit);
  }
  ```
- [x] Add `updateOrganizationFeaturedStatus(orgId: string, isFeatured: boolean)` function (moved to admin.ts):
  ```typescript
  export async function updateOrganizationFeaturedStatus(
    organizationId: string, 
    isFeatured: boolean
  ) {
    const updateData = {
      isFeatured,
      featuredAt: isFeatured ? new Date() : null,
    };
    
    return await updateOrg(organizationId, updateData);
  }
  ```

**API Routes (`apps/server/src/routes/organizations.ts`):**
- [x] Add featured organizations endpoint with method chaining:
  ```typescript
  // Get featured organizations (limited list)
  .get('/featured', authMiddleware, zValidator('query', featuredSchema), async (c) => {
    const { limit } = c.req.valid('query');
    
    try {
      const featuredOrgs = await orgModel.getFeaturedOrganizations(limit);
      
      const organizationsWithImages = await Promise.all(
        featuredOrgs.map(async (org) => ({
          ...org,
          imageUrl: await generateDownloadURL(org.imageKey),
        }))
      );
      
      return c.json({ organizations: organizationsWithImages });
    } catch (error) {
      console.error('Failed to fetch featured organizations:', error);
      return c.json({ error: 'Failed to fetch featured organizations' }, 500);
    }
  })
  ```
- [x] Add featured status update endpoint with proper auth:
  ```typescript
  // Update featured status (admin only)
  .patch('/:id/featured', authMiddleware, zValidator('json', featuredStatusSchema), async (c) => {
    const user = c.get('user');
    const organizationId = c.req.param('id');
    const { isFeatured } = c.req.valid('json');
    
    // TODO: Add admin role check when admin roles are implemented
    
    try {
      const updatedOrg = await orgModel.updateOrganizationFeaturedStatus(
        organizationId, 
        isFeatured
      );
      
      if (!updatedOrg) {
        return c.json({ error: 'Organization not found' }, 404);
      }
      
      return c.json(updatedOrg);
    } catch (error) {
      console.error('Failed to update featured status:', error);
      return c.json({ error: 'Failed to update featured status' }, 500);
    }
  })
  ```

### Phase 3: Frontend Hooks & Business Page Integration ✅
Following existing organization API and query patterns.

**Query Hooks (`apps/web-app/src/api/organization.ts`):**
- [x] Add `useFeaturedOrganizations` hook following existing pattern:
  ```typescript
  export const useFeaturedOrganizations = (limit: number = 6) => {
    return useQuery({
      queryKey: queryKeys.organizations.featured(limit),
      queryFn: async () => {
        const response = await rpcClient.api.organizations.featured.$get({
          query: { limit: String(limit) }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured organizations');
        }
        
        return response.json();
      },
      staleTime: 5 * 60 * 1000, // 5 minute cache
    });
  };
  ```
- [x] Add featured query key to `apps/web-app/src/api/query-keys.ts`:
  ```typescript
  organization: {
    // existing keys...
    featured: (limit: number) => ['organizations', 'featured', limit] as const,
  },
  ```

**Business Page (`apps/web-app/src/routes/(app)/businesses.tsx`):**
- [x] Update to show featured businesses by default:
  ```typescript
  // Get featured organizations by default
  const { data: featuredOrgs, isLoading: featuredLoading } = useFeaturedOrganizations(6);
  
  // Current search functionality remains the same
  const { data: searchResults, isLoading: searchLoading } = useSearch(debouncedQuery, 'organization');
  
  // Show logic: search takes priority, then featured, then all
  const businesses = searchQuery 
    ? searchResults?.organizations || []
    : featuredOrgs?.organizations || [];
  ```
- [x] Add subtle "Featured" badge to cards when showing featured businesses
- [ ] Keep "Browse all businesses" link when showing featured (optional enhancement)

### Phase 4: Admin Management Interface ✅
Following existing TanStack Table pattern from organizations-table-view.tsx.

**Admin API Hook (`apps/admin-app/src/api/organization.ts`):**
- [x] Add mutation hook for featured status toggle:
  ```typescript
  export const useUpdateOrganizationFeaturedStatus = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async ({ organizationId, isFeatured }: { 
        organizationId: string; 
        isFeatured: boolean; 
      }) => {
        const response = await rpcClient.api.organizations[':id'].featured.$patch({
          param: { id: organizationId },
          json: { isFeatured },
        });
        
        if (!response.ok) {
          throw new Error('Failed to update featured status');
        }
        
        return response.json();
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
        queryClient.invalidateQueries({ queryKey: ['organizations', 'featured'] });
        toast.success('Featured status updated successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update featured status');
      },
    });
  };
  ```

**Admin Table Interface (`apps/admin-app/src/components/organizations/organizations-table-view.tsx`):**
- [x] Add "Featured" column with Switch component:
  ```typescript
  {
    id: "featured",
    header: "Featured",
    cell: ({ row }) => {
      const org = row.original;
      return (
        <Switch
          checked={org.isFeatured || false}
          onCheckedChange={(checked) => 
            updateFeaturedStatus.mutate({
              organizationId: org.id,
              isFeatured: checked,
            })
          }
          disabled={updateFeaturedStatus.isPending}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  ```
- [x] Import and use the mutation hook in the component
- [x] Add loading state and optimistic updates

### Phase 5: Testing & Performance Validation
Following existing testing patterns in the codebase.

**Backend Tests:**
- [ ] Unit tests for `getFeaturedOrganizations` with limit enforcement
- [ ] Unit tests for `updateOrganizationFeaturedStatus` 
- [ ] Test proper ordering by `featuredAt desc`
- [ ] Test server-side limit clamping (max 12)

**Frontend Tests:**
- [ ] E2E test: Businesses page shows featured by default
- [ ] E2E test: Search overrides featured display
- [ ] E2E test: Admin can toggle featured status
- [ ] Performance test: Featured query response time under 200ms

**Database Performance:**
- [ ] Verify index usage with `EXPLAIN ANALYZE`
- [ ] Load test with 1000+ organizations
- [ ] Ensure featured query scales properly

## Success Criteria
- [ ] Featured businesses render by default on `/(app)/businesses` (max 6)
- [ ] Search results replace featured view when query exists
- [ ] Clearing search query restores featured view  
- [ ] Admin can toggle featured status with immediate UI feedback
- [ ] Server enforces max limit (12) and returns deterministic results
- [ ] All tests pass with no performance regressions
- [ ] Featured query response time under 200ms

## Technical Improvements Aligned with Codebase

### Following Existing Patterns
- **Schema-First**: Database schema changes defined first, then migration generation
- **Cursor Pagination**: Ready for future enhancement using existing pagination pattern
- **Method Chaining**: Hono routes use proper method chaining for type safety
- **Query Keys**: Centralized query key organization following existing structure
- **TanStack Table**: Admin interface matches existing organizations-table-view pattern
- **RPC Type Safety**: Full type inference from backend to frontend
- **Error Handling**: Consistent error handling with toast notifications

### Performance Considerations
- **Index Optimization**: Composite index on `(is_featured, featured_at desc)` for efficient queries
- **Server Limits**: Hard-coded max limit (12) prevents runaway queries
- **Cache Strategy**: 5-minute cache for featured organizations (low volatility)
- **Image URLs**: Follows existing pattern of adding imageUrl in response

### Future Enhancements (Not in Scope)
- **Promotional Content System**: Add promotional banners to featured business cards (sales, hiring, events, etc.)
- **Dynamic Promotions**: Admin interface to set custom promotional messages per business
- Cursor-based pagination for featured businesses (if list grows beyond 12)
- Featured business analytics in admin dashboard
- Automated featured status based on activity/engagement metrics
- Featured business email notifications for status changes