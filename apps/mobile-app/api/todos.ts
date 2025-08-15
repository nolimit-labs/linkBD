import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rpcClient } from './rpc-client';

export const useTodos = () => {
    return useQuery({
        queryKey: ['todos'],
        queryFn: async () => {
            // Simple timeout with console log
            await new Promise((resolve) => setTimeout(resolve, 1000));
            console.log('Timeout finished');
            return [];
        }
    });
};

