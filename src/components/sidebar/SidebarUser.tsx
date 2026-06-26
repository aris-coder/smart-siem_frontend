import { useCallback } from 'react'
import { useRouter } from '@tanstack/react-router'
import { useCurrentUser } from '#/lib/auth/hooks'
import { cn } from '#/lib/utils'
import { Settings, LogOut, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

interface SidebarUserProps {
  collapsed: boolean
}

const TOKEN_KEY = 'smart-siem_token'

export default function SidebarUser({ collapsed }: SidebarUserProps) {
  const { data: user } = useCurrentUser()
  const router = useRouter()

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    router.navigate({ to: '/auth/login' })
  }, [router])

  if (!user) return null

  return (
    <div className="border-t border-[var(--line)] p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              'flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--sea-ink)] transition-colors hover:bg-[var(--link-bg-hover)]',
              collapsed && 'justify-center px-0',
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white text-xs font-bold uppercase text-[var(--sea-ink)] dark:bg-zinc-800 dark:text-white">
              {user.username.charAt(0)}
            </div>
            {!collapsed && (
              <div className="flex min-w-0 flex-1 flex-col text-left">
                <span className="truncate text-sm font-medium">
                  {user.username}
                </span>
                <span className="truncate text-xs text-[var(--sea-ink-soft)]">
                  {user.role}
                </span>
              </div>
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="top"
          align={collapsed ? 'center' : 'start'}
          className="w-56"
        >
          <DropdownMenuLabel>
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--line)] bg-white text-sm font-bold uppercase dark:bg-zinc-800">
                {user.username.charAt(0)}
              </div>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">
                  {user.username}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.role}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <a
                href="/settings"
                className="flex cursor-pointer items-center gap-2"
              >
                <Settings className="size-4 shrink-0" />
                <span>Settings</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="size-4 shrink-0" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
