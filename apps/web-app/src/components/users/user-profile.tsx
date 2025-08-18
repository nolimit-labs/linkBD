import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface UserProfileProps {
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string
    createdAt: string
    postCount?: number
  }
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="flex items-start gap-6">
      <Avatar className="h-24 w-24">
        <AvatarImage src={user.avatarUrl} />
        <AvatarFallback className="text-2xl">
          {user.name?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {user.postCount || 0} posts
          </div>
        </div>
        
      </div>
    </div>
  )
}