import React from 'react';
import { Platform, View, Image, ActionSheetIOS, Alert, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { useSession } from '~/api/auth';
import { organization } from '~/lib/auth-client';
import { AccountSwitcher } from './account-switcher';
import { useGetProfile } from '~/api/profile';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

export function DrawerAccountHeader() {
  const { data: session } = useSession();
  // Determine active entity (personal or organization) similar to web
  const { userId, activeOrganizationId } = session?.data?.session || {};
  const currentAccountId = activeOrganizationId || userId;

  const { data: profile, isPending: profileLoading } = useGetProfile(currentAccountId);
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  
  const onPressSwitch = () => {
    setOpen(true);
  };

  const handleSelect = async (targetId: string | null) => {
    try {
      await organization.setActive({ organizationId: targetId });
    } finally {
      setOpen(false);
      queryClient.invalidateQueries();
    }
  };

  console.log('profile follower counts', profile?.followerCounts);

  if (profileLoading) {
    return (
      <View className="px-6 pb-5">
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View
      className="px-8 pb-5"
      style={{ paddingTop: insets.top + 8 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {profile?.image ? (
            <Image source={{ uri: profile.image }} className="w-10 h-10 rounded-lg" />
          ) : (
            <View className="w-10 h-10 rounded-lg bg-muted items-center justify-center">
              <Text className="text-lg font-semibold">{profile?.name?.charAt(0) || '?'}</Text>
            </View>
          )}
          <View>
            <Text className="font-semibold text-foreground">{profile?.name}</Text>
            <Text className="text-muted-foreground text-xs">
              {profile?.followerCounts?.followersCount ?? 0} followers
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onPressSwitch}
          className="p-2 rounded-md"
          hitSlop={8}
        >
          {/* @ts-ignore React 19 JSX typing mismatch */}
          <MaterialIcons name="swap-horiz" size={22} color={'#666'} />
        </Pressable>
      </View>

      <AccountSwitcher open={open} onOpenChange={setOpen} />
    </View>
  );
}

