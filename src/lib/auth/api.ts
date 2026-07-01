import { http } from '#/lib/axios'
import type { User } from '#/types'

export interface LoginCredentials {
  username: string
  password: string
}

export interface UpdateProfilePayload {
  username?: string
  password?: string
}

export interface LoginResponseData {
  access_token?: string
  mfa_required?: boolean
  session_id?: string
  user?: User
}

interface VerifyMfaPayload {
  session_id: string
  code: string
}

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponseData> {
  const { data } = await http.post<LoginResponseData>(
    '/api/v1/auth/login',
    credentials,
  )
  return data
}

export async function verifyMfa(
  payload: VerifyMfaPayload,
): Promise<LoginResponseData> {
  const { data } = await http.post<LoginResponseData>(
    '/api/v1/auth/mfa/verify',
    payload,
  )
  return data
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await http.get<User>('/api/v1/auth/profile')
  return data
}

export async function updateCurrentUser(
  payload: UpdateProfilePayload,
): Promise<User> {
  const { data } = await http.put<User>('/api/v1/auth/profile', payload)
  return data
}
