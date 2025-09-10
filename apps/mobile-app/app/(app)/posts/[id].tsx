import React from 'react'
import { View, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Text } from '~/components/ui/text'
import { PostCard } from '~/components/posts/post-card'
import { CommentsList } from '~/components/comments/comments-list'
import { CommentInput } from '~/components/comments/comment-input'
import { useGetPostById } from '~/api/posts'
import { usePostComments } from '~/api/comments'
import { useSession } from '~/api/auth'
import type { ComponentProps } from 'react'

export default function PostDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const postId = params.id as string

  const { data: post, isLoading: loadingPost } = useGetPostById(postId)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = usePostComments(postId)

  const comments = data?.pages.flatMap((p) => p.comments) ?? []
  type PostCardPost = ComponentProps<typeof PostCard>['post']
  const postWithAuthor: PostCardPost  =
    ({
        ...post,
        author:
          post?.author ?? {
            id: post?.userId || '',
            name: 'Unknown',
            image: null,
            type: 'user',
            isOfficial: false,
          },
      } as unknown as PostCardPost)
    

  if (loadingPost) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-2">Loading post...</Text>
      </View>
    )
  }

  const handleCommentSuccess = () => {
    // Refetch comments after successful submission
    refetch()
  }

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View className="flex-1">
          <CommentsList
          comments={comments}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          header={
            <View className="mb-4">
              {postWithAuthor ? (
                <PostCard post={postWithAuthor} showAuthor={true} onPostPress={() => {}} />
              ) : null}
              {comments.length > 0 && (
                <View className="ml-4">
                  <Text className="text-lg font-semibold text-foreground">Comments ({comments.length})</Text>
                </View>
              )}
            </View>
          }
          onItemPress={(c) => {
            const root = encodeURIComponent(
              JSON.stringify({
                id: c.id,
                postId,
                parentId: c.parentId ?? null,
                content: c.content,
                isEdited: c.isEdited ?? false,
                createdAt: c.createdAt,
                author: c.author
                  ? {
                      id: c.author.id,
                      name: c.author.name,
                      image: c.author.image ?? c.author.imageUrl ?? null,
                      type: c.author.type,
                      isOfficial: c.author.isOfficial ?? false,
                      subscriptionPlan: c.author.subscriptionPlan,
                    }
                  : null,
                repliesCount: c.repliesCount ?? 0,
              })
            );
            // @ts-ignore router available via expo-router
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            import('expo-router').then(({ router }) => {
              router.push({ pathname: '/posts/[postId]/comments/[commentId]', params: { postId, commentId: c.id, root } });
            });
          }}
          onReplyPress={(c) => {
            const root = encodeURIComponent(
              JSON.stringify({
                id: c.id,
                postId,
                parentId: c.parentId ?? null,
                content: c.content,
                isEdited: c.isEdited ?? false,
                createdAt: c.createdAt,
                author: c.author
                  ? {
                      id: c.author.id,
                      name: c.author.name,
                      image: c.author.image ?? c.author.imageUrl ?? null,
                      type: c.author.type,
                      isOfficial: c.author.isOfficial ?? false,
                      subscriptionPlan: c.author.subscriptionPlan,
                    }
                  : null,
                repliesCount: c.repliesCount ?? 0,
              })
            );
            import('expo-router').then(({ router }) => {
              router.push({ pathname: '/posts/[postId]/comments/[commentId]', params: { postId, commentId: c.id, root } });
            });
          }}
          />
        </View>

        {/* Bottom input stays in flow so KeyboardAvoidingView can lift it */}
        
          <View className="border-t border-border bg-background">
            <CommentInput
              postId={postId}
              placeholder="Join the conversation..."
              onSuccess={handleCommentSuccess}
            />
          </View>
        
      </KeyboardAvoidingView>
    </View>
  )
}


