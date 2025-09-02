import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { signOut } from '@/lib/auth-client'
import { env } from '@/lib/env'
import { AccountInfoCard } from './account-info-card'

export function AccountSettings() {

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = '/login'
          }
        }
      })
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }


  return (
    <div className="space-y-6">
      {/* Account Information */}
      <AccountInfoCard />

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="w-full sm:w-auto"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 