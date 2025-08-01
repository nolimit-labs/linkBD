# Database-Backed File Storage with Organization Isolation Implementation Roadmap

> 📝 **Living Document** - This roadmap is actively updated as phases are executed. Check items off as completed. Also update the roadmap with any additional work done. Everything should be documented.

## Overview
Migrate from R2-only file storage to a database-backed approach with proper organization isolation. This will enable secure file separation between personal and organization contexts, better access control, metadata tracking, and easier file management. Files will remain stored in R2 but with database records tracking ownership and access permissions.

## Implementation Progress

- [x] Phase 1: Database Schema & Migration Setup
- [x] Phase 2: Backend Storage Models & Logic  
- [x] Phase 3: Storage Route Updates with Organization Context
- [x] Phase 4: Frontend API Updates
- [ ] Phase 5: Testing & Validation

## Phase Instructions

### Phase 1: Database Schema & Migration Setup

- [ ] Create `storage` table schema in `apps/server/src/db/schema.ts`
  ```typescript
  import { pgTable, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
  
  export const storage = pgTable('storage', {
    id: text('id').primaryKey().$defaultFn(() => generateId()),
    fileKey: text('file_key').notNull().unique(),
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    organizationId: text('organization_id').references(() => organization.id, { onDelete: 'cascade' }),
    filename: text('filename').notNull(),
    mimeType: text('mime_type').notNull(),
    size: integer('size').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  }, (table) => ({
    userIdIdx: index('idx_storage_user_id').on(table.userId),
    organizationIdIdx: index('idx_storage_organization_id').on(table.organizationId),
    createdAtIdx: index('idx_storage_created_at').on(table.createdAt),
  }));
  ```

- [ ] Create database migration file for the new storage table
  ```bash
  # Generate migration
  pnpm db:generate
  ```

- [ ] Run migration in development environment
  ```bash
  pnpm db:migrate
  ```

### Phase 2: Backend Storage Models & Logic

- [ ] Create storage model file `apps/server/src/models/storage.ts`
  ```typescript
  import { db } from '../db';
  import { storage } from '../db/schema';
  import { eq, and, isNull, desc } from 'drizzle-orm';
  
  export async function createFileRecord(data: {
    fileKey: string;
    userId: string;
    organizationId?: string | null;
    filename: string;
    mimeType: string;
    size: number;
  }) {
    const [record] = await db.insert(storage).values({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
    }).returning();
    return record;
  }
  
  export async function getUserFiles(userId: string) {
    // Get personal files (where organizationId is null)
    return await db.select()
      .from(storage)
      .where(and(
        eq(storage.userId, userId),
        isNull(storage.organizationId)
      ))
      .orderBy(desc(storage.createdAt));
  }
  
  export async function getOrgFiles(organizationId: string) {
    // Get organization files
    return await db.select()
      .from(storage)
      .where(eq(storage.organizationId, organizationId))
      .orderBy(desc(storage.createdAt));
  }
  
  export async function getFileById(fileKey: string, userId: string, organizationId?: string | null) {
    const results = await db.select()
      .from(storage)
      .where(eq(storage.fileKey, fileKey));
    
    const file = results[0];
    if (!file) return null;
    
    // Validate access based on context
    if (organizationId && file.organizationId === organizationId) {
      return file; // Organization file access
    } else if (!organizationId && file.organizationId === null && file.userId === userId) {
      return file; // Personal file access
    }
    
    return null; // No access
  }
  
  export async function deleteFileRecord(fileKey: string) {
    await db.delete(storage).where(eq(storage.fileKey, fileKey));
  }
  ```

- [ ] Update R2 file path generation logic
  ```typescript
  // Helper function for generating storage paths
  export function generateStoragePath(userId: string, organizationId: string | null, filename: string): string {
    const timestamp = Date.now();
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${timestamp}-${sanitizedFilename}`;
    
    if (organizationId) {
      return `uploads/orgs/${organizationId}/${uniqueFilename}`;
    }
    return `uploads/users/${userId}/${uniqueFilename}`;
  }
  ```

### Phase 3: Storage Route Updates with Organization Context

- [ ] Update storage routes to use database and organization context
  ```typescript
  // Update list endpoint in apps/server/src/routes/storage.ts
  .get('/list', authMiddleware, async (c) => {
    const session = c.get('session');
    const organizationId = session.activeOrganizationId;
    
    try {
      const files = await storageModel.getUserFiles(session.userId, organizationId);
      return c.json({ files });
    } catch (error) {
      console.error('Storage list error:', error);
      return c.json({ error: 'Failed to list files' }, 500);
    }
  })
  ```

- [ ] Update upload-url endpoint to create database records
  ```typescript
  .post('/upload-url', authMiddleware, zValidator('json', uploadRequestSchema), async (c) => {
    const session = c.get('session');
    const organizationId = session.activeOrganizationId;
    const { fileName, fileType, fileSize } = c.req.valid('json');
    
    // Generate storage path based on context
    const fileKey = generateStoragePath(session.userId, organizationId, fileName);
    
    try {
      // Create database record first
      const fileRecord = await storageModel.createFileRecord({
        fileKey,
        userId: session.userId,
        organizationId,
        filename: fileName,
        mimeType: fileType,
        size: fileSize,
      });
      
      // Generate presigned URL for R2 upload
      const command = new PutObjectCommand({
        Bucket: 'os-saas-starter-1',
        Key: fileKey,
        ContentType: fileType,
        ContentLength: fileSize,
        Metadata: {
          userId: session.userId,
          organizationId: organizationId || '',
          originalName: fileName,
        }
      });
      
      const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 600 });
      
      return c.json({
        uploadUrl,
        fileKey,
        recordId: fileRecord.id,
        expiresIn: 600,
      });
      
    } catch (error) {
      console.error('Storage upload URL generation error:', error);
      return c.json({ error: 'Failed to generate upload URL' }, 500);
    }
  })
  ```

- [ ] Update download-url endpoint with access validation
  ```typescript
  .post('/download-url', authMiddleware, zValidator('json', z.object({
    fileKey: z.string().min(1)
  })), async (c) => {
    const session = c.get('session');
    const organizationId = session.activeOrganizationId;
    const { fileKey } = c.req.valid('json');
    
    try {
      // Validate file access through database
      const file = await storageModel.getFileById(fileKey, session.userId, organizationId);
      if (!file) {
        return c.json({ error: 'File not found or access denied' }, 404);
      }
      
      // Generate presigned URL for R2
      const command = new GetObjectCommand({
        Bucket: 'os-saas-starter-1',
        Key: fileKey,
      });
      
      const downloadUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });
      
      return c.json({
        downloadUrl,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        expiresIn: 3600,
      });
      
    } catch (error) {
      console.error('Storage download URL generation error:', error);
      return c.json({ error: 'Failed to generate download URL' }, 500);
    }
  })
  ```

- [ ] Add file deletion endpoint with proper cleanup
  ```typescript
  .delete('/:fileKey', authMiddleware, async (c) => {
    const session = c.get('session');
    const organizationId = session.activeOrganizationId;
    const fileKey = c.req.param('fileKey');
    
    try {
      // Validate file access
      const file = await storageModel.getFileById(fileKey, session.userId, organizationId);
      if (!file) {
        return c.json({ error: 'File not found or access denied' }, 404);
      }
      
      // Delete from R2
      const deleteCommand = new DeleteObjectCommand({
        Bucket: 'os-saas-starter-1',
        Key: fileKey,
      });
      await r2.send(deleteCommand);
      
      // Delete database record
      await storageModel.deleteFileRecord(fileKey);
      
      return c.json({ message: 'File deleted successfully' });
      
    } catch (error) {
      console.error('Storage deletion error:', error);
      return c.json({ error: 'Failed to delete file' }, 500);
    }
  })
  ```

### Phase 4: Frontend API Updates

- [x] Update storage API hooks to handle new response format and organization context
- [x] Update query keys to differentiate between personal and organization files
- [x] Update file upload mutations to invalidate correct queries based on organization context
- [x] Add visual indicators showing file context (personal vs organization) in images page
- [x] Add file deletion hook with proper error handling and cache invalidation

### Phase 6: Testing & Validation

- [ ] Test personal file upload and retrieval (no active organization)
- [ ] Test organization file upload and retrieval
- [ ] Test switching between organizations updates file list
- [ ] Test file access validation prevents cross-context access
- [ ] Test file deletion removes both R2 object and database record
- [ ] Verify migration script works correctly with existing files
- [ ] Performance test with large file lists
- [ ] Test edge cases (corrupted records, missing R2 files, etc.)

## Success Criteria

- Files are properly isolated between personal and organization contexts
- Database records accurately track all file metadata and access permissions
- Users cannot access files from contexts they don't have permission for
- File operations (upload, download, delete, list) work seamlessly in both contexts
- Migration preserves all existing files without data loss
- Performance is maintained or improved compared to R2-only approach
- Clear visual indicators show users which context their files belong to
- No security vulnerabilities allow unauthorized file access