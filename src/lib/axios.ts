import axios from 'axios'
import { env } from '#/env'
import { getApiErrorMessage, isUnauthorizedError } from '#/lib/api/errors'
import {
  clearAuthToken,
  getAuthToken,
  redirectToLogin,
} from '#/lib/auth/session'

export const http = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isUnauthorizedError(error)) {
      clearAuthToken()
      redirectToLogin()
    }

    if (import.meta.env.DEV && axios.isAxiosError(error)) {
      console.error('[api] request failed', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        message: getApiErrorMessage(error),
      })
    }

    return Promise.reject(error)
  },
)
