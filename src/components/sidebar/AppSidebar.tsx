import { cn } from '#/lib/utils'
import { PanelLeftClose, ShieldAlert } from 'lucide-react'
import SidebarNav from './SidebarNav'
import SidebarUser from './SidebarUser'

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-dvh flex-col border-r border-(--line) bg-(--bg-base) transition-all duration-200 ease-in-out',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex w-full items-center border-b border-(--line) px-3 py-4',
          collapsed ? 'justify-center' : 'gap-3 px-4',
        )}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex shrink-0 items-center justify-center rounded-lg bg-(--lagoon) text-white size-8"
        >
          <ShieldAlert className="size-5" />
        </button>

        {!collapsed && (
          <span
            onClick={onToggle}
            className="flex-1 cursor-pointer text-sm font-semibold tracking-tight text-(--sea-ink)"
          >
            Smart SIEM
          </span>
        )}

        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              'flex cursor-pointer items-center justify-center rounded-md p-1.5 text-(--sea-ink-soft) transition-colors hover:bg-(--link-bg-hover) hover:text-(--sea-ink)',
            )}
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="size-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3">
        <SidebarNav collapsed={collapsed} />
      </div>

      {/* Bottom section */}
      <SidebarUser collapsed={collapsed} />
    </aside>
  )
}
