import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getDashboardOverview, listIncidents } from '#/lib/incidents/api'
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
  Globe,
  Users,
  AlertCircle,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: Dashboard })

const threatLevelColors: Record<string, string> = {
  HIGH: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  MEDIUM:
    'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
  LOW: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
  NONE: 'text-gray-400 bg-gray-50 dark:bg-gray-800',
  CRITICAL: 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30',
  MINOR:
    'text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30',
}

const heatmapLevelBg: Record<string, string> = {
  CRITICAL: 'bg-red-200 dark:bg-red-800',
  MEDIUM: 'bg-orange-200 dark:bg-orange-800',
  MINOR: 'bg-yellow-100 dark:bg-yellow-800/50',
  NONE: 'bg-gray-50 dark:bg-zinc-800',
}

function Dashboard() {
  const { data: user } = useCurrentUser()
  const role = user?.role ?? 'READER'
  const canInvestigate = role === 'ANALYST' || role === 'ADMIN'

  const { data: overview } = useQuery({
    queryKey: ['dashboard', 'overview', '24h'],
    queryFn: () => getDashboardOverview({ interval: '24h' }),
    staleTime: 15_000,
  })

  const { data: criticalIncidents = [] } = useQuery({
    queryKey: ['incidents', { severity: 'CRITICAL' }],
    queryFn: () => listIncidents({ severity: 'CRITICAL' }),
  })
  const hasPriorityIncident = criticalIncidents.length > 0
  const priorityIncident = criticalIncidents[0]

  const stats = overview?.stats

  const statCards = [
    {
      label: 'Critical Alerts',
      value: stats?.critical_alerts ?? '—',
      icon: <ShieldAlert className="size-5 text-red-600 dark:text-red-400" />,
      tone: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'High Alerts',
      value: stats?.high_alerts ?? '—',
      icon: (
        <AlertTriangle className="size-5 text-orange-600 dark:text-orange-400" />
      ),
      tone: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'Open Incidents',
      value: stats?.open_incidents ?? '—',
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
    <div className="flex flex-col gap-6 overflow-auto p-4 lg:p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-[var(--sea-ink)]">
            Dashboard
          </h1>
          <p className="text-xs text-[var(--sea-ink-soft)]">
            Real-time security operations overview
            {overview?.generated_at && (
              <span className="ml-2">
                · updated {new Date(overview.generated_at).toLocaleTimeString()}
              </span>
            )}
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
        {/* Severity distribution */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-zinc-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            Severity Distribution
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {overview?.severity_distribution ? (
              Object.entries(overview.severity_distribution).map(
                ([severity, count]) => {
                  const barColor: Record<string, string> = {
                    CRITICAL: 'bg-red-500',
                    HIGH: 'bg-orange-500',
                    WARNING: 'bg-yellow-500',
                    INFO: 'bg-gray-300 dark:bg-gray-600',
                  }
                  const maxVal = Math.max(
                    ...Object.values(overview.severity_distribution),
                    1,
                  )
                  return (
                    <div key={severity} className="flex items-center gap-3">
                      <span className="w-16 text-xs font-medium text-[var(--sea-ink)]">
                        {severity}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-zinc-700">
                        <div
                          className={`h-full rounded-full ${barColor[severity] ?? 'bg-gray-400'}`}
                          style={{
                            width: `${(count / maxVal) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-6 text-right text-xs font-semibold text-[var(--sea-ink)]">
                        {count}
                      </span>
                    </div>
                  )
                },
              )
            ) : (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No data
              </p>
            )}
          </div>
        </div>

        {/* Events timeline (mini chart as bars) */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-zinc-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
            Events Timeline
          </p>
          <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
            Last {overview?.interval ?? '24h'}
          </p>
          <div className="mt-3 flex items-end gap-0.5 h-24">
            {overview?.events_timeline &&
            overview.events_timeline.length > 0 ? (
              overview.events_timeline.map((bucket, i) => {
                const maxCount = Math.max(
                  ...overview.events_timeline.map((b) => b.count),
                  1,
                )
                const heightPct = (bucket.count / maxCount) * 100
                return (
                  <div key={i} className="group relative flex-1">
                    <div
                      className="w-full rounded-t bg-[var(--lagoon)] opacity-80 transition-opacity hover:opacity-100"
                      style={{ height: `${Math.max(heightPct, 2)}%` }}
                      title={`${bucket.label}: ${bucket.count} events`}
                    />
                  </div>
                )
              })
            ) : (
              <p className="w-full text-center text-xs text-muted-foreground self-center">
                No timeline data
              </p>
            )}
          </div>
          {overview?.events_timeline && overview.events_timeline.length > 0 && (
            <div className="mt-1 flex justify-between text-[10px] text-[var(--sea-ink-soft)]">
              <span>{overview.events_timeline[0]?.label}</span>
              <span>
                {
                  overview.events_timeline[overview.events_timeline.length - 1]
                    ?.label
                }
              </span>
            </div>
          )}
        </div>

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
      </div>

      {/* Top sources + Threat types + Login failures */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top sources */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-[var(--sea-ink-soft)]" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              Top Source IPs
            </p>
          </div>
          {overview?.top_sources && overview.top_sources.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2">
              {overview.top_sources.map((src, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-[var(--line)] px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono text-[var(--sea-ink)] truncate">
                      {src.source_ip}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-[var(--sea-ink)]">
                      {src.count}
                    </span>
                    <span className="text-[10px] text-[var(--sea-ink-soft)]">
                      {src.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-center text-muted-foreground py-4">
              No data
            </p>
          )}
        </div>

        {/* Threat types */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-[var(--sea-ink-soft)]" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              Threat Types
            </p>
          </div>
          {overview?.threat_types && overview.threat_types.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2">
              {overview.threat_types.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-[var(--line)] px-3 py-2"
                >
                  <span className="text-xs text-[var(--sea-ink)] truncate">
                    {t.type}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-[var(--sea-ink)]">
                      {t.count}
                    </span>
                    <span className="text-[10px] text-[var(--sea-ink-soft)]">
                      {t.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-center text-muted-foreground py-4">
              No data
            </p>
          )}
        </div>

        {/* Login failures */}
        <div className="rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Users className="size-4 text-[var(--sea-ink-soft)]" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              Login Failures
            </p>
          </div>
          {overview?.login_failures && overview.login_failures.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2">
              {overview.login_failures.map((f, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-[var(--line)] px-3 py-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-[var(--sea-ink)]">
                      {f.label}
                    </span>
                    <span className="text-xs font-semibold text-[var(--sea-ink)]">
                      {f.count}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        threatLevelColors[f.threat_level]
                      }`}
                    >
                      {f.threat_level}
                    </Badge>
                    <span className="text-[10px] text-[var(--sea-ink-soft)] truncate">
                      {f.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-center text-muted-foreground py-4">
              No data
            </p>
          )}
        </div>
      </div>

      {/* Heatmap + Pipeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Suspicious activity heatmap */}
        <div className="lg:col-span-2 rounded-xl border border-[var(--line)] bg-white p-4 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-[var(--sea-ink-soft)]" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--sea-ink-soft)]">
              Suspicious Activity Heatmap
            </p>
          </div>
          <p className="mt-0.5 text-xs text-[var(--sea-ink-soft)]">
            High-severity events by day and hour block
          </p>
          {overview?.suspicious_activity_heatmap &&
          overview.suspicious_activity_heatmap.length > 0 ? (
            <div className="mt-3 overflow-x-auto">
              <div className="grid grid-cols-[auto_repeat(6,1fr)] gap-1 min-w-[400px]">
                <div />
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => (
                  <div
                    key={d}
                    className="text-center text-[10px] font-medium text-[var(--sea-ink-soft)]"
                  >
                    {d}
                  </div>
                ))}
                {[
                  '00h-04h',
                  '04h-08h',
                  '08h-12h',
                  '12h-16h',
                  '16h-20h',
                  '20h-00h',
                ].map((block) => {
                  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
                  return [
                    <div
                      key={`label-${block}`}
                      className="text-[10px] text-[var(--sea-ink-soft)] self-center"
                    >
                      {block}
                    </div>,
                    ...days.map((day) => {
                      const cell = overview.suspicious_activity_heatmap.find(
                        (c) => c.day === day && c.hour_block === block,
                      )
                      return (
                        <div
                          key={`${day}-${block}`}
                          className={`h-6 rounded ${
                            cell
                              ? (heatmapLevelBg[cell.level] ??
                                'bg-gray-50 dark:bg-zinc-800')
                              : 'bg-gray-50 dark:bg-zinc-800'
                          }`}
                          title={
                            cell
                              ? `${cell.description} (score: ${cell.score})`
                              : 'No activity'
                          }
                        />
                      )
                    }),
                  ]
                })}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-xs text-center text-muted-foreground py-4">
              No heatmap data
            </p>
          )}
        </div>

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
      </div>
    </div>
  )
}
