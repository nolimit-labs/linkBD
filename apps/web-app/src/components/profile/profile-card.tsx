import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, Building, User, Edit3, Save, X, Upload } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { OfficialBadge } from './badge-official'
import { ProBadge } from './badge-pro'
import { FollowButton } from '@/components/follows/follow-button'
import { FollowStats } from '@/components/follows/follow-stats'
import { useState, useRef } from 'react'
import { useSession } from '@/lib/auth-client'
import { useActiveOrganization } from '@/lib/auth-client'
import { useUpdateUser } from '@/api/user'
import { useUpdateOrganization } from '@/api/organization'
import { useUploadFile } from '@/api/storage'

type ProfileCardProps = {
  profile: {
    id: string
    type: 'user' | 'organization'
    name: string
    image: string | null
    isOfficial?: boolean
    subscriptionPlan?: string
    createdAt: string
    description?: string | null
  }
}

export function ProfileCard({ profile }: ProfileCardProps) {
  // Component State
  const [isEditMode, setIsEditMode] = useState(false)
  const [editName, setEditName] = useState(profile.name)
  const [editDescription, setEditDescription] = useState(profile.description || '')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Authentication & Session
  const { data: session } = useSession()
  const { data: activeOrg } = useActiveOrganization()

  // Data Fetching & Mutations
  const updateUser = useUpdateUser()
  const updateOrganization = useUpdateOrganization()
  const uploadFile = useUploadFile()

  const isOrganization = profile.type === 'organization'
  
  // Determine if current user can edit this profile
  const canEdit = isOrganization 
    ? activeOrg?.id === profile.id 
    : session?.user?.id === profile.id

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSave = async () => {
    try {
      let imageKey = undefined

      // Upload image if selected
      if (selectedImage) {
        const uploadResult = await uploadFile.mutateAsync(selectedImage)
        imageKey = uploadResult.fileKey
      }

      if (isOrganization) {
        await updateOrganization.mutateAsync({
          id: profile.id,
          name: editName,
          description: editDescription,
          imageKey,
        })
      } else {
        await updateUser.mutateAsync({
          name: editName,
          image: imageKey,
          description: editDescription,
        })
      }

      // Reset edit mode and cleanup
      setIsEditMode(false)
      setSelectedImage(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleCancel = () => {
    setIsEditMode(false)
    setEditName(profile.name)
    setEditDescription(profile.description || '')
    setSelectedImage(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const currentImage = previewUrl || profile.image
  const isLoading = updateUser.isPending || updateOrganization.isPending || uploadFile.isPending

  return (
    <Card className="sticky">
      <CardContent className="px-6">
        <div className="space-y-6">
          {/* Profile Header - Avatar on top centered, Name below left-aligned */}
          <div>
            <div className="relative mx-auto mb-6">
              <Avatar className="h-full w-full max-h-70 max-w-70 mx-auto rounded-lg">
                <AvatarImage src={currentImage || undefined} className="rounded-lg object-cover" />
                <AvatarFallback className="text-3xl rounded-lg object-cover">
                  {isOrganization ? (
                    <Building className="h-full w-full p-20" />
                  ) : (
                    <User className="h-full w-full p-20" />
                  )}
                </AvatarFallback>
              </Avatar>
              
              {/* Image upload button in edit mode */}
              {isEditMode && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            
            <div className="text-left">
              {isEditMode ? (
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter name"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{profile.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-balg text-muted-foreground">
                      {isOrganization ? 'Business' : 'User'}
                    </span>
                    {profile.isOfficial && (
                      <OfficialBadge className="text-xs" />
                    )}
                    {(profile.subscriptionPlan === 'pro' || 
                      profile.subscriptionPlan === 'pro_complementary') && (
                      <ProBadge className="text-xs" />
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          {(profile.description || isEditMode) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">About</h3>
              {isEditMode ? (
                <div className="space-y-2">
                  <Textarea
                    id="edit-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder={isOrganization ? "Tell people about your organization..." : "Tell people about yourself..."}
                    rows={3}
                    maxLength={500}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {editDescription.length}/500 characters
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground break-words">{profile.description}</p>
              )}
            </div>
          )}

          {/* Follow Stats */}
          <div className="space-y-3">
            <FollowStats
              userId={isOrganization ? undefined : profile.id}
              organizationId={isOrganization ? profile.id : undefined}
              clickable={true}
            />
          </div>

          {/* Follow Button */}
          {!canEdit && (
            <div className="pt-2">
              <FollowButton
                targetId={profile.id}
                targetType={isOrganization ? 'organization' : 'user'}
                variant="default"
                size="default"
                className="w-full"
              />
            </div>
          )}

          {/* Date Joined */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {isOrganization ? 'Established' : 'Joined'} {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Edit Mode Controls */}
          {canEdit && (
            <div className="pt-4 border-t">
              {isEditMode ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading || !editName.trim()}
                    className="flex-1"
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    size="sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditMode(true)}
                  className="w-full"
                  size="sm"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  )
}