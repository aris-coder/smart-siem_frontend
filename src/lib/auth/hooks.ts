import { useQuery } from '@tanstack/react-query'
import { http } from '#/lib/axios'
import type { User } from '#/types'

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: async () => {
      const { data } = await http.get<User>('/api/v1/auth/profile')
      return data
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}
