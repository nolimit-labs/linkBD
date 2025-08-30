import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, Building2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

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
  const isOrganization = profile.type === 'organization'
  
  return (
    <Card className="sticky">
      <CardContent className="px-2 pt-2 mx-auto">
        <div className="space-y-6">
          {/* Profile Header - Avatar on top centered, Name below left-aligned */}
          <div>
            <Avatar className="h-64 w-64 mb-6 rounded-lg">
              <AvatarImage src={profile.image || undefined} className="rounded-lg" />
              <AvatarFallback className="text-3xl rounded-lg">
                {isOrganization ? (
                  <Building2 className="h-16 w-16" />
                ) : (
                  profile.name?.charAt(0) || '?'
                )}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-left">
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-balg text-muted-foreground">
                  {isOrganization ? 'Business Account' : 'Personal Account'}
                </span>
                {profile.isOfficial && (
                  <Badge variant="default" className="text-xs">
                    Official
                  </Badge>
                )}
                {(profile.subscriptionPlan === 'pro' || 
                  profile.subscriptionPlan === 'pro_complementary') && (
                  <Badge variant="secondary" className="text-xs">
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Description (for organizations) */}
          {profile.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">About</h3>
              <p className="text-sm text-muted-foreground">{profile.description}</p>
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

        </div>
      </CardContent>
    </Card>
  )
}