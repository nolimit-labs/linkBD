import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { BadgeText } from '~/components/ui/badge';

interface CommentCardProps {
  comment: any;
}

export function CommentCard({ comment }: CommentCardProps) {
  const router = useRouter();
  
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

  const handleAuthorPress = () => {
    if (comment.author?.id) {
      router.push(`/profile/${comment.author.id}` as const);
    }
  };

  return (
    <Card className="mb-3 p-4 bg-card">
      {/* Author info */}
      <TouchableOpacity onPress={handleAuthorPress}>
        <View className="flex-row items-center mb-3">
          {comment.author?.image ? (
            <Image
              source={{ uri: comment.author.image }}
              className="w-8 h-8 rounded-lg mr-3"
            />
          ) : (
            <View className="w-8 h-8 rounded-lg bg-muted mr-3 items-center justify-center">
              <Text className="text-sm font-semibold">
                {comment.author?.name?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="font-semibold text-foreground text-sm">{comment.author?.name || 'Unknown'}</Text>
              {comment.author?.isOfficial && (
                <BadgeText variant="default">
                  Official
                </BadgeText>
              )}
              {(comment.author?.subscriptionPlan === 'pro' || comment.author?.subscriptionPlan === 'pro_complementary') && (
                <BadgeText variant="secondary">
                  Pro
                </BadgeText>
              )}
            </View>
            <Text className="text-xs text-muted-foreground">
              {formatDate(comment.createdAt)}
              {comment.isEdited && ' • edited'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Comment content */}
      <Text className="text-foreground">{comment.content}</Text>
    </Card>
  );
}