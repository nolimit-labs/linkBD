import { createFileRoute } from '@tanstack/react-router';
import { useUserFollowers } from '@/api/followers';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { User, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { FollowButton } from '@/components/follows/follow-button';
import { Link } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/lib/auth-client';

export const Route = createFileRoute('/(app)/profile/$id/followers')({
  component: FollowersPage,
});

function FollowersPage() {
  const { id } = Route.useParams();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');

  // Use the API hook for followers
  const { data: followers, isLoading } = useUserFollowers(id);

  const filteredFollowers = followers?.followers.filter(follower =>
    follower.follower.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-10 w-full mb-4" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link to="/profile/$id" params={{ id }} className="hover:underline">
            <h1 className="text-2xl font-bold">Followers</h1>
          </Link>
          <span className="text-muted-foreground">({followers?.followers.length || 0})</span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search followers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredFollowers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">
            {searchTerm ? 'No followers found' : 'No followers yet'}
          </h3>
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search terms
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredFollowers.map((followerData) => (
            <Card key={followerData.follower.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Link
                    to="/profile/$id"
                    params={{ id: followerData.follower.id }}
                    className="flex items-center gap-4 hover:opacity-80"
                  >
                    <Avatar className="h-12 w-12 rounded-lg">
                      <AvatarImage src={followerData.follower.image || ''} />
                      <AvatarFallback className="rounded-lg">
                        <User className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{followerData.follower.name}</h3>
                      {followerData.follower.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {followerData.follower.description}
                        </p>
                      )}
                    </div>
                  </Link>
                  
                  {session?.user.id !== followerData.follower.id && (
                    <FollowButton
                      targetId={followerData.follower.id}
                      targetType="user"
                      size="sm"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}