// app/(app)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { Logo } from '~/components/logo';

export default function AppStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerTitle: () => <Logo />, headerBackTitle: 'Back' }}>
      {/* (drawer) is the Drawer group; we hide its header here */}
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      {/* posts stack remains sibling to (drawer) within the same Stack */}
      <Stack.Screen name="posts/[id]" options={{ headerShown: true }} />
      <Stack.Screen name="posts/[postId]/comments/[commentId]" options={{ headerShown: true }} />

      <Stack.Screen name="profile/[id]" options={{ headerShown: true }} />

    </Stack>
  );
}