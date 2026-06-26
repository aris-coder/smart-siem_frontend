import { z } from 'zod'
import { createFileRoute, useRouter } from '@tanstack/react-router'

import { useAppForm } from '#/hooks/demo.form'
import { http } from '#/lib/axios'

const TOKEN_KEY = 'smart-siem_token'

export const Route = createFileRoute('/auth/login')({
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

interface LoginResponse {
  access_token: string
}

function RouteComponent() {
  const router = useRouter()

  const form = useAppForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onBlur: schema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { data } = await http.post<LoginResponse>(
          '/api/v1/auth/login',
          value,
        )
        localStorage.setItem(TOKEN_KEY, data.access_token)
        router.navigate({ to: '/' })
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosErr = error as {
            response: { data?: { message?: string | string[] } }
          }
          const msg = axiosErr.response.data?.message

          if (Array.isArray(msg)) {
            form.setErrorMap({
              onSubmit: {
                form: 'Veuillez corriger les erreurs ci-dessus',
                fields: {
                  username: msg.join(', '),
                },
              },
            })
          } else {
            form.setErrorMap({
              onSubmit: {
                form: msg ?? 'Identifiants incorrects',
                fields: {
                  username: msg ?? 'Identifiants incorrects',
                },
              },
            })
          }
        } else {
          form.setErrorMap({
            onSubmit: {
              form: 'Erreur de connexion au serveur',
              fields: {
                username: 'Erreur de connexion au serveur',
              },
            },
          })
        }
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
          className="space-y-5"
        >
          <form.AppField name="username">
            {(field) => <field.TextField label="Nom d'utilisateur" />}
          </form.AppField>

          <form.AppField name="password">
            {(field) => (
              <field.TextField label="Mot de passe" type="password" />
            )}
          </form.AppField>

          <form.AppForm>
            <form.SubscribeButton label="Se connecter" className="w-full" />
          </form.AppForm>
        </form>
      </div>
    </div>
  )
}
