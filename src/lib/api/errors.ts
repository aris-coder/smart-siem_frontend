import axios from 'axios'

type ApiErrorBody = {
  message?: unknown
  error?: unknown
}

function stringifyMessage(message: unknown): string | null {
  if (typeof message === 'string' && message.trim()) {
    return message
  }

  if (Array.isArray(message)) {
    const parts = message.filter(
      (part): part is string => typeof part === 'string' && part.trim() !== '',
    )
    return parts.length > 0 ? parts.join(', ') : null
  }

  return null
}

export function isUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Une erreur inattendue est survenue.',
): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const responseData = error.response ? error.response.data : undefined
    const responseMessage =
      stringifyMessage(responseData?.message) ?? stringifyMessage(responseData?.error)

    if (responseMessage) {
      return responseMessage
    }

    if (error.code === 'ECONNABORTED') {
      return 'Le serveur met trop de temps a repondre.'
    }

    if (!error.response) {
      return "Impossible de joindre l'API. Verifiez que le backend est lance."
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
