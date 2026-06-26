import { http } from '#/lib/axios'
import type { LogSearchResponse, LogSearchParams } from '#/types'

export async function searchLogs(
  params: LogSearchParams,
): Promise<LogSearchResponse> {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        for (const item of value) {
          query.append(key, item)
        }
      } else {
        query.set(key, String(value))
      }
    }
  }

  const queryString = query.toString()
  const url = `/api/v1/logs/search${queryString ? `?${queryString}` : ''}`

  const { data } = await http.get<LogSearchResponse>(url)
  return data
}
