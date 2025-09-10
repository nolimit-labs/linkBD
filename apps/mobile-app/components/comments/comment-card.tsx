import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { BadgeText } from '~/components/ui/badge';
import { Heart } from '~/lib/icons/Heart';
import { MessageCircle } from '~/lib/icons/MessageCircle';

interface CommentCardProps {
  comment: any;
  onReply?: () => void;
  onShowReplies?: () => void;
  showReplies?: boolean;
  repliesCountDisplay?: number;
  onPress?: () => void;
}

export function CommentCard({ comment, onReply, onShowReplies, showReplies, repliesCountDisplay, onPress }: CommentCardProps) {
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
    <Card className="mb-3 bg-card dark:border-background/0 rounded-sm">
      <TouchableOpacity className="p-4" onPress={onPress} disabled={!onPress}>
        {/* Author info - match PostCard header */}
        <TouchableOpacity onPress={handleAuthorPress}>
          <View className="flex-row items-center mb-3">
            {comment.author?.imageUrl ? (
              <Image
                source={{ uri: comment.author.imageUrl }}
                className="w-10 h-10 rounded-lg mr-3"
              />
            ) : (
              <View className="w-10 h-10 rounded-lg bg-muted mr-3 items-center justify-center">
                <Text className="text-lg font-semibold">
                  {comment.author?.name?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="font-semibold text-foreground">{comment.author?.name || 'Unknown'}</Text>
                {comment.author?.isOfficial && (
                  <BadgeText variant="default">Official</BadgeText>
                )}
                {(comment.author?.subscriptionPlan === 'pro' || comment.author?.subscriptionPlan === 'pro_complementary') && (
                  <BadgeText variant="secondary">Pro</BadgeText>
                )}
              </View>
              <View className="flex-row items-center">
                <Text className="text-xs text-muted-foreground">
                  {comment.author?.type === 'organization' ? 'Organization' : 'User'}
                </Text>
                <Text className="text-xs text-muted-foreground ml-2">
                  • {formatDate(comment.createdAt)}{comment.isEdited ? ' • edited' : ''}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Comment content */}
        <Text className="text-foreground">{comment.content}</Text>
      </TouchableOpacity>

      {/* Action bar similar to PostCard (no Share) */}
      <View className="flex-row items-center justify-between px-4 pb-4 pt-3 border-t border-border">
        {/* Like placeholder: visual only (no backend yet) */}
        <View className="flex-row items-center gap-1 opacity-60">
          <Heart className="text-muted-foreground" size={16} />
          <Text className="text-sm text-muted-foreground">Like</Text>
        </View>
        {onReply ? (
          <TouchableOpacity className="flex-row items-center gap-1" onPress={onReply}>
            <MessageCircle className="text-muted-foreground" size={16} />
            <Text className="text-sm text-muted-foreground">Reply</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row items-center gap-1">
            <MessageCircle className="text-muted-foreground" size={16} />
            <Text className="text-sm text-muted-foreground">Reply</Text>
          </View>
        )}
        {(repliesCountDisplay ?? 0) > 0 ? (
          onShowReplies ? (
            <TouchableOpacity className="flex-row items-center gap-1" onPress={onShowReplies}>
              <Text className="text-sm text-muted-foreground">
                {showReplies ? 'Hide' : 'View'} {repliesCountDisplay} {repliesCountDisplay === 1 ? 'reply' : 'replies'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row items-center gap-1">
              <Text className="text-sm text-muted-foreground">
                {repliesCountDisplay} {repliesCountDisplay === 1 ? 'reply' : 'replies'}
              </Text>
            </View>
          )
        ) : (
          <View />
        )}
      </View>
    </Card>
  );
}