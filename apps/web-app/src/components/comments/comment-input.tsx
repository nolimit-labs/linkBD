import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Building2, User, Send, X } from 'lucide-react'
import { useCreateComment } from '@/api'
import { useSession } from '@/lib/auth-client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useGetProfile } from '@/api/profile'

interface CommentInputProps {
  postId: string
  parentId?: string
  placeholder?: string
  onSuccess?: () => void
  onCancel?: () => void
  autoFocus?: boolean
  className?: string
  compact?: boolean
}

export function CommentInput({
  postId,
  parentId,
  placeholder = 'Write a comment...',
  onSuccess,
  onCancel,
  autoFocus = false,
  className,
  compact = false
}: CommentInputProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(autoFocus)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const createComment = useCreateComment()

  const currentAccountId = session?.session?.activeOrganizationId || session?.session?.userId

  const { data: profileData } = useGetProfile(currentAccountId)

  // Determine current author for avatar display
  const currentAccount = {
    id: currentAccountId,
    name: profileData?.name,
    image: profileData?.image,
    type: profileData?.type
  }

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Please enter a comment')
      return
    }

    if (!session) {
      toast.error('Please sign in to comment')
      return
    }

    createComment.mutate(
      {
        postId,
        content: content.trim(),
        parentId
      },
      {
        onSuccess: () => {
          setContent('')
          setIsFocused(false)
          onSuccess?.()
        }
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleCancel = () => {
    setContent('')
    setIsFocused(false)
    onCancel?.()
  }

  const handleFocus = () => {
    setIsFocused(true)
  }



  // Compact mode: expandable input with integrated button
  if (compact) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10 rounded-lg">
            <AvatarImage src={currentAccount.image || ''} />
            <AvatarFallback className="rounded-lg">
              {currentAccount.type === 'organization' ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 relative">
            {!isFocused ? (
              // Collapsed state - clickable placeholder
              <div
                onClick={handleFocus}
                className="w-full p-3 border border-input rounded-md bg-background cursor-text hover:bg-accent/50 transition-colors text-muted-foreground text-sm"
              >
                {placeholder}
              </div>
            ) : (
              // Expanded state - full textarea with integrated button
              <div className="space-y-2">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="min-h-[100px] resize-none pr-20 pb-12"
                    disabled={createComment.isPending}
                  />
                  
                  {/* Comment button positioned inside textarea */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!content.trim() || createComment.isPending}
                    size="sm"
                    className="absolute bottom-2 right-2"
                  >
                    {createComment.isPending ? (
                      'Posting...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-1" />
                        {parentId ? 'Reply' : 'Comment'}
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {`Commenting as ${currentAccount.name}`} • 
                    Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">⌘</kbd> + 
                    <kbd className="px-1 py-0.5 text-xs bg-muted rounded ml-1">Enter</kbd> to post
                  </p>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={createComment.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Regular mode: always expanded
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-start space-x-3">
        <Avatar className="h-10 w-10 rounded-lg">
          <AvatarImage src={currentAccount.image || ''} />
          <AvatarFallback className="rounded-lg">
            {currentAccount.type === 'organization' ? (
              <Building2 className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "min-h-[80px] resize-none",
              !isFocused && "cursor-pointer"
            )}
            disabled={!session || createComment.isPending}
          />

          {isFocused && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {`Commenting as ${currentAccount.name}`} • 
                Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">⌘</kbd> + 
                <kbd className="px-1 py-0.5 text-xs bg-muted rounded ml-1">Enter</kbd> to post
              </p>

              <div className="flex items-center gap-2">
                {onCancel && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={createComment.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
                
                <Button
                  onClick={handleSubmit}
                  disabled={!content.trim() || createComment.isPending}
                  size="sm"
                >
                  {createComment.isPending ? (
                    'Posting...'
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      {parentId ? 'Reply' : 'Comment'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}