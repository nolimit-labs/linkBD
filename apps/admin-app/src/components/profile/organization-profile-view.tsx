import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  FileText, 
  Users, 
  Building2,
  File
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from '@tanstack/react-router'
import { ProfileTodos } from './profile-todos'
import { ProfileFiles } from './profile-files'

interface Member {
  userId: string
  role: string | null
  name: string | null
  email: string | null
  image: string | null
  avatarUrl: string | null
}

interface OrganizationProfile {
  id: string
  name: string
  slug: string | null
  logo: string | null
  logoUrl: string | null
  createdAt: string
  memberCount: number
}

interface OrgProfileData {
  type: 'organization'
  profile: OrganizationProfile
  members: Member[]
}

interface OrganizationProfileViewProps {
  data: OrgProfileData
}

export function OrganizationProfileView({ data }: OrganizationProfileViewProps) {
  const { profile, members } = data


  return (
    <div className="flex gap-6 h-[calc(90vh-4rem)] overflow-hidden">
      {/* Left Column - Profile Info */}
      <div className="w-80 flex-shrink-0">
        <Card className="sticky bg-card/60">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Avatar and Name */}
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={profile.logoUrl || undefined} />
                  <AvatarFallback className="text-3xl">
                    <Building2 className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">
                  {profile.name}
                </h1>
                {profile.slug && (
                  <p className="text-muted-foreground text-sm">
                    @{profile.slug}
                  </p>
                )}
                
                {/* Status Badge */}
                <div className="flex justify-center mt-3">
                  <Badge variant="secondary">
                    <Building2 className="h-3 w-3 mr-1" />
                    Organization
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Profile Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Created {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{profile.memberCount} member(s)</span>
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
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members ({members?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Todos Tab */}
          <TabsContent 
            value="todos" 
            className="flex-1 overflow-y-auto mt-6"
            style={{ height: 'calc(100% - 48px)' }}
          >
            <div className="pb-6 pr-2">
              <ProfileTodos profileId={profile.id} profileType="organization" />
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent 
            value="files" 
            className="flex-1 overflow-y-auto mt-6"
            style={{ height: 'calc(100% - 48px)' }}
          >
            <div className="pb-6 pr-2">
              <ProfileFiles profileId={profile.id} profileType="organization" />
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent 
            value="members"
            className="flex-1 overflow-y-auto mt-6"
            style={{ height: 'calc(100% - 48px)' }}
          >
            <div className="pb-6 pr-2 space-y-4">
              {members.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No members found
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                members.map((member) => (
                  <Card key={member.userId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatarUrl || undefined} />
                            <AvatarFallback>
                              {member.name?.slice(0, 2).toUpperCase() || '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <Link 
                              to="/profile/$id" 
                              params={{ id: member.userId }}
                              className="font-medium hover:text-primary hover:underline"
                            >
                              {member.name || 'Anonymous'}
                            </Link>
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          </div>
                        </div>
                        {member.role && (
                          <Badge variant="outline">
                            {member.role}
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