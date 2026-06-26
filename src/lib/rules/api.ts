import { http } from '#/lib/axios'

export interface RuleDefinition {
  threshold?: number
  time_window_seconds?: number
  interval_seconds?: number
  source_types?: string[]
  trigger_playbook?: string
  playbook_mode?: 'AUTO' | 'CONFIRM'
  [key: string]: unknown
}

export interface Rule {
  id: string
  name: string
  tactic?: string
  technique?: string
  definition: RuleDefinition
  confidence_weight: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateRulePayload {
  id: string
  name: string
  tactic?: string
  technique?: string
  definition: RuleDefinition
  confidence_weight?: number
  is_active?: boolean
}

export interface UpdateRulePayload {
  name?: string
  tactic?: string
  technique?: string
  definition?: RuleDefinition
  confidence_weight?: number
  is_active?: boolean
}

export async function listRules(): Promise<Rule[]> {
  const { data } = await http.get<Rule[]>('/api/v1/rules')
  return data
}

export async function getRule(id: string): Promise<Rule> {
  const { data } = await http.get<Rule>(`/api/v1/rules/${id}`)
  return data
}

export async function createRule(payload: CreateRulePayload): Promise<Rule> {
  const { data } = await http.post<Rule>('/api/v1/rules', payload)
  return data
}

export async function updateRule(
  id: string,
  payload: UpdateRulePayload,
): Promise<Rule> {
  const { data } = await http.patch<Rule>(`/api/v1/rules/${id}`, payload)
  return data
}

export async function deleteRule(id: string): Promise<void> {
  await http.delete(`/api/v1/rules/${id}`)
}
