// Query Keys - centralized for consistency
export const queryKeys = {
  user: {
    all: ['user'] as const,
    profile: ['user', 'profile'] as const,
    subscription: ['user', 'subscription'] as const,
  },
  todos: {
    all: (organizationId?: string) => 
      organizationId ? ['todos', 'org', organizationId] : ['todos', 'personal'] as const,
    single: (id: string) => ['todos', id] as const,
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
} as const