import { Heart, MessageCircle, Share, MoreVertical, Check, Building2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { useTogglePostLike } from '@/api'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useSession } from '@/lib/auth-client'
import { rpcClient } from '@/api'
import { Link } from '@tanstack/react-router'
import { OfficialBadge } from '@/components/profile/badge-official'
import { ProBadge } from '@/components/profile/badge-pro'

type Post = Awaited<
  ReturnType<
    Awaited<ReturnType<typeof rpcClient.api.posts.feed.$get>>['json']
  >
>['posts'][number]

interface PostCardProps {
  post: Post
  onEdit?: () => void
  onDelete?: () => void
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const { data: session } = useSession()
  const toggleLike = useTogglePostLike()

  // Use author data from post response (no additional API call needed)
  const author = post.author
  const isOwner = session?.user?.id === post.userId

  const handleLike = () => {
    toggleLike.mutate(post.id)
  }

  return (
    <Card className="w-full gap-0">
      <CardHeader>
        <div className="flex items-start justify-between">
          <Link 
            to="/profile/$id" 
            params={{ id: author?.id || post.userId || '' }}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-12 w-12 rounded-lg">
              <AvatarImage src={author?.image || ''} />
              <AvatarFallback className="text-3xl rounded-lg object-cover">
                {author?.type === 'organization' ? (
                  <Building2 className="h-full w-full p-3" />
                ) : (
                  <User className="h-full w-full p-3" />
                )}
              </AvatarFallback>
            </Avatar>

            { /* Name and Badges */ }
            <div className="flex flex-col pb-4">
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-semibold">
                  {author?.name || 'Unknown User'}
                </h4>
                {author?.isOfficial && (
                  <OfficialBadge className="text-xs" />
                )}
                {(author?.subscriptionPlan === 'pro' || 
                  author?.subscriptionPlan === 'pro_complementary') && (
                  <ProBadge className="text-10 text-secondary-foreground flex items-center gap-1 px-2 py-0.5 rounded-lg" />
                )}
              </div>
            </div>
          </Link>

          { /* Edit and Delete if Owner */ }
          {isOwner && (onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background/70 text-xl" side="bottom">
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={onDelete} className="text-lg text-destructive">
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 pl-21 pb-6">
        <p className="text-base whitespace-pre-wrap">{post.content}</p>
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

      <CardFooter className="pt-0 pl-20">
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

            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-1"
              asChild
            >
              <Link to="/posts/$id" params={{ id: post.id }}>
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">Comment</span>
              </Link>
            </Button>

            <Button variant="ghost" size="sm" className="flex items-center space-x-1">
              <Share className="h-4 w-4" />
              <span className="text-xs">Share</span>
            </Button>

            <span className="text-xs text-muted-foreground">
              {/* {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })} */}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}