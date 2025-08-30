import * as React from 'react';
import { Stack } from 'expo-router';
import { ThemeToggle } from '~/components/ThemeToggle';

export default function RootNavigator() {

  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'linkBD',
          headerRight: () => <ThemeToggle />,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='(app)'
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}


