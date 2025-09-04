import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Card } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { BadgeText } from '~/components/ui/badge';
import { useRouter } from 'expo-router';
import { Heart, MessageCircle, Share } from 'lucide-react-native';
import { useTogglePostLike } from '~/api/posts';

// Post type definition based on the API response
type Post = {
  author: {
    image: string | null;
    id: string;
    name: string;
    type: "user" | "organization";
    isOfficial?: boolean;
    subscriptionPlan?: string;
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
  showAuthor?: boolean;
}

export function PostCard({ post, showAuthor = true }: PostCardProps) {
  const router = useRouter();
  const toggleLike = useTogglePostLike();

  // Navigate to user profile when author is tapped
  const handleAuthorPress = () => {
    router.push(`/profile/${post.author.id}` as const);
  };

  // Handle like toggle
  const handleLikeToggle = () => {
    toggleLike.mutate(post.id);
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
      {/* Author info - Clickable (only show if showAuthor is true) */}
      {showAuthor && (
        <TouchableOpacity onPress={handleAuthorPress}>
          <View className="flex-row items-center mb-3">
            {post.author.image ? (
              <Image
                source={{ uri: post.author.image }}
                className="w-10 h-10 rounded-lg mr-3"
              />
            ) : (
              <View className="w-10 h-10 rounded-lg bg-muted mr-3 items-center justify-center">
                <Text className="text-lg font-semibold">
                  {post.author.name?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="font-semibold text-foreground">{post.author.name}</Text>
                {post.author.isOfficial && (
                  <BadgeText variant="default">
                    Official
                  </BadgeText>
                )}
                {(post.author.subscriptionPlan === 'pro' || post.author.subscriptionPlan === 'pro_complementary') && (
                  <BadgeText variant="secondary">
                    Pro
                  </BadgeText>
                )}
              </View>
              <View className="flex-row items-center">
                <Text className="text-xs text-muted-foreground">
                  {post.author.type === 'organization' ? 'Organization' : 'User'}
                </Text>
                <Text className="text-xs text-muted-foreground ml-2">
                  • {formatDate(post.updatedAt)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
      
      {/* Show timestamp when author is hidden */}
      {!showAuthor && (
        <Text className="text-xs text-muted-foreground mb-2">
          {formatDate(post.updatedAt)}
        </Text>
      )}

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
        <TouchableOpacity 
          className="flex-row items-center gap-1" 
          onPress={handleLikeToggle}
          disabled={toggleLike.isPending}
        >
          <Heart 
            size={16}
            color={post.hasLiked ? "#ef4444" : "#6b7280"}
            fill={post.hasLiked ? "#ef4444" : "transparent"}
          />
          <Text className={`text-sm ${post.hasLiked ? 'text-red-500' : 'text-muted-foreground'}`}>
            {post.hasLiked ? 'Liked' : 'Like'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center gap-1">
          <MessageCircle size={16} color="#6b7280" />
          <Text className="text-sm text-muted-foreground">Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center gap-1">
          <Share size={16} color="#6b7280" />
          <Text className="text-sm text-muted-foreground">Share</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}