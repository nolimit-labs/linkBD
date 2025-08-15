import { db } from '../db/index.js';
import { organization, member, posts } from '../db/schema.js';
import { eq, ilike, or, sql, desc, and } from 'drizzle-orm';

// Get organization by ID
export async function getOrgById(orgId: string) {
  const organizations = await db
    .select()
    .from(organization)
    .where(eq(organization.id, orgId))
    .limit(1);

  return organizations[0] || null;
}

// Create a new organization
export async function createOrg(data: {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  metadata?: string;
}) {
  const createdOrganizations = await db
    .insert(organization)
    .values({
      ...data,
      createdAt: new Date(),
    })
    .returning();

  return createdOrganizations[0] || null;
}

// Update organization
export async function updateOrg(
  organizationId: string,
  data: { 
    name?: string; 
    slug?: string;
    logo?: string | null;
    metadata?: string | null;
    stripeCustomerId?: string | null;
  }
) {
  const updatedOrganizations = await db
    .update(organization)
    .set(data)
    .where(eq(organization.id, organizationId))
    .returning();

  return updatedOrganizations[0] || null;
}

// Delete organization
export async function deleteOrg(orgId: string) {
  const deletedOrganizations = await db
    .delete(organization)
    .where(eq(organization.id, orgId))
    .returning();

  return deletedOrganizations[0] || null;
}

// Get organization by slug
export async function getOrgBySlug(slug: string) {
  const organizations = await db
    .select()
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1);

  return organizations[0] || null;
}

// Get organization profile with member count and post count
export async function getOrgProfile(organizationId: string) {
  const orgInfo = await getOrgById(organizationId);
  if (!orgInfo) return null;

  const memberCount = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(member)
    .where(eq(member.organizationId, organizationId));

  const postCount = await db
    .select({
      count: sql<number>`count(*)`.as('count'),
    })
    .from(posts)
    .where(eq(posts.organizationId, organizationId));
  
  return {
    ...orgInfo,
    memberCount: memberCount[0]?.count || 0,
    postCount: postCount[0]?.count || 0,
  };
}

// Get organization member by user id
export async function getOrgMemberByUserId(orgId: string, userId: string) {
  const members = await db
    .select()
    .from(member)
    .where(and(eq(member.organizationId, orgId), eq(member.userId, userId)));
  return members[0] || null;
}

// Search organizations by name or slug
export async function searchOrganizations(query: string, limit = 20, offset = 0) {
  const searchPattern = `%${query}%`;
  
  return await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      createdAt: organization.createdAt,
    })
    .from(organization)
    .where(
      or(
        ilike(organization.name, searchPattern),
        ilike(organization.slug, searchPattern)
      )
    )
    .orderBy(desc(organization.createdAt))
    .limit(limit)
    .offset(offset);
}

// Get organizations for a user (organizations where user is a member)
export async function getUserOrganizations(userId: string) {
  return await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      createdAt: organization.createdAt,
      role: member.role,
      memberSince: member.createdAt,
    })
    .from(organization)
    .innerJoin(member, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId))
    .orderBy(desc(member.createdAt));
}

// Check if user is member of organization
export async function isUserMemberOfOrganization(userId: string, organizationId: string) {
  const members = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.userId, userId),
        eq(member.organizationId, organizationId)
      )
    )
    .limit(1);

  return members.length > 0;
}

// Get user's role in organization
export async function getUserRoleInOrganization(userId: string, organizationId: string) {
  const members = await db
    .select({
      role: member.role,
    })
    .from(member)
    .where(
      and(
        eq(member.userId, userId),
        eq(member.organizationId, organizationId)
      )
    )
    .limit(1);

  return members[0]?.role || null;
}