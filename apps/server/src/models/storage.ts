import { db } from '../db';
import { storage } from '../db/schema';
import { eq, and, isNull, desc } from 'drizzle-orm';

// =====================================================================
// Read Functions
// =====================================================================


// Get personal files for a user (where organizationId is null)
export async function getUserFiles(userId: string) {
  return await db.select()
    .from(storage)
    .where(and(
      eq(storage.userId, userId),
      isNull(storage.organizationId)
    ))
    .orderBy(desc(storage.createdAt));
}

// Get organization files
export async function getOrgFiles(organizationId: string) {
  return await db.select()
    .from(storage)
    .where(eq(storage.organizationId, organizationId))
    .orderBy(desc(storage.createdAt));
}

// Get a specific file by fileKey with access validation
export async function getFileByFileKey(fileKey: string, userId: string, organizationId?: string | null) {
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


// ================================
// Write Functions
// ================================

// Create a new file record in the database
export async function createFileRecord(data: {
  fileKey: string;
  userId: string;
  organizationId?: string | null;
  filename: string;
  mimeType: string;
  size: number;
}) {
  const [record] = await db.insert(storage).values({
    id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    ...data,
  }).returning();
  return record;
}


// Delete a file record from the database
export async function deleteFileRecord(fileKey: string) {
  await db.delete(storage).where(eq(storage.fileKey, fileKey));
}

