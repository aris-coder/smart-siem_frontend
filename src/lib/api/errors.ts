export function getApiErrorMessage(
  error: unknown,
  fallback = 'Une erreur est survenue.',
): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosErr = error as {
      response?: { data?: { message?: string | string[] } }
    }
    const msg = axiosErr.response?.data?.message
    if (Array.isArray(msg)) return msg.join(', ')
    if (typeof msg === 'string' && msg.length > 0) return msg
  }

  if (error instanceof Error) return error.message

  return fallback
}

export function isUnauthorizedError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosErr = error as { response?: { status?: number } }
    return axiosErr.response?.status === 401
  }
  return false
}
