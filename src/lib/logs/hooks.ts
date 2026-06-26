import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { searchLogs } from '#/lib/logs/api'
import type { LogSearchParams } from '#/types'

export function useLogSearch(params: LogSearchParams) {
  return useQuery({
    queryKey: ['logs', 'search', params],
    queryFn: () => searchLogs(params),
    placeholderData: keepPreviousData,
    staleTime: 10_000,
  })
}
