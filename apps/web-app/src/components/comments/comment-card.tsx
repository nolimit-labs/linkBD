import { useState } from 'react'
import { MoreVertical, Building2, User, Reply, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useSession } from '@/lib/auth-client'
import { Link } from '@tanstack/react-router'
import { OfficialBadge } from '@/components/profile/badge-official'
import { ProBadge } from '@/components/profile/badge-pro'
 

// Local hard-coded Comment type (minimal fields used by this component)
export type Comment = {
  id: string
  postId: string
  parentId: string | null
  content: string
  isEdited: boolean
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    imageUrl: string | null
    type: 'user' | 'organization'
    isOfficial?: boolean
    subscriptionPlan?: string
  } | null
  repliesCount?: number
}

interface CommentCardProps {
  comment: Comment
  depth?: number
  onReply?: (commentId: string) => void
  onEdit?: (commentId: string, content: string) => void
  onDelete?: (commentId: string) => void
  onShowReplies?: (commentId: string) => void
  repliesCountDisplay?: number
  className?: string
}

export function CommentCard({ 
  comment, 
  depth = 0, 
  onReply, 
  onEdit, 
  onDelete, 
  onShowReplies,
  repliesCountDisplay,
  className 
}: CommentCardProps) {
  const { data: session } = useSession()
  const [showReplies, setShowReplies] = useState(false)

  const userId = session?.session?.userId
  const activeOrganizationId = session?.session?.activeOrganizationId

  const author = comment.author
  const isOwner = userId === comment.author?.id || 
                  (activeOrganizationId && activeOrganizationId === comment.author?.id)

  const maxDepth = 2 // Maximum nesting level
  const canReply = depth < maxDepth

  const handleReply = () => {
    onReply?.(comment.id)
  }

  const handleEdit = () => {
    onEdit?.(comment.id, comment.content)
  }

  const handleDelete = () => {
    onDelete?.(comment.id)
  }

  const handleToggleReplies = () => {
    onShowReplies?.(comment.id)
    setShowReplies(!showReplies)
  }

  return (
    <div 
      className={cn(
        "relative",
        className
      )}
    >
      {/* Connecting lines only for replies (depth > 0) */}
      {depth > 0 && (
        <>
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border/30 -ml-5" />
          <div className="absolute left-5 top-5 w-5 h-px bg-border/30 -ml-5" />
        </>
      )}
      
      {/* Only indent replies, not top-level comments */}
      <div className={cn("relative", depth > 0 && "ml-10")}>
        <Card className="w-full border-none shadow-none bg-transparent gap-2 pt-6 pb-0">
        <CardHeader className="mb-0 pb-0">
          <div className="flex items-start justify-between">
            <Link 
              to="/profile/$id" 
              params={{ id: author?.id || '' }}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-10 w-10 rounded-lg">
                <AvatarImage src={author?.imageUrl || ''} />
                <AvatarFallback className="rounded-lg">
                  {author?.type === 'organization' ? (
                    <Building2 className="h-5 w-5" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h5 className="text-sm font-semibold">
                    {author?.name || 'Unknown User'}
                  </h5>
                  {author?.isOfficial && (
                    <OfficialBadge className="text-xs" />
                  )}
                  {(author?.subscriptionPlan === 'pro' || 
                    author?.subscriptionPlan === 'pro_complementary') && (
                    <ProBadge className="text-xs" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  {comment.isEdited && (
                    <span className="ml-1">(edited)</span>
                  )}
                </span>
              </div>
            </Link>

            {isOwner && (onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background">
                  {onEdit && (
                    <DropdownMenuItem onClick={handleEdit}>
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap pl-12">
            {comment.content}
          </p>
        </CardContent>
        
        <CardFooter className="pt-2">
          <div className="flex items-center gap-4 pl-12">
            {canReply && onReply && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReply}
                className="h-6 text-xs px-2"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            
            {(repliesCountDisplay ?? comment.repliesCount ?? 0) > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleToggleReplies}
                className="h-6 text-xs px-2"
              >
                {showReplies ? 'Hide' : 'Show'} {repliesCountDisplay ?? comment.repliesCount ?? 0} {(repliesCountDisplay ?? comment.repliesCount ?? 0) === 1 ? 'reply' : 'replies'}
              </Button>
            )}
          </div>
        </CardFooter>
        </Card>
      </div>
    </div>
  )
}