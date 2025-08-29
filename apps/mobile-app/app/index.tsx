import * as React from 'react';
import { ColorValue, View } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { Text } from '~/components/ui/text';
import { authClient } from '~/lib/auth-client';
import { Logo } from '~/components/logo';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '~/lib/use-theme-colors';
import { useSession } from '~/api/auth';

// This screen simply provides links to Sign In and Sign Up
export default function Screen() {

  const { data: session, isPending } = useSession();
  const { gradientColors } = useThemeColors();


  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  if (session?.data) {
    return <Redirect href="/todos" />;
  }

  return (
    <LinearGradient
      colors={gradientColors as [ColorValue, ColorValue, ...ColorValue[]]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View className="flex-1 justify-center items-center gap-8 p-6">
        {/* Large logo */}
        <View className="mb-2">
          <Logo className="items-center justify-center" width={240} height={80} />
        </View>

        {/* Tagline */}
        <View className="items-center mb-4">
          <Text className="text-2xl font-bold text-foreground" >Connect with the Bengali Community</Text>
        </View>

        {/* Buttons */}
        <View className="gap-4 w-full max-w-xs">
          <Link href="/sign-in">
            <View className="w-full items-center justify-center rounded-2xl py-4 bg-primary shadow-lg">
              <Text className="text-primary-foreground font-semibold text-lg">Sign In</Text>
            </View>
          </Link>
          <Link href="/sign-up" >
            <View className="w-full items-center justify-center rounded-2xl py-4 bg-secondary shadow-lg">
              <Text className="text-secondary-foreground font-semibold text-lg">Sign Up</Text>
            </View>
          </Link>
        </View>
      </View>
    </LinearGradient>
  );
}
