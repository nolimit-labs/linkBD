import React from 'react';
import { View, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { usePostComments, useCommentReplies } from '~/api/comments';
import { useGetPostById } from '~/api/posts';
import { CommentCard } from '~/components/comments/comment-card';
import { CommentsList } from '~/components/comments/comments-list';
import { CommentInput } from '~/components/comments/comment-input';

export default function CommentThreadScreen() {
  const params = useLocalSearchParams<{ postId: string; commentId: string; root?: string }>();
  const postId = params.postId ;
  const commentId = params.commentId ;
  const rootParam = params.root;
  const router = useRouter();

  const { data: commentsData, isLoading } = usePostComments(postId);
  const {
    data: repliesData,
    fetchNextPage: fetchNextReplies,
    hasNextPage: hasMoreReplies,
    isFetchingNextPage: isFetchingMoreReplies,
    isLoading: isLoadingReplies,
  } = useCommentReplies(postId, commentId);

  const allTopLevel = commentsData?.pages.flatMap((p: any) => p.comments) ?? [];
  let root = allTopLevel.find((c: any) => c.id === commentId);
  if (!root && rootParam) {
    try {
      root = JSON.parse(decodeURIComponent(rootParam));
    } catch {
      // ignore decode errors
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-2">Loading thread...</Text>
      </View>
    );
  }

  if (!root) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-xl font-semibold mb-2">Thread not found</Text>
        <Text className="text-muted-foreground text-center">This comment may have been deleted.</Text>
      </View>
    );
  }

  const replies = repliesData?.pages.flatMap((p: any) => p.comments) ?? [];

  return (
    <View className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View className="flex-1">
          <CommentsList
            comments={replies}
            isLoading={isLoadingReplies}
            isFetchingNextPage={isFetchingMoreReplies}
            hasNextPage={hasMoreReplies}
            onEndReached={() => fetchNextReplies()}
            emptyMessage="No replies yet"
            header={
              <View>
                <View className="pb-2">
                  <CommentCard comment={root} />
                </View>
                <View className="ml-4 mb-2">
                  <Text className="text-lg font-semibold text-foreground">Replies ({replies.length})</Text>
                </View>
              </View>
            }
            onItemPress={(reply) => {
              const nextRoot = encodeURIComponent(
                JSON.stringify({
                  id: reply.id,
                  postId,
                  parentId: reply.parentId ?? null,
                  content: reply.content,
                  isEdited: reply.isEdited ?? false,
                  createdAt: reply.createdAt,
                  author: reply.author
                    ? {
                        id: reply.author.id,
                        name: reply.author.name,
                        imageUrl: reply.author.imageUrl ?? null,
                        type: reply.author.type,
                        isOfficial: reply.author.isOfficial ?? false,
                        subscriptionPlan: reply.author.subscriptionPlan,
                      }
                    : null,
                  repliesCount: reply.repliesCount ?? 0,
                })
              );
              router.push({ pathname: '/posts/[postId]/comments/[commentId]', params: { postId, commentId: reply.id, root: nextRoot } });
            }}
            onReplyPress={(reply) => {
              const nextRoot = encodeURIComponent(
                JSON.stringify({
                  id: reply.id,
                  postId,
                  parentId: reply.parentId ?? null,
                  content: reply.content,
                  isEdited: reply.isEdited ?? false,
                  createdAt: reply.createdAt,
                  author: reply.author
                    ? {
                        id: reply.author.id,
                        name: reply.author.name,
                        image: reply.author.image ?? reply.author.imageUrl ?? null,
                        type: reply.author.type,
                        isOfficial: reply.author.isOfficial ?? false,
                        subscriptionPlan: reply.author.subscriptionPlan,
                      }
                    : null,
                  repliesCount: reply.repliesCount ?? 0,
                })
              );
              router.push({ pathname: '/posts/[postId]/comments/[commentId]', params: { postId, commentId: reply.id, root: nextRoot } });
            }}
          />
        </View>

        {/* Bottom input stays in flow so KeyboardAvoidingView can lift it */}
        <View>
          <View className="px-4 mb-1">
            <Text className="text-xs text-muted-foreground">Replying to {root?.author?.name || 'this comment'}</Text>
          </View>
          <CommentInput
            postId={postId as string}
            parentId={root.id}
            placeholder={`Reply to ${root?.author?.name || 'this comment'}...`}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}


