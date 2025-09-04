import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { useCreatePost } from '~/api/posts';
import { X, Plus } from 'lucide-react-native';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CreatePostModal({ visible, onClose }: CreatePostModalProps) {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'organization' | 'private'>('public');
  
  const createPost = useCreatePost();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        visibility,
      });
      
      setContent('');
      setVisibility('public');
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const handleClose = () => {
    setContent('');
    setVisibility('public');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-background"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color="currentColor" />
          </TouchableOpacity>
          
          <Text className="text-lg font-semibold text-foreground">Create Post</Text>
          
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!content.trim() || createPost.isPending}
            className={`
              px-4 py-2 rounded-md
              ${!content.trim() || createPost.isPending 
                ? 'bg-muted' 
                : 'bg-primary'
              }
            `}
          >
            {createPost.isPending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className={`
                font-medium text-sm
                ${!content.trim() || createPost.isPending 
                  ? 'text-muted-foreground' 
                  : 'text-primary-foreground'
                }
              `}>
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Content Input */}
          <Card className="p-4 mb-4 bg-card">
            <Text className="text-sm font-medium text-foreground mb-2">
              What's on your mind?
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Share something with the community..."
              multiline
              numberOfLines={6}
              className="text-base text-foreground border border-border rounded-md p-3 min-h-[120px]"
              textAlignVertical="top"
            />
          </Card>

          {/* Visibility Settings */}
          <Card className="p-4 bg-card">
            <Text className="text-sm font-medium text-foreground mb-3">
              Visibility
            </Text>
            
            <View className="space-y-2">
              <TouchableOpacity
                onPress={() => setVisibility('public')}
                className={`
                  flex-row items-center justify-between p-3 rounded-md border
                  ${visibility === 'public' ? 'border-primary bg-primary/10' : 'border-border'}
                `}
              >
                <View>
                  <Text className="font-medium text-foreground">Public</Text>
                  <Text className="text-xs text-muted-foreground">Everyone can see</Text>
                </View>
                {visibility === 'public' && (
                  <View className="w-4 h-4 rounded-full bg-primary" />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setVisibility('private')}
                className={`
                  flex-row items-center justify-between p-3 rounded-md border
                  ${visibility === 'private' ? 'border-primary bg-primary/10' : 'border-border'}
                `}
              >
                <View>
                  <Text className="font-medium text-foreground">Private</Text>
                  <Text className="text-xs text-muted-foreground">Only you can see</Text>
                </View>
                {visibility === 'private' && (
                  <View className="w-4 h-4 rounded-full bg-primary" />
                )}
              </TouchableOpacity>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Floating Action Button for creating posts
export function CreatePostButton() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg"
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
      
      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </>
  );
}