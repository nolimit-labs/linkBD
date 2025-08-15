import React from 'react';
import { View, ScrollView } from 'react-native';
import { authClient } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from '~/api/auth';

export default function ProfileScreen() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // Handles user sign out and redirects to sign-in page
  const handleSignOut = async () => {
    await authClient.signOut();
    queryClient.invalidateQueries({ queryKey: ['todos'] });
    router.replace('/(auth)/sign-in');
  };

  return (
    <ScrollView className="flex-1 bg-background mt-5">
      <View className="px-6 py-4">
        {/* Profile Info */}
        <Card className="mb-6 bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="items-center py-4">
              {/* Avatar placeholder */}
              <View className="w-20 h-20 bg-primary rounded-full items-center justify-center mb-4">
                <Text className="text-2xl text-primary-foreground">👤</Text>
              </View>

              <Text className="text-xl font-bold text-card-foreground">
                {session?.data?.user?.email || 'Anonymous User'}
              </Text>
              <Text className="text-muted-foreground">
                Member since {new Date().getFullYear()}
              </Text>
            </View>

            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground">Email</Text>
                <Text className="text-card-foreground font-medium">
                  {session?.user?.email || 'Not provided'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground">User ID</Text>
                <Text className="text-card-foreground font-mono text-sm">
                  {session?.user?.id ? `${session.user.id.slice(0, 8)}...` : 'N/A'}
                </Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground">Account Type</Text>
                <Text className="text-card-foreground font-medium">
                  {session?.user?.email ? 'Registered' : 'Anonymous'}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Account Actions - Only Sign Out */}
        <Card className="mb-6 bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <Button variant="outline" className="border-border" onPress={handleSignOut}>
              <Text className="text-card-foreground">Sign Out</Text>
            </Button>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}