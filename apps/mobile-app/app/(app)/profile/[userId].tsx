import React from 'react';
import { View, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useGetProfile, useGetPostsByAuthor } from '~/api/profile';
import { PostCard } from '~/components/posts/post-card';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  
  // Fetch profile data
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfile(userId);
  
  // Fetch user's posts
  const { data: userPosts, isLoading: postsLoading } = useGetPostsByAuthor(userId);

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

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Profile Header */}
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
          
          {/* Name and Type */}
          <Text className="text-2xl font-bold text-foreground mb-1">
            {profile.name}
          </Text>
          {isOrganization && (
            <View className="bg-secondary px-3 py-1 rounded-full mb-3">
              <Text className="text-xs text-secondary-foreground">
                🏢 Business Account
              </Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-border my-4" />

        {/* Profile Stats */}
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-lg font-semibold text-foreground">
              {userPosts?.length || 0}
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
      </Card>

      {/* Posts Section */}
      <View className="px-4 mt-6 mb-4">
        <Text className="text-lg font-semibold text-foreground mb-4">
          Posts
        </Text>
        
        {postsLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="small" />
            <Text className="text-muted-foreground mt-2">Loading posts...</Text>
          </View>
        ) : !userPosts || userPosts.length === 0 ? (
          <Card className="p-6 bg-card">
            <Text className="text-center text-muted-foreground">
              {profile.name} hasn't shared any posts yet.
            </Text>
          </Card>
        ) : (
          <View>
            {userPosts.map((post: any) => {
              // Add author information to post if missing
              const postWithAuthor = {
                ...post,
                author: post.author || {
                  id: profile.id,
                  name: profile.name,
                  image: profile.image,
                  type: profile.type
                }
              };
              return <PostCard key={post.id} post={postWithAuthor} />;
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}