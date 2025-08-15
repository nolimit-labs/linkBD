import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface ErrorMessageProps {
  error: string | null;
}

// Reusable error message component with consistent styling
export function ErrorMessage({ error }: ErrorMessageProps) {
  if (!error) return null;
  
  return (
    <View className="rounded-xl p-3 mb-4">
      <Text className="text-destructive text-sm text-center">{error}</Text>
    </View>
  );
}