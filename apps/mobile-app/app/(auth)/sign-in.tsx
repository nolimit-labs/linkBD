import React, { useEffect, useState } from 'react';
import { View, TextInput, ActivityIndicator, TouchableOpacity, ColorValue, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { authClient } from '~/lib/auth-client';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '~/lib/use-theme-colors';
import { Logo } from '~/components/logo';
import * as Linking from 'expo-linking';
import { useSession } from '~/api/auth';

type ErrorShape = { error?: { message?: string } };
const hasError = (value: unknown): value is Required<ErrorShape> => {
  return typeof value === 'object' && value !== null && 'error' in (value as Record<string, unknown>);
};

export default function SignInScreen() {
  const router = useRouter();
  const { gradientColors } = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  // If a session exists (e.g., after social login completes via deep link), redirect
  useEffect(() => {
    if (session?.data) {
      router.replace('/todos');
    }
  }, [session, router]);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await authClient.signIn.email({ email, password });
      if (hasError(result) && result.error) {
        setError(result.error.message || 'Failed to sign in');
        console.log('Sign in failed', result.error.message);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      const getSession = await authClient.getSession();
      if (getSession.data) {
        router.replace('/(app)/todos');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const deepLink = Linking.createURL('/todos');
      const result = await authClient.signIn.social({
        provider: 'google',
        // callbackURL: 'linkbd://todos',
      });
      if (hasError(result) && result.error) {
        setError(result.error.message || 'Failed to sign in');
        console.log('Sign in failed', result.error.message);
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      const session = await authClient.getSession();
      if (session.data) {
        console.log('Session', session.data);
        router.replace('/todos');
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={gradientColors as [ColorValue, ColorValue, ...ColorValue[]]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Logo with enhanced styling */}
          <View className="items-center mb-10">
            <Logo className="items-center justify-center mb-2" width={240} height={80} />
            <Text className="text-3xl font-bold text-foreground mt-6">Welcome back</Text>
            <Text className="text-base text-muted-foreground mt-2">Sign in to continue</Text>
          </View>

          {/* Form Container */}
          <View className="">
            <View className="mb-4">
              <Text className="mb-2 text-foreground font-semibold text-sm">Email</Text>
              <View className="rounded-2xl border-2 border-input overflow-hidden">
                <TextInput
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="px-4 py-4 text-foreground text-base bg-background/60 placeholder:text-foreground/80"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-foreground font-semibold text-sm">Password</Text>
              <View className="rounded-2xl border-2 border-input overflow-hidden">
                <TextInput
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="px-4 py-4 text-foreground text-base bg-background/60 placeholder:text-foreground/80"
                />
              </View>
            </View>

            {error ? (
              <View className="rounded-xl p-3 mb-4">
                <Text className="text-destructive text-sm text-center">{error}</Text>
              </View>
            ) : null}

            <Button
              className="bg-primary shadow-2xl rounded-2xl py-4"
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-primary-foreground font-bold text-lg">Sign In</Text>
              )}
            </Button>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px] bg-muted-foreground/20" />
              <Text className="mx-4 text-muted-foreground text-sm">or</Text>
              <View className="flex-1 h-[1px] bg-muted-foreground/20" />
            </View>

            {/* Google Sign In Button */}
            <Button
              className="bg-background/80 border-2 border-input shadow-xl rounded-2xl py-4"
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#4285F4" />
              ) : (
                <Text className="text-foreground font-bold text-lg">Sign in with Google</Text>
              )}
            </Button>

            {/* Forgot Password Link */}
            <TouchableOpacity className="mt-4">
              <Text className="text-primary text-center text-sm font-medium">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Up Link */}
          <View className="flex-row items-center justify-center gap-2 mt-8">
            <Text className="text-muted-foreground">Don't have an account?</Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity className="py-2">
                <Text className="text-foreground font-bold">Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}