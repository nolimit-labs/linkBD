import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Save, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommentEditorProps {
  initialContent: string
  onSave: (content: string) => void
  onCancel: () => void
  isLoading?: boolean
  className?: string
}

export function CommentEditor({
  initialContent,
  onSave,
  onCancel,
  isLoading = false,
  className
}: CommentEditorProps) {
  const [content, setContent] = useState(initialContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      // Set cursor to end of text
      textareaRef.current.setSelectionRange(content.length, content.length)
    }
  }, [content.length])

  const handleSave = () => {
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      return
    }

    if (trimmedContent === initialContent.trim()) {
      onCancel() // No changes made
      return
    }

    onSave(trimmedContent)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  const hasChanges = content.trim() !== initialContent.trim()

  return (
    <div className={cn("space-y-3", className)}>
      <div className="pl-10">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Edit your comment..."
          className="min-h-[80px] resize-none"
          disabled={isLoading}
        />

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">⌘</kbd> + 
            <kbd className="px-1 py-0.5 text-xs bg-muted rounded ml-1">Enter</kbd> to save • 
            <kbd className="px-1 py-0.5 text-xs bg-muted rounded ml-1">Esc</kbd> to cancel
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!content.trim() || !hasChanges || isLoading}
              size="sm"
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}