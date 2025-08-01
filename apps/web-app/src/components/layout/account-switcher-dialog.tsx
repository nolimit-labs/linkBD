import { User, Building, Check, Plus } from "lucide-react"
import { useActiveOrganization, useListOrganizations, organization } from "@/lib/auth-client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CreateOrganizationDialog } from "@/components/organization/create-organization-dialog"
import { cn } from "@/lib/utils"

interface AccountSwitcherProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountSwitcher({ open, onOpenChange }: AccountSwitcherProps) {
  const { data: activeOrg } = useActiveOrganization()
  const { data: organizations, isPending } = useListOrganizations()

  const handleSetActiveOrganization = async (orgId?: string) => {
    try {
      if (orgId) {
        await organization.setActive({ organizationId: orgId })
      } else {
        // Switch to personal account
        await organization.setActive({ organizationId: null })
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to switch organization:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Switch Profile</DialogTitle>
          <DialogDescription>
            Choose between your personal account and organizations
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2">
          {/* Personal Account */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start h-auto p-3",
              !activeOrg && "bg-accent"
            )}
            onClick={() => handleSetActiveOrganization()}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Personal Account</p>
                <p className="text-xs text-muted-foreground">Your individual workspace</p>
              </div>
              {!activeOrg && <Check className="w-4 h-4" />}
            </div>
          </Button>
          
          {/* Organizations */}
          {isPending ? (
            <div className="space-y-2">
              <div className="animate-pulse space-y-2">
                <div className="h-12 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded"></div>
              </div>
            </div>
          ) : organizations && organizations.length > 0 ? (
            <>
              <Separator className="my-3" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 pb-1">
                  Organizations
                </p>
                {organizations.map((org) => (
                  <Button
                    key={org.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-auto p-3",
                      activeOrg?.id === org.id && "bg-accent"
                    )}
                    onClick={() => handleSetActiveOrganization(org.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <Building className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium truncate">{org.name}</p>
                        <p className="text-xs text-muted-foreground">Organization</p>
                      </div>
                      {activeOrg?.id === org.id && <Check className="w-4 h-4" />}
                    </div>
                  </Button>
                ))}
              </div>
            </>
          ) : (
            <div className="px-3 py-6 text-center">
              <Building className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-1">No organizations yet</p>
              <p className="text-xs text-muted-foreground">Create one to collaborate with your team</p>
            </div>
          )}
          
          <Separator className="my-3" />
          
          {/* Create Organization Button */}
          <CreateOrganizationDialog
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}