import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSession } from '~/api/auth';
import { useCreateComment } from '~/api/comments';
import { Send } from '~/lib/icons';

interface CommentInputProps {
  postId: string;
  placeholder?: string;
  onSuccess?: () => void;
}

export function CommentInput({ 
  postId, 
  placeholder = "Join the conversation...",
  onSuccess 
}: CommentInputProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const createComment = useCreateComment();

  const handleSubmit = async () => {
    if (!content.trim() || !session) return;

    createComment.mutate(
      {
        postId,
        content: content.trim(),
      },
      {
        onSuccess: () => {
          setContent('');
          setIsFocused(false);
          onSuccess?.();
        }
      }
    );
  };

  if (!session) return null;

  return (
    <View className="bg-background border-t border-border">
      <View className="px-4 py-3">
        <View className="flex-row items-end gap-2">
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`flex-1 bg-muted/10 rounded-lg px-4 py-2 text-foreground ${
              isFocused ? 'min-h-[80px]' : 'min-h-[44px]'
            }`}
            style={{ textAlignVertical: 'top' }}
          />
          {content.trim() && (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={createComment.isPending}
              className="bg-primary rounded-lg p-2.5"
            >
              {createComment.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Send size={20} color="white" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}