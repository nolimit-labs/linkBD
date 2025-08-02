import { db } from '../db/index.js';
import { user, posts } from '../db/schema.js';
import { eq, like, or, sql, desc } from 'drizzle-orm';

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

// Get user profile with post count
export async function getUserProfile(userId: string) {
  const userInfo = await getUserById(userId);
  if (!userInfo) return null;

  const postCount = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(posts)
    .where(eq(posts.userId, userId));
  
  return {
    ...userInfo,
    postCount: postCount[0]?.count || 0,
  };
}

// Search users by name or email
export async function searchUsers(query: string, limit = 20, offset = 0) {
  const searchPattern = `%${query}%`;
  
  return await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(
      or(
        like(user.name, searchPattern),
        like(user.email, searchPattern)
      )
    )
    .orderBy(user.name)
    .limit(limit)
    .offset(offset);
}