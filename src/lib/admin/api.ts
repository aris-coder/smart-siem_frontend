import { http } from '#/lib/axios'
import type { User } from '#/types'

export interface CreateUserPayload {
  username: string
  password: string
  role: User['role']
}

export interface UpdateUserPayload {
  username?: string
  password?: string
  role?: User['role']
  is_active?: boolean
}

export interface AuditEntry {
  time: string
  actor: string
  action: string
  target: string
}

export interface AuditTrailParams {
  user_id?: string
  action?: string
  from?: string
  to?: string
}

export async function listUsers(): Promise<User[]> {
  const { data } = await http.get<User[]>('/api/v1/admin/users')
  return data
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
  const { data } = await http.post<User>('/api/v1/admin/users', payload)
  return data
}

export async function updateUser(
  userId: string,
  payload: UpdateUserPayload,
): Promise<User> {
  const { data } = await http.put<User>(
    `/api/v1/admin/users/${userId}`,
    payload,
  )
  return data
}

export async function deleteUser(userId: string): Promise<void> {
  await http.delete(`/api/v1/admin/users/${userId}`)
}

export async function getAuditTrail(
  params?: AuditTrailParams,
): Promise<AuditEntry[]> {
  const query = new URLSearchParams()
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) query.set(key, value)
    }
  }
  const qs = query.toString()
  const { data } = await http.get<AuditEntry[]>(
    `/api/v1/audit/trail${qs ? `?${qs}` : ''}`,
  )
  return data
}
