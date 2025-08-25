import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Building2, Users, Settings2, CreditCard } from 'lucide-react'
import { useActiveOrganization } from '@/lib/auth-client'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ConfirmationDialog } from '@/components/layout/confirmation-dialog'
import { useDeleteOrganization } from '@/api'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const organizationFormSchema = z.object({
  name: z.string().min(1, 'Organization name is required').max(100, 'Organization name is too long'),
})

type OrganizationFormData = z.infer<typeof organizationFormSchema>

export function OrganizationSettings() {
  const { data: activeOrg } = useActiveOrganization()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const deleteOrganization = useDeleteOrganization()
  
  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: activeOrg?.name || '',
    },
  })

  const { formState: { isDirty }, watch } = form
  const watchedName = watch('name')

  const handleOrganizationDelete = async () => {
    if (!activeOrg) return
    await deleteOrganization.mutateAsync(activeOrg.id)
  }

  const handleSaveChanges = async (data: OrganizationFormData) => {
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
                <CardTitle>Organization Information</CardTitle>
                <CardDescription>Manage your organization's basic information</CardDescription>
              </div>
            </div>
            <Badge variant="secondary">Organization Admin</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSaveChanges)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input 
                id="org-name" 
                {...form.register('name')}
                placeholder="Enter organization name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="org-id">Organization ID</Label>
              <Input 
                id="org-id" 
                value={activeOrg.id} 
                disabled
                className="bg-muted"
              />
            </div>

            
            {isDirty && (
              <div className="pt-2">
                <Button type="submit">Save Changes</Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>


      {/* Members Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Organization Members</CardTitle>
              <CardDescription>Manage who has access to this organization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">
                Member management features coming soon. You'll be able to invite team members and manage their roles.
              </p>
            </div>
          </div>
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
              <CardDescription>Additional organization configuration options</CardDescription>
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
                {deleteOrganization.isPending ? 'Deleting...' : 'Delete Organization'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Organization"
        description={`Are you sure you want to delete "${activeOrg.name}"? This action cannot be undone and will permanently remove all organization data, including todos and member access.`}
        confirmText="Delete Organization"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleOrganizationDelete}
        isLoading={deleteOrganization.isPending}
      />
    </div>
  )
}