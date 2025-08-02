import { Heart, MessageCircle, Share, MoreHorizontal, Eye, Users, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { useTogglePostLike, useUser } from '@/api'
import { cn } from '@/lib/utils'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { useSession } from '@/lib/auth-client'

interface PostCardProps {
  post: {
    id: string
    userId: string
    content: string
    imageUrl?: string
    likesCount: number
    hasLiked: boolean
    visibility: 'public' | 'organization' | 'private'
    createdAt: string
  }
  onEdit?: () => void
  onDelete?: () => void
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const { data: author } = useUser(post.userId)
  const { data: session } = useSession()
  const toggleLike = useTogglePostLike()
  
  const isOwner = session?.user?.id === post.userId
  
  const handleLike = () => {
    toggleLike.mutate(post.id)
  }
  
  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case 'public':
        return <Eye className="h-3 w-3" />
      case 'organization':
        return <Users className="h-3 w-3" />
      case 'private':
        return <Lock className="h-3 w-3" />
    }
  }
  
  const getVisibilityLabel = () => {
    switch (post.visibility) {
      case 'public':
        return 'Public'
      case 'organization':
        return 'Organization'
      case 'private':
        return 'Private'
    }
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={author?.user?.avatarUrl} />
              <AvatarFallback>
                {author?.user?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold">
                  {author?.user?.name || 'Unknown User'}
                </h4>
                <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                  {getVisibilityIcon()}
                  {getVisibilityLabel()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          {isOwner && (onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
        {post.imageUrl && (
          <div className="mt-4">
            <img 
              src={post.imageUrl} 
              alt="Post image" 
              className="rounded-lg max-w-full h-auto object-cover max-h-96"
            />
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={toggleLike.isPending}
              className={cn(
                "flex items-center space-x-1",
                post.hasLiked && "text-red-500"
              )}
            >
              <Heart 
                className={cn(
                  "h-4 w-4",
                  post.hasLiked && "fill-current"
                )} 
              />
              <span className="text-xs">{post.likesCount}</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">Comment</span>
            </Button>
            
            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <Share className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}