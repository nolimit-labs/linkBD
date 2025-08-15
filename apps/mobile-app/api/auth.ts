import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '~/lib/auth-client';

export const useSession = () => {
    return useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const session = await authClient.getSession();
            return session;
        }
    });
};

