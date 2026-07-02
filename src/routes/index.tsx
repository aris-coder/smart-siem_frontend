import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { getDashboardOverview, listIncidents } from '#/lib/incidents/api'
import { useCurrentUser } from '#/lib/auth/hooks'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { SeverityBadge } from '#/components/logs/SeverityBadge'
import {
  SeverityDonutChart,
  EventEvolutionChart,
  TopSourcesChart,
  ThreatTypesChart,
  LoginFailuresChart,
  SuspiciousActivityHeatmap,
} from '#/components/dashboard/SIEMCharts'
import {
  ShieldAlert,
  AlertTriangle,
  Activity,
  Server,
  ArrowRight,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: Dashboard })

const pipelineSteps = [
  { name: 'Ingestion', status: 'Operational', ok: true },
  { name: 'Normalization', status: 'Operational', ok: true },
  { name: 'Correlation', status: 'Operational', ok: true },
  { name: 'Triage', status: 'Analyst Queue', ok: false },
  { name: 'Reporting', status: 'Operational', ok: true },
]

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

  const severityDist: Record<string, number> =
    overview?.severity_distribution ?? {}
  const severityWarning = 'WARNING' in severityDist ? severityDist.WARNING : 0
  const severityInfo = 'INFO' in severityDist ? severityDist.INFO : 0

  const stats = overview?.stats

  return (
    <div className="flex flex-col gap-6 overflow-auto p-4 lg:p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-(--sea-ink)">Dashboard</h1>
          <p className="text-xs text-(--sea-ink-soft)">
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
        {[
          {
            label: 'Critical Alerts',
            value: stats?.critical_alerts ?? '—',
            icon: (
              <ShieldAlert className="size-5 text-red-600 dark:text-red-400" />
            ),
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
            icon: <Activity className="size-5 text-(--sea-ink)" />,
            tone: 'text-(--sea-ink)',
          },
          {
            label: 'System Status',
            value: stats?.system_status ?? '—',
            icon: (
              <Server className="size-5 text-green-600 dark:text-green-400" />
            ),
            tone: 'text-green-600 dark:text-green-400',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-(--line) bg-white p-4 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-(--sea-ink-soft)">{stat.label}</p>
              {stat.icon}
            </div>
            <p className={`mt-2 text-2xl font-semibold ${stat.tone}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row 1 — Severity donut + Event timeline + Priority incident */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SeverityDonutChart
          critical={stats?.critical_alerts ?? 0}
          high={stats?.high_alerts ?? 0}
          warning={severityWarning}
          info={severityInfo}
        />

        <EventEvolutionChart data={overview?.events_timeline ?? []} />

        {/* Priority incident */}
        <div className="rounded-xl border border-(--line) bg-white p-4 dark:bg-zinc-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
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
              <h2 className="text-sm font-semibold leading-snug text-(--sea-ink)">
                {priorityIncident.summary}
              </h2>
              <div className="flex flex-col gap-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-(--sea-ink-soft)">Rule</span>
                  <span className="font-medium text-(--sea-ink)">
                    {priorityIncident.rule.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--sea-ink-soft)">Confidence</span>
                  <span className="font-medium text-(--sea-ink)">
                    {priorityIncident.confidence_score}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-(--sea-ink-soft)">Status</span>
                  <Badge variant="outline" className="text-[10px]">
                    {priorityIncident.status}
                  </Badge>
                </div>
                {priorityIncident.related_entities.hosts && (
                  <div className="flex justify-between">
                    <span className="text-(--sea-ink-soft)">Affected</span>
                    <span className="font-medium text-(--sea-ink)">
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

      {/* Charts row 2 — Top sources + Threat types + Login failures */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TopSourcesChart data={overview?.top_sources ?? []} />
        <ThreatTypesChart data={overview?.threat_types ?? []} />
        <LoginFailuresChart data={overview?.login_failures ?? []} />
      </div>

      {/* Heatmap + Pipeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SuspiciousActivityHeatmap
            data={overview?.suspicious_activity_heatmap ?? []}
          />
        </div>

        {/* SIEM Pipeline */}
        <div className="rounded-xl border border-(--line) bg-white p-4 dark:bg-zinc-900">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-(--sea-ink-soft)">
            SIEM Pipeline
          </p>
          <p className="mt-0.5 text-xs text-(--sea-ink-soft)">
            Processing stages status
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {pipelineSteps.map((step, i) => (
              <div
                key={step.name}
                className="flex items-center gap-3 rounded-lg border border-(--line) bg-(--surface) px-3 py-2.5"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-(--line) text-[10px] font-semibold text-(--sea-ink-soft)">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-(--sea-ink)">
                    {step.name}
                  </p>
                  <p className="text-[10px] text-(--sea-ink-soft)">
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
