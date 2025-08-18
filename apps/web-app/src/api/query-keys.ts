// Query Keys - centralized for consistency
export const queryKeys = {
  user: {
    all: ['user'] as const,
    profile: ['user', 'profile'] as const,
    subscription: ['user', 'subscription'] as const,
  },
  posts: {
    all: (organizationId?: string, userId?: string) => {
      const key = ['posts'];
      if (organizationId) key.push('org', organizationId);
      if (userId) key.push('user', userId);
      return key as const;
    },
    single: (id: string) => ['posts', id] as const,
  },
  feed: {
    public: () => ['feed', 'public'] as const,
  },
  users: {
    single: (id: string) => ['users', id] as const,
    search: (query: string) => ['users', 'search', query] as const,
  },
  search: {
    all: (query: string, type: string) => ['search', type, query] as const,
  },
  subscription: {
    limits: () => ['subscription', 'limits'] as const,
  },
  storage: {
    list: (organizationId?: string) => 
      organizationId ? ['storage', 'list', 'org', organizationId] : ['storage', 'list', 'personal'] as const,
    upload: () => ['storage', 'upload'] as const,
    download: (fileKey: string) => ['storage', 'download', fileKey] as const,
  },
  organization: {
    subscription: (organizationId?: string) => 
      organizationId ? ['organization', 'subscription', organizationId] : ['organization', 'subscription'] as const,
  },
  profile: {
    detail: (id: string) => ['profile', id] as const,
  },
} as const