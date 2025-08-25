import { db } from '../db';
import { migrationRuns,  user as users, organization as organizations, storage } from '../db/schema';
import { eq, and, isNull, isNotNull, desc, sql } from 'drizzle-orm';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { spawn } from 'child_process';
import { v4 as uuid } from 'uuid';
import * as userModel from './user';
import * as organizationModel from './organization';
import { generateDownloadURL } from '../lib/storage';

// This is for admin tasks only. It may seem like this is redundant, but there is some extra data that is needed for the admin app and used in the admin routes.

// ================================
// User Management Functions
// ================================

// Get user profile for admin with all related data
export async function getUserProfileForAdmin(userId: string) {
  // Get the base user profile
  const userProfile = await userModel.getUserById(userId);
  if (!userProfile) {
    return null;
  }

  // Generate avatar URL if user has an image
  const avatarUrl = userProfile.image ? await generateDownloadURL(userProfile.image) : null;
  
  // Get organization memberships for this user
  const memberships = await userModel.getUserMembershipsByUserId(userId);

  const organizations = memberships.map(membership => ({
    organizationId: membership.organizationId,
    organizationName: membership.organizationName,
    role: membership.role,
  }));

  return {
    profile: {
      id: userProfile.id,
      email: userProfile.email,
      emailVerified: userProfile.emailVerified,
      name: userProfile.name,
      image: userProfile.image,
      avatarUrl,
      role: userProfile.role,
      banned: userProfile.banned || false,
      banReason: userProfile.banReason,
      banExpires: userProfile.banExpires,
      createdAt: userProfile.createdAt,
      updatedAt: userProfile.updatedAt,
    },
    organizations,
  };
}

// ================================
// Organization Management Functions
// ================================

// Get organization profile for admin with all related data
export async function getOrgProfileForAdmin(organizationId: string) {
  // Get the organization profile with member count
  const orgProfile = await organizationModel.getOrgWithMemberCount(organizationId);
  if (!orgProfile) {
      return null;
  }

  // Generate logo URL if organization has a logo
  const logoUrl = orgProfile.logo ? await generateDownloadURL(orgProfile.logo) : null;

  // Get organization members
  const membersList = await organizationModel.getOrgMembers(organizationId);

  return {
      profile: {
          id: orgProfile.id,
          name: orgProfile.name,
          slug: orgProfile.slug,
          logo: orgProfile.logo,
          logoUrl,
          createdAt: orgProfile.createdAt,
          memberCount: orgProfile.memberCount,
      },
      members: membersList,
  };
}

// =====================================================================
// Migration Management Functions
// =====================================================================

// Get list of available migration files from the filesystem
export async function getAvailableMigrations() {
  const migrationsDir = join(process.cwd(), 'src/db/admin/migrations');
  
  try {
    const files = await readdir(migrationsDir);
    const migrationFiles = files
      .filter(file => file.endsWith('.ts'))
      .sort()
      .map(file => {
        const [sequence, ...nameParts] = file.replace('.ts', '').split('_');
        return {
          filename: file,
          sequence,
          name: nameParts.join('_'),
          path: join(migrationsDir, file),
        };
      });
    
    return migrationFiles;
  } catch (error) {
    console.error('Error reading migrations directory:', error);
    return [];
  }
}

// Get migration run history from database
export async function getMigrationHistory(limit = 50) {
  const history = await db
    .select({
      id: migrationRuns.id,
      migrationFile: migrationRuns.migrationFile,
      status: migrationRuns.status,
      startedAt: migrationRuns.startedAt,
      completedAt: migrationRuns.completedAt,
      error: migrationRuns.error,
      runBy: migrationRuns.runBy,
      runByEmail: users.email,
      runByName: users.name,
    })
    .from(migrationRuns)
    .leftJoin(users, eq(migrationRuns.runBy, users.id))
    .orderBy(desc(migrationRuns.startedAt))
    .limit(limit);
  
  return history;
}

// Get status of a specific migration
export async function getMigrationStatus(filename: string) {
  const latestRun = await db
    .select()
    .from(migrationRuns)
    .where(eq(migrationRuns.migrationFile, filename))
    .orderBy(desc(migrationRuns.startedAt))
    .limit(1);
  
  return latestRun[0] || null;
}

// Record a new migration run
export async function recordMigrationRun(data: {
  migrationFile: string;
  status: 'running' | 'completed' | 'failed' | 'rolled_back';
  runBy: string;
  error?: string;
}) {
  const runId = uuid();
  
  const [migrationRun] = await db
    .insert(migrationRuns)
    .values({
      id: runId,
      migrationFile: data.migrationFile,
      status: data.status,
      startedAt: new Date(),
      completedAt: data.status !== 'running' ? new Date() : null,
      error: data.error || null,
      runBy: data.runBy,
    })
    .returning();
  
  return migrationRun;
}

// Update migration run status
export async function updateMigrationRunStatus(
  runId: string,
  status: 'completed' | 'failed' | 'rolled_back',
  error?: string
) {
  const [updated] = await db
    .update(migrationRuns)
    .set({
      status,
      completedAt: new Date(),
      error: error || null,
    })
    .where(eq(migrationRuns.id, runId))
    .returning();
  
  return updated;
}

// Execute a migration with proper tracking
export async function executeMigration(filename: string, userId: string): Promise<{
  success: boolean;
  runId: string;
  output?: string;
  error?: string;
}> {
  const migrationsDir = join(process.cwd(), 'src/db/admin/migrations');
  const migrationPath = join(migrationsDir, filename);
  
  // Create initial migration run record
  const migrationRun = await recordMigrationRun({
    migrationFile: filename,
    status: 'running',
    runBy: userId,
  });
  
  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';
    
    const child = spawn('npx', ['tsx', migrationPath], {
      shell: true,
      cwd: process.cwd(),
    });
    
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', async (code) => {
      if (code === 0) {
        await updateMigrationRunStatus(migrationRun.id, 'completed');
        resolve({
          success: true,
          runId: migrationRun.id,
          output,
        });
      } else {
        const error = errorOutput || `Migration failed with exit code ${code}`;
        await updateMigrationRunStatus(migrationRun.id, 'failed', error);
        resolve({
          success: false,
          runId: migrationRun.id,
          error,
          output,
        });
      }
    });
    
    child.on('error', async (err) => {
      const error = `Failed to start migration: ${err.message}`;
      await updateMigrationRunStatus(migrationRun.id, 'failed', error);
      resolve({
        success: false,
        runId: migrationRun.id,
        error,
      });
    });
  });
}

// Rollback a migration with proper tracking
export async function rollbackMigration(filename: string, userId: string): Promise<{
  success: boolean;
  runId: string;
  output?: string;
  error?: string;
}> {
  const migrationsDir = join(process.cwd(), 'src/db/admin/migrations');
  const migrationPath = join(migrationsDir, filename);
  
  // Create rollback run record
  const migrationRun = await recordMigrationRun({
    migrationFile: filename,
    status: 'running',
    runBy: userId,
  });
  
  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';
    
    const child = spawn('npx', ['tsx', migrationPath, '--rollback'], {
      shell: true,
      cwd: process.cwd(),
    });
    
    child.stdout?.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr?.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    child.on('close', async (code) => {
      if (code === 0) {
        await updateMigrationRunStatus(migrationRun.id, 'rolled_back');
        resolve({
          success: true,
          runId: migrationRun.id,
          output,
        });
      } else {
        const error = errorOutput || `Rollback failed with exit code ${code}`;
        await updateMigrationRunStatus(migrationRun.id, 'failed', error);
        resolve({
          success: false,
          runId: migrationRun.id,
          error,
          output,
        });
      }
    });
    
    child.on('error', async (err) => {
      const error = `Failed to start rollback: ${err.message}`;
      await updateMigrationRunStatus(migrationRun.id, 'failed', error);
      resolve({
        success: false,
        runId: migrationRun.id,
        error,
      });
    });
  });
}

// Check if a migration is currently running
export async function isMigrationRunning(): Promise<boolean> {
  const runningMigrations = await db
    .select({ count: sql<number>`count(*)` })
    .from(migrationRuns)
    .where(eq(migrationRuns.status, 'running'));
  
  return runningMigrations[0].count > 0;
}

// =====================================================================
// Orphaned Resource Detection Functions (Placeholder for Phase 3)
// =====================================================================



// Find files without references in todos, users, or organizations
export async function findOrphanedFiles() {
  // Get all referenced file keys from different sources
  

  
  // 2. Files referenced directly in user profiles (image field contains file key)
  const referencedInUsers = await db
    .select({ fileKey: users.image })
    .from(users)
    .where(isNotNull(users.image));
  
  // 3. Files referenced directly in organization logos (logo field contains file key)
  const referencedInOrgs = await db
    .select({ fileKey: organizations.logo })
    .from(organizations)
    .where(isNotNull(organizations.logo));
  
  // Combine all referenced file keys
  const allReferencedKeys = new Set<string>();
  
  referencedInUsers.forEach(ref => ref.fileKey && allReferencedKeys.add(ref.fileKey));
  referencedInOrgs.forEach(ref => ref.fileKey && allReferencedKeys.add(ref.fileKey));
  
  // Get all files from storage
  const allFiles = await db.select().from(storage);
  
  // Filter out files that are referenced
  const orphanedFiles = allFiles.filter(file => !allReferencedKeys.has(file.fileKey));
  
  return orphanedFiles;
}

// Get summary statistics for orphaned resources
export async function getOrphanedResourcesSummary() {
  const orphanedFiles = await findOrphanedFiles();
  
  return {

    files: {
      count: orphanedFiles.length,
      totalSize: orphanedFiles.reduce((sum, file) => sum + (file.size || 0), 0),
      items: orphanedFiles.slice(0, 5), // Preview first 5
    },
    totalOrphaned: orphanedFiles.length,
  };
}

// Delete a specific orphaned resource
export async function deleteOrphanedResource(type: 'file', id: string) {
  if (type === 'file') {
    await db.delete(storage).where(eq(storage.id, id));
  }
  
  return { success: true, type, id };
}

// Batch delete orphaned resources
export async function batchDeleteOrphans(type: 'todo' | 'file', ids: string[]) {
  const results = await db.transaction(async (tx) => {
    const deleted = [];
    
    for (const id of ids) {
      if (type === 'file') {
        await tx.delete(storage).where(eq(storage.id, id));
      }
      deleted.push(id);
    }
    
    return deleted;
  });
  
  return {
    success: true,
    type,
    deletedCount: results.length,
    deletedIds: results,
  };
}