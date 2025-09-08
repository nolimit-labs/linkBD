import { db } from "../db";
import { user, organization } from "../db/schema";
import { eq } from "drizzle-orm";

// ===============================
// This file is for helper functions that are used across all other model files
// ===============================

/**
 * Auto-detect if an ID belongs to a user or organization
 * @param id - The ID to detect the type of
 * @returns 'user' if the ID belongs to a user, 'organization' if it belongs to an organization, and null if it belongs to neither
 */
export async function detectEntityType(id: string): Promise<'user' | 'organization' | null> {
    // Check if it's a user
    const userResult = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.id, id))
      .limit(1);
    
    if (userResult.length > 0) {
      return 'user';
    }
    
    // Check if it's an organization
    const orgResult = await db
      .select({ id: organization.id })
      .from(organization)
      .where(eq(organization.id, id))
      .limit(1);
    
    if (orgResult.length > 0) {
      return 'organization';
    }
    
    return null;
  }