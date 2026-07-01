import { useQuery } from '@tanstack/react-query'
import { getDashboardStats } from '#/lib/incidents/api'
import { getFakeDashboardStats } from '#/lib/dashboard/fake'
import type { DashboardStats } from '#/lib/incidents/api'
import { env } from '#/env'

/**
 * Hook that fetches dashboard stats from the backend API.
 *
 * Behavior depends on VITE_USE_DEMO_DATA:
 * - `false` (default/prod) → calls the real NestJS backend, propagates errors
 * - `true` (dev/demo) → generates fake data locally for development
 */
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      if (env.VITE_USE_DEMO_DATA) {
        if (import.meta.env.DEV) {
          console.info('[dashboard] Using demo data (VITE_USE_DEMO_DATA=true)')
        }
        return getFakeDashboardStats()
      }
      return getDashboardStats()
    },
    staleTime: 10_000,
    retry: env.VITE_USE_DEMO_DATA ? 1 : 2,
    retryDelay: 500,
  })
}
