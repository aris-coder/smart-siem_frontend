import { redirect } from '@tanstack/react-router'
import { hasAuthToken, LOGIN_PATH } from '#/lib/auth/session'

type GuardContext = {
  cause?: string
}

function isPreload(context?: GuardContext) {
  return context?.cause === 'preload'
}

export function requireAuth(context?: GuardContext) {
  if (
    typeof window !== 'undefined' &&
    !isPreload(context) &&
    !hasAuthToken()
  ) {
    throw redirect({ to: LOGIN_PATH, replace: true })
  }
}

export function redirectIfAuthenticated(context?: GuardContext) {
  if (
    typeof window !== 'undefined' &&
    !isPreload(context) &&
    hasAuthToken()
  ) {
    throw redirect({ to: '/', replace: true })
  }
}
