import React from 'react';
import { View, ScrollView, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/lib/use-theme-colors';
import { Logo } from '@/components/logo';
import { Text } from '@/components/ui/text';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

// Reusable layout component for authentication screens
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const { gradientColors } = useThemeColors();

  return (
    <LinearGradient
      colors={gradientColors as [ColorValue, ColorValue, ...ColorValue[]]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Logo with title */}
          <View className="items-center mb-10">
            <Logo className="items-center justify-center mb-6" />
            <Text className="text-3xl font-bold text-foreground">{title}</Text>
            <Text className="text-base text-muted-foreground mt-2">{subtitle}</Text>
          </View>

          {children}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}