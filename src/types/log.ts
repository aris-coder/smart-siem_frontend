export type UserRole = 'READER' | 'ANALYST' | 'ADMIN'

export interface User {
  id: string
  username: string
  role: UserRole
  is_active?: boolean
  created_at?: string
}

export interface LogEntry {
  id: string
  score: number | null
  source: LogSource
}

export interface LogSource {
  collected_at: string
  normalized_at: string
  source_type: string
  hostname: string
  source_ip: string
  destination_ip?: string
  user_principal: string
  event_taxonomy: string
  action: string
  outcome: string
  severity: number // 0-7
  raw_message: string
  ingestion_hash: string
  event_id: number
  tags?: string[]
  [key: string]: unknown
}

export interface LogSearchResponse {
  total: number
  hits: LogEntry[]
}

export interface LogSearchParams {
  source_ip?: string
  destination_ip?: string
  user_principal?: string
  hostname?: string
  source_type?: string
  event_taxonomy?: string
  action?: string
  severity_min?: number
  severity_max?: number
  raw_message?: string
  tags?: string[]
  date_from?: string
  date_to?: string
  from?: number
  size?: number
  sort_field?: string
  sort_order?: 'asc' | 'desc'
}
