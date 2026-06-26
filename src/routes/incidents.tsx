import { useState, useCallback } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listIncidents,
  updateIncident,
  getDashboardStats,
} from '#/lib/incidents/api'
import type {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from '#/lib/incidents/api'
import { useCurrentUser } from '#/lib/auth/hooks'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ShieldAlert,
  ChevronRight,
  Play,
  UserCheck,
} from 'lucide-react'

export const Route = createFileRoute('/incidents')({
  component: IncidentsPage,
})

const severityColors: Record<IncidentSeverity, string> = {
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  WARNING:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  INFO: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
}

const severityIcons: Record<IncidentSeverity, React.ReactNode> = {
  CRITICAL: (
    <ShieldAlert className="size-4 shrink-0 text-red-600 dark:text-red-400" />
  ),
  HIGH: (
    <AlertTriangle className="size-4 shrink-0 text-orange-600 dark:text-orange-400" />
  ),
  WARNING: (
    <AlertCircle className="size-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
  ),
  INFO: <Info className="size-4 shrink-0 text-gray-500 dark:text-gray-400" />,
}

const statusColors: Record<IncidentStatus, string> = {
  OPEN: 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900',
  IN_PROGRESS:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  RESOLVED:
    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  FALSE_POSITIVE:
    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
}

function IncidentsPage() {
  const { data: user } = useCurrentUser()
  const queryClient = useQueryClient()
  const role = user?.role ?? 'READER'
  const canUpdate = role === 'ANALYST' || role === 'ADMIN'

  const [statusTab, setStatusTab] = useState<IncidentStatus | 'ALL'>('ALL')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  )
  const [detailsOpen, setDetailsOpen] = useState(false)

  // Queries
  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    staleTime: 10_000,
  })

  const filters = statusTab === 'ALL' ? undefined : { status: statusTab }
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => listIncidents(filters),
  })

  // Mutation
  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE'
    }) => updateIncident(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })

  const handleSelectIncident = useCallback((incident: Incident) => {
    setSelectedIncident(incident)
    setDetailsOpen(true)
  }, [])

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false)
    setSelectedIncident(null)
  }, [])

  const handleStatusChange = useCallback(
    async (
      id: string,
      status: 'IN_PROGRESS' | 'RESOLVED' | 'FALSE_POSITIVE',
    ) => {
      await updateMutation.mutateAsync({ id, status })
      if (selectedIncident?.id === id) {
        setSelectedIncident((prev) => (prev ? { ...prev, status } : null))
      }
    },
    [updateMutation, selectedIncident],
  )

  const tabs: Array<{ key: IncidentStatus | 'ALL'; label: string }> = [
    { key: 'ALL', label: 'All' },
    { key: 'OPEN', label: 'Open' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'FALSE_POSITIVE', label: 'False Positive' },
  ]

  const filteredIncidents =
    statusTab === 'ALL'
      ? incidents
      : incidents.filter((i) => i.status === statusTab)

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--sea-ink)]">
            Incidents
          </h1>
          <p className="text-xs text-[var(--sea-ink-soft)]">
            Correlated security alerts and triage
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: 'Critical Alerts',
            value: stats?.critical_alerts ?? '—',
            tone: 'text-red-600 dark:text-red-400',
          },
          {
            label: 'High Alerts',
            value: stats?.high_alerts ?? '—',
            tone: 'text-orange-600 dark:text-orange-400',
          },
          {
            label: 'Open Incidents',
            value: stats?.open_incidents ?? '—',
            tone: 'text-[var(--sea-ink)]',
          },
          {
            label: 'System',
            value: stats?.system_status ?? '—',
            tone: 'text-green-600 dark:text-green-400',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-zinc-900"
          >
            <p className="text-xs text-[var(--sea-ink-soft)]">{stat.label}</p>
            <p className={`mt-1 text-2xl font-semibold ${stat.tone}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--line)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusTab(tab.key)}
            className={`px-4 py-2.5 text-xs font-medium transition-colors ${
              statusTab === tab.key
                ? 'border-b-2 border-[var(--sea-ink)] text-[var(--sea-ink)]'
                : 'text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Incidents list */}
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading incidents...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No incidents found
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <button
              key={incident.id}
              type="button"
              onClick={() => handleSelectIncident(incident)}
              className="flex w-full items-start gap-3 rounded-xl border border-[var(--line)] bg-white p-4 text-left transition-colors hover:bg-[var(--link-bg-hover)] dark:bg-zinc-900"
            >
              {severityIcons[incident.severity]}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--sea-ink)]">
                      {incident.summary}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
                      {incident.rule.name} ·{' '}
                      {new Date(incident.triggered_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      className={severityColors[incident.severity]}
                      variant="outline"
                    >
                      {incident.severity}
                    </Badge>
                    <Badge
                      className={statusColors[incident.status]}
                      variant="outline"
                    >
                      {incident.status}
                    </Badge>
                    <ChevronRight className="size-4 text-[var(--sea-ink-soft)]" />
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Details Sheet */}
      <Sheet open={detailsOpen} onOpenChange={handleCloseDetails}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl overflow-y-auto p-6"
        >
          <SheetHeader>
            <SheetTitle className="sr-only">Incident Details</SheetTitle>
          </SheetHeader>

          {selectedIncident && (
            <div className="flex flex-col gap-6">
              {/* Header */}
              <div className="flex items-start gap-3">
                {severityIcons[selectedIncident.severity]}
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[var(--sea-ink)]">
                    {selectedIncident.summary}
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
                    {selectedIncident.rule.name} · ID:{' '}
                    {selectedIncident.id.slice(0, 8)}
                  </p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  { label: 'Severity', value: selectedIncident.severity },
                  { label: 'Status', value: selectedIncident.status },
                  {
                    label: 'Confidence',
                    value: `${selectedIncident.confidence_score}%`,
                  },
                  {
                    label: 'Triggered',
                    value: new Date(
                      selectedIncident.triggered_at,
                    ).toLocaleString(),
                  },
                  {
                    label: 'Assigned To',
                    value: selectedIncident.assigned_to ?? 'Unassigned',
                  },
                  {
                    label: 'Resolved At',
                    value: selectedIncident.resolved_at
                      ? new Date(selectedIncident.resolved_at).toLocaleString()
                      : '—',
                  },
                ].map((field) => (
                  <div key={field.label}>
                    <dt className="text-xs font-medium text-[var(--sea-ink-soft)] uppercase tracking-wider">
                      {field.label}
                    </dt>
                    <dd className="mt-1 text-sm text-[var(--sea-ink)]">
                      {field.label === 'Severity' ? (
                        <Badge
                          className={severityColors[selectedIncident.severity]}
                          variant="outline"
                        >
                          {field.value}
                        </Badge>
                      ) : field.label === 'Status' ? (
                        <Badge
                          className={statusColors[selectedIncident.status]}
                          variant="outline"
                        >
                          {field.value}
                        </Badge>
                      ) : (
                        field.value
                      )}
                    </dd>
                  </div>
                ))}
              </div>

              {/* Related entities */}
              {selectedIncident.related_entities.hosts &&
                selectedIncident.related_entities.hosts.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-xs font-semibold text-[var(--sea-ink-soft)] uppercase tracking-wider">
                      Affected Hosts
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedIncident.related_entities.hosts.map((host) => (
                        <Badge key={host} variant="outline">
                          {host}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

              {/* Actions */}
              {canUpdate && selectedIncident.status === 'OPEN' && (
                <Button
                  onClick={() =>
                    handleStatusChange(selectedIncident.id, 'IN_PROGRESS')
                  }
                  disabled={updateMutation.isPending}
                >
                  <Play className="size-3.5" />
                  {updateMutation.isPending
                    ? 'Updating...'
                    : 'Acknowledge & Start Investigation'}
                </Button>
              )}

              {canUpdate && selectedIncident.status === 'IN_PROGRESS' && (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="default"
                    onClick={() =>
                      handleStatusChange(selectedIncident.id, 'RESOLVED')
                    }
                    disabled={updateMutation.isPending}
                  >
                    <UserCheck className="size-3.5" />
                    Mark as Resolved
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleStatusChange(selectedIncident.id, 'FALSE_POSITIVE')
                    }
                    disabled={updateMutation.isPending}
                  >
                    Mark as False Positive
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
