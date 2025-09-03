import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { rpcClient } from '@/api/rpc-client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Building2, User, Search, Users } from 'lucide-react';
import { useState } from 'react';
import { FollowButton } from '@/components/follows/follow-button';
import { Link } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { useSession } from '@/lib/auth-client';
import { useActiveOrganization } from '@/lib/auth-client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Route = createFileRoute('/(app)/organizations/$id/following')({
  component: OrganizationFollowingPage,
});

function OrganizationFollowingPage() {
  const { id } = Route.useParams();
  const { data: session } = useSession();
  const { data: activeOrg } = useActiveOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users');

  // Get who the organization is following
  const { data: following, isLoading } = useQuery({
    queryKey: ['org-following', id],
    queryFn: async () => {
      const res = await rpcClient.api.followers.organizations[':orgId'].following.$get({
        param: { orgId: id },
        query: { limit: '100' }
      });
      
      if (!res.ok) return { following: [], organizations: [] };
      return res.json();
    },
  });

  const filteredUsers = following?.following.filter(follow =>
    follow.following.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredOrganizations = following?.organizations.filter(org =>
    org.following.name?.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Check if current user/org can view this page
  const isOwner = activeOrg?.id === id;

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Link to="/profile/$id" params={{ id }} className="hover:underline">
            <h1 className="text-2xl font-bold">Following</h1>
          </Link>
          <span className="text-muted-foreground">
            ({(following?.following.length || 0) + (following?.organizations.length || 0)})
          </span>
        </div>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search following..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="users">
              Users ({following?.following.length || 0})
            </TabsTrigger>
            <TabsTrigger value="organizations">
              Organizations ({following?.organizations.length || 0})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  {searchTerm ? 'No users found' : 'Not following any users yet'}
                </h3>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map((followingData) => (
                  <Card key={followingData.following.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Link
                          to="/profile/$id"
                          params={{ id: followingData.following.id }}
                          className="flex items-center gap-4 hover:opacity-80"
                        >
                          <Avatar className="h-12 w-12 rounded-lg">
                            <AvatarImage src={followingData.following.image || ''} />
                            <AvatarFallback className="rounded-lg">
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold">{followingData.following.name}</h3>
                            {followingData.following.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {followingData.following.description}
                              </p>
                            )}
                          </div>
                        </Link>
                        
                        {isOwner && (
                          <FollowButton
                            targetId={followingData.following.id}
                            targetType="user"
                            size="sm"
                            initialFollowing={true}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="organizations" className="mt-4">
            {filteredOrganizations.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  {searchTerm ? 'No organizations found' : 'Not following any organizations yet'}
                </h3>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredOrganizations.map((orgData) => (
                  <Card key={orgData.following.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <Link
                          to="/profile/$id"
                          params={{ id: orgData.following.id }}
                          className="flex items-center gap-4 hover:opacity-80"
                        >
                          <Avatar className="h-12 w-12 rounded-lg">
                            <AvatarImage src={orgData.following.image || ''} />
                            <AvatarFallback className="rounded-lg">
                              <Building2 className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="font-semibold">{orgData.following.name}</h3>
                            {orgData.following.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {orgData.following.description}
                              </p>
                            )}
                          </div>
                        </Link>
                        
                        {isOwner && (
                          <FollowButton
                            targetId={orgData.following.id}
                            targetType="organization"
                            size="sm"
                            initialFollowing={true}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}