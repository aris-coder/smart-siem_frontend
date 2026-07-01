import { useState, useEffect } from 'react'
import { z } from 'zod'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import { useAppForm } from '#/hooks/demo.form'
import { getApiErrorMessage } from '#/lib/api/errors'
import { login } from '#/lib/auth/api'
import { redirectIfAuthenticated } from '#/lib/auth/guards'
import { setAuthToken } from '#/lib/auth/session'
import { getMfaPolicy, type MfaPolicy } from '#/lib/auth/mfa'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Inbox, RefreshCw, ArrowLeft, AlertCircle } from 'lucide-react'

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

  // MFA Flow States
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials')
  const [tempToken, setTempToken] = useState('')
  const [usernameState, setUsernameState] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(3)
  const [expiryTime, setExpiryTime] = useState<Date | null>(null)
  const [cooldownLeft, setCooldownLeft] = useState(0)
  const [policy, setPolicy] = useState<MfaPolicy | null>(null)
  const [emailSimVisible, setEmailSimVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)

  // Countdown timer for code validity
  useEffect(() => {
    if (step !== 'mfa' || !expiryTime) return

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((expiryTime.getTime() - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0) {
        clearInterval(interval)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [step, expiryTime])

  // Cooldown timer for resending
  useEffect(() => {
    if (cooldownLeft <= 0) return

    const timer = setTimeout(() => {
      setCooldownLeft((c) => c - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [cooldownLeft])

  const generateAndSendMfaCode = (activePolicy: MfaPolicy, username: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedCode(code)
    const expiry = new Date(Date.now() + activePolicy.validitySeconds * 1000)
    setExpiryTime(expiry)
    setCooldownLeft(activePolicy.resendCooldownSeconds)
    console.log(`[SIEM MFA] Code sent to ${username}@siem-corp.local: ${code}`)
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!mfaCode.trim()) {
      setSubmitError('Veuillez entrer le code de vérification.')
      return
    }

    if (timeLeft <= 0) {
      setSubmitError('Le code de vérification a expiré. Veuillez en renvoyer un.')
      return
    }

    if (mfaCode.trim() !== generatedCode) {
      const nextAttempts = attemptsLeft - 1
      setAttemptsLeft(nextAttempts)
      if (nextAttempts <= 0) {
        setStep('credentials')
        setSubmitError('Nombre maximum de tentatives atteint. Veuillez vous reconnecter.')
        setMfaCode('')
        setGeneratedCode('')
        setExpiryTime(null)
      } else {
        setSubmitError(`Code incorrect. ${nextAttempts} tentative(s) restante(s).`)
      }
      return
    }

    // Success! Save token and redirect
    try {
      setAuthToken(tempToken)
      await queryClient.invalidateQueries({ queryKey: ['auth'] })
      router.navigate({ to: '/', replace: true })
    } catch {
      setSubmitError('Une erreur est survenue lors de la finalisation de la connexion.')
    }
  }

  const handleResendCode = () => {
    if (cooldownLeft > 0 || !policy) return
    setSubmitError(null)
    setMfaCode('')
    generateAndSendMfaCode(policy, usernameState)
  }

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
        const token = await login(value)
        setUsernameState(value.username)
        
        const activePolicy = getMfaPolicy()
        setPolicy(activePolicy)

        if (activePolicy.enabled) {
          setTempToken(token)
          setAttemptsLeft(activePolicy.maxAttempts)
          generateAndSendMfaCode(activePolicy, value.username)
          setStep('mfa')
        } else {
          setAuthToken(token)
          await queryClient.invalidateQueries({ queryKey: ['auth'] })
          router.navigate({ to: '/', replace: true })
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

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-black px-4 py-8">
      {/* Main Login / MFA Container */}
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
              className="space-y-5 [&_input]:border-zinc-700 [&_input]:bg-transparent [&_input]:text-white [&_input]:placeholder:text-zinc-500 [&_input]:focus-visible:border-blue-500 [&_input]:focus-visible:ring-blue-500/30"
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
                <credentialsForm.SubscribeButton label="Se connecter" className="w-full" />
              </credentialsForm.AppForm>
            </form>
          </>
        ) : (
          <>
            <div className="mb-6 text-center">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-4 transition-colors"
              >
                <ArrowLeft className="size-3.5" />
                Retour
              </button>
              <p className="mb-2 text-lg font-semibold text-white">
                Double Facteur (MFA)
              </p>
              <p className="text-sm text-zinc-400">
                Saisissez le code de validation envoyé à votre email
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
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center font-mono text-lg tracking-widest border-zinc-700 bg-transparent text-white placeholder:text-zinc-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/30"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>
                  Temps restant :{' '}
                  <span className={`font-mono font-semibold ${timeLeft < 15 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                    {timeLeft}s
                  </span>
                </span>
                <span>
                  Tentatives :{' '}
                  <span className="font-semibold text-zinc-200">
                    {attemptsLeft} / {policy?.maxAttempts}
                  </span>
                </span>
              </div>

              {submitError && (
                <p className="flex items-start gap-1.5 rounded-lg border border-red-900/40 bg-red-950/40 px-3 py-2 text-sm text-red-200" role="alert">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </p>
              )}

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full">
                  Vérifier le code
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={cooldownLeft > 0}
                  className="w-full border-zinc-800 text-zinc-300 hover:text-white"
                >
                  {cooldownLeft > 0 ? (
                    `Renvoyer le code (${cooldownLeft}s)`
                  ) : (
                    <>
                      <RefreshCw className="mr-1.5 size-3.5" />
                      Renvoyer le code
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* Email Inbox Simulator */}
      {step === 'mfa' && emailSimVisible && (
        <div className="mt-6 w-full max-w-md rounded-xl border border-blue-900/40 bg-zinc-950 p-5 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center justify-between border-b border-zinc-850 pb-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <Inbox className="size-4" />
              <span>Simulateur de Messagerie Interne (SIEM)</span>
            </div>
            <button
              onClick={() => setEmailSimVisible(false)}
              className="text-zinc-500 hover:text-zinc-300 text-xs"
            >
              Masquer
            </button>
          </div>
          <div className="text-xs space-y-2 text-zinc-300">
            <div>
              <span className="font-semibold text-zinc-500">De :</span> {policy?.senderEmail}
            </div>
            <div>
              <span className="font-semibold text-zinc-500">À :</span> {usernameState}@siem-corp.local
            </div>
            <div>
              <span className="font-semibold text-zinc-500">Objet :</span> Code de validation de sécurité Smart SIEM
            </div>
            <div className="border-t border-zinc-900 pt-2.5 mt-2.5 text-zinc-400 leading-relaxed font-mono bg-zinc-900/50 p-3 rounded border border-zinc-800/40">
              Bonjour,<br /><br />
              Une tentative de connexion a été détectée sur la console Smart SIEM.<br />
              Voici votre code d'authentification multifacteur :<br /><br />
              <div className="text-center my-3">
                <span className="text-lg font-bold text-blue-400 bg-blue-950/50 border border-blue-800/60 px-4 py-1.5 rounded tracking-widest select-all">
                  {generatedCode}
                </span>
              </div>
              Ce code est valide pendant <span className="text-blue-300 font-semibold">{policy?.validitySeconds} secondes</span> et expirera à {expiryTime?.toLocaleTimeString()}.<br /><br />
              Si vous n'êtes pas à l'origine de cette demande, veuillez contacter votre administrateur SOC immédiatement.
            </div>
          </div>
        </div>
      )}

      {step === 'mfa' && !emailSimVisible && (
        <button
          onClick={() => setEmailSimVisible(true)}
          className="mt-4 text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5"
        >
          <Inbox className="size-3.5" />
          Afficher le simulateur de messagerie
        </button>
      )}
    </div>
  )
}
