import React, { useState } from 'react';
import { View, TextInput, ActivityIndicator, TouchableOpacity, ColorValue, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '@/lib/use-theme-colors';
import { Logo } from '@/components/logo';

type ErrorShape = { error?: { message?: string } };
const hasError = (value: unknown): value is Required<ErrorShape> => {
    return typeof value === 'object' && value !== null && 'error' in (value as Record<string, unknown>);
};

export default function SignUpScreen() {
    const router = useRouter();
    const { gradientColors } = useThemeColors();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignUp = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await authClient.signUp.email({ email, password, name });
            if (hasError(result) && result.error) {
                setError(result.error.message || 'Failed to sign up');
                return;
            }
            router.replace('/(app)/todos');
        } catch {
            setError('Sign up failed. Please try again.');
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

                        <Logo className="items-center justify-center" width={240} height={80} />
                        <Text className="text-3xl font-bold text-foreground mt-6">Create Account</Text>
                        <Text className="text-base text-muted-foreground mt-2">Join us and start managing tasks</Text>
                    </View>

                    {/* Form Container */}
                    <View className="">
                        <View className="mb-4">
                            <Text className="mb-2 text-foreground font-semibold text-sm">Name</Text>
                            <View className="rounded-2xl border-2 border-input overflow-hidden">
                                <TextInput
                                    placeholder="Your name"
                                    value={name}
                                    onChangeText={setName}
                                    className="px-4 py-4 text-foreground bg-background/60 placeholder:text-foreground/80 text-base"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="mb-2 text-foreground font-semibold text-sm">Email</Text>
                            <View className="rounded-2xl border-2 border-input overflow-hidden">
                                <TextInput
                                    placeholder="your@email.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    className="px-4 py-4 text-foreground bg-background/60 placeholder:text-foreground/80 text-base"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="mb-2 text-foreground font-semibold text-sm">Password</Text>
                            <View className="rounded-2xl border-2 border-input overflow-hidden">
                                <TextInput
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry
                                    className="px-4 py-4 text-foreground bg-background/60 placeholder:text-foreground/80 text-base"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                            <Text className="text-xs text-muted-foreground mt-1">
                                Must be at least 6 characters
                            </Text>
                        </View>

                        {error ? (
                            <View className="rounded-xl p-3 mb-4">
                                <Text className="text-destructive text-sm text-center">{error}</Text>
                            </View>
                        ) : null}

                        <Button
                            className="bg-secondary shadow-2xl rounded-2xl py-4"
                            onPress={handleSignUp}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text className="text-secondary-foreground font-bold text-lg">Create Account</Text>
                            )}
                        </Button>

                        {/* Terms and Privacy */}
                        <Text className="text-xs text-muted-foreground text-center mt-4">
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </Text>
                    </View>

                    {/* Sign In Link */}
                    <View className="flex-row items-center justify-center gap-2 mt-8">
                        <Text className="text-muted-foreground">Already have an account?</Text>
                        <Link href="/(auth)/sign-in" asChild>
                            <TouchableOpacity className="py-2">
                                <Text className="text-foreground font-bold">Sign in</Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}