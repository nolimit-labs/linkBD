# Storage Reference Migration: File Keys → Storage IDs

> 📝 **Living Document** - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Everything should be documented.

## Overview
Migrate the database schema and application code from directly storing R2 file keys to referencing storage table IDs. This creates proper referential integrity and centralized file management, though it adds an extra join for fetching image URLs.

## Implementation Progress

- [ ] Phase 1: Database Schema Migration
- [ ] Phase 2: Backend Model Updates  
- [ ] Phase 3: Backend Route Updates
- [ ] Phase 4: Frontend Component Updates
- [ ] Phase 5: Data Migration & Cleanup
- [ ] Phase 6: Testing & Validation

## Phase Instructions

### Phase 1: Database Schema Migration
- [ ] Update `apps/server/src/db/schema.ts` to change image references:
  ```typescript
  // posts table
  imageId: text('image_id').references(() => storage.id, { onDelete: 'set null' }),
  
  // user table  
  imageId: text('image_id').references(() => storage.id, { onDelete: 'set null' }),
  ```
- [ ] Create Drizzle migration file:
  ```bash
  cd apps/server
  pnpm db:generate
  ```
- [ ] Review generated migration SQL and ensure it:
  - Adds new `imageId` columns
  - Maintains existing `imageKey`/`image` columns temporarily for data migration
  - Adds foreign key constraints

### Phase 2: Backend Model Updates
- [ ] Update `apps/server/src/models/posts.ts`:
  - [ ] Modify `createPost` to accept `imageId` instead of `imageKey`
  - [ ] Update `updatePost` to use `imageId`
  - [ ] Add joins to storage table in all SELECT queries
  - [ ] Update `updatePostImage` to accept storage ID
  ```typescript
  // Example for getPostById with storage join
  const results = await db
    .select({
      post: posts,
      image: storage
    })
    .from(posts)
    .leftJoin(storage, eq(posts.imageId, storage.id))
    .where(eq(posts.id, postId));
  ```

- [ ] Update `apps/server/src/models/user.ts`:
  - [ ] Modify `updateUser` to accept `imageId` instead of `image`
  - [ ] Add storage table joins for user queries
  
- [ ] Update `apps/server/src/models/storage.ts`:
  - [ ] Add `getFileById` function
  - [ ] Update access validation to use IDs

### Phase 3: Backend Route Updates
- [ ] Update `apps/server/src/routes/posts.ts`:
  - [ ] Change POST endpoint to accept `imageId` from client
  - [ ] Update response mapping to get file key from joined storage data
  - [ ] Modify image update endpoints to work with storage IDs
  ```typescript
  // Map URLs from joined storage data
  const postsWithDetails = await Promise.all(
    postList.map(async (item) => ({
      ...item.post,
      imageUrl: item.image ? await generateDownloadURL(item.image.fileKey) : null,
      hasLiked: await postModel.hasUserLikedPost(item.post.id, userId)
    }))
  );
  ```

- [ ] Update `apps/server/src/routes/user.ts`:
  - [ ] Change profile update to accept `imageId`
  - [ ] Update avatar URL generation from joined data

- [ ] Update `apps/server/src/routes/storage.ts`:
  - [ ] Return storage ID in upload response for client reference
  - [ ] Add endpoint to get storage record by ID if needed

### Phase 4: Frontend Component Updates
- [ ] Search and update all frontend components using image fields:
  ```bash
  grep -r "imageKey\|image:" apps/web-app/src
  ```
- [ ] Update post creation/editing components to store and use `imageId`
- [ ] Update user profile components to use `imageId`
- [ ] Ensure upload flows return and store the storage ID, not file key

### Phase 5: Data Migration & Cleanup
- [ ] Create migration script to populate new `imageId` columns:
  ```typescript
  // Migration script to map existing file keys to storage IDs
  async function migrateImageReferences() {
    // 1. Update posts.imageId from posts.imageKey
    const postsWithKeys = await db.select().from(posts).where(isNotNull(posts.imageKey));
    for (const post of postsWithKeys) {
      const storageRecord = await db.select().from(storage)
        .where(eq(storage.fileKey, post.imageKey)).limit(1);
      if (storageRecord[0]) {
        await db.update(posts).set({ imageId: storageRecord[0].id })
          .where(eq(posts.id, post.id));
      }
    }
    
    // 2. Update user.imageId from user.image
    // Similar logic for users
  }
  ```
- [ ] Run migration script on existing data
- [ ] Verify all image references are migrated
- [ ] Drop old columns (`imageKey`, `image`) after verification:
  ```sql
  ALTER TABLE posts DROP COLUMN image_key;
  ALTER TABLE "user" DROP COLUMN image;
  ```

### Phase 6: Testing & Validation
- [ ] Test post creation with images
- [ ] Test post editing and image updates
- [ ] Test user profile image updates
- [ ] Verify image deletion cascades properly
- [ ] Test organization context for images
- [ ] Performance test: measure query time impact of joins
- [ ] Ensure no broken image links in existing content

## Success Criteria
- All image references use storage table IDs with proper foreign keys
- No data loss during migration
- Referential integrity enforced at database level
- Image deletion properly cascades or sets null
- Frontend continues to work seamlessly
- Query performance remains acceptable (< 100ms for feed queries)

## Rollback Plan
- Keep backup of database before migration
- Maintain old columns during transition period
- Have reverse migration script ready to restore file keys if needed

## Notes
- Consider adding database indexes on new `imageId` columns for query performance
- May want to add a composite index on storage table for faster lookups
- Monitor R2 storage for orphaned files after migration