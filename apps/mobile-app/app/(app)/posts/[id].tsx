import React from 'react'
import { View, ActivityIndicator, FlatList, KeyboardAvoidingView, Platform } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { Text } from '~/components/ui/text'
import { PostCard } from '~/components/posts/post-card'
import { CommentCard } from '~/components/comments/comment-card'
import { CommentInput } from '~/components/comments/comment-input'
import { useGetPostById } from '~/api/posts'
import { usePostComments } from '~/api/comments'
import { useSession } from '~/api/auth'
import type { ComponentProps } from 'react'

export default function PostDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>()
  const postId = params.id as string
  const { data: session } = useSession()

  const { data: post, isLoading: loadingPost } = useGetPostById(postId)
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = usePostComments(postId)

  const comments = data?.pages.flatMap((p) => p.comments) ?? []
  type PostCardPost = ComponentProps<typeof PostCard>['post']
  const postWithAuthor: PostCardPost | null = post
    ? ({
        ...post,
        author:
          post.author ?? {
            id: post.userId || '',
            name: 'Unknown',
            image: null,
            type: 'user',
            isOfficial: false,
          },
      } as unknown as PostCardPost)
    : null

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ 
            padding: 16,
            paddingBottom: session ? 80 : 16 // Extra padding when comment input is shown
          }}
          ListHeaderComponent={
            <View className="mb-4">
              {postWithAuthor ? (
                <PostCard 
                  post={postWithAuthor} 
                  showAuthor={true}
                  onPostPress={() => {}} // Disable navigation since we're already on the detail page
                />
              ) : null}
              {comments.length > 0 && (
                <View className="mt-4 mb-2">
                  <Text className="text-lg font-semibold text-foreground">
                    Comments ({comments.length})
                  </Text>
                </View>
              )}
            </View>
          }
          renderItem={({ item }) => <CommentCard comment={item} />}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage()
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={isLoading ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" />
              <Text className="text-muted-foreground mt-2">Loading comments...</Text>
            </View>
          ) : (
            <View className="py-10 items-center">
              <Text className="text-muted-foreground text-lg">No comments yet</Text>
              <Text className="text-muted-foreground mt-1 text-center">Be the first to share your thoughts!</Text>
            </View>
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" />
                <Text className="text-muted-foreground mt-1">Loading more comments...</Text>
              </View>
            ) : null
          }
        />
        
        {/* Sticky comment input at bottom */}
        {session && (
          <View className="absolute bottom-2 left-0 right-0">
            <CommentInput
              postId={postId}
              placeholder="Join the conversation..."
              onSuccess={handleCommentSuccess}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  )
}


