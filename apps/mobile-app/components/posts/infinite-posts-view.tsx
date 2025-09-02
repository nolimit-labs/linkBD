import React, { useCallback } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { PostCard } from './post-card';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import type { InfiniteData } from '@tanstack/react-query';

interface Post {
  author: {
    image: string | null;
    id: string;
    name: string;
    type: "user" | "organization";
    isOfficial?: boolean;
  };
  imageUrl: string | null;
  hasLiked: boolean;
  id: string;
  userId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface PostsPage {
  posts: Post[];
  pagination: {
    hasMore: boolean;
    nextCursor?: string | null;
    limit?: number;
    count?: number;
  };
}

interface InfinitePostsViewProps {
  data?: InfiniteData<PostsPage>;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
  emptyMessage?: string;
  showAuthor?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export function InfinitePostsView({
  data,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  refetch,
  emptyMessage = "No posts yet.",
  showAuthor = true,
  ListHeaderComponent,
}: InfinitePostsViewProps) {
  // Flatten all pages of posts into a single array and deduplicate
  const posts = React.useMemo(() => {
    const allPosts = data?.pages.flatMap((page) => page.posts || []) || [];
    // Filter out any null/undefined posts and deduplicate by ID
    const validPosts = allPosts.filter((post): post is Post => post != null && typeof post.id === 'string');
    const uniquePosts = Array.from(
      new Map(validPosts.map(post => [post.id, post])).values()
    );
    return uniquePosts;
  }, [data]);

  // Handle pull to refresh
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch();
    setTimeout(() => setRefreshing(false), 1000);
  }, [refetch]);

  // Handle loading more posts when reaching the end
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Render individual post item
  const renderItem = useCallback(({ item }: { item: Post }) => {
    return <PostCard post={item} showAuthor={showAuthor} />;
  }, [showAuthor]);

  // Render footer with loading indicator
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" />
        <Text className="text-muted-foreground mt-2">Loading more...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" />
          <Text className="text-muted-foreground mt-2">Loading posts...</Text>
        </View>
      );
    }

    return (
      <Card className="mx-4 mt-4 p-6 bg-card">
        <Text className="text-center text-muted-foreground">{emptyMessage}</Text>
      </Card>
    );
  }, [isLoading, emptyMessage]);

  // Key extractor for FlatList with null safety
  const keyExtractor = useCallback((item: Post) => item?.id || Math.random().toString(), []);

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    />
  );
}