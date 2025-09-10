import { db } from '../db/index.js';
import { organization, member, posts, user, subscription } from '../db/schema.js';
import { eq, ilike, or, sql, desc, and, gt, count } from 'drizzle-orm';
import { generateDownloadURL } from '../lib/storage.js';

// ================================
// Read Functions
// ================================

// Get all organizations with pagination 
export async function getAllOrgsPaginated(paginationOptions: {
  limit?: number;
  cursor?: string;
}) {
  const { limit = 50, cursor } = paginationOptions;

  // Build where clause for cursor-based pagination
  const whereClause = cursor 
      ? gt(organization.createdAt, new Date(cursor))
      : undefined;

  // Always get organizations with member count
  const organizations = await db
      .select({
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          logo: organization.logo,
          createdAt: organization.createdAt,
          memberCount: count(member.userId),  
          isFeatured: organization.isFeatured,
      })
      .from(organization)
      .leftJoin(member, eq(organization.id, member.organizationId))
      .where(whereClause)
      .groupBy(organization.id)
      .orderBy(desc(organization.createdAt))
      .limit(limit + 1);

  // Check if there are more organizations for pagination
  const hasMore = organizations.length > limit;
  const orgsToReturn = hasMore ? organizations.slice(0, limit) : organizations;

  // Get the next cursor (last org's createdAt)
  const nextCursor = hasMore ? orgsToReturn[orgsToReturn.length - 1]?.createdAt.toISOString() : null;

  return {
      organizations: orgsToReturn,
      pagination: {
          hasMore,
          nextCursor,
      },
  };
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
      imageKey: organization.imageKey,
      description: organization.description,
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



// Get organization and generate image URL
export async function getOrgById(orgId: string) {
  const organizations = await db
    .select()
    .from(organization)
    .where(eq(organization.id, orgId))
    .limit(1);

  const base = organizations[0] || null;
  if (!base) return null;

  // Backward compatible: return original fields plus imageUrl
  const imageSource = base.imageKey || null;
  if (imageSource) {
    const imageUrl = await generateDownloadURL(imageSource);
    return {
    ...base,
      imageUrl,
    } 
  } else {
    return {
      ...base,
      imageUrl: null,
    }
  }
}

// Get organization profile with member count
export async function getOrgWithMemberCount(organizationId: string) {
  const orgInfo = await getOrgById(organizationId);
  if (!orgInfo) return null;

  const memberCount = await db
      .select({
          count: sql<number>`count(*)`.as('count'),
      })
      .from(member)
      .where(eq(member.organizationId, organizationId));


  return {
      ...orgInfo,
      memberCount: memberCount[0]?.count || 0,
  };
}

// Get organization members with avatar URLs
export async function getOrgMembers(organizationId: string) {
  const members = await db
      .select({
          userId: member.userId,
          role: member.role,
          userName: user.name,
          userEmail: user.email,
          userImage: user.image,
      })
      .from(member)
      .leftJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, organizationId));

  const membersList = await Promise.all(
      members.map(async (m) => ({
          userId: m.userId,
          role: m.role,
          name: m.userName,
          email: m.userEmail,
          image: m.userImage,
          avatarUrl: m.userImage ? await generateDownloadURL(m.userImage) : null,
      }))
  );

  return membersList;
}

// Get organization member by user id
export async function getOrgMemberByUserId(orgId: string, userId: string) {
  const members = await db
      .select()
      .from(member)
      .where(and(eq(member.organizationId, orgId), eq(member.userId, userId)));
  return members[0] || null;
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

// Get organization owner (user with 'owner' role)
export async function getOrgOwner(organizationId: string) {
  const owners = await db
    .select({
      userId: member.userId,
      userName: user.name,
      userEmail: user.email,
    })
    .from(member)
    .leftJoin(user, eq(member.userId, user.id))
    .where(
      and(
        eq(member.organizationId, organizationId),
        eq(member.role, 'owner')
      )
    )
    .limit(1);

  return owners[0] || null;
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

/**
 * Get organization profile by ID with subscription data
 * @param orgId - The organization ID to fetch
 * @returns Organization profile with owner's subscription plan or null if not found
 */
export async function getOrgProfileById(orgId: string) {
  // Get organization data with image URL
  const orgInfo = await getOrgById(orgId);
  if (!orgInfo) return null;

  // Get the organization owner's subscription
  let subscriptionPlan = 'free';
  const orgOwner = await getOrgOwner(orgInfo.id);
  if (orgOwner) {
    const ownerSubscription = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.referenceId, orgOwner.userId),
          or(
            eq(subscription.status, 'active'),
            eq(subscription.status, 'trialing')
          )
        )
      )
      .limit(1);
    
    subscriptionPlan = ownerSubscription[0]?.plan || 'free';
  }
  
  return {
    id: orgInfo.id,
    name: orgInfo.name,
    image: orgInfo.imageUrl,
    description: orgInfo.description || null,
    type: 'organization' as const,
    isOfficial: orgInfo.isOfficial || false,
    subscriptionPlan,
    createdAt: orgInfo.createdAt
  };
}

// ================================
// Write Functions
// ================================


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
    imageKey?: string | null;
    description?: string | null;
    metadata?: string | null;
    stripeCustomerId?: string | null;
    isFeatured?: boolean;
    featuredAt?: Date | null;
  }
) {
  const updatedOrganizations = await db
    .update(organization)
    .set(data)
    .where(eq(organization.id, organizationId))
    .returning();

  return updatedOrganizations[0] || null;
}

// Get featured organizations with server-side limit enforcement
export async function getFeaturedOrganizations(limit = 6) {
  const maxLimit = Math.min(limit, 12); // Server-side limit enforcement
  
  return await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      imageKey: organization.imageKey,
      description: organization.description,
      createdAt: organization.createdAt,
      isFeatured: organization.isFeatured,
      featuredAt: organization.featuredAt,
      isOfficial: organization.isOfficial,
    })
    .from(organization)
    .where(eq(organization.isFeatured, true))
    .orderBy(desc(organization.featuredAt))
    .limit(maxLimit);
}

// Delete organization
export async function deleteOrg(orgId: string) {
  const deletedOrganizations = await db
    .delete(organization)
    .where(eq(organization.id, orgId))
    .returning();

  return deletedOrganizations[0] || null;
}