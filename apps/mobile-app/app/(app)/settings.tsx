import React from 'react';
import { View, ScrollView } from 'react-native';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 py-4">

        {/* Theme Settings */}
        <Card className="mb-6 bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-card-foreground font-medium">Dark Mode</Text>
                <Text className="text-muted-foreground text-sm mt-1">
                  Switch between light and dark themes
                </Text>
              </View>
              <ThemeToggle />
            </View>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="mb-6 bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-card-foreground font-medium">Push Notifications</Text>
                <Text className="text-muted-foreground text-sm mt-1">
                  Get notified about todo reminders
                </Text>
              </View>
              <Button variant="outline" className="border-border">
                <Text className="text-card-foreground">Enable</Text>
              </Button>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-card-foreground font-medium">Email Notifications</Text>
                <Text className="text-muted-foreground text-sm mt-1">
                  Receive daily todo summaries via email
                </Text>
              </View>
              <Button variant="outline" className="border-border">
                <Text className="text-card-foreground">Configure</Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card className="mb-6 bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Data & Storage</CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-card-foreground font-medium">Export Data</Text>
                <Text className="text-muted-foreground text-sm mt-1">
                  Download all your todos as JSON
                </Text>
              </View>
              <Button variant="outline" className="border-border">
                <Text className="text-card-foreground">Export</Text>
              </Button>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-card-foreground font-medium">Clear Cache</Text>
                <Text className="text-muted-foreground text-sm mt-1">
                  Clear app cache and temporary data
                </Text>
              </View>
              <Button variant="outline" className="border-border">
                <Text className="text-card-foreground">Clear</Text>
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="mb-6 bg-card border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">About</CardTitle>
          </CardHeader>
          <CardContent className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Version</Text>
              <Text className="text-card-foreground font-medium">1.0.0</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Build</Text>
              <Text className="text-card-foreground font-medium">2024.1</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-muted-foreground">Platform</Text>
              <Text className="text-card-foreground font-medium">React Native</Text>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}