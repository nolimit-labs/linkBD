import { useState, useEffect, useRef } from 'react'
import { useCurrentUserProfile, useUpdateUser, useUploadFile } from '@/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera, User, X, Check, XIcon } from 'lucide-react'
import { toast } from 'sonner'

export function AccountInfoCard() {
  const [name, setName] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: user, isLoading } = useCurrentUserProfile()
  const updateUser = useUpdateUser()
  const uploadFile = useUploadFile()

  useEffect(() => {
    if (user?.name) {
      setName(user.name)
    }
  }, [user?.name])


  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || name.trim() === user?.name) {
      setIsEditingName(false)
      return
    }

    try {
      await updateUser.mutateAsync({ name: name.trim() })
      setIsEditingName(false)
    } catch (error) {
      console.error('Failed to update name:', error)
      setName(user?.name || '')
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    try {
      // Upload file to storage
      const uploadResult = await uploadFile.mutateAsync(file)
      
      // Update user profile with new image file key
      await updateUser.mutateAsync({ image: uploadResult.fileKey })
      
      toast.success('Avatar updated successfully')
    } catch (error) {
      console.error('Failed to update avatar:', error)
      toast.error('Failed to update avatar')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user?.image) return

    try {
      // Update user profile to remove image
      await updateUser.mutateAsync({ image: null })
      toast.success('Avatar removed successfully')
    } catch (error) {
      console.error('Failed to remove avatar:', error)
      toast.error('Failed to remove avatar')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>
          Your account details and authentication information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {user && (
          <>
            {/* Avatar and Info Section */}
            <div className="flex gap-6">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-48 w-48">
                  {user?.image ? (
                    <AvatarImage src={user.image} alt={user.name || 'User avatar'} />
                  ) : (
                    <AvatarFallback>
                      <User className="h-14 w-14 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadFile.isPending || updateUser.isPending}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                {user?.image && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute top-0 right-0 h-6 w-6 rounded-full shadow-sm"
                    onClick={handleRemoveAvatar}
                    disabled={updateUser.isPending}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              
              {/* Name and Email */}
              <div className="flex-1 space-y-4">
                {/* Name */}
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  {isEditingName ? (
                    <form onSubmit={handleUpdateName} className="mt-1 flex gap-2">
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="flex-1"
                        autoFocus
                      />
                      <Button type="submit" size="sm" disabled={updateUser.isPending}>
                        {updateUser.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setIsEditingName(false)
                          setName(user?.name || '')
                        }}
                      >
                        Cancel
                      </Button>
                    </form>
                  ) : (
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-base">
                        {user?.name || 'Not set'}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditingName(true)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
                
                {/* Email */}
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="text-base">
                      {user?.email || 'Not set'}
                    </p>
                    {user?.emailVerified ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <XIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                {/* Created At */}
                <div>
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not available'
                    }
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}