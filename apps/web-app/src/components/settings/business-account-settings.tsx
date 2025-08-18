import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Building2, Settings2 } from 'lucide-react'
import { useActiveOrganization } from '@/lib/auth-client'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ConfirmationDialog } from '@/components/layout/confirmation-dialog'
import { useDeleteOrganization } from '@/api'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const businessFormSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Organization name is too long'),
})

type BusinessFormData = z.infer<typeof businessFormSchema>

export function BusinessAccountSettings() {
  const { data: activeOrg } = useActiveOrganization()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteOrganization = useDeleteOrganization()
  
  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: activeOrg?.name || '',
    },
  })

  const { formState: { isDirty } } = form

  const handleOrganizationDelete = async () => {
    if (!activeOrg) return
    await deleteOrganization.mutateAsync(activeOrg.id)
  }

  const handleSaveChanges = async (data: BusinessFormData) => {
    // TODO: Implement organization update mutation
    console.log('Save organization:', data)
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
          <form onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-4">
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
            
            {isDirty && (
              <div className="pt-2">
                <Button type="submit">Save Changes</Button>
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