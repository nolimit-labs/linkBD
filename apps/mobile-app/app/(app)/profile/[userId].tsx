import React from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { BadgeText } from '~/components/ui/badge';
import { useGetProfile, useGetPostsByAuthor } from '~/api/profile';
import { InfinitePostsView } from '~/components/posts/infinite-posts-view';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  
  // Fetch profile data
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfile(userId);
  
  // Fetch user's posts with infinite scroll
  const { 
    data: postsData, 
    isLoading: postsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchPosts
  } = useGetPostsByAuthor(userId);

  if (profileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-2">Loading profile...</Text>
      </View>
    );
  }

  if (profileError || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-xl font-semibold mb-2">Profile not found</Text>
        <Text className="text-muted-foreground text-center">
          The profile you're looking for doesn't exist.
        </Text>
      </View>
    );
  }

  const isOrganization = profile.type === 'organization';

  // Format date to relative time
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Calculate total posts count from all pages
  const totalPostsCount = postsData?.pages.reduce((total, page) => 
    total + (page.posts?.length || 0), 0) || 0;

  // Profile header component for ListHeaderComponent
  const ProfileHeader = () => (
    <>
      <Card className="mx-4 mt-4 p-6 bg-card">
        <View className="items-center">
          {/* Avatar */}
          {profile.image ? (
            <Image
              source={{ uri: profile.image }}
              className="w-24 h-24 rounded-full mb-4"
            />
          ) : (
            <View className="w-24 h-24 rounded-full bg-muted mb-4 items-center justify-center">
              <Text className="text-3xl font-bold">
                {isOrganization ? '🏢' : profile.name?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          
          {/* Name and Badges */}
          <View className="items-center">
            <Text className="text-2xl font-bold text-foreground mb-2">
              {profile.name}
            </Text>
            
            {/* Badges */}
            <View className="flex-row gap-2 mb-2">
              {isOrganization && (
                <BadgeText variant="secondary">
                  Business
                </BadgeText>
              )}
              {profile.isOfficial && (
                <BadgeText variant="default">
                  ✓ Official
                </BadgeText>
              )}
              {profile.subscriptionPlan && profile.subscriptionPlan !== 'free' && (
                <BadgeText variant="outline">
                  {profile.subscriptionPlan}
                </BadgeText>
              )}
            </View>
          </View>

          {/* Bio/Description if available (for organizations) */}
          {isOrganization && 'description' in profile && profile.description && (
            <Text className="text-sm text-muted-foreground text-center mt-3 px-4">
              {profile.description}
            </Text>
          )}
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-border my-4" />

        {/* Profile Stats */}
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-lg font-semibold text-foreground">
              {totalPostsCount}
            </Text>
            <Text className="text-sm text-muted-foreground">Posts</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-semibold text-foreground">0</Text>
            <Text className="text-sm text-muted-foreground">Followers</Text>
          </View>
          <View className="items-center">
            <Text className="text-lg font-semibold text-foreground">0</Text>
            <Text className="text-sm text-muted-foreground">Following</Text>
          </View>
        </View>

        {/* Join Date */}
        <View className="mt-4 items-center">
          <Text className="text-sm text-muted-foreground">
            {isOrganization ? 'Established' : 'Joined'} {formatJoinDate(profile.createdAt)}
          </Text>
        </View>

        {/* Follow Button (if not viewing own profile) */}
        {/* TODO: Add follow functionality */}
      </Card>

      {/* Posts Section Header */}
      <View className="mt-6 mb-4 px-4">
        <Text className="text-lg font-semibold text-foreground">
          {isOrganization ? 'Updates' : 'Posts'}
        </Text>
      </View>
    </>
  );

  return (
    <View className="flex-1 bg-background">
      <InfinitePostsView
        data={postsData}
        isLoading={postsLoading}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        refetch={refetchPosts}
        emptyMessage={`${profile.name} hasn't shared any posts yet.`}
        showAuthor={false}
        ListHeaderComponent={ProfileHeader}
      />
    </View>
  );
}