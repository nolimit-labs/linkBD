import React from 'react';
import { View, ScrollView, Image, ActivityIndicator } from 'react-native';
import { authClient } from '~/lib/auth-client';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '~/api/auth';
import { useGetProfile, useGetPostsByAuthor } from '~/api/profile';
import { PostCard } from '~/components/posts/post-card';

export default function ProfileIndexScreen() {
  const queryClient = useQueryClient();
  const { data: session, isLoading: sessionLoading } = useSession();
  const userId = session?.data?.user?.id;

  const { data: profile, isLoading: profileLoading } = useGetProfile(userId);
  const { data: userPosts, isLoading: postsLoading } = useGetPostsByAuthor(userId);

  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.invalidateQueries({ queryKey: ['session'] });
    router.replace('/');
  };

  if (sessionLoading || profileLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-2">Loading profile...</Text>
      </View>
    );
  }

  if (!session || !userId) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <Text className="text-xl font-semibold mb-2">Not signed in</Text>
        <Button onPress={() => router.replace('/')}>
          <Text>Sign In</Text>
        </Button>
      </View>
    );
  }

  const profileData = profile || {
    id: userId,
    name: session.data?.user?.name || session.data?.user?.email?.split('@')[0] || 'User',
    email: session.data?.user?.email,
    image: session.data?.user?.image,
    createdAt: session.data?.user?.createdAt || new Date().toISOString(),
    type: 'user' as const,
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <Card className="mx-4 mt-4 p-6 bg-card">
        <View className="items-center">
          {profileData.image ? (
            <Image source={{ uri: profileData.image }} className="w-24 h-24 rounded-full mb-4" />
          ) : (
            <View className="w-24 h-24 rounded-full bg-muted mb-4 items-center justify-center">
              <Text className="text-3xl font-bold">{profileData.name?.charAt(0) || '?'}</Text>
            </View>
          )}

          <Text className="text-2xl font-bold text-foreground mb-1">{profileData.name}</Text>
        </View>

        <View className="h-[1px] bg-border my-4" />

        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-lg font-semibold text-foreground">{userPosts?.length || 0}</Text>
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

        <View className="mt-4 items-center">
          <Text className="text-sm text-muted-foreground">Joined {formatJoinDate(profileData.createdAt as string)}</Text>
        </View>

        <View className="mt-6">
          <Button variant="outline" className="w-full" onPress={handleSignOut}>
            <Text>Sign Out</Text>
          </Button>
        </View>
      </Card>

      <View className="px-4 mt-6 mb-4">
        <Text className="text-lg font-semibold text-foreground mb-4">My Posts</Text>
        {postsLoading ? (
          <View className="items-center py-8">
            <ActivityIndicator size="small" />
            <Text className="text-muted-foreground mt-2">Loading posts...</Text>
          </View>
        ) : !userPosts || userPosts.length === 0 ? (
          <Card className="p-6 bg-card">
            <Text className="text-center text-muted-foreground">You haven't shared any posts yet.</Text>
          </Card>
        ) : (
          <View>
            {userPosts.map((post: any) => {
              const postWithAuthor = {
                ...post,
                author: post.author || {
                  id: profileData.id,
                  name: profileData.name,
                  image: profileData.image,
                  type: profileData.type,
                },
              };
              return <PostCard key={post.id} post={postWithAuthor} />;
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}


