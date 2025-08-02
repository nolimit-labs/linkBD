import { Link } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'

interface UserListItemProps {
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
}

export function UserListItem({ user }: UserListItemProps) {
  return (
    <Link 
      to="/users/$userId" 
      params={{ userId: user.id }}
      className="block"
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>
                {user.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{user.name}</h3>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}