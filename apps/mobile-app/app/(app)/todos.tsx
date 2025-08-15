import React, { useEffect, useState } from 'react';
import { View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { authClient } from '@/lib/auth-client';
import { useTodos } from '@/api/todos';
import { Text } from '~/components/ui/text';
import { useSession } from '~/api/auth';

export default function TodosScreen() {
  // Authentication & session
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // Data hooks
  const { data: todos = [], isLoading, error, refetch } = useTodos();

  // Local state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Redirect if unauthenticated
  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/(auth)/sign-in');
    }
  }, [isPending, session, router]);




  if (isPending || (!session && isPending)) {
    return (
      <View className="flex-1 items-center justify-center gap-2">
        <Text className="text-muted-foreground">Checking session…</Text>
      </View>
    );
  }

  if (!session) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-background"
    >
      <View className="flex-1 px-6 py-4 mt-4">

<View>
  <Text>Todos</Text>
</View>
      </View>
    </KeyboardAvoidingView>
  );
}

