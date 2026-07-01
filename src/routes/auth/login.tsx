import { useState, useEffect, useCallback } from 'react'
import { z } from 'zod'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import { useAppForm } from '#/hooks/demo.form'
import { getApiErrorMessage } from '#/lib/api/errors'
import { login, verifyMfa } from '#/lib/auth/api'
import { redirectIfAuthenticated } from '#/lib/auth/guards'
import { setAuthToken } from '#/lib/auth/session'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { ArrowLeft, AlertCircle } from 'lucide-react'

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

const CODE_SCHEMA = z
  .string()
  .length(6, 'Le code doit contenir exactement 6 chiffres')

function RouteComponent() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [submitError, setSubmitError] = useState<string | null>(null)

  // MFA Flow States
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')
  const [sessionId, setSessionId] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minute countdown
  const [isVerifying, setIsVerifying] = useState(false)

  // Countdown timer for code validity
  useEffect(() => {
    if (step !== 'mfa' || timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [step, timeLeft])

  const handleMfaSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setSubmitError(null)

      const parsed = CODE_SCHEMA.safeParse(mfaCode)
      if (!parsed.success) {
        setSubmitError('Veuillez entrer un code de 6 chiffres.')
        return
      }

      if (timeLeft <= 0) {
        setSubmitError('Le code a expiré. Veuillez vous reconnecter.')
        return
      }

      setIsVerifying(true)
      try {
        const data = await verifyMfa({
          session_id: sessionId,
          code: parsed.data,
        })

        if (data.access_token) {
          setAuthToken(data.access_token)
          await queryClient.invalidateQueries({ queryKey: ['auth'] })
          router.navigate({ to: '/', replace: true })
        } else {
          setSubmitError('Réponse inattendue du serveur.')
        }
      } catch (error: unknown) {
        const message = getApiErrorMessage(
          error,
          'Code invalide. Veuillez réessayer.',
        )
        setSubmitError(message)

        // If code expired or already used, redirect back to login
        if (
          message.toLowerCase().includes('expir') ||
          message.toLowerCase().includes('déjà utilisé')
        ) {
          setTimeout(() => {
            setStep('credentials')
            setMfaCode('')
            setSubmitError('Session expirée. Veuillez vous reconnecter.')
          }, 2000)
        }
      } finally {
        setIsVerifying(false)
      }
    },
    [mfaCode, timeLeft, sessionId, queryClient, router],
  )

  const credentialsForm = useAppForm({
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
        const data = await login(value)

        if (data.mfa_required && data.session_id) {
          setSessionId(data.session_id)
          setTimeLeft(300) // 5 minutes
          setStep('mfa')
        } else if (data.access_token) {
          setAuthToken(data.access_token)
          await queryClient.invalidateQueries({ queryKey: ['auth'] })
          router.navigate({ to: '/', replace: true })
        } else {
          setSubmitError('Réponse inattendue du serveur.')
        }
      } catch (error: unknown) {
        const message = getApiErrorMessage(error, 'Identifiants incorrects')
        setSubmitError(message)
        credentialsForm.setErrorMap({
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

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        {step === 'credentials' ? (
          <>
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
                credentialsForm.handleSubmit()
              }}
              className="space-y-5"
            >
              <credentialsForm.AppField name="username">
                {(field) => <field.TextField label="Nom d'utilisateur" />}
              </credentialsForm.AppField>

              <credentialsForm.AppField name="password">
                {(field) => (
                  <field.TextField label="Mot de passe" type="password" />
                )}
              </credentialsForm.AppField>

              {submitError && (
                <p
                  className="rounded-lg border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-200"
                  role="alert"
                >
                  {submitError}
                </p>
              )}

              <credentialsForm.AppForm>
                <credentialsForm.SubscribeButton
                  label="Se connecter"
                  className="w-full"
                />
              </credentialsForm.AppForm>
            </form>
          </>
        ) : (
          <>
            <div className="mb-6 text-center">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="mb-4 inline-flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-white"
              >
                <ArrowLeft className="size-3.5" />
                Retour
              </button>
              <p className="mb-2 text-lg font-semibold text-white">
                Vérification MFA
              </p>
              <p className="text-sm text-zinc-400">
                Saisissez le code à 6 chiffres envoyé à votre email
              </p>
            </div>

            <form onSubmit={handleMfaSubmit} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Code de sécurité
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) =>
                    setMfaCode(e.target.value.replace(/\D/g, ''))
                  }
                  className="border-zinc-700 bg-transparent text-center font-mono text-lg tracking-widest text-white placeholder:text-zinc-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/30"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Expire dans :{' '}
                  <span
                    className={`font-mono font-semibold ${
                      timeLeft < 30
                        ? 'animate-pulse text-red-400'
                        : 'text-blue-400'
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </span>
              </div>

              {submitError && (
                <p
                  className="flex items-start gap-1.5 rounded-lg border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-200"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{submitError}</span>
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying || timeLeft <= 0}
              >
                {isVerifying ? 'Vérification...' : 'Vérifier le code'}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
