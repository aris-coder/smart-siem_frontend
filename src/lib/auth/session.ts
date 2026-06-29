export const TOKEN_KEY = 'smart-siem_token'
export const LOGIN_PATH = '/auth/login'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function hasAuthToken(): boolean {
  return Boolean(getAuthToken())
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return

  const trimmed = token.trim()
  if (!trimmed) return

  window.localStorage.setItem(TOKEN_KEY, trimmed)
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') return

  window.localStorage.removeItem(TOKEN_KEY)
}

export function redirectToLogin(): void {
  if (typeof window === 'undefined') return
  if (window.location.pathname === LOGIN_PATH) return

  window.location.assign(LOGIN_PATH)
}
