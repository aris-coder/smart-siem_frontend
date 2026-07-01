import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCurrentUser } from '#/lib/auth/hooks'
import { updateCurrentUser } from '#/lib/auth/api'
import { requireAuth } from '#/lib/auth/guards'
import { getApiErrorMessage } from '#/lib/api/errors'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Switch } from '#/components/ui/switch'
import { getMfaPolicy, setMfaPolicy, type MfaPolicy } from '#/lib/auth/mfa'
import { env } from '#/env'
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  User as UserIcon,
  ShieldCheck,
  Globe,
  Database,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export const Route = createFileRoute('/settings')({
  beforeLoad: requireAuth,
  component: SettingsPage,
})

type ThemeMode = 'light' | 'dark' | 'auto'

function SettingsPage() {
  const queryClient = useQueryClient()
  const { data: user, isLoading } = useCurrentUser()
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark' || stored === 'auto') {
        return stored
      }
    }
    return 'auto'
  })
  const [profileUsername, setProfileUsername] = useState('')
  const [profilePassword, setProfilePassword] = useState('')
  const [profilePasswordConfirm, setProfilePasswordConfirm] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // MFA Policy States
  const [mfaEnabled, setMfaEnabled] = useState(() => getMfaPolicy().enabled)
  const [mfaValidity, setMfaValidity] = useState(() => getMfaPolicy().validitySeconds)
  const [mfaAttempts, setMfaAttempts] = useState(() => getMfaPolicy().maxAttempts)
  const [mfaCooldown, setMfaCooldown] = useState(() => getMfaPolicy().resendCooldownSeconds)
  const [mfaSender, setMfaSender] = useState(() => getMfaPolicy().senderEmail)
  const [mfaSuccess, setMfaSuccess] = useState('')
  const [mfaError, setMfaError] = useState('')

  const handleMfaSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMfaSuccess('')
    setMfaError('')

    if (mfaValidity <= 5) {
      setMfaError('Le code doit être valide au moins 5 secondes.')
      return
    }
    if (mfaAttempts <= 0) {
      setMfaError('Le nombre maximum de tentatives doit être supérieur à 0.')
      return
    }
    if (mfaCooldown < 0) {
      setMfaError('Le délai de renvoi ne peut pas être négatif.')
      return
    }
    if (!mfaSender.trim() || !mfaSender.includes('@')) {
      setMfaError("L'adresse email de l'expéditeur doit être valide.")
      return
    }

    try {
      setMfaPolicy({
        enabled: mfaEnabled,
        validitySeconds: mfaValidity,
        maxAttempts: mfaAttempts,
        resendCooldownSeconds: mfaCooldown,
        senderEmail: mfaSender.trim(),
      })
      setMfaSuccess('Politique MFA mise à jour avec succès.')
    } catch {
      setMfaError('Impossible de sauvegarder la politique MFA.')
    }
  }

  const updateProfileMutation = useMutation({
    mutationFn: updateCurrentUser,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['auth', 'profile'], updatedUser)
      queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
    },
  })

  // Theme resolution logic
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
    const resolved = theme === 'auto' ? (prefersDark ? 'dark' : 'light') : theme

    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    root.style.colorScheme = resolved

    window.localStorage.setItem('theme', theme)
    if (theme === 'auto') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
  }, [theme])

  useEffect(() => {
    if (!user) return
    setProfileUsername(user.username)
  }, [user])

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return

    setProfileSuccess('')
    setProfileError('')

    const username = profileUsername.trim()
    const shouldUpdatePassword =
      profilePassword.length > 0 || profilePasswordConfirm.length > 0

    if (username.length < 2) {
      setProfileError(
        "Le nom d'utilisateur doit contenir au moins 2 caractères.",
      )
      return
    }

    if (shouldUpdatePassword && profilePassword.length < 6) {
      setProfileError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    if (shouldUpdatePassword && profilePassword !== profilePasswordConfirm) {
      setProfileError('Les mots de passe ne correspondent pas.')
      return
    }

    const payload: { username?: string; password?: string } = {}
    if (username !== user.username) payload.username = username
    if (shouldUpdatePassword) payload.password = profilePassword

    if (Object.keys(payload).length === 0) {
      setProfileError('Aucune modification à enregistrer.')
      return
    }

    try {
      await updateProfileMutation.mutateAsync(payload)
      setProfilePassword('')
      setProfilePasswordConfirm('')
      setProfileSuccess('Profil mis à jour avec succès.')
    } catch (error: unknown) {
      setProfileError(
        getApiErrorMessage(error, 'Impossible de mettre à jour le profil.'),
      )
    }
  }

  const roleLabels: Record<string, string> = {
    READER: 'Lecteur (Lecture Seule)',
    ANALYST: 'Analyste (Opérations & Triage)',
    ADMIN: 'Administrateur (Contrôle Total)',
  }

  const roleColors: Record<string, string> = {
    READER: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    ANALYST: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    ADMIN:
      'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  }

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--sea-ink)]">
          <SettingsIcon className="size-5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-[var(--sea-ink)]">
            Paramètres
          </h1>
          <p className="text-xs text-[var(--sea-ink-soft)]">
            Configurez vos préférences d'application et gérez votre session.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Theme Settings */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:bg-zinc-900 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--sea-ink)]">
              Apparence & Thème
            </h2>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Personnalisez l'affichage de la console Smart SIEM.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              {
                mode: 'light',
                label: 'Clair',
                icon: <Sun className="size-4" />,
              },
              {
                mode: 'dark',
                label: 'Sombre',
                icon: <Moon className="size-4" />,
              },
              {
                mode: 'auto',
                label: 'Système',
                icon: <Laptop className="size-4" />,
              },
            ].map((opt) => (
              <button
                key={opt.mode}
                type="button"
                onClick={() => setTheme(opt.mode as ThemeMode)}
                className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-xs font-medium transition-all ${
                  theme === opt.mode
                    ? 'border-[var(--sea-ink)] bg-[var(--link-bg-hover)] text-[var(--sea-ink)]'
                    : 'border-[var(--line)] text-[var(--sea-ink-soft)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* User Profile Info */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:bg-zinc-900 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--sea-ink)]">
              Profil Utilisateur
            </h2>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Détails de votre compte actuel.
            </p>
          </div>

          {isLoading ? (
            <div className="h-20 animate-pulse rounded bg-muted" />
          ) : user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]">
                  <UserIcon className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--sea-ink)]">
                    {user.username}
                  </p>
                  <p className="text-xs text-[var(--sea-ink-soft)]">
                    ID: {user.id.slice(0, 8)}...
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--line)] pt-3 text-xs">
                <span className="text-[var(--sea-ink-soft)]">
                  Rôle de sécurité
                </span>
                <Badge className={roleColors[user.role]} variant="outline">
                  <ShieldCheck className="mr-1 size-3" />
                  {roleLabels[user.role] ?? user.role}
                </Badge>
              </div>

              <form
                className="flex flex-col gap-3 border-t border-[var(--line)] pt-4"
                onSubmit={handleProfileSubmit}
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                    Nom d'utilisateur
                  </label>
                  <Input
                    value={profileUsername}
                    onChange={(event) => setProfileUsername(event.target.value)}
                    aria-invalid={profileError.includes('nom')}
                    autoComplete="username"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                      Nouveau mot de passe
                    </label>
                    <Input
                      type="password"
                      value={profilePassword}
                      onChange={(event) =>
                        setProfilePassword(event.target.value)
                      }
                      placeholder="Optionnel"
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                      Confirmation
                    </label>
                    <Input
                      type="password"
                      value={profilePasswordConfirm}
                      onChange={(event) =>
                        setProfilePasswordConfirm(event.target.value)
                      }
                      placeholder="Répéter le mot de passe"
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {profileError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="size-3.5" />
                    {profileError}
                  </p>
                )}
                {profileSuccess && (
                  <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="size-3.5" />
                    {profileSuccess}
                  </p>
                )}

                <Button
                  type="submit"
                  size="sm"
                  className="self-start"
                  disabled={updateProfileMutation.isPending}
                >
                  <Save className="size-3.5" />
                  {updateProfileMutation.isPending
                    ? 'Enregistrement...'
                    : 'Enregistrer'}
                </Button>
              </form>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Déconnecté</p>
          )}
        </div>

        {/* Politique MFA & Email */}
        <div className="md:col-span-2 rounded-xl border border-[var(--line)] bg-white p-5 dark:bg-zinc-900 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--sea-ink)]">
              Politique MFA & Email
            </h2>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Déterminez les règles de l'authentification multifacteur et de l'envoi de codes par email.
            </p>
          </div>

          <form onSubmit={handleMfaSubmit} className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-[var(--sea-ink)]">
                  Activer le MFA obligatoire
                </span>
                <span className="text-[10px] text-[var(--sea-ink-soft)]">
                  Exige une vérification de code par email après la saisie des identifiants.
                </span>
              </div>
              <Switch
                checked={mfaEnabled}
                onCheckedChange={setMfaEnabled}
              />
            </div>

            {mfaEnabled && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-[var(--line)] pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                    Validité du code (secondes)
                  </label>
                  <Input
                    type="number"
                    value={mfaValidity}
                    onChange={(e) => setMfaValidity(parseInt(e.target.value) || 0)}
                    min={5}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                    Nombre maximum de tentatives
                  </label>
                  <Input
                    type="number"
                    value={mfaAttempts}
                    onChange={(e) => setMfaAttempts(parseInt(e.target.value) || 0)}
                    min={1}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                    Délai de renvoi / Cooldown (secondes)
                  </label>
                  <Input
                    type="number"
                    value={mfaCooldown}
                    onChange={(e) => setMfaCooldown(parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-[var(--sea-ink-soft)]">
                    Expéditeur de l'email
                  </label>
                  <Input
                    type="text"
                    value={mfaSender}
                    onChange={(e) => setMfaSender(e.target.value)}
                    placeholder="security-alerts@siem-corp.local"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-[var(--line)] pt-3">
              <div className="flex-1">
                {mfaError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                    <AlertCircle className="size-3.5" />
                    {mfaError}
                  </p>
                )}
                {mfaSuccess && (
                  <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="size-3.5" />
                    {mfaSuccess}
                  </p>
                )}
              </div>
              <Button type="submit" size="sm">
                <Save className="size-3.5" />
                Enregistrer la politique
              </Button>
            </div>
          </form>
        </div>

        {/* API Connection Info */}
        <div className="md:col-span-2 rounded-xl border border-[var(--line)] bg-white p-5 dark:bg-zinc-900 flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--sea-ink)]">
              Configuration de Connexion API
            </h2>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Points de terminaison configurés pour les flux de données.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
            <div className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
              <Globe className="size-4 text-[var(--sea-ink-soft)] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-[var(--sea-ink)]">
                  API REST Endpoint
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--sea-ink-soft)] truncate">
                  {env.VITE_API_URL || 'http://localhost:3000'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
              <Database className="size-4 text-[var(--sea-ink-soft)] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-[var(--sea-ink)]">
                  Websocket Server
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--sea-ink-soft)] truncate">
                  {env.VITE_WS_URL || 'http://localhost:3000'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
