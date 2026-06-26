import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, listIncidents } from '#/lib/incidents/api'
import { searchLogs } from '#/lib/logs/api'
import { useCurrentUser } from '#/lib/auth/hooks'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { SeverityBadge } from '#/components/logs/SeverityBadge'
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Server,
  ArrowRight,
  ChevronRight,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: Dashboard })

function Dashboard() {
  const { data: user } = useCurrentUser()
  const role = user?.role ?? 'READER'
  const canInvestigate = role === 'ANALYST' || role === 'ADMIN'

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    staleTime: 10_000,
  })

  // Priority incident (most recent critical)
  const { data: criticalIncidents = [] } = useQuery({
    queryKey: ['incidents', { severity: 'CRITICAL' }],
    queryFn: () => listIncidents({ severity: 'CRITICAL' }),
  })
  const hasPriorityIncident = criticalIncidents.length > 0
  const priorityIncident = criticalIncidents[0]

  // Recent logs
  const { data: recentLogs } = useQuery({
    queryKey: ['logs', 'search', { size: 5 }],
    queryFn: () => searchLogs({ size: 5 }),
    staleTime: 10_000,
  })
  const recentHits = recentLogs?.hits ?? []

  const statCards = [
    {
      label: 'Critical Alerts',
      value: stats?.critical_alerts ?? 0,
      icon: <ShieldAlert className="size-5 text-red-600 dark:text-red-400" />,
      tone: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'High Alerts',
      value: stats?.high_alerts ?? 0,
      icon: (
        <AlertTriangle className="size-5 text-orange-600 dark:text-orange-400" />
      ),
      tone: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Open Incidents',
      value: stats?.open_incidents ?? 0,
      icon: <Activity className="size-5 text-[var(--sea-ink)]" />,
      tone: 'text-[var(--sea-ink)]',
    },
    {
      label: 'System Status',
      value: stats?.system_status ?? '—',
      icon: <Server className="size-5 text-green-600 dark:text-green-400" />,
      tone: 'text-green-600 dark:text-green-400',
    },
  ]

  const pipelineSteps = [
    { name: 'Ingestion', status: 'Operational', ok: true },
    { name: 'Normalization', status: 'Operational', ok: true },
    { name: 'Correlation', status: 'Operational', ok: true },
    { name: 'Triage', status: 'Analyst Queue', ok: false },
    { name: 'Reporting', status: 'Operational', ok: true },
  ]

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--sea-ink)]">
            Dashboard
          </h1>
          <p className="text-xs text-[var(--sea-ink-soft)]">
            Real-time security operations overview
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-[var(--sea-ink-soft)]">{stat.label}</p>
              {stat.icon}
            </div>
            <p className={`mt-2 text-2xl font-semibold ${stat.tone}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Priority incident */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-zinc-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            {canInvestigate ? 'Priority Incident' : 'Recent Incident'}
          </p>
          {hasPriorityIncident ? (
            <div className="mt-3 flex flex-col gap-3">
              <SeverityBadge
                severity={
                  priorityIncident.severity === 'CRITICAL'
                    ? 9
                    : priorityIncident.severity === 'HIGH'
                      ? 7
                      : priorityIncident.severity === 'WARNING'
                        ? 4
                        : 2
                }
              />
              <h2 className="text-sm font-semibold text-[var(--sea-ink)] leading-snug">
                {priorityIncident.summary}
              </h2>
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--sea-ink-soft)]">Rule</span>
                  <span className="font-medium text-[var(--sea-ink)]">
                    {priorityIncident.rule.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--sea-ink-soft)]">Confidence</span>
                  <span className="font-medium text-[var(--sea-ink)]">
                    {priorityIncident.confidence_score}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--sea-ink-soft)]">Status</span>
                  <Badge variant="outline" className="text-[10px]">
                    {priorityIncident.status}
                  </Badge>
                </div>
                {priorityIncident.related_entities.hosts && (
                  <div className="flex justify-between">
                    <span className="text-[var(--sea-ink-soft)]">Affected</span>
                    <span className="font-medium text-[var(--sea-ink)]">
                      {priorityIncident.related_entities.hosts.join(', ')}
                    </span>
                  </div>
                )}
              </div>
              <Link to="/incidents">
                <Button size="sm" className="w-full">
                  {canInvestigate ? 'Investigate Incident' : 'View Incidents'}
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">
              No critical incidents at this time
            </p>
          )}
        </div>

        {/* Recent logs */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--line)] bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
                Recent Events
              </p>
              <p className="text-xs text-[var(--sea-ink-soft)]">
                Latest security events from all sources
              </p>
            </div>
            <Link to="/logs">
              <Button variant="outline" size="xs">
                View All
                <ChevronRight className="size-3" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--line)]">
                  {['Time', 'Source', 'Event', 'Message', 'Severity'].map(
                    (h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold text-[var(--sea-ink-soft)]"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {recentHits.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-xs text-muted-foreground"
                    >
                      No recent events
                    </td>
                  </tr>
                ) : (
                  recentHits.map((hit) => (
                    <tr
                      key={hit.id}
                      className="text-sm text-[var(--sea-ink)] transition-colors hover:bg-[var(--link-bg-hover)]"
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-[var(--sea-ink-soft)]">
                        {new Date(hit.source.collected_at).toLocaleTimeString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs">
                        {hit.source.source_type}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs">
                        {hit.source.event_taxonomy}
                      </td>
                      <td className="max-w-xs truncate px-4 py-2.5 text-xs">
                        {hit.source.raw_message}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5">
                        <SeverityBadge severity={hit.source.severity} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pipeline + Top Attackers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* SIEM Pipeline */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-zinc-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            SIEM Pipeline
          </p>
          <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
            Processing stages status
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {pipelineSteps.map((step, i) => (
              <div
                key={step.name}
                className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2.5"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--line)] text-[10px] font-semibold text-[var(--sea-ink-soft)]">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--sea-ink)]">
                    {step.name}
                  </p>
                  <p className="text-[10px] text-[var(--sea-ink-soft)]">
                    {step.status}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    step.ok
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}
                >
                  {step.ok ? 'OK' : 'Review'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Top Attackers */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--line)] bg-white dark:bg-zinc-900">
          <div className="border-b border-[var(--line)] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              Top Attackers
            </p>
            <p className="text-xs text-[var(--sea-ink-soft)]">
              Most frequent source IPs by event volume
            </p>
          </div>
          {stats?.top_attackers && stats.top_attackers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--line)]">
                    <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold text-[var(--sea-ink-soft)]">
                      IP Address
                    </th>
                    <th className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold text-[var(--sea-ink-soft)]">
                      Events
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--line)]">
                  {stats.top_attackers.map((ip, i) => (
                    <tr
                      key={i}
                      className="text-sm text-[var(--sea-ink)] transition-colors hover:bg-[var(--link-bg-hover)]"
                    >
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs">
                        {ip}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-xs">
                        —
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No top attacker data available
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
