import React from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { Text } from '@/components/ui/text';

interface FormInputProps extends TextInputProps {
  label: string;
  helperText?: string;
  error?: string;
}

// Reusable form input component with consistent styling
export function FormInput({
  label,
  helperText,
  error,
  ...textInputProps
}: FormInputProps) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-foreground font-semibold text-sm">{label}</Text>
      <View className="rounded-2xl border-2 border-input overflow-hidden">
        <TextInput
          className="px-4 py-4 text-foreground text-base"
          placeholderTextColor="#9CA3AF"
          {...textInputProps}
        />
      </View>
      {helperText && !error && (
        <Text className="text-xs text-muted-foreground mt-1">{helperText}</Text>
      )}
      {error && (
        <Text className="text-xs text-destructive mt-1">{error}</Text>
      )}
    </View>
  );
}