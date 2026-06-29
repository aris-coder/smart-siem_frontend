import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useCurrentUser } from '#/lib/auth/hooks'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
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
} from 'lucide-react'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

type ThemeMode = 'light' | 'dark' | 'auto'

function SettingsPage() {
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

  // Theme resolution logic
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
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

  const roleLabels: Record<string, string> = {
    READER: 'Lecteur (Lecture Seule)',
    ANALYST: 'Analyste (Opérations & Triage)',
    ADMIN: 'Administrateur (Contrôle Total)',
  }

  const roleColors: Record<string, string> = {
    READER: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300',
    ANALYST: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    ADMIN: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
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
              { mode: 'light', label: 'Clair', icon: <Sun className="size-4" /> },
              { mode: 'dark', label: 'Sombre', icon: <Moon className="size-4" /> },
              { mode: 'auto', label: 'Système', icon: <Laptop className="size-4" /> },
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
                <span className="text-[var(--sea-ink-soft)]">Rôle de sécurité</span>
                <Badge className={roleColors[user.role]} variant="outline">
                  <ShieldCheck className="mr-1 size-3" />
                  {roleLabels[user.role] ?? user.role}
                </Badge>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Déconnecté</p>
          )}
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
                <p className="font-semibold text-[var(--sea-ink)]">API REST Endpoint</p>
                <p className="mt-0.5 font-mono text-[10px] text-[var(--sea-ink-soft)] truncate">
                  {env.VITE_API_URL || 'http://localhost:3000'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3">
              <Database className="size-4 text-[var(--sea-ink-soft)] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-semibold text-[var(--sea-ink)]">Websocket Server</p>
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
