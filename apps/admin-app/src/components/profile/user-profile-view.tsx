import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  FileText, 
  Users, 
  Shield,
  Mail,
  User,
  Ban,
  UserCheck,
  File,
  CheckCircle2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { admin } from '@/lib/auth-client'
import { toast } from 'sonner'
import { ProfileTodos } from './profile-todos'
import { ProfileFiles } from './profile-files'

interface Organization {
  organizationId: string
  organizationName: string | null
  role: string | null
}

interface UserProfile {
  id: string
  email: string
  emailVerified: boolean
  name: string | null
  image: string | null
  avatarUrl: string | null
  role: string | null
  banned: boolean
  banReason?: string | null
  banExpires?: string | null
  createdAt: string
  updatedAt: string
  isAnonymous: boolean
}

interface UserProfileData {
  type: 'user'
  profile: UserProfile
  organizations: Organization[]
}

interface UserProfileViewProps {
  data: UserProfileData
}

export function UserProfileView({ data }: UserProfileViewProps) {
  const { profile, organizations } = data

  const getInitials = () => {
    if (profile.name) {
      return profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return profile.email
      .split('@')[0]
      .slice(0, 2)
      .toUpperCase()
  }

  const handleBanUser = async () => {
    try {
      const result = await admin.banUser({
        userId: profile.id,
        banReason: 'Banned by admin',
      })
      
      if (result.error) {
        toast.error('Failed to ban user')
      } else {
        toast.success('User banned successfully')
        window.location.reload()
      }
    } catch (error) {
      toast.error('Failed to ban user')
    }
  }

  const handleUnbanUser = async () => {
    try {
      const result = await admin.unbanUser({
        userId: profile.id,
      })
      
      if (result.error) {
        toast.error('Failed to unban user')
      } else {
        toast.success('User unbanned successfully')
        window.location.reload()
      }
    } catch (error) {
      toast.error('Failed to unban user')
    }
  }

  const handleImpersonateUser = async () => {
    try {
      const result = await admin.impersonateUser({
        userId: profile.id,
      })
      
      if (result.error) {
        toast.error('Failed to impersonate user')
      } else {
        toast.success('Impersonating user')
        window.location.href = '/'
      }
    } catch (error) {
      toast.error('Failed to impersonate user')
    }
  }

  return (
    <div className="flex gap-6 h-[calc(90vh-4rem)] overflow-hidden">
      {/* Left Column - Profile Info */}
      <div className="w-80 flex-shrink-0">
        <Card className="sticky">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Avatar and Name */}
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={profile.avatarUrl || undefined} />
                  <AvatarFallback className="text-3xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">
                  {profile.name || 'Anonymous'}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {profile.email}
                </p>
                
                {/* Status Badges */}
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  {profile.role && (
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      {profile.role}
                    </Badge>
                  )}
                  {profile.emailVerified ? (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <Mail className="h-3 w-3 mr-1" />
                      Unverified
                    </Badge>
                  )}
                  {profile.banned && (
                    <Badge variant="destructive">
                      Banned
                    </Badge>
                  )}
                  {profile.isAnonymous && (
                    <Badge variant="secondary">
                      <User className="h-3 w-3 mr-1" />
                      Anonymous
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />


              {/* Profile Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                {organizations.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{organizations.length} organization(s)</span>
                  </div>
                )}
              </div>

              {/* Ban Information */}
              {profile.banned && profile.banReason && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-destructive">Ban Information</h3>
                    <p className="text-sm text-muted-foreground">
                      {profile.banReason}
                    </p>
                    {profile.banExpires && (
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(profile.banExpires).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Admin Actions */}
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Admin Actions</h3>
                <div className="space-y-2">
                  {profile.banned ? (
                    <Button 
                      onClick={handleUnbanUser}
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Unban User
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleBanUser}
                      variant="destructive" 
                      size="sm" 
                      className="w-full"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Ban User
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleImpersonateUser}
                    variant="secondary" 
                    size="sm" 
                    className="w-full"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Impersonate User
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Tabbed Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="todos" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="todos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="organizations" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Organizations ({organizations?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Todos Tab */}
          <TabsContent 
            value="todos" 
            className="flex-1 overflow-y-auto mt-6"
            style={{ height: 'calc(100% - 48px)' }}
          >
            <div className="pb-6 pr-2">
              <ProfileTodos profileId={profile.id} profileType="user" />
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent 
            value="files" 
            className="flex-1 overflow-y-auto mt-6"
            style={{ height: 'calc(100% - 48px)' }}
          >
            <div className="pb-6 pr-2">
              <ProfileFiles profileId={profile.id} profileType="user" />
            </div>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent 
            value="organizations"
            className="flex-1 overflow-y-auto mt-6"
            style={{ height: 'calc(100% - 48px)' }}
          >
            <div className="pb-6 pr-2 space-y-4">
              {organizations.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Not a member of any organizations
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                organizations.map((org) => (
                  <Card key={org.organizationId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Link 
                            to="/profile/$id" 
                            params={{ id: org.organizationId }}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {org.organizationName || org.organizationId}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Organization ID: {org.organizationId}
                          </p>
                        </div>
                        {org.role && (
                          <Badge variant="outline">
                            {org.role}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}