import React, { useEffect } from 'react';
import { View, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { useSession } from '~/api/auth';
import { useInfinitePostsFeed } from '~/api/posts';
import { PostCard } from '~/components/posts/post-card';

export default function TodosScreen() {
  // Authentication & session
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Posts feed with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfinitePostsFeed(10);

  // Flatten all pages of posts into a single array
  const posts = data?.pages.flatMap(page => page.posts) || [];

  // Redirect if unauthenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/(auth)/sign-in');
    }
  }, [isPending, session, router]);




  if (isPending || (!session && isPending)) {
    return (
      <View className="flex-1 items-center justify-center gap-2">
        <Text className="text-muted-foreground">Checking session…</Text>
      </View>
    );
  }

  if (!session) return null;

  // Render individual post item using PostCard component
  const renderPost = ({ item }: { item: any }) => <PostCard post={item} />;

  // Handle load more when reaching end of list
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <View className="flex-1">
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            isLoading ? (
              <View className="flex-1 items-center justify-center py-10">
                <ActivityIndicator size="large" />
                <Text className="text-muted-foreground mt-2">Loading posts...</Text>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center py-10">
                <Text className="text-muted-foreground">No posts yet</Text>
              </View>
            )
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
}

