import { db } from '../db/index.js';
import { user } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function getUserById(userId: string) {
  const users = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return users[0] || null;
}

export async function updateUser(userId: string, data: { name?: string; image?: string | null }) {
  const updatedUsers = await db
    .update(user)
    .set({ 
      ...data,
      updatedAt: new Date()
    })
    .where(eq(user.id, userId))
    .returning();

  return updatedUsers[0] || null;
}