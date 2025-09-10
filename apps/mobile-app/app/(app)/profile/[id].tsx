import React from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { BadgeText } from '~/components/ui/badge';
import { useGetProfile, useGetPostsByAuthor } from '~/api/profile';
import { InfinitePostsView } from '~/components/posts/infinite-posts-view';
import { FollowButton } from '~/components/follows/follow-button';
import { FollowStats } from '~/components/follows/follow-stats';
import { useSession } from '~/api/auth';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Authentication & Session
  const { data: session } = useSession();
  
  // Fetch profile data
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfile(id);
  
  // Fetch user's posts with infinite scroll
  const { 
    data: postsData, 
    isLoading: postsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchPosts
  } = useGetPostsByAuthor(id);

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


  // Format date to relative time
  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isOrganization = profile?.type === 'organization';

  // Profile header component for ListHeaderComponent
  const ProfileHeader = () => (
    <>
      <Card className="p-6 bg-card dark:border-background/0 rounded-sm">
        {/* Top Section - Avatar and Basic Info */}
        <View className="flex-row items-start gap-5 mb-5">
          {/* Avatar */}
          {profile.image ? (
            <Image
              source={{ uri: profile.image }}
              className="w-20 h-20 rounded-2xl"
            />
          ) : (
            <View className="w-20 h-20 rounded-2xl bg-muted items-center justify-center">
              <Text className="text-2xl font-bold">
                {isOrganization ? '🏢' : profile.name?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          
          {/* Name and Badges Section */}
          <View className="flex-1">
            {/* Name and Badges Row */}
            <View className="flex-row items-center flex-wrap gap-2 mb-2">
              <Text className="text-2xl font-bold text-foreground">
                {profile.name}
              </Text>
              {profile.isOfficial && (
                <BadgeText variant="default">
                  ✓ Official
                </BadgeText>
              )}
              {(profile.subscriptionPlan === 'pro' || profile.subscriptionPlan === 'pro_complementary') && (
                <BadgeText variant="secondary">
                  Pro
                </BadgeText>
              )}
            </View>
            
            {/* Account Type */}
            <Text className="text-sm text-muted-foreground mb-3">
              {isOrganization ? 'Business' : 'User'}
            </Text>
          </View>
        </View>

        {/* Bottom Section - Left: Description/Date, Right: Stats/Actions */}
        <View className="flex-row justify-between items-start mt-2 gap-2">
          {/* Left Side - Description and Join Date */}
          <View className="flex-1 mr-2">
            {/* Bio/Description if available */}
            {isOrganization && 'description' in profile && profile.description && (
              <Text className="text-sm text-muted-foreground leading-relaxed mb-3">
                {profile.description}
              </Text>
            )}
            
            {/* Join Date */}
            <Text className="text-xs text-muted-foreground">
              {isOrganization ? 'Established' : 'Joined'} {formatJoinDate(profile.createdAt)}
            </Text>
          </View>
          
          {/* Right Side - Stats and Actions */}
          <View className="w-32 items-end gap-3">
            {/* Follow Stats */}
            <FollowStats
              userId={isOrganization ? undefined : profile.id}
              organizationId={isOrganization ? profile.id : undefined}
              
            />
            
            {/* Follow Button - Always show for other users/orgs */}
            {session?.data?.user?.id !== profile.id && (
              <FollowButton
                targetId={profile.id}
                targetType={isOrganization ? 'organization' : 'user'}
                size="default"
              />
            )}
          </View>
        </View>
      </Card>

      {/* Posts Section Header */}
      <View className="mt-6 mb-4 ml-6">
        <Text className="text-lg font-semibold text-foreground">
          Posts
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