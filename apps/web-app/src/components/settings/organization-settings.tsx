import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Building2, Users, Settings2, CreditCard } from 'lucide-react'
import { useActiveOrganization } from '@/lib/auth-client'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ConfirmationDialog } from '@/components/layout/confirmation-dialog'
import { useDeleteOrganization, useOrganizationSubscription } from '@/api'
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
  const { data: subscription } = useOrganizationSubscription()
  
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

  // Get the active subscription
  const activeSubscription = subscription?.[0] // Assuming first subscription is active
  
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

      {/* Organization Billing Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Organization Billing</CardTitle>
              <CardDescription>Manage your organization's subscription and usage</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeSubscription ? (
            <>
              {/* Current Plan */}
              <div className="space-y-2">
                <Label>Current Plan</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{activeSubscription.plan}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: <span className="capitalize">{activeSubscription.status}</span>
                      </p>
                    </div>
                    <Badge variant={activeSubscription.status === 'active' ? 'default' : 'secondary'}>
                      {activeSubscription.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Usage Limits */}
              {activeSubscription.limits && (
                <div className="space-y-2">
                  <Label>Usage Limits</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Todos</p>
                        <p className="text-2xl font-bold">{activeSubscription.limits.todos === -1 ? '∞' : activeSubscription.limits.todos}</p>
                        <p className="text-xs text-muted-foreground">
                          {activeSubscription.limits.todos === -1 ? 'Unlimited' : 'Maximum allowed'}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Files</p>
                        <p className="text-2xl font-bold">{activeSubscription.limits.files === -1 ? '∞' : activeSubscription.limits.files}</p>
                        <p className="text-xs text-muted-foreground">
                          {activeSubscription.limits.files === -1 ? 'Unlimited' : 'Maximum allowed'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Period */}
              {activeSubscription.periodStart && activeSubscription.periodEnd && (
                <div className="space-y-2">
                  <Label>Billing Period</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      {new Date(activeSubscription.periodStart).toLocaleDateString()} - {' '}
                      {new Date(activeSubscription.periodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No subscription information available</p>
            </div>
          )}
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