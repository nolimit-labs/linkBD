import React, { useState } from 'react';
import { View, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useSearch } from '~/api/search';
import { useDebounce } from '~/hooks/use-debounce';

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data: searchResults, isLoading } = useSearch(debouncedQuery);

  const hasResults = searchResults && (
    (searchResults.users && searchResults.users.length > 0) || 
    (searchResults.organizations && searchResults.organizations.length > 0)
  );

  const handleProfilePress = (profileId: string) => {
    router.push(`/profile/${profileId}`);
  };

  const renderUser = (user: any) => (
    <TouchableOpacity key={user.id} onPress={() => handleProfilePress(user.id)}>
      <Card className="p-3 mb-3 bg-card">
        <View className="flex-row items-center">
          {user.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              className="w-12 h-12 rounded-full mr-3"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-muted mr-3 items-center justify-center">
              <Text className="text-lg font-semibold">
                {user.name?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="font-medium text-foreground">{user.name}</Text>
            <Text className="text-xs text-muted-foreground">Person</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const renderOrganization = (org: any) => (
    <TouchableOpacity key={org.id} onPress={() => handleProfilePress(org.id)}>
      <Card className="p-3 mb-3 bg-card">
        <View className="flex-row items-center">
          {org.imageUrl ? (
            <Image
              source={{ uri: org.imageUrl }}
              className="w-12 h-12 rounded-full mr-3"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-muted mr-3 items-center justify-center">
              <Text className="text-lg">🏢</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="font-medium text-foreground">{org.name}</Text>
            <Text className="text-xs text-muted-foreground">Business</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground mb-2">Search</Text>
        <Text className="text-sm text-muted-foreground mb-4">
          Find people and businesses in the linkBD community
        </Text>
        
        {/* Search Bar */}
        <View className="relative">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for people and businesses by name..."
            placeholderTextColor="#999"
            className="bg-card border border-input rounded-lg px-4 py-3 text-foreground"
            autoFocus
          />
          {isLoading && searchQuery && (
            <View className="absolute right-3 top-3.5">
              <ActivityIndicator size="small" />
            </View>
          )}
        </View>
      </View>

      {/* Results */}
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Loading State */}
        {isLoading && searchQuery && (
          <View className="items-center py-10">
            <ActivityIndicator size="large" />
            <Text className="text-muted-foreground mt-2">Searching...</Text>
          </View>
        )}

        {/* No Query State */}
        {!searchQuery && (
          <View className="items-center py-10">
            <Text className="text-4xl mb-4">🔍</Text>
            <Text className="text-muted-foreground text-center">
              Start typing to search the linkBD community
            </Text>
          </View>
        )}

        {/* No Results State */}
        {searchQuery && !isLoading && !hasResults && (
          <View className="items-center py-10">
            <Text className="text-muted-foreground">
              No results found for "{searchQuery}"
            </Text>
          </View>
        )}

        {/* Results */}
        {searchResults && hasResults && (
          <View className="pb-4">
            {/* Users Section */}
            {searchResults.users && searchResults.users.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-foreground mb-3 flex-row items-center">
                  👥 People ({searchResults.users.length})
                </Text>
                {searchResults.users.map(renderUser)}
              </View>
            )}

            {/* Organizations Section */}
            {searchResults.organizations && searchResults.organizations.length > 0 && (
              <View className="mb-6">
                <Text className="text-lg font-semibold text-foreground mb-3">
                  🏢 Businesses ({searchResults.organizations.length})
                </Text>
                {searchResults.organizations.map(renderOrganization)}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}