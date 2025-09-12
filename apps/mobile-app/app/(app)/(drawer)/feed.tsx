import { useState, useMemo } from 'react';
import { View, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { useSession } from '~/api/auth';
import { useGetPostsFeed } from '~/api/posts';
import { PostCard } from '~/components/posts/post-card';
import { CreatePostButton } from '~/components/posts/create-post-modal';

export default function TodosScreen() {
  // Authentication & session
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  // Feed filter state
  const [feedFilter, setFeedFilter] = useState<'all' | 'following'>('all');

  // Posts feed with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useGetPostsFeed(10, feedFilter);

  // Flatten all pages of posts into a single array and deduplicate
  const posts = useMemo(() => {
    const allPosts = data?.pages.flatMap(page => page.posts) || [];
    // Deduplicate posts by ID to prevent React key warnings
    const uniquePosts = Array.from(
      new Map(allPosts.map(post => [post.id, post])).values()
    );
    return uniquePosts;
  }, [data]);

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

        {/* Sticky tabs for feed filter */}
        <View className="bg-background border-b border-border">
          <View className="flex-row">
            <TouchableOpacity
              onPress={() => setFeedFilter('all')}
              className={`flex-1 py-3 px-4 ${feedFilter === 'all' ? 'border-b-2 border-primary' : ''}`}
            >
              <Text className={`text-center font-medium ${feedFilter === 'all' ? 'text-primary' : 'text-muted-foreground'}`}>
                All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFeedFilter('following')}
              className={`flex-1 py-3 px-4 ${feedFilter === 'following' ? 'border-b-2 border-primary' : ''}`}
            >
              <Text className={`text-center font-medium ${feedFilter === 'following' ? 'text-primary' : 'text-muted-foreground'}`}>
                Following
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 0 }}
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
        
        {/* Floating Create Post Button */}
        <CreatePostButton />
      </View>
    </KeyboardAvoidingView>
  );
}

