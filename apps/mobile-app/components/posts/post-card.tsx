import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Card } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { useRouter } from 'expo-router';

// Post type definition based on the API response
type Post = {
  author: {
    image: string | null;
    id: string;
    name: string;
    type: "user" | "organization";
  };
  imageUrl: string | null;
  hasLiked: boolean;
  id: string;
  userId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  // Add other fields as needed
};

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const router = useRouter();

  // Navigate to user profile when author is tapped
  const handleAuthorPress = () => {
    router.push(`/profile/${post.author.id}`);
  };

  // Format date to relative time
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="mb-4 p-4 bg-card">
      {/* Author info - Clickable */}
      <TouchableOpacity onPress={handleAuthorPress}>
        <View className="flex-row items-center mb-3">
          {post.author.image ? (
            <Image
              source={{ uri: post.author.image }}
              className="w-10 h-10 rounded-full mr-3"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-muted mr-3 items-center justify-center">
              <Text className="text-lg font-semibold">
                {post.author.name?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="font-semibold text-foreground">{post.author.name}</Text>
            <View className="flex-row items-center">
              <Text className="text-xs text-muted-foreground">
                {post.author.type === 'organization' ? '🏢 Organization' : 'User'}
              </Text>
              <Text className="text-xs text-muted-foreground ml-2">
                • {formatDate(post.updatedAt)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Post content */}
      <Text className="mb-3 text-foreground">{post.content}</Text>

      {/* Post image if exists */}
      {post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          className="w-full h-48 rounded-lg mb-3"
          resizeMode="cover"
        />
      )}

      {/* Post stats */}
      <View className="flex-row items-center justify-between pt-3 border-t border-border">
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-sm text-muted-foreground">
            {post.hasLiked ? '❤️ Liked' : '🤍 Like'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-sm text-muted-foreground">💬 Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-sm text-muted-foreground">📤 Share</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}