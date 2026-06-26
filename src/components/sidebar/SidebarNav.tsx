import { cn } from '#/lib/utils'
import { Link, useLocation } from '@tanstack/react-router'
import { useCurrentUser } from '#/lib/auth/hooks'
import {
  Search,
  AlertTriangle,
  Shield,
  Users,
  LayoutDashboard,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '#/components/ui/tooltip'

import type { UserRole } from '#/types'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  roles: UserRole[]
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    to: '/',
    icon: <LayoutDashboard className="size-5 shrink-0" />,
    roles: ['READER', 'ANALYST', 'ADMIN'],
  },
  {
    label: 'Logs',
    to: '/logs',
    icon: <Search className="size-5 shrink-0" />,
    roles: ['READER', 'ANALYST', 'ADMIN'],
  },
  {
    label: 'Incidents',
    to: '/incidents',
    icon: <AlertTriangle className="size-5 shrink-0" />,
    roles: ['ANALYST', 'ADMIN'],
  },
  {
    label: 'Rules',
    to: '/rules',
    icon: <Shield className="size-5 shrink-0" />,
    roles: ['ADMIN'],
  },
  {
    label: 'Users',
    to: '/admin/users',
    icon: <Users className="size-5 shrink-0" />,
    roles: ['ADMIN'],
  },
]

interface SidebarNavProps {
  collapsed: boolean
}

export default function SidebarNav({ collapsed }: SidebarNavProps) {
  const { data: user } = useCurrentUser()
  const location = useLocation()

  const visibleItems = navItems.filter(
    (item) => user?.role && item.roles.includes(user.role),
  )

  if (!visibleItems.length) return null

  return (
    <nav className="flex flex-col gap-1 px-2">
      {visibleItems.map((item) => {
        const isActive = location.pathname === item.to

        const link = (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors no-underline',
              isActive
                ? 'bg-[var(--lagoon)]/10 text-[var(--lagoon-deep)]'
                : 'text-[var(--sea-ink)] hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]',
              collapsed && 'justify-center px-0',
            )}
          >
            {item.icon}
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        )

        if (collapsed) {
          return (
            <Tooltip key={item.to} delayDuration={0}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent side="right" className="text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          )
        }

        return link
      })}
    </nav>
  )
}
