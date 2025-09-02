import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Plus, ImageIcon, X, Building2, User, Clock, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { useCreatePost, usePostLimits } from '@/api'
import { Label } from '@/components/ui/label'
import { useActiveOrganization } from '@/lib/auth-client'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function NewPostDialog() {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<'public' | 'organization' | 'private'>('public')
  const createPostWithImage = useCreatePost()
  const { data: activeOrg } = useActiveOrganization()
  const { data: limits, isLoading: limitsLoading } = usePostLimits()
  
  // Calculate display values for reset time
  const getResetTimeDisplay = () => {
    if (!limits?.hoursUntilReset) return '';
    const hours = limits.hoursUntilReset;
    if (hours === 1) return 'in 1 hour';
    if (hours < 24) return `in ${hours} hours`;
    return 'tomorrow';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    // Reset file input
    const fileInput = document.getElementById('image-input') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    try {
      await createPostWithImage.mutateAsync({
        postData: {
          content: content.trim(),
          visibility,
        },
        imageFile: selectedImage || undefined,
      })
      
      setContent('')
      setSelectedImage(null)
      setImagePreview(null)
      setOpen(false)
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Posting to
            <Badge variant={activeOrg ? 'default' : 'secondary'} className="inline-flex items-center gap-1">
              {activeOrg ? (
                <>
                  <Building2 className="h-3 w-3" />
                  {activeOrg.name}
                </>
              ) : (
                <>
                  <User className="h-3 w-3" />
                  Personal workspace
                </>
              )}
            </Badge>
          </DialogDescription>
        </DialogHeader>
        
        {/* Post Limits Display */}
        {limits && (
          <Alert className={limits.hasReachedDailyLimit ? 'border-destructive' : ''}>
            <AlertDescription className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {limits.hasReachedDailyLimit ? (
                  <AlertCircle className="h-4 w-4 text-destructive" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {limits.hasReachedDailyLimit ? (
                    <>Daily limit reached. Resets {getResetTimeDisplay()}</>
                  ) : (
                    <>
                      {limits.remainingToday} of {limits.dailyLimit} posts remaining today
                    </>
                  )}
                </span>
              </div>
              {!limits.hasReachedDailyLimit && (
                <span className="text-xs text-muted-foreground">
                  Resets {getResetTimeDisplay()}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-2">
              What's on your mind?
            </label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share something with the community..."
              rows={4}
              required
            />
          </div>
          
          <div>
            <Label className="block text-sm font-medium mb-2">
              Visibility
            </Label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'organization' | 'private')}
              className="w-full p-2 border rounded-md"
            >
              <option value="public">Public - Everyone can see</option>
              {activeOrg && <option value="organization">Organization - {activeOrg.name} members only</option>}
              <option value="private">Private - Only you can see</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="image-input" className="block text-sm font-medium mb-2">
              Image (optional)
            </Label>
            <div className="space-y-2">
              <Input
                id="image-input"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!content.trim() || createPostWithImage.isPending || limits?.hasReachedDailyLimit}
            >
              {createPostWithImage.isPending ? 'Posting...' : 
               limits?.hasReachedDailyLimit ? 'Limit Reached' : 'Create Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}