import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'

const SEVERITY_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  info: {
    label: 'INFO',
    className:
      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  warning: {
    label: 'WARNING',
    className:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  },
  high: {
    label: 'HIGH',
    className:
      'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  },
  critical: {
    label: 'CRITICAL',
    className:
      'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  },
  emergency: {
    label: 'EMERGENCY',
    className:
      'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  },
}

function getSeverityLevel(severity: number): keyof typeof SEVERITY_CONFIG {
  if (severity >= 9) return 'emergency'
  if (severity >= 7) return 'critical'
  if (severity >= 5) return 'high'
  if (severity >= 3) return 'warning'
  return 'info'
}

interface SeverityBadgeProps {
  severity: number
  className?: string
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const level = getSeverityLevel(severity)
  const config = SEVERITY_CONFIG[level]

  return (
    <Badge className={cn(config.className, className)} variant="outline">
      {config.label}
    </Badge>
  )
}
