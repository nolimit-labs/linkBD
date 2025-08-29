import React, { useState } from 'react';
import { View, FlatList, ActivityIndicator, TextInput, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useOrganizations, useSearch } from '~/api/search';
import { useDebounce } from '~/hooks/use-debounce';

export default function BusinessesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Get all organizations by default
  const { data: allOrganizations, isLoading: allLoading } = useOrganizations(20);
  
  // Search only for organizations when there's a query
  const { data: searchResults, isLoading: searchLoading } = useSearch(debouncedQuery, 'organization');

  const businesses = searchQuery 
    ? searchResults?.organizations || []
    : allOrganizations?.organizations || [];
  
  const isLoading = searchQuery ? searchLoading : allLoading;

  const handleBusinessPress = (businessId: string) => {
    router.push(`/profile/${businessId}`);
  };

  const renderBusiness = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleBusinessPress(item.id)} className="mb-4">
      <Card className="p-4 bg-card">
        <View className="flex-row items-center">
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              className="w-16 h-16 rounded-full mr-4"
            />
          ) : (
            <View className="w-16 h-16 rounded-full bg-muted mr-4 items-center justify-center">
              <Text className="text-2xl">🏢</Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-lg font-semibold text-foreground">{item.name}</Text>
            <Text className="text-sm text-muted-foreground">Business Account</Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="px-4 py-4 border-b border-border">
        <Text className="text-2xl font-bold text-foreground mb-2">Businesses</Text>
        <Text className="text-sm text-muted-foreground mb-4">
          Discover businesses in the linkBD community
        </Text>
        
        {/* Search Bar */}
        <View className="relative">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search businesses by name..."
            placeholderTextColor="#999"
            className="bg-card border border-input rounded-lg px-4 py-3 text-foreground"
          />
          {isLoading && searchQuery && (
            <View className="absolute right-3 top-3.5">
              <ActivityIndicator size="small" />
            </View>
          )}
        </View>
      </View>

      {/* Business List */}
      <FlatList
        data={businesses}
        renderItem={renderBusiness}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator size="large" />
              <Text className="text-muted-foreground mt-2">Loading businesses...</Text>
            </View>
          ) : searchQuery ? (
            <View className="items-center py-10">
              <Text className="text-muted-foreground">
                No businesses found for "{searchQuery}"
              </Text>
            </View>
          ) : (
            <View className="items-center py-10">
              <Text className="text-muted-foreground">No businesses yet</Text>
            </View>
          )
        }
        ListHeaderComponent={
          businesses.length > 0 ? (
            <Text className="text-sm font-semibold text-muted-foreground mb-3">
              {searchQuery ? `Search Results (${businesses.length})` : `All Businesses (${businesses.length})`}
            </Text>
          ) : null
        }
      />
    </View>
  );
}