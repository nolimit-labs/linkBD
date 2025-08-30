import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from '@/components/posts/post-card'
import { ProfileCard } from '@/components/profile/profile-card'
import { Loader2, FileText, Heart, MessageCircle } from 'lucide-react'

type UserProfile = {
  id: string;
  type: 'user';
  name: string;
  image: string | null;
  isOfficial?: boolean;
  subscriptionPlan?: string;
  createdAt: string;
}

type UserProfileViewProps = {
  profile: UserProfile;
  posts: any[] | undefined;
  postsLoading: boolean;
}

export function UserProfileView({ profile, posts, postsLoading }: UserProfileViewProps) {
  return (
    <div className="flex gap-6 h-[calc(90vh-4rem)] px-6 py-6 overflow-hidden">
      <div className="w-80 flex-shrink-0">
        <ProfileCard profile={profile} />
      </div>

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
              ) : !posts || posts.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <p className="text-center text-muted-foreground">
                      {profile.name} hasn't shared any posts yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="likes" className="flex-1 overflow-y-auto mt-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/30" style={{ height: 'calc(100% - 48px)' }}>
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Liked posts will appear here</p>
                  <p className="text-sm text-muted-foreground mt-2">This feature is coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="flex-1 overflow-y-auto mt-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-background [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-primary/30" style={{ height: 'calc(100% - 48px)' }}>
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Comments will appear here</p>
                  <p className="text-sm text-muted-foreground mt-2">This feature is coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}



