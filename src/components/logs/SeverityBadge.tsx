import { Badge } from '#/components/ui/badge'
import { cn } from '#/lib/utils'

const SEVERITY_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  info: {
    label: 'INFO',
    className:
      'bg-severity-info-bg text-severity-info-text border-severity-info-border',
  },
  warning: {
    label: 'WARNING',
    className:
      'bg-severity-warning-bg text-severity-warning-text border-severity-warning-border',
  },
  high: {
    label: 'HIGH',
    className:
      'bg-severity-high-bg text-severity-high-text border-severity-high-border',
  },
  critical: {
    label: 'CRITICAL',
    className:
      'bg-severity-critical-bg text-severity-critical-text border-severity-critical-border',
  },
  emergency: {
    label: 'EMERGENCY',
    className:
      'bg-severity-emergency-bg text-severity-emergency-text border-severity-emergency-border',
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
