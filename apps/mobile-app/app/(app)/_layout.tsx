import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { Stack, Tabs } from 'expo-router';
import { useRouter } from 'expo-router';
import { authClient } from '~/lib/auth-client';
import { Text } from '~/components/ui/text';
import { MaterialIcons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Logo } from '~/components/logo';
import { useSession } from '~/api/auth';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Text as UIText } from '~/components/ui/text';
import { Link } from 'expo-router';
import { Pressable } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

export default function AppLayout() {
  const { data: session, isPending, isFetching, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'success' || isFetching) return; // wait until fully settled
    if (!session?.data) {
      console.log('No session, redirecting to sign-in');
      router.replace('/');
    }
  }, [status, isFetching, session, router]);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  if (!session?.data) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* @ts-ignore Drawer types are incompatible with React 19 types in our setup */}
      <Drawer
        initialRouteName="feed"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            height: 110,
          },
          headerTitleStyle: {
            fontSize: 20,
          },
          headerTitle: () => <Logo />,
        }}
        drawerContent={(props) => <AppDrawerContent {...props} />}
      >
        <Drawer.Screen
          name="feed"
          options={{
            title: 'Feed',
            drawerLabel: 'Feed',
            drawerIcon: ({ color, size }) => (
              // @ts-ignore React 19 JSX typing mismatch
              <MaterialIcons name="home" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="search"
          options={{
            title: 'Search',
            drawerLabel: 'Search',
            drawerIcon: ({ color, size }) => (
              // @ts-ignore React 19 JSX typing mismatch
              <MaterialIcons name="search" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="businesses"
          options={{
            title: 'Businesses',
            drawerLabel: 'Businesses',
            drawerIcon: ({ color, size }) => (
              // @ts-ignore React 19 JSX typing mismatch
              <MaterialIcons name="business" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="profile/index"
          options={{
            title: 'My Profile',
            drawerLabel: 'My Profile',
            drawerIcon: ({ color, size }) => (
              // @ts-ignore React 19 JSX typing mismatch
              <MaterialIcons name="person" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Settings',
            drawerLabel: 'Settings',
            drawerIcon: ({ color, size }) => (
              // @ts-ignore React 19 JSX typing mismatch
              <MaterialIcons name="settings" size={size} color={color} />
            ),
          }}
        />
        {/* Hidden dynamic profile route */}
        <Drawer.Screen
          name="profile/[userId]"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'User Profile',
          }}
        />
      </Drawer>

    </GestureHandlerRootView>




  );
}

function AppDrawerContent(props: any) {
  const query = useSession();
  const userName = (query.data as any)?.user?.name ?? 'Current Account';
  const userEmail = (query.data as any)?.user?.email ?? '';

  return (
    <View className="flex-1 bg-background">
      {/* Drawer items */}
      {/* @ts-ignore React 19 JSX typing mismatch with RN Navigation */}
      <DrawerContentScrollView {...props} className="flex-1">
        {/* @ts-ignore React 19 JSX typing mismatch with RN Navigation */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Footer: current user */}
      <View className="px-4 pb-8 pt-4 border-t border-border">
        <Link href="/profile" asChild>
          <Pressable className="flex-row items-center gap-3">
            <Avatar alt={userName}>
              <AvatarFallback>
                <UIText>{userName?.slice(0, 2).toUpperCase()}</UIText>
              </AvatarFallback>
            </Avatar>
            <View className="flex-1">
              <UIText className="font-medium text-foreground">{userName}</UIText>
              {!!userEmail && (
                <UIText className="text-xs text-muted-foreground">{userEmail}</UIText>
              )}
            </View>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}