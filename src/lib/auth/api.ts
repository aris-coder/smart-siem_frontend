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

interface LoginResponse {
  access_token?: string
  accessToken?: string
  token?: string
}

function extractAccessToken(response: LoginResponse): string {
  const token = response.access_token ?? response.accessToken ?? response.token

  if (!token) {
    throw new Error("La reponse d'authentification ne contient pas de token.")
  }

  return token
}

export async function login(credentials: LoginCredentials): Promise<string> {
  const { data } = await http.post<LoginResponse>(
    '/api/v1/auth/login',
    credentials,
  )

  return extractAccessToken(data)
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
