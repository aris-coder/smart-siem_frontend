import { QueryClient } from '@tanstack/react-query'
import { isUnauthorizedError } from '#/lib/api/errors'

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (isUnauthorizedError(error)) return false
          return failureCount < 2
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return {
    queryClient,
  }
}
