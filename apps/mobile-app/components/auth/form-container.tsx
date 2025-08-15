import React from 'react';
import { View } from 'react-native';

interface FormContainerProps {
  children: React.ReactNode;
}

// Reusable form container with consistent card styling
export function FormContainer({ children }: FormContainerProps) {
  return (
    <View className="">
      {children}
    </View>
  );
}