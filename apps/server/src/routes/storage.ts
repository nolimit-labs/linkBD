import { Hono } from 'hono';
import { authMiddleware, type AuthVariables } from '../middleware/auth';
import * as r2 from '../lib/storage';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as storageModel from '../models/storage';

const BUCKET_NAME = process.env.R2_BUCKET_NAME!;
if (!BUCKET_NAME) {
  throw new Error('R2_BUCKET_NAME is not set');
}

const uploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileType: z.string().min(1),
  fileSize: z.number().max(10 * 1024 * 1024), // 10MB limit
});

const storageRoute = new Hono<{ Variables: AuthVariables }>()
  // Gets user or organization uploaded files
  .get('/', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');

    try {
      // Get files from database based on organization context
      const files = activeOrganizationId
        ? await storageModel.getOrgFiles(activeOrganizationId)
        : await storageModel.getUserFiles(userId);

      // Map download URLs for each file
      const filesWithUrls = await Promise.all(
        files.map(async (file) => ({
          ...file,
          downloadUrl: await r2.generateDownloadURL(file.fileKey)
        }))
      );

      return c.json({ files: filesWithUrls });

    } catch (error) {
      console.error('Storage list error:', error);
      return c.json({ error: 'Failed to list files' }, 500);
    }
  })

  // Generate presigned URL for file upload
  .post('/upload-url', authMiddleware, zValidator('json', uploadRequestSchema), async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const { fileName, fileType, fileSize } = c.req.valid('json');

    // Validate file type (images only)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      return c.json({ error: 'Invalid file type. Only images are allowed.' }, 400);
    }

    // Generate storage path based on context (user or org)
    const fileKey = r2.generateStoragePath(userId, activeOrganizationId, fileName);

    try {
      // Create database record first
      const fileRecord = await storageModel.createFileRecord({
        fileKey,
        userId,
        organizationId: activeOrganizationId,
        filename: fileName,
        mimeType: fileType,
        size: fileSize,
      });

      // Generate presigned URL for R2 upload
      const uploadUrl = await r2.generateUploadURL(fileKey, fileType, fileSize, userId, activeOrganizationId, fileName);

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

  // Get presigned URL for file download/viewing
  .post('/download-url', authMiddleware, zValidator('json', z.object({
    fileKey: z.string().min(1)
  })), async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const { fileKey } = c.req.valid('json');

    try {
      // Validate file access through database
      const file = await storageModel.getFileByFileKey(fileKey, userId, activeOrganizationId);
      if (!file) {
        return c.json({ error: 'File not found or access denied' }, 404);
      }

      // Generate presigned URL for R2
      const downloadUrl = await r2.generateDownloadURL(fileKey);

      return c.json({
        downloadUrl: downloadUrl,
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

  // Delete a file
  .delete('/:fileKey', authMiddleware, async (c) => {
    const { userId, activeOrganizationId } = c.get('session');
    const fileKey = c.req.param('fileKey');

    try {
      // Validate file access
      const file = await storageModel.getFileByFileKey(fileKey, userId, activeOrganizationId);
      if (!file) {
        return c.json({ error: 'File not found or access denied' }, 404);
      }

      // Delete from R2
      await r2.deleteFile(fileKey);

      // Delete database record
      await storageModel.deleteFileRecord(fileKey);

      return c.json({ message: 'File deleted successfully' });

    } catch (error) {
      console.error('Storage deletion error:', error);
      return c.json({ error: 'Failed to delete file' }, 500);
    }
  });

export default storageRoute;