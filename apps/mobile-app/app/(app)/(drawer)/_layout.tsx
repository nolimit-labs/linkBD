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
import { DrawerAccountHeader } from '~/components/layout/drawer-account-header';

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
        {/* Hide Drawer header and item for the posts segment; nested Stack will handle headers */}
        <Drawer.Screen
          name="posts"
          options={{
            drawerItemStyle: { display: 'none' },
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="profile/[id]"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'Profile',
            drawerLabel: 'Profile',
            headerLeft: ({ tintColor }) => (
              <Pressable
                onPress={() => router.back()}
                className="ml-4 p-2"
              >
                {/* @ts-ignore React 19 JSX typing mismatch with RN Navigation */}
                <MaterialIcons name="arrow-back" size={24} color={tintColor} />
              </Pressable>
            ),
          }}
        />

      </Drawer>


    </GestureHandlerRootView>




  );
}

function AppDrawerContent(props: any) {
  const { data: session } = useSession();
  const userName = (session?.data?.user?.name ?? 'Current Account');

  return (
    <View className="flex-1 bg-background">
      {/* Drawer items */}
      {/* Account header at the top */}
      <DrawerAccountHeader />

      {/* @ts-ignore React 19 JSX typing mismatch with RN Navigation */}
      <DrawerContentScrollView
        {...props}
        className="flex-1"
        contentContainerStyle={{ paddingTop: 0, marginTop: 2 }}
      >
        {/* @ts-ignore React 19 JSX typing mismatch with RN Navigation */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Footer removed per spec */}
    </View>
  );
}