import React from 'react';
import { Platform, View, Image, ActionSheetIOS, Alert, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { useSession } from '~/api/auth';
import { useActiveOrganization, useListOrganizations, organization } from '~/lib/auth-client';
import { useFollowerCounts } from '~/api/followers';
import { useGetProfile } from '~/api/profile';
import { MaterialIcons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

export function DrawerAccountHeader() {
  const { data: session } = useSession();
  // const { data: activeOrg } = useActiveOrganization();
  const { data: orgs } = useListOrganizations();
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

      {/* Switch Account Modal */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="w-11/12 max-w-[520px] rounded-2xl bg-background border border-border p-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-semibold text-foreground">Switch Account</Text>
              <Pressable onPress={() => setOpen(false)} className="p-2">
                {/* @ts-ignore */}
                <MaterialIcons name="close" size={20} color={'#888'} />
              </Pressable>
            </View>

            <ScrollView className="max-h-[380px]">
              {/* Personal account */}
              <TouchableOpacity
                onPress={() => handleSelect(null)}
                className={`flex-row items-center p-3 rounded-lg ${!activeOrganizationId ? 'bg-muted/30' : ''}`}
              >
                {profile?.image ? (
                  <Image source={{ uri: profile.image }} className="w-9 h-9 rounded-md mr-3" />
                ) : (
                  <View className="w-9 h-9 rounded-md bg-muted mr-3 items-center justify-center">
                    <Text className="text-sm font-semibold">{profile?.name?.charAt(0) || '?'}</Text>
                  </View>
                )}
                <View className="flex-1">
                  <Text className="text-foreground">Personal Account</Text>
                  <Text className="text-xs text-muted-foreground">Your individual workspace</Text>
                </View>
                {!activeOrganizationId && (
                  // @ts-ignore
                  <MaterialIcons name="check" size={18} color={'#888'} />
                )}
              </TouchableOpacity>

              {/* Organizations */}
              {orgs?.length ? (
                <View className="mt-3">
                  <Text className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Business Accounts</Text>
                  {orgs.map((org: any) => (
                    <AccountRow
                      key={org.id}
                      id={org.id}
                      name={org.name}
                      isActive={activeOrganizationId === org.id}
                      onSelect={() => handleSelect(org.id)}
                    />
                  ))}
                </View>
              ) : (
                <View className="items-center py-6">
                  {/* @ts-ignore */}
                  <MaterialIcons name="business" size={36} color={'#666'} />
                  <Text className="text-sm text-muted-foreground mt-2">No business accounts yet</Text>
                  <Pressable className="mt-3 px-4 py-2 rounded-md border border-border" onPress={() => {}}>
                    <Text className="text-foreground">Create Business Account</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>

            <View className="mt-3">
              <Pressable className="w-full items-center py-2 rounded-md bg-muted" onPress={() => setOpen(false)}>
                <Text className="text-foreground">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function AccountRow({ id, name, isActive, onSelect }: { id: string; name: string; isActive: boolean; onSelect: () => void }) {
  const { data: prof } = useGetProfile(id);
  return (
    <TouchableOpacity onPress={onSelect} className={`flex-row items-center p-3 rounded-lg ${isActive ? 'bg-muted/30' : ''}`}>
      {prof?.image ? (
        <Image source={{ uri: prof.image }} className="w-9 h-9 rounded-md mr-3" />
      ) : (
        <View className="w-9 h-9 rounded-md bg-muted mr-3 items-center justify-center">
          <Text className="text-sm font-semibold">{name?.charAt(0) || '?'}</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-foreground">{name}</Text>
        <Text className="text-xs text-muted-foreground">Business Account</Text>
      </View>
      {isActive && (
        // @ts-ignore
        <MaterialIcons name="check" size={18} color={'#888'} />
      )}
    </TouchableOpacity>
  );
}


