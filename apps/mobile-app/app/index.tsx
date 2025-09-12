import React, { useState } from 'react';
import { View, TextInput, ActivityIndicator, ColorValue, ScrollView } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { authClient } from '~/lib/auth-client';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
// import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '~/lib/use-theme-colors';
import { Logo } from '~/components/logo';
import { GoogleIcon } from '~/lib/icons/Google';
import { useSession } from '~/api/auth';
import { useQueryClient } from '@tanstack/react-query';

type ErrorShape = { error?: { message?: string } };
const hasError = (value: unknown): value is Required<ErrorShape> => {
  return typeof value === 'object' && value !== null && 'error' in (value as Record<string, unknown>);
};

export default function SignInScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { gradientColors } = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const { data: session, isPending, isError } = useSession();

  // Clear invalid sessions in production
  React.useEffect(() => {
    if (isError && session === null) {
      authClient.signOut().catch(() => {});
      queryClient.invalidateQueries({ queryKey: ['session'] });
    }
  }, [isError, session, queryClient]);

  // Check if we should show email login (only in development)
  const isDevelopment = process.env.EXPO_NODE_ENV === 'development';

  // If a valid session exists, redirect to feed
  if (session?.data?.user?.id && !isPending) {
    return <Redirect href="/(app)/(drawer)/feed" />;
  }

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await authClient.signIn.email({ email, password });
      if (hasError(result) && result.error) {
        setError(result.error.message || 'Failed to sign in');
        return;
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
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: 'linkbd://(app)/feed',
      });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  return (
    // <LinearGradient
    //   colors={gradientColors as [ColorValue, ColorValue, ...ColorValue[]]}
    //   style={{ flex: 1 }}
    //   start={{ x: 0, y: 0 }}
    //   end={{ x: 1, y: 1 }}
    // >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Logo with enhanced styling */}
          <View className="items-center mb-10">
            <Logo className="items-center justify-center mb-2" width={240} height={80} />
            <Text className="text-3xl font-bold text-foreground mt-6">Welcome to linkBD</Text>
            <Text className="text-base text-muted-foreground mt-2">Connect with the Bengali Community</Text>
          </View>

          {/* Form Container */}
          <View >
            {/* Only show email/password fields in development */}
            {isDevelopment && (
              <>
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
                  className="bg-primary shadow-2xl rounded-2xl py-4 mb-4"
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-primary-foreground font-bold text-lg">Sign In with Email</Text>
                  )}
                </Button>

                {/* Divider - only show in development */}
                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-[1px] bg-muted-foreground/20" />
                  <Text className="mx-4 text-muted-foreground text-sm">or</Text>
                  <View className="flex-1 h-[1px] bg-muted-foreground/20" />
                </View>
              </>
            )}

            {/* Google Sign In Button - Always visible */}
            <Button
              className="bg-background/80 border-2 border-input shadow-xl rounded-3xl"
              size="lg"
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#4285F4" />
              ) : (
                <View className="flex-row items-center justify-center ">
                  <GoogleIcon width={20} height={20} />
                  <Text className="text-foreground/80 font-bold text-lg ml-2">Sign in with Google</Text>
                </View>
              )}
            </Button>


            {/* Error message for production */}
            {error && !isDevelopment ? (
              <View className="rounded-xl p-3 mt-4">
                <Text className="text-destructive text-sm text-center">{error}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    // </LinearGradient>
  );
}