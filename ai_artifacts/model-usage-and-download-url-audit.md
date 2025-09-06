## Backend Audit: Model Usage and Download URL Generation

### Goals
- Ensure routes consistently rely on model helpers like `getUserById` / `getOrgById` or higher-level profile helpers.
- Move `generateDownloadURL` logic from routes into model functions to keep routes thin and consistent.

### Key Findings (by file)

#### routes/posts.ts
- Route-level image URL generation and author enrichment scattered across handlers:

```89:96:apps/server/src/routes/posts.ts
          author: {
            ...post.author,
            image: await generateDownloadURL(post.author.image),
            subscriptionPlan
          },
          imageUrl: await generateDownloadURL(post.imageKey),
          hasLiked: await postModel.hasUserLikedPost(post.id, user.id)
        };
```

```130:137:apps/server/src/routes/posts.ts
        id: userInfo.id,
        name: userInfo.name,
        image: await generateDownloadURL(userInfo.image),
        type: 'user' as const,
        isOfficial: userInfo.isOfficial || false,
        subscriptionPlan: authorSubscription?.plan || 'free'
      };
```

```256:263:apps/server/src/routes/posts.ts
        author = {
          id: orgInfo.id,
          name: orgInfo.name,
          image: await generateDownloadURL(orgInfo.imageKey),
          type: 'organization' as const,
          isOfficial: orgInfo.isOfficial || false,
          subscriptionPlan
        };
```

```268:272:apps/server/src/routes/posts.ts
    const postWithDetails = {
      ...post,
      author,
      imageUrl: await generateDownloadURL(post.imageKey),
      hasLiked: await postModel.hasUserLikedPost(post.id, user.id)
    };
```

```318:322:apps/server/src/routes/posts.ts
    const updatedWithDetails = {
      ...updated,
      imageUrl: await generateDownloadURL(updated.imageKey),
      hasLiked: await postModel.hasUserLikedPost(updated.id, user.id)
    };
```

```364:368:apps/server/src/routes/posts.ts
    const updatedWithDetails = {
      ...updated,
      imageUrl: await generateDownloadURL(updated.imageKey),
      hasLiked: await postModel.hasUserLikedPost(updated.id, user.id)
    };
```

- Uses `getUserById` / `getOrgById` (good), but enrichment (image URL + subscription) happens in the route.

#### routes/profile.ts
- Route calls `getUserById`/`getOrgById` (good) but still builds presentation details in the route (image URL + subscription):

```15:22:apps/server/src/routes/profile.ts
      // Try to fetch as user first
      const userInfo = await userModel.getUserById(profileId);
      
      if (userInfo) {
        // Generate avatar URL if user has an image
        const imageUrl = await generateDownloadURL(userInfo.image);
        
        // Get subscription data
        const subscription = await subscriptionModel.getUserActiveSubscription(userInfo.id);
```

```40:46:apps/server/src/routes/profile.ts
      if (orgInfo) {
        // Generate logo URL if organization has a logo or imageKey
        const imageUrl = await generateDownloadURL(orgInfo.imageKey || orgInfo.logo);
        
        // Get the organization owner's subscription
        let subscriptionPlan = 'free';
```

#### models/comments.ts
- `getCommentAuthor` directly queries tables (not via `userModel.getUserById` / `orgModel.getOrgById`) and returns raw `image`/`imageKey` without download URLs:

```242:285:apps/server/src/models/comments.ts
async function getCommentAuthor(comment: Comment) {
  if (comment.userId) {
    // Fetch user info
    const [userData] = await db
      .select({
        id: user.id,
        name: user.name,
        image: user.image,
      })
      .from(user)
      .where(eq(user.id, comment.userId));

    if (userData) {
      return {
        id: userData.id,
        name: userData.name,
        image: userData.image,
        type: 'user' as const,
      };
    }
  } else if (comment.organizationId) {
    // Fetch organization info
    const [orgData] = await db
      .select({
        id: organization.id,
        name: organization.name,
        imageKey: organization.imageKey,
      })
      .from(organization)
      .where(eq(organization.id, comment.organizationId));

    if (orgData) {
      return {
        id: orgData.id,
        name: orgData.name,
        image: orgData.imageKey,
        type: 'organization' as const,
      };
    }
  }

  return null;
}
```

#### models/posts.ts
- Model returns `author.image` as raw key from DB (user.image or org.imageKey). URL conversion is done later in routes:

```71:81:apps/server/src/models/posts.ts
      author: {
        id: sql<string>`COALESCE(${organization.id}, ${user.id})`.as('author_id'),
        name: sql<string>`COALESCE(${organization.name}, ${user.name})`.as('author_name'),
        image: sql<string | null>`COALESCE(${organization.imageKey}, ${user.image})`.as('author_image'),
        type: sql<'user' | 'organization'>`CASE 
          WHEN ${posts.userId} IS NULL THEN 'organization'
          ELSE 'user'
        END`.as('author_type'),
        isOfficial: sql<boolean>`COALESCE(${organization.isOfficial}, ${user.isOfficial}, false)`.as('author_is_official')
      }
```

### Gaps vs. Desired Pattern
- Routes are doing presentation work: generating download URLs and assembling author profiles/subscription data.
- `models/comments.ts` bypasses `userModel.getUserById`/`orgModel.getOrgById` and returns raw image keys.
- `models/posts.ts` returns raw image keys for both post and author; routes convert to URLs.

### Recommendations
- Introduce profile-centric model helpers to centralize enrichment:
  - `userModel.getUserPublicById(userId)` → { id, name, isOfficial, subscriptionPlan, imageUrl }
  - `orgModel.getOrgPublicById(orgId)` → { id, name, isOfficial, subscriptionPlan, imageUrl }
  - Optionally, a `profileModel.getActorPublicById(id)` that resolves user vs organization.

- Update model functions to return URL-ready fields:
  - In `models/comments.ts`, make `getCommentAuthor` use the public helpers above (or call `generateDownloadURL` directly) so comments always include `author.imageUrl` (or standardize `author.image` to be the URL).
  - In `models/posts.ts`, move image URL resolution (post `imageKey` → `imageUrl`) and author image URL resolution inside:
    - `getPublicPostsPaginated`, `getFollowingPostsPaginated`, `getPostById` (or add `getPostWithDetailsById`) should all return `imageUrl` and `author.imageUrl` already computed.
    - Also consider moving `hasUserLikedPost` computation into `getPostWithDetailsById` to keep routes thin when returning a single post.

- Refactor routes to call these enriched model functions:
  - `routes/posts.ts`: replace in-place enrichments with calls that already include `imageUrl`, `author.imageUrl`, and `subscriptionPlan`.
  - `routes/profile.ts`: reduce to a single `profileModel.getProfileById(id)` call that returns the fully shaped public profile with `imageUrl` and `subscriptionPlan`.

### Proposed Minimal API Additions (non-breaking)
- user model
  - `getUserPublicById(userId: string)`
- organization model
  - `getOrgPublicById(orgId: string)`
- profile model (new)
  - `getProfileById(id: string)` returning `{ type: 'user' | 'organization', id, name, imageUrl, isOfficial, subscriptionPlan, ... }`
- posts model
  - `getPostWithDetailsById(postId: string, viewerUserId: string, activeOrgId?: string | null)` returns URL-ready post + author + `hasLiked`.
  - Update paginated getters to emit URL-ready fields so feeds require no route-level enrichment.
- comments model
  - Update `getCommentAuthor` to return URL-ready `author` via profile helpers.

### Frontend Compatibility Note
- Today, frontends often use `author.image` as a URL (not raw key). Standardize the API so `author.image` is always a URL. If you prefer `author.imageUrl`, update web/mobile components accordingly (e.g., `comment-card.tsx`, `post-card.tsx`).

### Migration Plan
- Phase 1: Add new model helpers (non-breaking), keep routes unchanged.
- Phase 2: Switch routes to new helpers, remove route-level `generateDownloadURL` calls.
- Phase 3: Update existing model functions to return URL-ready fields; deprecate old patterns.
- Phase 4: Adjust any remaining frontend components expecting raw keys.

### Quick Wins
- Update `models/comments.ts#getCommentAuthor` first to return URL-ready images (visible impact on comments UI).
- Create `profileModel.getProfileById` and use it in `routes/profile.ts` to eliminate duplication.
- Add `postsModel.getPostWithDetailsById` and use it in `routes/posts.ts` show/detail handlers.

### Completed Refactor (this session)
- Updated model helpers to emit URL-ready images:
  - `userModel.getUserById` now returns `{ ...user, imageUrl }` using `generateDownloadURL(user.image)`.
  - `orgModel.getOrgById` now returns `{ ...org, imageUrl }` using `generateDownloadURL(org.imageKey || org.logo)`.
- Updated routes to use model-provided URLs and removed route-level URL generation:
  - `routes/posts.ts`: author images now use `userInfo.imageUrl` / `orgInfo.imageUrl`.
  - `routes/profile.ts`: profile image uses `imageUrl` from model (no direct URL generation in route).

Next steps (still recommended):
- Update `models/comments.ts#getCommentAuthor` to leverage the public profile helpers or generate URL internally so comment authors always include URL-ready images.
- Consider `postsModel.getPostWithDetailsById` to centralize `hasLiked` and post `imageUrl`.


