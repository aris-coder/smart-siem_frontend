import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from '#/lib/auth/api'
import { hasAuthToken } from '#/lib/auth/session'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: getCurrentUser,
    enabled: typeof window !== 'undefined' && hasAuthToken(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
