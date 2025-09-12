import React from 'react';
import { View, Modal, Pressable, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { useSession } from '~/api/auth';
import { useListOrganizations, organization } from '~/lib/auth-client';
import { authClient } from '~/lib/auth-client';
import { useGetProfile } from '~/api/profile';
import { useQueryClient } from '@tanstack/react-query';
import { MaterialIcons } from '@expo/vector-icons';

export function AccountSwitcher({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { data: session } = useSession();
  const { data: orgs } = useListOrganizations();
  const { userId, activeOrganizationId } = session?.data?.session || {};
  const queryClient = useQueryClient();

  const handleSelect = async (targetId: string | null) => {
    try {
      await organization.setActive({ organizationId: targetId });
    } finally {
      onOpenChange(false);
      queryClient.invalidateQueries();
    }
  };

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => onOpenChange(false)}>
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="w-11/12 max-w-[520px] rounded-2xl bg-background border border-border p-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-semibold text-foreground">Switch Account</Text>
            <Pressable onPress={() => onOpenChange(false)} className="p-2">
              {/* @ts-ignore */}
              <MaterialIcons name="close" size={20} color={'#888'} />
            </Pressable>
          </View>

          <ScrollView className="max-h-[380px]">
            <PersonalAccountRow isActive={!activeOrganizationId} onSelect={() => handleSelect(null)} />

            {orgs?.length ? (
              <View className="mt-3">
                <Text className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Business Accounts</Text>
                {orgs.map((org: any) => (
                  <OrgRow
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

          <View className="mt-3 gap-2">
            <Pressable className="w-full items-center py-2 rounded-md bg-muted" onPress={() => onOpenChange(false)}>
              <Text className="text-foreground">Cancel</Text>
            </Pressable>
            <Pressable
              className="w-full items-center py-2 rounded-md border border-destructive"
              onPress={() => {
                authClient.signOut().catch(() => {});
                onOpenChange(false);
              }}
            >
              <Text className="text-destructive">Sign out</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PersonalAccountRow({ isActive, onSelect }: { isActive: boolean; onSelect: () => void }) {
  const { data: session } = useSession();
  const { userId } = session?.data?.session || {};
  const { data: prof } = useGetProfile(userId);
  return (
    <TouchableOpacity onPress={onSelect} className={`flex-row items-center p-3 rounded-lg ${isActive ? 'bg-muted/30' : ''}`}>
      {prof?.image ? (
        <Image source={{ uri: prof.image }} className="w-9 h-9 rounded-md mr-3" />
      ) : (
        <View className="w-9 h-9 rounded-md bg-muted mr-3 items-center justify-center">
          <Text className="text-sm font-semibold">{prof?.name?.charAt(0) || '?'}</Text>
        </View>
      )}
      <View className="flex-1">
        <Text className="text-foreground">Personal Account</Text>
        <Text className="text-xs text-muted-foreground">Your individual workspace</Text>
      </View>
      {isActive && (
        // @ts-ignore
        <MaterialIcons name="check" size={18} color={'#888'} />
      )}
    </TouchableOpacity>
  );
}

function OrgRow({ id, name, isActive, onSelect }: { id: string; name: string; isActive: boolean; onSelect: () => void }) {

    const { data: org } = useGetProfile(id);

  return (
    <TouchableOpacity onPress={onSelect} className={`flex-row items-center p-3 rounded-lg ${isActive ? 'bg-muted/30' : ''}`}>
      {org?.image ? (
        <Image source={{ uri: org.image }} className="w-9 h-9 rounded-md mr-3" />
      ) : (
        <View className="w-9 h-9 rounded-md bg-muted mr-3 items-center justify-center">
        <Text className="text-sm font-semibold">{org?.name?.charAt(0) || '?'}</Text>
      </View>
      )}
      <View className="flex-1">
        <Text className="text-foreground">{org?.name}</Text>
        <Text className="text-xs text-muted-foreground">Business Account</Text>
      </View>   
      {isActive && (
        // @ts-ignore
        <MaterialIcons name="check" size={18} color={'#888'} />
      )}
    </TouchableOpacity>
  );
}


