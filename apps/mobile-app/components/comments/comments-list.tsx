import React from 'react';
import { View, ActivityIndicator, FlatList } from 'react-native';
import { Text } from '~/components/ui/text';
import { CommentCard } from '~/components/comments/comment-card';

type Comment = any;

type CommentsListProps = {
  comments: Comment[];
  isLoading: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onEndReached?: () => void;
  header?: React.ReactElement | null;
  onItemPress?: (comment: Comment) => void;
  onReplyPress?: (comment: Comment) => void;
  emptyMessage?: string;
};

export function CommentsList({
  comments,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onEndReached,
  header,
  onItemPress,
  onReplyPress,
  emptyMessage = 'No comments yet',
}: CommentsListProps) {
  
  if (isLoading) {
    return (
      <View className="py-10 items-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-2">Loading comments...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 80 }}
      ListHeaderComponent={header ?? null}
      renderItem={({ item }) => (
        <CommentCard
          comment={item}
          onPress={onItemPress ? () => onItemPress(item) : undefined}
          onReply={onReplyPress ? () => onReplyPress(item) : undefined}
          repliesCountDisplay={item.repliesCount}
        />
      )}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) onEndReached?.();
      }}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View className="py-10 items-center">
          <Text className="text-muted-foreground text-lg">{emptyMessage}</Text>
        </View>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" />
            <Text className="text-muted-foreground mt-1">Loading more comments...</Text>
          </View>
        ) : null
      }
    />
  );
}


