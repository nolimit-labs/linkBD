import { createFileRoute } from '@tanstack/react-router'
import { useGetProfile, useGetPostsByAuthor } from '@/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from '@/components/posts/post-card'
import { Loader2, Calendar, Building2, FileText, Heart, MessageCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const Route = createFileRoute('/(app)/profile/$id')({
  component: ProfilePage,
})

function ProfilePage() {
  const { id } = Route.useParams()
  const { data: profile, isLoading: profileLoading, error: profileError } = useGetProfile(id)
  
  // Get posts based on profile type
  const { data: profilePosts, isLoading: postsLoading } = useGetPostsByAuthor(id)

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  if (profileError || !profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Profile not found</h2>
        <p className="text-muted-foreground">The profile you're looking for doesn't exist.</p>
      </div>
    )
  }

  const isOrganization = profile.type === 'organization'

  return (
    <div className="flex gap-6 h-[calc(90vh-4rem)] px-6 py-6 overflow-hidden">
      {/* Left Column - Profile Info Card */}
      <div className="w-80 flex-shrink-0">
        <Card className="sticky">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Avatar and Name */}
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={profile.image || undefined} />
                  <AvatarFallback className="text-3xl">
                    {isOrganization && <Building2 className="h-16 w-16" />}
                    {!isOrganization && (profile.name?.charAt(0) || '?')}
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                {isOrganization && (
                  <Badge variant="secondary" className="mt-2">
                    <Building2 className="h-3 w-3 mr-1" />
                    Business
                  </Badge>
                )}
              </div>

              {/* Divider */}
              <div className="border-t" />

              {/* About Section for Organizations */}
              {isOrganization && (profile as any).description && (
                <>
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">About</h3>
                    <p className="text-sm text-muted-foreground">
                      {(profile as any).description}
                    </p>
                  </div>
                  <div className="border-t" />
                </>
              )}

              {/* Profile Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {isOrganization ? 'Established' : 'Joined'} {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                {profilePosts && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <span>{profilePosts.length} posts</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Tabbed Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <Tabs defaultValue="posts" className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="likes" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Likes
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Comments
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent 
            value="posts" 
            className="flex-1 overflow-y-auto mt-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-secondary/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-secondary/30" 
            style={{ height: 'calc(100% - 48px)' }}
          >
            <div className="pb-6 pr-2">
              {postsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading posts...</span>
                </div>
              ) : !profilePosts || profilePosts.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <p className="text-center text-muted-foreground">
                      {profile.name} hasn't shared any posts yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {profilePosts.map((post) => {
                    // Add author information to post if missing
                    const postWithAuthor = {
                      ...post,
                      author: post.author || {
                        id: profile.id,
                        name: profile.name,
                        image: profile.image,
                        type: profile.type
                      }
                    }
                    return <PostCard key={post.id} post={postWithAuthor} />
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Likes Tab */}
          <TabsContent 
            value="likes" 
            className="flex-1 overflow-y-auto mt-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/30" 
            style={{ height: 'calc(100% - 48px)' }}
          >
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Liked posts will appear here
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This feature is coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comments Tab */}
          <TabsContent 
            value="comments" 
            className="flex-1 overflow-y-auto mt-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/30" 
            style={{ height: 'calc(100% - 48px)' }}
          >
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Comments will appear here
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This feature is coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
