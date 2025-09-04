import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '~/components/ui/text';
import { useFollowerCounts } from '~/api/followers';
import { useRouter } from 'expo-router';

interface FollowStatsProps {
  userId?: string;
  organizationId?: string;
  clickable?: boolean;
}

export function FollowStats({
  userId,
  organizationId,
  clickable = true
}: FollowStatsProps) {
  const router = useRouter();
  const { data: counts, isLoading } = useFollowerCounts(userId, organizationId);

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (isLoading) {
    return (
      <View className="flex-row justify-around">
        <View className="items-center">
          <Text className="text-lg font-semibold text-foreground">-</Text>
          <Text className="text-sm text-muted-foreground">Followers</Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-semibold text-foreground">-</Text>
          <Text className="text-sm text-muted-foreground">Following</Text>
        </View>
      </View>
    );
  }

  const followersCount = counts?.followersCount || 0;
  const followingCount = counts?.followingCount || 0;
  const targetId = userId || organizationId;
  const isOrganization = !!organizationId;

  const handleFollowersPress = () => {
    if (clickable && targetId) {
      router.push(`/profile/${targetId}/followers`);
    }
  };



  const FollowerStat = ({ 
    count, 
    label, 
    onPress 
  }: { 
    count: number; 
    label: string; 
    onPress?: () => void;
  }) => {
    const content = (
      <View className="items-center px-1">
        <Text className="text-xl font-bold text-foreground">
          {formatCount(count)}
        </Text>
        <Text className="text-sm text-muted-foreground">{label}</Text>
      </View>
    );

    if (clickable && onPress) {
      return (
        <TouchableOpacity onPress={onPress} className="items-center px-1">
          {content}
        </TouchableOpacity>
      );
    }

    return content;
  };

  return (
    <View className="flex-row gap-4">
      <FollowerStat 
        count={followersCount} 
        label="followers" 
      />
      <FollowerStat 
        count={followingCount} 
        label="following" 
      />
    </View>
  );
}