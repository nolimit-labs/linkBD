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

export default function AppLayout() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/(auth)/sign-in');
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  if (!session) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerShown: true,
          headerStyle: {
            height: 110,
          },
          headerTitleStyle: {
            fontSize: 20,
          }
        }}
      // drawerContent={() => (
      //   <View className="flex-1 bg-background">
      //     <Logo className="flex-1 bg-background" textSize="text-2xl" />
      //   </View>
      // )}
      >
        <Drawer.Screen
          name="todos"
          options={{
            title: 'Todos',
            drawerLabel: 'Todos',
          }}
        />
        <Drawer.Screen
          name="profile"
          options={{
            title: 'Profile',
            drawerLabel: 'Profile',
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Settings',
            drawerLabel: 'Settings',
          }}
        />
      </Drawer>

    </GestureHandlerRootView>




  );
}