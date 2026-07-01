import { http } from '#/lib/axios'

export type IncidentSeverity = 'INFO' | 'WARNING' | 'HIGH' | 'CRITICAL'
export type IncidentStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'FALSE_POSITIVE'

export interface IncidentRule {
  id: string
  name: string
}

export interface RelatedEntities {
  hosts?: string[]
  users?: string[]
  ips?: string[]
}

export interface Incident {
  id: string
  rule_id: string
  triggered_at: string
  severity: IncidentSeverity
  confidence_score: number
  status: IncidentStatus
  summary: string
  related_entities: RelatedEntities
  assigned_to: string | null
  resolved_at: string | null
  batch_manifest_id: string | null
  rule: IncidentRule
}

export interface DashboardStats {
  critical_alerts: number
  high_alerts: number
  open_incidents: number
  logs_per_hour: number
  top_attackers: string[]
  system_status: string
}

export interface TimelineBucket {
  bucket_start: string
  bucket_end: string
  label: string
  count: number
}

export interface TopSource {
  source_ip: string
  count: number
  percentage: number
}

export interface ThreatType {
  type: string
  key: string
  count: number
  percentage: number
}

export interface LoginFailure {
  bucket_start: string
  bucket_end: string
  label: string
  count: number
  threat_level: string
  description: string
}

export interface HeatmapCell {
  day: string
  hour_block: string
  score: number
  level: string
  description: string
}

export interface DashboardOverview {
  generated_at: string
  interval: string
  stats: DashboardStats
  severity_distribution: Record<string, number>
  events_timeline: TimelineBucket[]
  top_sources: TopSource[]
  threat_types: ThreatType[]
  login_failures: LoginFailure[]
  suspicious_activity_heatmap: HeatmapCell[]
}

export interface OverviewQuery {
  interval?: string
  source_type?: string
}

export interface IncidentFilters {
  status?: IncidentStatus
  severity?: IncidentSeverity
  from?: string
  to?: string
}

export async function listIncidents(
  filters?: IncidentFilters,
): Promise<Incident[]> {
  const query = new URLSearchParams()
  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      if (value) query.set(key, value)
    }
  }
  const qs = query.toString()
  const { data } = await http.get<Incident[]>(
    `/api/v1/incidents${qs ? `?${qs}` : ''}`,
  )
  return data
}

export async function getIncident(id: string): Promise<Incident> {
  const { data } = await http.get<Incident>(`/api/v1/incidents/${id}`)
  return data
}

export interface UpdateIncidentPayload {
  status: 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE'
  summary?: string
  assigned_to?: string
}

export async function updateIncident(
  id: string,
  payload: UpdateIncidentPayload,
): Promise<Incident> {
  const { data } = await http.patch<Incident>(
    `/api/v1/incidents/${id}`,
    payload,
  )
  return data
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await http.get<DashboardStats>('/api/v1/dashboard/stats')
  return data
}

export async function getDashboardOverview(
  query?: OverviewQuery,
): Promise<DashboardOverview> {
  const params = new URLSearchParams()
  if (query?.interval) params.set('interval', query.interval)
  if (query?.source_type) params.set('source_type', query.source_type)
  const qs = params.toString()
  const { data } = await http.get<DashboardOverview>(
    `/api/v1/dashboard/overview${qs ? `?${qs}` : ''}`,
  )
  return data
}
