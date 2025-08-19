import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Building2, Settings2, Camera } from 'lucide-react'
import { useActiveOrganization } from '@/lib/auth-client'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ConfirmationDialog } from '@/components/layout/confirmation-dialog'
import { useDeleteOrganization, useUpdateOrganization, useUploadFile } from '@/api'
import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { generateDownloadURL } from '@/lib/storage'

const businessFormSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100, 'Business name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
})

type BusinessFormData = z.infer<typeof businessFormSchema>

export function BusinessAccountSettings() {
  const { data: activeOrg } = useActiveOrganization()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const deleteOrganization = useDeleteOrganization()
  const updateOrganization = useUpdateOrganization()
  const uploadFile = useUploadFile()
  
  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: activeOrg?.name || '',
      description: (activeOrg as any)?.description || '',
    },
  })
  
  // Generate image URL when activeOrg changes
  useEffect(() => {
    const loadImageUrl = async () => {
      if ((activeOrg as any)?.imageKey) {
        const url = await generateDownloadURL((activeOrg as any).imageKey)
        setImageUrl(url)
      }
    }
    loadImageUrl()
  }, [activeOrg])

  const { formState: { isDirty, isSubmitting } } = form

  const handleOrganizationDelete = async () => {
    if (!activeOrg) return
    await deleteOrganization.mutateAsync(activeOrg.id)
  }

  const handleSaveChanges = async (data: BusinessFormData) => {
    if (!activeOrg) return
    
    try {
      await updateOrganization.mutateAsync({
        id: activeOrg.id,
        ...data,
      })
      form.reset(data)
    } catch (error) {
      console.error('Failed to update organization:', error)
    }
  }
  
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !activeOrg) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    setIsUploadingImage(true)
    try {
      // Upload the file
      const uploadResult = await uploadFile.mutateAsync(file)
      
      // Update organization with new image key
      await updateOrganization.mutateAsync({
        id: activeOrg.id,
        imageKey: uploadResult.key,
      })
      
      // Update local image URL
      const url = await generateDownloadURL(uploadResult.key)
      setImageUrl(url)
      
      toast.success('Business image updated successfully')
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }
  
  if (!activeOrg) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Organization Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Manage your business account's basic information</CardDescription>
              </div>
            </div>
            <Badge variant="secondary">Business Admin</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-6">
            {/* Business Image */}
            <div className="space-y-2">
              <Label>Business Image</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={imageUrl || undefined} />
                  <AvatarFallback>
                    <Building2 className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {isUploadingImage ? 'Uploading...' : 'Change Image'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="org-name">Business Name</Label>
              <Input 
                id="org-name" 
                {...form.register('name')}
                placeholder="Enter business name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            {/* About Section */}
            <div className="space-y-2">
              <Label htmlFor="org-description">About</Label>
              <Textarea
                id="org-description"
                {...form.register('description')}
                placeholder="Tell us about your business..."
                rows={4}
                className="resize-none"
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {form.watch('description')?.length || 0}/500 characters
              </p>
            </div>
            
            {isDirty && (
              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Advanced Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Additional business account configuration options</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Danger Zone</h4>
              <p className="text-sm text-muted-foreground mb-3">
                These actions are irreversible. Please be certain.
              </p>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleteOrganization.isPending}
              >
                {deleteOrganization.isPending ? 'Deleting...' : 'Delete Business Account'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Business Account"
        description={`Are you sure you want to delete "${activeOrg.name}"? This action cannot be undone and will permanently remove all business account data, including posts and related content.`}
        confirmText="Delete Business Account"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleOrganizationDelete}
        isLoading={deleteOrganization.isPending}
      />
    </div>
  )
}