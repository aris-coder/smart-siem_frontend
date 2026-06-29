import { Copy, Download, Bell, CornerDownRight } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Badge } from '#/components/ui/badge'
import { SeverityBadge } from '#/components/logs/SeverityBadge'
import type { LogEntry } from '#/types'

interface LogDetailsProps {
  log: LogEntry | null
  onClose?: () => void
  onPivotIp?: (ip: string) => void
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}

function formatISODate(iso: string): string {
  try {
    const date = new Date(iso)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    return iso
  }
}

export function LogDetails({ log, onClose, onPivotIp }: LogDetailsProps) {
  const handleCopyJson = useCallback(() => {
    if (!log) return
    copyToClipboard(JSON.stringify(log, null, 2))
  }, [log])

  const handleExport = useCallback(() => {
    if (!log) return
    const blob = new Blob([JSON.stringify(log, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `log-${log.source.event_id}-${log.id.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [log])

  const handleCreateAlert = useCallback(() => {
    alert('Create Alert — to be implemented')
  }, [])

  if (!log) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-24">
        <p className="text-sm text-muted-foreground">
          Select a log entry to view details
        </p>
      </div>
    )
  }

  const { source } = log

  const detailFields: Array<{ label: string; value: string | number }> = [
    { label: 'Event ID', value: source.event_id },
    { label: 'Source Type', value: source.source_type },
    { label: 'Hostname', value: source.hostname },
    { label: 'IP Address', value: source.source_ip },
    { label: 'User', value: source.user_principal || 'N/A' },
    { label: 'Event Taxonomy', value: source.event_taxonomy },
    { label: 'Action', value: source.action },
    { label: 'Outcome', value: source.outcome },
    { label: 'Severity', value: source.severity },
    { label: 'Ingestion Hash', value: source.ingestion_hash },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header with severity */}
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold text-[var(--sea-ink)]">
          Log Details
        </h2>
        <SeverityBadge severity={source.severity} />
      </div>

      {/* Key-value fields in responsive grid */}
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
        {detailFields.map((field) => (
          <div key={field.label}>
            <dt className="text-xs font-medium text-[var(--sea-ink-soft)] uppercase tracking-wider">
              {field.label}
            </dt>
            <dd className="mt-1 whitespace-nowrap text-sm text-[var(--sea-ink)]">
              {field.label === 'Severity' ? (
                <SeverityBadge severity={field.value as number} />
              ) : field.label === 'IP Address' && onPivotIp ? (
                <div className="flex items-center gap-1.5 group/details-ip">
                  <span className="font-mono">{field.value}</span>
                  <button
                    type="button"
                    onClick={() => onPivotIp(field.value as string)}
                    className="opacity-0 group-hover/details-ip:opacity-100 transition-opacity p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-muted-foreground hover:text-foreground cursor-pointer"
                    title={`Pivoter sur l'IP ${field.value}`}
                  >
                    <CornerDownRight className="size-3" />
                  </button>
                </div>
              ) : (
                <span className="truncate" title={String(field.value)}>
                  {field.value}
                </span>
              )}
            </dd>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider">
          Timeline
        </h3>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              Collected
            </span>
            <span className="whitespace-nowrap font-mono text-sm text-[var(--sea-ink)]">
              {formatISODate(source.collected_at)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              Normalized
            </span>
            <span className="whitespace-nowrap font-mono text-sm text-[var(--sea-ink)]">
              {formatISODate(source.normalized_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Score */}
      {log.score !== null && (
        <div>
          <h3 className="mb-2 text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider">
            Score
          </h3>
          <Badge variant="outline" className="text-sm font-semibold">
            {log.score}
          </Badge>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {onPivotIp && log && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPivotIp(source.source_ip)}
            className="cursor-pointer"
          >
            <CornerDownRight className="size-3.5" />
            Pivot on IP
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={handleCopyJson}>
          <Copy className="size-3.5" />
          Copy JSON
        </Button>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="size-3.5" />
          Export Log
        </Button>
        <Button size="sm" variant="outline" onClick={handleCreateAlert}>
          <Bell className="size-3.5" />
          Create Alert
        </Button>
      </div>

      {/* Raw JSON */}
      <div>
        <h3 className="mb-2 text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider">
          Raw Event
        </h3>
        <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 font-mono text-xs leading-relaxed text-[var(--sea-ink)]">
          {JSON.stringify(log, null, 2)}
        </pre>
      </div>
    </div>
  )
}
