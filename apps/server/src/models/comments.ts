import { db } from '../db';
import { comments, user, organization, type Comment, type NewComment } from '../db/schema';
import * as userModel from './user';
import * as orgModel from './organization';
import { eq, and, desc, lt, sql, isNull } from 'drizzle-orm';



// ================================
// Read Functions
// ================================

// Get paginated comments for a post (top-level comments only)
export async function getPostComments(
  postId: string,
  limit: number = 20,
  cursor?: string
) {
  // Build where conditions
  const whereConditions = [
    eq(comments.postId, postId),
    isNull(comments.parentId) // Only top-level comments
  ];

  // Apply cursor for pagination
  if (cursor) {
    const cursorDate = new Date(cursor);
    whereConditions.push(lt(comments.createdAt, cursorDate));
  }

  const results = await db
    .select({
      comment: comments,
      repliesCount: sql<number>`(
        SELECT COUNT(*)::int 
        FROM ${comments} AS replies
        WHERE replies.parent_id = ${comments.id}
      )`,
    })
    .from(comments)
    .where(and(...whereConditions))
    .orderBy(desc(comments.createdAt))
    .limit(limit + 1); // Fetch one extra to check if there's more

  // Process results for pagination
  const hasMore = results.length > limit;
  const commentsData = hasMore ? results.slice(0, -1) : results;

  // Map to include author info and replies count
  const commentsWithAuthors = await Promise.all(
    commentsData.map(async ({ comment, repliesCount }) => {
      const author = await getCommentAuthor(comment);
      return {
        ...comment,
        author,
        repliesCount,
      };
    })
  );

  return {
    comments: commentsWithAuthors,
    nextCursor: hasMore 
      ? commentsData[commentsData.length - 1].comment.createdAt.toISOString()
      : null,
    hasMore,
  };
}

// Get nested replies for a comment
export async function getCommentReplies(
  commentId: string,
  limit: number = 10,
  cursor?: string
) {
  // Build where conditions
  const whereConditions = [eq(comments.parentId, commentId)];

  // Apply cursor for pagination
  if (cursor) {
    const cursorDate = new Date(cursor);
    whereConditions.push(lt(comments.createdAt, cursorDate));
  }

  const results = await db
    .select()
    .from(comments)
    .where(and(...whereConditions))
    .orderBy(desc(comments.createdAt))
    .limit(limit + 1);

  // Process results for pagination
  const hasMore = results.length > limit;
  const commentsData = hasMore ? results.slice(0, -1) : results;

  // Map to include author info
  const commentsWithAuthors = await Promise.all(
    commentsData.map(async (comment) => {
      const author = await getCommentAuthor(comment);
      return {
        ...comment,
        author,
      };
    })
  );

  return {
    comments: commentsWithAuthors,
    nextCursor: hasMore 
      ? commentsData[commentsData.length - 1].createdAt.toISOString()
      : null,
    hasMore,
  };
}


// Get a single comment by ID
export async function getCommentById(commentId: string) {
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId));

  if (!comment) {
    return null;
  }

  const author = await getCommentAuthor(comment);
  return {
    ...comment,
    author,
  };
}

// Helper: Check if user/org owns a comment
async function checkCommentOwnership(
  commentId: string,
  authorId: string,
  authorType: 'user' | 'organization'
): Promise<boolean> {
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId));

  if (!comment) {
    return false;
  }

  if (authorType === 'user') {
    return comment.userId === authorId;
  } else {
    return comment.organizationId === authorId;
  }
}

// Helper: Get author information for a comment
async function getCommentAuthor(comment: Comment) {
  if (comment.userId) {
    const userInfo = await userModel.getUserById(comment.userId);
    if (userInfo) {
      return {
        ...userInfo,
        type: 'user' as const,
        isOfficial: userInfo.isOfficial || false,
      };
    }
  } else if (comment.organizationId) {
    const orgInfo = await orgModel.getOrgById(comment.organizationId);
    if (orgInfo) {
      return {
        ...orgInfo,
        type: 'organization' as const,
        isOfficial: orgInfo.isOfficial || false,
      };
    }
  }

  return null;
}

// Count comments for a post (for updating post stats)
export async function getCommentCount(postId: string) {
  const [result] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(comments)
    .where(eq(comments.postId, postId));

  return result?.count || 0;
}

// ================================
// Write Functions
// ================================

// Create a new comment
export async function createComment(
  postId: string,
  content: string,
  authorId: string,
  authorType: 'user' | 'organization',
  parentId?: string
){
  // Generate ID similar to posts
  const commentId = `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newComment: NewComment = {
    id: commentId,
    postId,
    content,
    parentId: parentId || null,
    userId: authorType === 'user' ? authorId : null,
    organizationId: authorType === 'organization' ? authorId : null,
    isEdited: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [comment] = await db
    .insert(comments)
    .values(newComment)
    .returning();

  return comment;
}

// Update a comment (with edit tracking)
export async function updateComment(
  commentId: string,
  content: string,
  authorId: string,
  authorType: 'user' | 'organization'
){
  // Check ownership
  const canEdit = await checkCommentOwnership(commentId, authorId, authorType);
  if (!canEdit) {
    throw new Error('Unauthorized to edit this comment');
  }

  const [updatedComment] = await db
    .update(comments)
    .set({
      content,
      isEdited: true,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId))
    .returning();

  return updatedComment || null;
}

// Delete a comment
export async function deleteComment(
  commentId: string,
  authorId: string,
  authorType: 'user' | 'organization'
){
  // Check ownership
  const canDelete = await checkCommentOwnership(commentId, authorId, authorType);
  if (!canDelete) {
    throw new Error('Unauthorized to delete this comment');
  }

  const result = await db
    .delete(comments)
    .where(eq(comments.id, commentId))
    .returning();

  return result.length > 0;
}

