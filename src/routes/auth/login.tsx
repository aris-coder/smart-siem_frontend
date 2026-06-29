import { useState } from 'react'
import { z } from 'zod'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import { useAppForm } from '#/hooks/demo.form'
import { getApiErrorMessage } from '#/lib/api/errors'
import { login } from '#/lib/auth/api'
import { redirectIfAuthenticated } from '#/lib/auth/guards'
import { setAuthToken } from '#/lib/auth/session'

export const Route = createFileRoute('/auth/login')({
  beforeLoad: redirectIfAuthenticated,
  component: RouteComponent,
})

const schema = z.object({
  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères")
    .max(100, "Le nom d'utilisateur est trop long"),
  password: z
    .string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
})

function RouteComponent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useAppForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onBlur: schema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      try {
        const token = await login(value)
        setAuthToken(token)
        await queryClient.invalidateQueries({ queryKey: ['auth'] })
        router.navigate({ to: '/', replace: true })
      } catch (error: unknown) {
        const message = getApiErrorMessage(error, 'Identifiants incorrects')
        setSubmitError(message)
        form.setErrorMap({
          onSubmit: {
            form: message,
            fields: {
              username: message,
            },
          },
        })
      }
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-lg font-semibold text-white">
            SIEM Intelligent
          </p>
          <p className="text-sm text-zinc-400">Veuillez vous connecter</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-5 [&_input]:border-zinc-700 [&_input]:bg-transparent [&_input]:text-white [&_input]:placeholder:text-zinc-500 [&_input]:focus-visible:border-blue-500 [&_input]:focus-visible:ring-blue-500/30"
        >
          <form.AppField name="username">
            {(field) => <field.TextField label="Nom d'utilisateur" />}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <field.TextField label="Mot de passe" type="password" />
            )}
          </form.AppField>

          {submitError && (
            <p
              className="rounded-lg border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-200"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <form.AppForm>
            <form.SubscribeButton label="Se connecter" className="w-full" />
          </form.AppForm>
        </form>
      </div>
    </div>
  )
}
